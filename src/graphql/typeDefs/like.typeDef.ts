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

    input IsPostLikedByUserInput {
        postId: String!
    }

    input DeleteLikeInput {
        postId: String!
    }

    type Query {
        allLikes: [Like!]!
        allLikesOnPost(input: AllLikesOnPostInput!): [Like!]!
        isPostLikedByUser(input: IsPostLikedByUserInput!): Boolean!
    }

    type Mutation {
        createLike(input: CreateLikeInput!): Like!
        deleteLike(input: DeleteLikeInput!): String!
    }

    type Subscription {
        onLiked: Like
        onDisliked: String
    }
`;

export default likeType;