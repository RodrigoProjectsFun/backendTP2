import { gql } from '@apollo/client';

export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
      description
    }
  }
`;

export const GET_CATEGORY = gql`
  query GetCategory($id: ID!) {
    category(id: $id) {
      id
      name
      description
    }
  }
`;
