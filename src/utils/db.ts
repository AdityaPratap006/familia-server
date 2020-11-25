import chalk from 'chalk';
import mongoose from "mongoose";

export const connectToDatabase = async () => {
    try {
        const dbURL = process.env.MONGODB_DATABASE_URL as string;
        await mongoose.connect(dbURL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false,
        });

        console.log(chalk.greenBright(`\nConnected to MongoDB successfully!\n`));
    } catch (error) {
        console.log(chalk.red(`\nError connecting to mongodb: ${error.message}\n`));
    }
}