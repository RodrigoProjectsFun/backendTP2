// typeDefs/association.js

import { gql } from 'apollo-server-express';

const associationTypeDef = gql`
  type Association {
    id: ID!
    product: Product!
    tag: Tag!
    createdAt: String!
    updatedAt: String!
  }

  extend type Query {
    associations: [Association!]!
    association(id: ID!): Association
  }

  extend type Mutation {
    createAssociation(productId: ID!, UIDresult: String!): Association!
    createOrUpdateAssociation(productId: ID!, UIDresult: String!): Association!
    updateAssociation(id: ID!, productId: ID, UIDresult: String): Association
    deleteAssociation(id: ID!): Association
  }
`;

export default associationTypeDef;
