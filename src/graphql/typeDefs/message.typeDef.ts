import { gql } from 'apollo-server-express';

const messageType = gql`
    type Message {
        _id: ID!
        text: String!
        from: User!
        to: User!
        family: String!
        createdAt: DateTime!
        updatedAt: DateTime!
    }

    input CreateMessageInput {
        text: String!
        from: String!
        to: String!
        familyId: String!
    }

    input AllChatMessagesInput {
        familyId: String!
        from: String!
        to: String!
    }

    type Query {
        totalMessages: Int!
        allChatMessages(input: AllChatMessagesInput!): [Message!]!
    }

    type Mutation {
        createMessage(input: CreateMessageInput!): Message!
    }

    type Subscription {
        onMessageAdded: Message
    }
`;

export default messageType;