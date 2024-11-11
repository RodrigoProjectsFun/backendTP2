// resolvers/order.js

import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import admin from '../firebaseAdmin.js'; // Firebase Admin SDK
import stripePackage from 'stripe';
import UserClient from '../models/userclient.model.js';
import dotenv from 'dotenv';
dotenv.config();

const stripe = stripePackage(process.env.STRIPE_SECRET_KEY);

const db = admin.firestore();

const orderResolvers = {
  Query: {
    orders: async () =>
      await Order.find().populate('items.product').populate('userClient'),
    order: async (_, { id }) =>
      await Order.findById(id).populate('items.product').populate('userClient'),
  },
  Mutation: {
    createOrder: async (_, { items, firebaseId }) => {
      // Find the UserClient by firebaseId
      const userClient = await UserClient.findOne({ firebaseId });
      if (!userClient) {
        throw new Error(`UserClient with firebaseId ${firebaseId} not found.`);
      }

      // Calculate total amount
      let totalAmount = 0;
      const orderItems = [];

      for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found.`);
        }
        const quantity = item.quantity;
        const amount = product.price * quantity;
        totalAmount += amount;

        orderItems.push({
          product: product._id,
          quantity,
        });
      }

      // Create the order in MongoDB
      const order = new Order({
        userClient: userClient._id, // Use the ObjectId of the UserClient
        items: orderItems,
        totalAmount,
        status: 'pending',
      });

      const savedOrder = await order.save();

      // Create a payment link via Stripe
      try {
        // Prepare line items for Stripe
        const stripeLineItems = [];
        for (const item of orderItems) {
          // Fetch the product's stripeProductId from Firestore
          const productDoc = await db
            .collection('products')
            .doc(item.product.toString())
            .get();
          if (!productDoc.exists) {
            throw new Error(`Product with ID ${item.product} not found in Firestore.`);
          }
          const productData = productDoc.data();
          if (!productData.stripeProductId) {
            throw new Error(
              `Product with ID ${item.product} does not have a Stripe product ID.`
            );
          }

          // Get the latest price for the product
          const prices = await stripe.prices.list({
            product: productData.stripeProductId,
            active: true,
          });

          if (!prices.data || prices.data.length === 0) {
            throw new Error(
              `No active price found for product with ID ${item.product}.`
            );
          }

          const stripePriceId = prices.data[0].id;

          stripeLineItems.push({
            price: stripePriceId,
            quantity: item.quantity,
          });
        }

        // Create a payment link
        const paymentLink = await stripe.paymentLinks.create({
          line_items: stripeLineItems,
          metadata: {
            orderIntentId: docId, 
          },
        });

        // Save the payment link in Firestore
        await db
          .collection('orders')
          .doc(savedOrder.id)   
          .set({
            firebaseId: firebaseId,
            items: items,
            totalAmount: totalAmount,
            status: 'pending',
            paymentLink: paymentLink.url,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });

        // Update the order in MongoDB with paymentLink
        savedOrder.paymentLink = paymentLink.url;
        await savedOrder.save();
      } catch (error) {
        console.error('Error creating payment link via Stripe:', error);
        throw new Error('Failed to create payment link.');
      }

      // Return the order
      return await savedOrder.populate('items.product').populate('userClient');
    },

    updateOrder: async (_, { id, status }) => {
      const updateData = {};
      if (status !== undefined) updateData.status = status;

      const updatedOrder = await Order.findByIdAndUpdate(id, updateData, {
        new: true,
      })
        .populate('items.product')
        .populate('userClient');

      if (!updatedOrder) {
        throw new Error('Order not found.');
      }

      // Update the order in Firestore
      try {
        await db.collection('orders').doc(id).update({
          status: updatedOrder.status,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } catch (error) {
        console.error('Error updating order in Firestore:', error);
      }

      return updatedOrder;
    },

    deleteOrder: async (_, { id }) => {
      const deletedOrder = await Order.findByIdAndRemove(id);
      if (!deletedOrder) {
        throw new Error('Order not found.');
      }

      // Delete the order from Firestore
      try {
        await db.collection('orders').doc(id).delete();
        console.log('Order deleted from Firestore.');
      } catch (error) {
        console.error('Error deleting order from Firestore:', error);
      }

      return true;
    },
  },
  Order: {
    userClient: async (parent) => await UserClient.findById(parent.userClient),
    items: async (parent) => parent.items,
  },
};

export default orderResolvers;
