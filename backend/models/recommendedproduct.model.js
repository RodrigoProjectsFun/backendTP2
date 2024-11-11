const mongoose = require('mongoose');

const RecommendedProductSchema = new mongoose.Schema(
  {
    userClient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserClient',
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    similarity: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const RecommendedProduct = mongoose.model('RecommendedProduct', RecommendedProductSchema);

module.exports = RecommendedProduct;
