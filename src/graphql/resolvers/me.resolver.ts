import { IFieldResolver, IResolvers } from 'graphql-tools';

const me: IFieldResolver<any, any, any, Promise<{ name: string, age: number }>> = async (parent, args, context) => {
    return {
        name: 'Aditya Pratap',
        age: 20,
    };
}

const meResolver: IResolvers = {
    Query: {
        me,
    },
};

export default meResolver;