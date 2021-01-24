import express, { Express, Request, Response } from 'express';
import http from 'http';
import chalk from 'chalk';
import { config as dotenvConfig } from 'dotenv';
import cors from 'cors';
import { ApolloServer } from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge';
import { GraphQLSchema } from 'graphql';
import path from 'path';
import { contextFunction } from './graphql/helpers/context';
import { connectToDatabase } from './utils/db';
import { getVerifiedUser } from './graphql/helpers/auth';
import { initIOServer } from './io';

dotenvConfig();

const app: Express = express();

app.use(cors());

app.get('/', (_req: Request, res: Response) => {
    res.send('Welcome to Familia Server!');
});

const typeDefs = mergeTypeDefs(loadFilesSync(path.join(__dirname, `./graphql/typeDefs/`)));
const resolvers = mergeResolvers(loadFilesSync(path.join(__dirname, `./graphql/resolvers/`)));

const schema: GraphQLSchema = makeExecutableSchema({
    typeDefs: typeDefs,
    resolvers: resolvers,
});

const apolloServer = new ApolloServer({
    schema: schema,
    context: contextFunction,
    subscriptions: {
        onConnect: async (connectionParams: any, _webSocket) => {
            if (connectionParams.authorization) {
                try {
                    const user = await getVerifiedUser(connectionParams.authorization);
                    return user;
                } catch (error) {
                    throw error;
                }
            } else {
                throw new Error('Missing auth token!');
            }

        },
    },
});

apolloServer.applyMiddleware({
    app: app,
    bodyParserConfig: {
        limit: '1mb',
    }
});

const mainServer = http.createServer(app);

apolloServer.installSubscriptionHandlers(mainServer);

const startServer = async () => {
    try {
        console.log(`Server is initializing!`);
        console.log(chalk.gray(`please wait...`));
        await connectToDatabase();

        const PORT = process.env.PORT;
        const httpServer = mainServer.listen(PORT, () => {
            const localURL = `http://localhost:${PORT}`;
            console.log(`Server is ready at ${chalk.blueBright(localURL)}`);

            const graphqlURL = `${localURL}${apolloServer.graphqlPath}`;
            console.log(`GraphQL Server is ready at ${chalk.magentaBright(graphqlURL)}`);

            const subscriptionsURL = `${localURL}${apolloServer.subscriptionsPath}`;
            console.log(`GraphQL Subscriptions are ready at ${chalk.cyan(subscriptionsURL)}\n`);
        });

        initIOServer(httpServer);

    } catch (error) {
        console.log(chalk.red(`Could not start server: ${error.message}`));
    }
}

startServer();