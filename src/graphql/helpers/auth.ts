import { Request } from 'express';
import { AuthenticationError } from 'apollo-server-express';
import { config as dotenvConfig } from 'dotenv';
import { firebaseAdmin } from '../../utils/firebase-admin';

dotenvConfig();

const userNotFoundError = new Error('User not found');

const getUserDetails = async (uid: string) => {
    try {
        const currentUser = await firebaseAdmin.auth().getUser(uid);
        return currentUser;
    } catch (error) {
        throw userNotFoundError;
    }
}

export const getVerifiedUser = async (authToken: string) => {
    try {
        const decodedToken = await firebaseAdmin.auth().verifyIdToken(authToken);
        const currentUser = await getUserDetails(decodedToken.uid);

        return currentUser;
    } catch (error) {
        if ((error as Error).message.startsWith(userNotFoundError.message)) {
            throw userNotFoundError;
        }

        throw new AuthenticationError(`Invalid or expired token`);
    }
}

export const authCheck = async (req: Request) => {
    const authToken = req.headers.authorization || '';
    const currentUser = await getVerifiedUser(authToken);
    return currentUser;
}

export type UserRecord = firebaseAdmin.auth.UserRecord;
