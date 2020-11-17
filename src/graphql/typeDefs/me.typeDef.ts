import { gql } from 'apollo-server-express';

const meTypeDef = gql`

    type Me {
        name: String!
        age: Int!
    }

    type Query {
        me: Me!
    }
`;

export default meTypeDef;