// resolvers/category.js

import Category from '../models/category.model.js';
import Product from '../models/product.model.js';
import admin from '../firebaseAdmin.js'; 
import dotenv from 'dotenv';
dotenv.config();
const db = admin.firestore(); // Initialize Firestore

const categoryResolvers = {
  Query: {
    categories: async () => await Category.find(),
    category: async (_, { id }) => await Category.findById(id),
  },
  Mutation: {
    createCategory: async (_, { name, description }) => {
      // Check if category exists in MongoDB
      const existingCategory = await Category.findOne({ name });
      if (existingCategory) {
        throw new Error('Category with this name already exists.');
      }

      // Check if category exists in Firebase
      const categorySnapshot = await db.collection('categories').where('name', '==', name).get();
      if (!categorySnapshot.empty) {
        throw new Error('Category with this name already exists in Firebase.');
      }

      // Create category in MongoDB
      const category = new Category({ name, description });
      const savedCategory = await category.save();

      // Create category in Firebase
      const firebaseCategory = {
        name,
        description,
        createdAt: savedCategory.createdAt,
        updatedAt: savedCategory.updatedAt,
      };
      await db.collection('categories').doc(savedCategory._id.toString()).set(firebaseCategory);

      return savedCategory;
    },
    updateCategory: async (_, { id, name, description }) => {
      // Prepare the update data
      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
    
      // Update category in MongoDB
      const updatedCategory = await Category.findByIdAndUpdate(id, updateData, { new: true });
      if (!updatedCategory) {
        throw new Error('Category not found.');
      }
    
      // Update or Create category in Firebase
      try {
        // Prepare data for Firebase
        const firebaseUpdateData = {
          name: updatedCategory.name,
          description: updatedCategory.description,
          updatedAt: updatedCategory.updatedAt,
        };
    
        const firebaseDocRef = db.collection('categories').doc(id);
        const firebaseDoc = await firebaseDocRef.get();
    
        if (firebaseDoc.exists) {
          // Document exists, update it
          await firebaseDocRef.update(firebaseUpdateData);
        } else {
          // Document doesn't exist, create it with createdAt
          const firebaseCategoryData = {
            ...firebaseUpdateData,
            createdAt: updatedCategory.createdAt,
          };
          await firebaseDocRef.set(firebaseCategoryData);
        }
      } catch (error) {
        console.error('Error updating category in Firebase:', error);
        // Optionally, handle the error or throw it
      }
    
      return updatedCategory;
    },
    
    deleteCategory: async (_, { id }) => {
      const deletedCategory = await Category.findByIdAndDelete(id);
      if (!deletedCategory) {
        throw new Error('Category not found.');
      }

      // Delete category from Firebase
      await db.collection('categories').doc(id).delete();

      return true;
    },
  },
  Category: {
    products: async (parent) => await Product.find({ category: parent.id }),
  },
};

export default categoryResolvers;
