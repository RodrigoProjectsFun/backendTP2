// index.js
import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import session from 'express-session';
import connectMongo from 'connect-mongodb-session';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import passport from 'passport';
import { buildContext } from 'graphql-passport';
import mergedResolvers from './resolvers/index.js';
import mergedTypeDefs from './typeDefs/index.js';
import { connectDB } from './db/connectDB.js';
import tagRoutes from './routes/tag.js';
import { configurePassport } from './passport/passport.config.js';
import { Server } from 'socket.io';
import admin from './firebaseAdmin.js';
import fs from 'fs';
import * as math from 'mathjs';
import UserClient from './models/userclient.model.js'; // Import UserClient model
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);const app = express();
const httpServer = http.createServer(app);
const db = admin.firestore();

const MongoDBStore = connectMongo(session);
const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: 'sessions',
});

store.on('error', (err) => console.log(err));

// Configure Passport.js strategies
configurePassport();

// Use session with MongoDB to store sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
    },
    store: store,
  })
);

// Initialize Passport.js middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(
  express.json({
    limit: '10mb', // Increase if needed
    verify: (req, res, buf, encoding) => {
      if (buf && buf.length) {
        req.rawBody = buf.toString(encoding || 'utf8');
      }
    },
  })
);
app.use(express.urlencoded({ extended: true }));

app.use(
  '/api/tags',
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
  tagRoutes
);

const io = new Server(httpServer, {
  cors: {
    origin: '*', 
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);

  socket.emit('test', { message: 'Welcome! Socket connected successfully.' });

  socket.on('disconnect', (reason) => {
    console.log('Client disconnected:', socket.id, 'Reason:', reason);
  });
});

// Export the io instance so it can be used in other files
export { io };

