// models/product.model.js

import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    price: {
      type: Number,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', ProductSchema);

export default Product;
