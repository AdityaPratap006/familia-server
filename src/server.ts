import express, { Express, Request, Response } from 'express';
import http from 'http';
import chalk from "chalk";
import { config as dotenvConfig } from 'dotenv';
import cors from 'cors';
import { ApolloServer } from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge';
import { GraphQLSchema } from 'graphql';
import path from 'path';

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
    context: ({ req }) => ({ req }),
});

apolloServer.applyMiddleware({
    app: app,
    bodyParserConfig: {
        limit: '1mb',
    }
});

const mainServer = http.createServer(app);

const PORT = process.env.PORT;

mainServer.listen(PORT, () => {
    const localURL = `http://localhost:${PORT}`;
    console.log(`\nServer is ready at ${chalk.blueBright(localURL)}`);

    const graphqlURL = `${localURL}${apolloServer.graphqlPath}`;
    console.log(`GraphQL Server is ready at ${chalk.magentaBright(graphqlURL)}`);
});