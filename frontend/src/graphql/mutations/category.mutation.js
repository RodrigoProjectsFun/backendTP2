import { gql } from '@apollo/client';

export const CREATE_CATEGORY = gql`
  mutation CreateCategory($name: String!, $description: String) {
    createCategory(name: $name, description: $description) {
      id
      name
      description
    }
  }
`;

export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($id: ID!, $name: String, $description: String) {
    updateCategory(id: $id, name: $name, description: $description) {
      id
      name
      description
    }
  }
`;

export const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id)
  }
`;
