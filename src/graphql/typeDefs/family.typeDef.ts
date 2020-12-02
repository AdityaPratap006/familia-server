import { gql } from 'apollo-server-express';

const familyTypeDef = gql`
    scalar DateTime

    type Family {
        _id: ID!
        name: String!
        description: String
        creator: User!
        memberCount: Int!
        createdAt: DateTime!
        updatedAt: DateTime!
    }

    input CreateFamilyInput {
        name: String!
        description: String
    }

    input UpdateFamilyInput {
        name: String!
        description: String
    }

    type Mutation {
        createFamily(input: CreateFamilyInput!): Family!
        updateFamily(input: UpdateFamilyInput!): Family!
    }

    type Query {
        allFamilies: [Family]!
    }
`;

export default familyTypeDef;