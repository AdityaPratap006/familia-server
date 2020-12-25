import { gql } from 'apollo-server-express';

const inviteTypeDef = gql`
    scalar DateTime

    type Invite {
        _id: ID!
        family: Family!
        from: User!
        to: User!
        createdAt: DateTime!
        updatedAt: DateTime!
    }

    input CreateInviteInput {
        family: String!
        to: String!
    }

    input GetInvitesSentForFamilyInput {
        familyId: String!
    }

    input DeleteInviteInput {
        inviteId: String!
    }

    type Query {
        getAllInvites: [Invite]!
        getInvitesReceivedByUser: [Invite]!
        getInvitesSentByUser: [Invite]!
        getInvitesSentForAFamily(input: GetInvitesSentForFamilyInput!): [Invite]!
    }

    type Mutation {
        createInvite(input: CreateInviteInput!): Invite!
        deleteInvite(input: DeleteInviteInput!): String!
    }
`;

export default inviteTypeDef;