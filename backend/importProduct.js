// importProducts.js

// Import necessary modules
import fs from 'fs';
import csvParser from 'csv-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import stripePackage from 'stripe';
import admin from './firebaseAdmin.js'; // Adjust the path as necessary

// Import Mongoose models
import Category from './models/category.model.js';
import Product from './models/product.model.js';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin SDK

// Initialize Firestore
const db = admin.firestore();

// Initialize Stripe
const stripe = stripePackage(process.env.STRIPE_SECRET_KEY);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Function to process each row from the CSV
async function processRow(row) {
  try {
    const { name, category, description, price } = row;

    // Validate required fields
    if (!name || !category || !price) {
      console.error(`Missing required fields in row: ${JSON.stringify(row)}`);
      return;
    }

    // Check if category exists
    let categoryDoc = await Category.findOne({ name: category });
    if (!categoryDoc) {
      // Create new category
      categoryDoc = new Category({ name: category, description: '' });
      categoryDoc = await categoryDoc.save();
      console.log(`Created new category: ${category}`);
    }

    // Create new product
    const product = new Product({
      name,
      price: parseFloat(price),
      description: description || '',
      category: categoryDoc._id,
    });

    // Save product to MongoDB
    const savedProduct = await product.save();

    // Create product in Stripe
    let stripeProductId = null;
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

      console.log(`Product '${savedProduct.name}' created in Stripe.`);
    } catch (error) {
      console.error(`Error creating product '${savedProduct.name}' in Stripe:`, error);
    }

    // Save product to Firestore
    try {
      const productId = savedProduct._id.toString(); // Ensure it's a string

      await db.collection('products').doc(productId).set({
        productId: productId, // The same as document ID
        name: savedProduct.name,
        price: savedProduct.price,
        description: savedProduct.description,
        categoryId: categoryDoc._id.toString(),
        stripeProductId: stripeProductId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`Product '${savedProduct.name}' saved to Firestore.`);
    } catch (error) {
      console.error(`Error saving product '${savedProduct.name}' to Firestore:`, error);
    }
  } catch (error) {
    console.error(`Error processing row:`, error);
  }
}

// Read and parse the CSV file
function importProductsFromCSV(csvFilePath) {
  const products = [];

  fs.createReadStream(csvFilePath)
    .pipe(csvParser())
    .on('data', (row) => {
      products.push(row);
    })
    .on('end', async () => {
      console.log('CSV file successfully processed.');
      for (const row of products) {
        await processRow(row);
      }
      console.log('All products have been processed.');
      mongoose.connection.close();
    })
    .on('error', (error) => {
      console.error(`Error reading CSV file:`, error);
    });
}

// Start the import process
const csvFilePath = './all_products.csv'; // Replace with the path to your CSV file
importProductsFromCSV(csvFilePath);
