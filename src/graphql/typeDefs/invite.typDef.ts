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
        familyId: String!
        from: String!
        to: String!
    }

    input GetInviteInput {
        familyId: String!
    }

    type Query {
        getAllInvites: [Invite]!
    }
`;

export default inviteTypeDef;