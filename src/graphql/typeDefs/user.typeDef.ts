import { gql } from 'apollo-server-express';

const authType = gql`
    scalar DateTime

    type Image {
        url: String
        public_id: String
    }

    type User {
        _id: ID!
        username: String
        email: String
        name: String
        about: String
        images: [Image]
        createdAt: DateTime
        updatedAt: DateTime
    }

    input AuthTokenInput {
        authToken: String!
    }

    type CreateUserResponse {
        name: String!
        email: String!
    }

    input ImageInput {
        url: String!
        public_id: String!
    }

    input UpdateUserInput {
        username: String
        email: String
        name: String
        imageBase64String: String
        about: String
    }

    type Mutation {
        # createUser(input: AuthTokenInput!): CreateUserResponse!
        createUser: CreateUserResponse!
        updateUser(input: UpdateUserInput): User!
    }

    type Query {
        profile: User!
        allUsers: [User]!
    }
`;

export default authType;