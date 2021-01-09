import { gql } from 'apollo-server-express';

const likeType = gql`
    type Like {
        _id: ID!
        likedBy: User!
        post: String!
        createdAt: DateTime!
        updatedAt: DateTime!
    }

    input CreateLikeInput {
        postId: String!
    }

    input AllLikesOnPostInput {
        postId: String!
    }

    type Query {
        allLikes: [Like!]!
        allLikesOnPost(input: AllLikesOnPostInput!): [Like!]!
    }

    type Mutation {
        createLike(input: CreateLikeInput!): Like!
    }

    type Subscription {
        onLiked: Like
    }
`;

export default likeType;