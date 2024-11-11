import { gql } from '@apollo/client';

export const GET_PRODUCTS = gql`
  query GetProducts {
    products {
      id
      name
      price
      description
      category {
        id
        name
      }
    }
  }
`;