// Configure Apollo Server
const server = new ApolloServer({
  typeDefs: mergedTypeDefs,
  resolvers: mergedResolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

// Start the Apollo Server
await server.start();

// --- Start of Recommendation Logic Integration ---

// Listener for 'orders' collection
db.collection('orders').onSnapshot((snapshot) => {
  snapshot.docChanges().forEach((change) => {
    if (change.type === 'added') {
      const doc = change.doc;
      const data = doc.data();
      const firebaseId = data.firebaseId;

      console.log(`New order added by user ${firebaseId}`);

      // Trigger recommendation logic for this user
      generateRecommendationsForUser(firebaseId)
        .then(() => {
          console.log(`Recommendations generated successfully for user ${firebaseId}`);
        })
        .catch((err) => {
          console.error(`Error generating recommendations for user ${firebaseId}:`, err);
        });
    }
  });
});

// Recommendation Logic Function
async function generateRecommendationsForUser(firebaseId) {
  console.log(`Starting recommendation generation for user ${firebaseId}...`);

  try {
    // Step 1: Fetch and prepare data

    // Fetch all categories
    const categoriesSnapshot = await db.collection('categories').get();
    const categories = {};
    categoriesSnapshot.forEach((doc) => {
      const data = doc.data();
      const categoryId = data.categoryId || doc.id;
      categories[categoryId] = data;
    });

    // Fetch all products
    const productsSnapshot = await db.collection('products').get();
    const allProducts = {};
    productsSnapshot.forEach((doc) => {
      const data = doc.data();
      const productId = data.productId || doc.id;
      allProducts[productId] = data;
    });

    // Step 2: Fetch user's purchase history
    const ordersSnapshot = await db
      .collection('orders')
      .where('firebaseId', '==', firebaseId)
      .get();

    const purchasedProductIdsSet = new Set();
    ordersSnapshot.forEach((doc) => {
      const data = doc.data();
      const items = data.items || [];
      const productIds = items.map((item) => item.productId);
      productIds.forEach((pid) => purchasedProductIdsSet.add(pid));
    });

    const purchasedProductIds = Array.from(purchasedProductIdsSet);

    // Handle case where user has no prior orders
    if (purchasedProductIds.length === 0) {
      console.log(`User ${firebaseId} has no prior orders. Generating default recommendations.`);

      // For users with no purchase history, recommend popular products or random products
      // For simplicity, recommend top 5 products (you can customize this logic)
      const topRecommendations = Object.values(allProducts)
        .slice(0, 5)
        .map((product) => ({
          productId: product.productId || product.id,
        }));

      // Store recommendations in Firebase
      const recommendProductsRef = db.collection('recommendProducts').doc(firebaseId);
      await recommendProductsRef.set({
        firebaseId,
        recommendations: topRecommendations.map((r) => r.productId),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`Stored default recommendations for user ${firebaseId}`);
      return;
    }

    // Step 3: Get categories of purchased products
    const purchasedCategoriesSet = new Set();
    purchasedProductIds.forEach((productId) => {
      const product = allProducts[productId];
      if (product && product.categoryId) {
        purchasedCategoriesSet.add(product.categoryId);
      }
    });

    const purchasedCategories = Array.from(purchasedCategoriesSet);

    // Step 4: Find products in those categories that the user hasn't purchased yet
    const recommendations = [];
    Object.values(allProducts).forEach((product) => {
      const productId = product.productId || product.id;
      if (
        purchasedCategoriesSet.has(product.categoryId) && // Product is in a purchased category
        !purchasedProductIdsSet.has(productId) // User hasn't purchased it yet
      ) {
        recommendations.push(product);
      }
    });

    // Step 5: If no recommendations found, recommend popular products or handle accordingly
    if (recommendations.length === 0) {
      console.log(`No new products found in user's purchased categories for user ${firebaseId}.`);

      // Recommend top 5 popular products (excluding purchased ones)
      const popularProducts = Object.values(allProducts)
        .filter((product) => !purchasedProductIdsSet.has(product.productId || product.id))
        .slice(0, 5);

      recommendations.push(...popularProducts);
    }

    // Step 6: Limit recommendations to top N (e.g., 5)
    const topN = 5;
    const topRecommendations = recommendations.slice(0, topN);

    // Store recommendations in Firebase
    const recommendProductsRef = db.collection('recommendProducts').doc(firebaseId);
    await recommendProductsRef.set({
      firebaseId,
      recommendations: topRecommendations.map((product) => product.productId || product.id),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`Stored recommendations for user ${firebaseId}`);
  } catch (error) {
    console.error(`Error in generateRecommendationsForUser for user ${firebaseId}:`, error);
  }
}


  // Utility function to tokenize text (basic implementation)
  function tokenizeText(text) {
    const tokens = text
      .toLowerCase()
      .split(/\W+/)
      .filter((token) => token.length > 0);

    // Convert tokens to a simple binary vector (word presence)
    // For a more advanced approach, use TF-IDF or word embeddings
    // Here, we'll just return a fixed-size vector for simplicity
    const maxTokens = 10;
    const tokenVector = Array(maxTokens).fill(0);
    tokens.slice(0, maxTokens).forEach((token, index) => {
      tokenVector[index] = 1; // Simple presence indicator
    });
    return tokenVector;
  }

// --- End of Recommendation Logic Integration ---

// --- Start of User Synchronization Logic ---

// Listener for 'users' collection in Firestore
db.collection('users').onSnapshot((snapshot) => {
  snapshot.docChanges().forEach(async (change) => {
    if (change.type === 'added') {
      const doc = change.doc;
      const data = doc.data();
      const firebaseId = doc.id; // Assuming the doc ID is the firebaseId

      console.log(`New user added with firebaseId ${firebaseId}`);

      // Check if the user already exists in MongoDB
      const existingUser = await UserClient.findOne({ firebaseId });
      if (existingUser) {
        console.log(`User with firebaseId ${firebaseId} already exists in MongoDB.`);
        return;
      }

      // Create a new UserClient in MongoDB
      try {
        const userClient = new UserClient({
          firebaseId,
          email: data.email,
          displayName: data.name || data.displayName,
          dni: data.dni,
          firstName: data.firstName,
          lastName: data.lastName,
          faceData: data.faceData,
        });

        await userClient.save();
        console.log(`UserClient created in MongoDB for firebaseId ${firebaseId}`);
      } catch (error) {
        console.error(`Error creating UserClient in MongoDB for firebaseId ${firebaseId}:`, error);
      }
    }
  });
});

// --- End of User Synchronization Logic ---

// Configure CORS and apply middleware for /graphql route
app.use(
  '/graphql',
  cors({
    origin: '*', // Adjust as needed
    credentials: true,
  }),
  expressMiddleware(server, {
    context: ({ req, res }) => buildContext({ req, res }),
  })
);

app.use(express.static(path.join(__dirname, 'frontend', 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
});


await connectDB();

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server is running on port ${PORT}`);
});
