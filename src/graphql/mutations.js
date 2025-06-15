/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createLink = /* GraphQL */ `
  mutation CreateLink(
    $input: CreateLinkInput!
    $condition: ModelLinkConditionInput
  ) {
    createLink(input: $input, condition: $condition) {
      id
      title
      url
      description
      category
      approved
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateLink = /* GraphQL */ `
  mutation UpdateLink(
    $input: UpdateLinkInput!
    $condition: ModelLinkConditionInput
  ) {
    updateLink(input: $input, condition: $condition) {
      id
      title
      url
      description
      category
      approved
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteLink = /* GraphQL */ `
  mutation DeleteLink(
    $input: DeleteLinkInput!
    $condition: ModelLinkConditionInput
  ) {
    deleteLink(input: $input, condition: $condition) {
      id
      title
      url
      description
      category
      approved
      createdAt
      updatedAt
      __typename
    }
  }
`;
