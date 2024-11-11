// resolvers/userclient.js
import UserClient from '../models/userclient.model.js';

import admin from '../firebaseAdmin.js'; // Firebase Admin SDK

const db = admin.firestore();

const userClientResolvers = {
  Query: {
    userClients: async () => await UserClient.find(),
    userClient: async (_, { id }) => await UserClient.findById(id),
    userClientByFirebaseId: async (_, { firebaseId }) =>
      await UserClient.findOne({ firebaseId }),
  },
  Mutation: {
    createUserClient: async (_, { firebaseId, email, displayName, dni, firstName, lastName, faceData }) => {
      // Check if user already exists
      const existingUserClient = await UserClient.findOne({ firebaseId });
      if (existingUserClient) {
        throw new Error('UserClient already exists.');
      }

      const userClient = new UserClient({
        firebaseId,
        email,
        displayName,
        dni,
        firstName,
        lastName,
        faceData,
      });

      const savedUserClient = await userClient.save();

      // Save user data to Firestore (if needed)
      // Since the user is already in Firestore, you may skip this step or update as necessary

      return savedUserClient;
    },
    updateUserClient: async (_, { id, email, displayName, dni, firstName, lastName, faceData }) => {
      const updateData = {};
      if (email !== undefined) updateData.email = email;
      if (displayName !== undefined) updateData.displayName = displayName;
      if (dni !== undefined) updateData.dni = dni;
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (faceData !== undefined) updateData.faceData = faceData;

      const updatedUserClient = await UserClient.findByIdAndUpdate(id, updateData, {
        new: true,
      });

      if (!updatedUserClient) {
        throw new Error('UserClient not found.');
      }

      // Update user data in Firestore (if needed)
      // You can update the Firestore document here if necessary

      return updatedUserClient;
    },
    deleteUserClient: async (_, { id }) => {
      const deletedUserClient = await UserClient.findByIdAndRemove(id);
      if (!deletedUserClient) {
        throw new Error('UserClient not found.');
      }

      // Delete user data from Firestore (if needed)

      return true;
    },
  },
};

export default userClientResolvers;
