// typeDefs/order.js

import { gql } from 'apollo-server-express';

const orderTypeDefs = gql`
  type OrderItem {
    product: Product!
    quantity: Int!
  }

  type Order {
    id: ID!
    userClient: UserClient
    items: [OrderItem!]!
    totalAmount: Float!
    paymentLink: String
    status: String!
    createdAt: String!
    updatedAt: String!
  }

  input OrderItemInput {
    productId: ID!
    quantity: Int!
  }

  extend type Query {
    orders: [Order!]!
    order(id: ID!): Order
  }

  extend type Mutation {
    createOrder(items: [OrderItemInput!]!, firebaseId: String!): Order!
    updateOrder(id: ID!, status: String): Order!
    deleteOrder(id: ID!): Boolean!
  }
`;

export default orderTypeDefs;
