import chalk from 'chalk';
import util from 'util';
import { IFieldResolver, IResolvers } from 'graphql-tools';
import { authCheck } from '../helpers/auth';
import { ContextAttributes } from '../helpers/context';

const me: IFieldResolver<any, ContextAttributes, any, Promise<{ name: string, age: number }>> = async (parent, args, context) => {
    const { req } = context;

    const currentUser = await authCheck(req);

    console.log(chalk.blueBright("current user is: ", util.inspect(currentUser, { showHidden: false, depth: null })));

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