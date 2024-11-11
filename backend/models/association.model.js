// models/association.model.js

import mongoose from 'mongoose';

const AssociationSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    tag: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tag',
      required: true,
      unique: true, 
    },
  },
  { timestamps: true }
);

AssociationSchema.index({ tag: 1 }, { unique: true });

const Association = mongoose.model('Association', AssociationSchema);

export default Association;
