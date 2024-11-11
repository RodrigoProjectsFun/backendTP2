// src/graphql/mutations/association.mutation.js

import { gql } from "@apollo/client";

export const CREATE_OR_UPDATE_ASSOCIATION = gql`
  mutation CreateOrUpdateAssociation($productId: ID!, $UIDresult: String!) {
    createOrUpdateAssociation(productId: $productId, UIDresult: $UIDresult) {
      id
      product {
        id
        name
      }
      tag {
        id
        UIDresult
      }
      createdAt
      updatedAt
    }
  }
`;
