import chalk from 'chalk';
import mongoose, { mongo } from 'mongoose';

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

export const compareMongoDocumentIds = (id1: any, id2: any) => {
    const objId1 = new mongo.ObjectID(id1);
    const objId2 = new mongo.ObjectID(id2);

    return objId1.equals(objId2);
}