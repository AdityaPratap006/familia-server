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

    type Query {
        totalPosts: Int!
        allPosts(input: AllPostsInput!): [Post!]!
    }

    type Mutation {
        createPost(input: CreatePostInput!): Post!
    }

    type Subscription {
        onPostAdded: Post
    }
`;

export default postType;