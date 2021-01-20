import { gql } from 'apollo-server-express';

const memoryType = gql`

    type Memory {
        _id: ID!
        type: String!
        content: String
        family: Family!
        date: String!
        createdAt: DateTime!
        updatedAt: DateTime!
    }

    input CreateMemoryInput {
        type: String!
        content: String!
        familyId: String!
        date: String!
    }

    input AllMemoriesInFamilyInput {
        familyId: String!
    }

    type Query {
        allMemories: [Memory!]!
        allMemoriesInFamily(input: AllMemoriesInFamilyInput!): [Memory!]!
    }

    type Mutation {
        createMemory(input: CreateMemoryInput!): Memory!
    }
`;

export default memoryType;