// routes/tag.js
import express from 'express';
import Tag from '../models/tag.model.js';
import Association from '../models/association.model.js';
import Product from '../models/product.model.js';
import { io } from '../index.js';
import admin from '../firebaseAdmin.js';

const router = express.Router();
const firestore = admin.firestore();

// Create or Update a Tag based on UIDresult
router.post('/', async (req, res) => {
  try {
    const { UIDresult } = req.body;

    if (!UIDresult) {
      return res.status(400).json({ message: 'UIDresult is required' });
    }

    const existingTag = await Tag.findOne({ UIDresult });

    let tag;
    if (existingTag) {
      tag = await Tag.findByIdAndUpdate(
        existingTag._id,
        { $set: { updatedAt: new Date() } },
        { new: true }
      );

      io.emit('uidresult', { UIDresult: tag.UIDresult, updatedAt: tag.updatedAt });

      const association = await Association.findOne({ tag: tag._id }).populate('product');

      if (association) {
        const product = association.product;

        const productInfo = {
          UIDresult: tag.UIDresult, // Include UIDresult
          productId: product._id.toString(),
          name: product.name || '',
          description: product.description || '',
          price: product.price || 0,
          timestamp: admin.firestore.Timestamp.now(),
        };

        console.log('Product Info:', productInfo);

        try {
          const querySnapshot = await firestore
            .collection('shoppingcart')
            .where('UIDresult', '==', tag.UIDresult)
            .get();

          if (!querySnapshot.empty) {
            const batch = firestore.batch();
            querySnapshot.forEach((doc) => {
              batch.delete(doc.ref);
            });
            await batch.commit();
            console.log(`Deleted existing document(s) with UIDresult: ${tag.UIDresult}`);
            res.status(200).json({ message: 'Product removed from shopping cart', tag });
          } else {
            await firestore.collection('shoppingcart').add(productInfo);
            console.log('Product info added to shoppingcart collection in Firestore:', productInfo);
            res.status(200).json({ message: 'Product added to shopping cart', tag });
          }
        } catch (firestoreError) {
          console.error('Failed to process product info in Firestore:', firestoreError);
          return res.status(500).json({
            message: 'Failed to process product info in Firestore',
            error: firestoreError.message,
          });
        }
      } else {
        console.log('No association found for tag:', tag._id.toString());
        res.status(404).json({ message: 'No association found for tag', tag });
      }
    } else {
      // Handle new tag creation
      // (Optional: Implement logic for creating new tags if needed)
      res.status(404).json({ message: 'Tag not found' });
    }
  } catch (error) {
    console.error('Error processing tag data:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

export default router;
