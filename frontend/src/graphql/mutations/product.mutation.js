import { gql } from '@apollo/client';

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($name: String!, $price: Float, $description: String, $categoryId: ID) {
    createProduct(name: $name, price: $price, description: $description, categoryId: $categoryId) {
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

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: ID!, $name: String, $price: Float, $description: String, $categoryId: ID) {
    updateProduct(id: $id, name: $name, price: $price, description: $description, categoryId: $categoryId) {
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

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id)
  }
`;
