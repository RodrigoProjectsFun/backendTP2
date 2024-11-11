// typeDefs/category.typeDefs.js
import { gql } from 'apollo-server-express';
const categoryTypedef = gql`

type Category {
  id: ID!
  name: String!
  description: String
  products: [Product]
}

extend type Query {
  categories: [Category]
  category(id: ID!): Category
}

extend type Mutation {
  createCategory(name: String!, description: String): Category
  updateCategory(id: ID!, name: String, description: String): Category
  deleteCategory(id: ID!): Boolean
}
`;

export default categoryTypedef;
