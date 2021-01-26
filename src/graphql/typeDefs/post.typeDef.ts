import { gql } from 'apollo-server-express';

const postType = gql`
    type PostImage {
        public_id: String!
        url: String!
    }

    type Post {
        _id: ID!
        title: String!
        content: String
        image: PostImage
        author: User!
        family: Family!
        createdAt: DateTime!
        updatedAt: DateTime!
    }

    input CreatePostInput {
        title: String!
        content: String
        familyId: String!
        imageBase64String: String
    }

    input AllPostsInput {
        skip: Int
    }

    input AllPostsInFamilyInput {
        familyId: String!
    }

    input DeletePostInput {
        postId: String!
    }

    type Query {
        totalPosts: Int!
        allPosts(input: AllPostsInput!): [Post!]!
        allPostsInFamily(input: AllPostsInFamilyInput!): [Post!]!
    }

    type Mutation {
        createPost(input: CreatePostInput!): Post!
        deletePost(input: DeletePostInput!): Post!
    }

    type Subscription {
        onPostAdded: Post
    }
`;

export default postType;