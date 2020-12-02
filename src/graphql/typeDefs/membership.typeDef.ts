import { gql } from 'apollo-server-express';

const membershipTypeDef = gql`
    scalar DateTime

    input GetMembersInput {
        familyId: String!
    }

    type Query {
        getFamiliesOfUser: [Family]!
        getMembersOfAFamily(input: GetMembersInput!): [User]!
    }
`;

export default membershipTypeDef;