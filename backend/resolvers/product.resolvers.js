// resolvers/product.js

import Category from '../models/category.model.js';
import Product from '../models/product.model.js';
import Association from '../models/association.model.js';
import stripePackage from 'stripe';
import admin from '../firebaseAdmin.js'; // Import initialized Firebase Admin SDK
import dotenv from 'dotenv';
dotenv.config();

const stripe = stripePackage(process.env.STRIPE_SECRET_KEY);

const db = admin.firestore(); // Initialize Firestore

const productResolvers = {
  Query: {
    products: async () => await Product.find().populate('category'),
    product: async (_, { id }) => await Product.findById(id).populate('category'),
  },
  Mutation: {
    // Create Product Mutation
    createProduct: async (_, { name, price, categoryId, description }) => {
      let stripeProductId = null;
      const product = new Product({
        name,
        price,
        description,
      });

      if (categoryId) {
        const category = await Category.findById(categoryId);
        if (!category) {
          throw new Error('Category not found.');
        }
        product.category = category._id;
      }

      // Save the product to MongoDB
      const savedProduct = await product.save();

      // Create the product in Stripe
      try {
        const stripeProduct = await stripe.products.create({
          name: savedProduct.name,
          description: savedProduct.description,
        });

        // Create a price for the product
        const priceInCents = Math.round(savedProduct.price * 100);
        await stripe.prices.create({
          unit_amount: priceInCents,
          currency: 'pen',
          product: stripeProduct.id,
        });

        stripeProductId = stripeProduct.id;

        console.log('Product created in Stripe.');
      } catch (error) {
        console.error('Error creating product in Stripe:', error);
        // Handle error as needed
      }

      // Save the product to Firestore
      try {
        const productId = savedProduct._id.toString(); // Ensure it's a string

        await db.collection('products').doc(productId).set({
          productId: productId, // The same as document ID
          name: savedProduct.name,
          price: savedProduct.price,
          description: savedProduct.description,
          categoryId: savedProduct.category ? savedProduct.category.toString() : null,
          stripeProductId: stripeProductId,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log('Product saved to Firestore.');
      } catch (error) {
        console.error('Error saving product to Firestore:', error);
      }

      return await savedProduct.populate('category');
    },

    // Update Product Mutation
    updateProduct: async (_, { id, name, price, categoryId, description }) => {
      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (price !== undefined) updateData.price = price;
      if (description !== undefined) updateData.description = description;

      if (categoryId !== undefined) {
        if (categoryId === '') {
          updateData.category = null; // Remove category
        } else {
          const category = await Category.findById(categoryId);
          if (!category) {
            throw new Error('Category not found.');
          }
          updateData.category = category._id;
        }
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      ).populate('category');

      if (!updatedProduct) {
        throw new Error('Product not found.');
      }

      // Update the product in Stripe
      try {
        // Fetch the Stripe Product ID from Firestore
        const productDoc = await db.collection('products').doc(id).get();
        if (productDoc.exists) {
          const productData = productDoc.data();
          if (productData.stripeProductId) {
            await stripe.products.update(productData.stripeProductId, {
              name: updatedProduct.name,
              description: updatedProduct.description,
            });

            // If price has changed, create a new price in Stripe
            if (price !== undefined) {
              const priceInCents = Math.round(updatedProduct.price * 100);
              await stripe.prices.create({
                unit_amount: priceInCents,
                currency: 'pen',
                product: productData.stripeProductId,
              });
            }
          }
        }
        console.log('Product updated in Stripe.');
      } catch (error) {
        console.error('Error updating product in Stripe:', error);
        // Handle error as needed
      }

      // Update the product in Firestore
      try {
        await db.collection('products').doc(id).update({
          productId: id,
          name: updatedProduct.name,
          price: updatedProduct.price,
          description: updatedProduct.description,
          categoryId: updatedProduct.category ? updatedProduct.category.toString() : null,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log('Product updated in Firestore.');
      } catch (error) {
        console.error('Error updating product in Firestore:', error);
      }

      return updatedProduct;
    },

    // Delete Product Mutation
    deleteProduct: async (_, { id }) => {
      const deletedProduct = await Product.findByIdAndDelete(id);
      if (!deletedProduct) {
        throw new Error('Product not found.');
      }

      // Delete the product from Stripe
      try {
        // Fetch the Stripe Product ID from Firestore
        const productDoc = await db.collection('products').doc(id).get();
        if (productDoc.exists) {
          const productData = productDoc.data();
          if (productData.stripeProductId) {
            await stripe.products.update(productData.stripeProductId, {
              active: false, // Deactivate the product
            });
          }
        }
        console.log('Product deactivated in Stripe.');
      } catch (error) {
        console.error('Error deactivating product in Stripe:', error);
        // Handle error as needed
      }

      // Delete the product from Firestore
      try {
        await db.collection('products').doc(id).delete();
        console.log('Product deleted from Firestore.');
      } catch (error) {
        console.error('Error deleting product from Firestore:', error);
      }

      return true;
    },
  },
  Product: {
    category: async (parent) => await Category.findById(parent.category),
    associations: async (parent) =>
      await Association.find({ product: parent.id }).populate('tag'),
  },
};

export default productResolvers;
