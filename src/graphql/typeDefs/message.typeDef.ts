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
        skip: Int
    }

    input OnMessageAddedInput {
        familyId: String!
        from: String!
        to: String!
    }

    input OnMessageDeletedInput {
        familyId: String!
        from: String!
        to: String!
    }

    input DeleteMessageInput {
        messageId: String!
    }

    type Query {
        totalMessages: Int!
        totalChatMessages(input: AllChatMessagesInput!): Int!
        allChatMessages(input: AllChatMessagesInput!): [Message!]!
    }

    type Mutation {
        createMessage(input: CreateMessageInput!): Message!
        deleteMessage(input: DeleteMessageInput!): Message!
    }

    type Subscription {
        onMessageAdded(input: OnMessageAddedInput!): Message
        onMessageDeleted(input: OnMessageDeletedInput!): Message
    }
`;

export default messageType;