//typeDefs/tag.js

import { gql } from 'apollo-server-express';

const tagTypeDef = gql`
  type Tag {
    id: ID!
    tagId: String
    UIDresult: String!
    createdAt: String!
    association: Association # Updated: Single Association
  }

  extend type Query {
    tags: [Tag!]!
    tag(id: ID!): Tag
    getTagByUIDresult(uidResult: String!): Tag
  }

  extend type Mutation {
    createTag(UIDresult: String!, tagId: ID): Tag!
    updateTag(id: ID!, UIDresult: String, tagId: ID): Tag!
    deleteTag(id: ID!): Boolean!
  }
`;

export default tagTypeDef;
