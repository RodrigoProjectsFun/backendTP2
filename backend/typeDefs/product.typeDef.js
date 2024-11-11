// typeDefs/product.js

import { gql } from 'apollo-server-express';

const productTypeDefs = gql`
  type Product {
    id: ID!
    name: String!
    price: Float
    category: Category
    description: String
    createdAt: String!
    updatedAt: String!
    associations: [Association!]!
  }

  extend type Query {
    products: [Product!]!
    product(id: ID!): Product
  }

  extend type Mutation {
    createProduct(
      name: String!
      price: Float
      categoryId: ID
      description: String
    ): Product!
    updateProduct(
      id: ID!
      name: String
      price: Float
      categoryId: ID
      description: String
    ): Product!
    deleteProduct(id: ID!): Boolean!
  }
`;

export default productTypeDefs;
