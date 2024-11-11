// typeDefs/root.js
import { gql } from 'apollo-server-express';

const rootTypeDefs = gql`
  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`;

export default rootTypeDefs;
