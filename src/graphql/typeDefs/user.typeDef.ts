import { gql } from 'apollo-server-express';

const authType = gql`
    scalar DateTime

    type Image {
        url: String!
        public_id: String!
    }

    type User {
        _id: ID!
        email: String!
        name: String!
        about: String!
        image: Image!
        defaultFamilyId: String
        createdAt: DateTime!
        updatedAt: DateTime!
    }

    input AuthTokenInput {
        authToken: String!
    }

    input ImageInput {
        url: String!
        public_id: String!
    }

    input UpdateUserInput {
        email: String
        name: String
        imageBase64String: String
        about: String
    }

    input SetDefaultFamilyIdInput {
        familyId: String!
    }

    type Mutation {
        createUser: User!
        updateUser(input: UpdateUserInput): User!
        setDefaultFamilyId(input: SetDefaultFamilyIdInput): User!
    }

    type Query {
        profile: User!
        allUsers: [User]!
    }
`;

export default authType;