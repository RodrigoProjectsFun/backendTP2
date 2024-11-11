import { gql } from "@apollo/client";


export const GET_TAG_BY_UIDRESULT = gql`
query GetTagByUIDresult($uidResult: String!) {
  getTagByUIDresult(uidResult: $uidResult) {
    id
    UIDresult
    createdAt
    updatedAt
  }
}
`;

