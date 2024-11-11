// typeDefs/userclient.js

import { gql } from 'apollo-server-express';

const userClientTypeDefs = gql`
  type UserClient {
  id: ID!
  firebaseId: String!
  email: String!
  displayName: String
  dni: String
  firstName: String
  lastName: String
  faceData: [Float]
}

type Query {
  userClients: [UserClient]
  userClient(id: ID!): UserClient
  userClientByFirebaseId(firebaseId: String!): UserClient
}

type Mutation {
  createUserClient(
    firebaseId: String!
    email: String!
    displayName: String
    dni: String
    firstName: String
    lastName: String
    faceData: [Float]
  ): UserClient

  updateUserClient(
    id: ID!
    email: String
    displayName: String
    dni: String
    firstName: String
    lastName: String
    faceData: [Float]
  ): UserClient

  deleteUserClient(id: ID!): Boolean
}
`;

export default userClientTypeDefs;
