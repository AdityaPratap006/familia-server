import { gql } from 'apollo-server-express';

const locationType = gql`
    scalar DateTime

    type Location {
        type: String!
        coordinates: [Float]!
    }

    type UserLocation {
        location: Location!
        user: User!
        createdAt: DateTime!
        updatedAt: DateTime!
    }

    input UpdateUserLocationInput {
        latitude: Float!
        longitude: Float!
    }

    type Mutation {
        updateUserLocation(input: UpdateUserLocationInput!): UserLocation!
    }

    type Query {
       memberLocations: [UserLocation!]!
    }
`;

export default locationType;