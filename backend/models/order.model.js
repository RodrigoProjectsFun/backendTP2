// models/order.model.js

import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
  {
    userClient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserClient',
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentLink: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'cancelled', 'completed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', OrderSchema);

export default Order;
