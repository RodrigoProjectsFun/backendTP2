import { gql } from 'apollo-server-express';

const RecommendedProduct = gql`

type RecommendedProduct {
    id: ID!
    userClient: UserClient!
    product: Product!
    similarity: Float!
    createdAt: String
    updatedAt: String
  }
  
  extend type Query {
    recommendedProducts(firebaseId: String!): [RecommendedProduct!]!
  }
  `

export default RecommendedProduct;
