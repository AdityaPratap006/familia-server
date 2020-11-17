import express, { Express, Request, Response } from 'express';
import http from 'http';
import chalk from "chalk";
import { config as dotenvConfig } from 'dotenv';
import cors from 'cors';

dotenvConfig();

const app: Express = express();

app.use(cors());

app.get('/', (_req: Request, res: Response) => {
    res.send('Welcome to Familia Server!');
});

const mainServer = http.createServer(app);

const PORT = process.env.PORT;

mainServer.listen(PORT, () => {
    const localURL = `http://localhost:${PORT}`;
    console.log(`\nServer is ready at ${chalk.blueBright(localURL)}`);
});