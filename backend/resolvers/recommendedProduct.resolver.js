const RecommendedProduct = require('../models/recommendedproduct.model');
const UserClient = require('../models/userclient.model');
const Product = require('../models/product.model');

const recommendedProductResolvers = {
  Query: {
    recommendedProducts: async (_, { firebaseId }) => {
      const user = await UserClient.findOne({ firebaseId });
      if (!user) {
        throw new Error('User not found');
      }
      const recommendations = await RecommendedProduct.find({ userClient: user._id })
        .populate('product')
        .populate('userClient');
      return recommendations;
    },
  },
  RecommendedProduct: {
    userClient: (parent) => {
      return parent.userClient;
    },
    product: (parent) => {
      return parent.product;
    },
  },
};

module.exports = recommendedProductResolvers;
