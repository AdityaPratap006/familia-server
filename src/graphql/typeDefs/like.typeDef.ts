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
        likeId: String!
    }

    input OnLikedInput {
        postId: String!
    }

    input OnUnlikedInput {
        postId: String!
    }

    type Query {
        allLikes: [Like!]!
        allLikesOnPost(input: AllLikesOnPostInput!): [Like!]!
        isPostLikedByUser(input: IsPostLikedByUserInput!): Boolean!
    }

    type Mutation {
        createLike(input: CreateLikeInput!): Like!
        deleteLike(input: DeleteLikeInput!): Like!
    }

    type Subscription {
        onLiked(input: OnLikedInput!): Like
        onUnliked(input: OnUnlikedInput!): Like
    }
`;

export default likeType;