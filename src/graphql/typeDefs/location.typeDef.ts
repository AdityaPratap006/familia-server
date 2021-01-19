import { gql } from 'apollo-server-express';

const locationType = gql`
    scalar DateTime

    type Location {
        type: String!
        coordinates: [Float]!
    }

    type UserLocation {
        _id: ID!
        location: Location!
        user: User!
        createdAt: DateTime!
        updatedAt: DateTime!
    }

    input UpdateUserLocationInput {
        latitude: Float!
        longitude: Float!
    }

    input GetMemberLocationsInput {
        familyId: String!
    }

    type Mutation {
        updateUserLocation(input: UpdateUserLocationInput!): UserLocation!
    }

    type Query {
       memberLocations(input: GetMemberLocationsInput!): [UserLocation!]!
    }
`;

export default locationType;