import { gql } from 'apollo-server-express';

const membershipTypeDef = gql`
    scalar DateTime
    
    type Query {
        getFamiliesOfUser: [Family]!
    }
`;

export default membershipTypeDef;