// importUsers.js

import mongoose from 'mongoose';
import admin from './firebaseAdmin.js';
import dotenv from 'dotenv';
import UserClient from './models/userclient.model.js';
dotenv.config();

// Initialize Firestore
const db = admin.firestore();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

(async () => {
  try {
    // Fetch users from Firestore
    const usersSnapshot = await db.collection('users').get();

    const userClients = [];

    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      userClients.push({
        firebaseId: doc.id,
        email: data.email,
        displayName: data.displayName,
        createdAt: data.createdAt ? data.createdAt.toDate() : null,
        updatedAt: data.updatedAt ? data.updatedAt.toDate() : null,
      });
    });

    console.log(`Fetched ${userClients.length} userClients from Firestore.`);

    // Insert userClients into MongoDB
    for (const userData of userClients) {
      // Check if userClient already exists
      const existingUserClient = await UserClient.findOne({
        firebaseId: userData.firebaseId,
      });
      if (existingUserClient) {
        console.log(
          `UserClient ${userData.firebaseId} already exists in MongoDB. Skipping.`
        );
        continue;
      }

      const userClient = new UserClient(userData);
      await userClient.save();
      console.log(`UserClient ${userClient.firebaseId} saved to MongoDB.`);
    }

    console.log('Import completed.');

    // Close MongoDB connection
    mongoose.connection.close();
  } catch (error) {
    console.error('Error importing userClients:', error);
  }
})();
