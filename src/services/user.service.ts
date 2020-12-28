import chalk from 'chalk';
import { User } from '../models/user.model';
import { internalServerError } from '../errors';
// import { cloudinary } from '../utils/cloudinary';

interface NewUserInput {
    email: string;
    name: string;
    photoURL: string;
    auth_id: string;
}

interface ProfileImageInput {
    url: string;
    public_id: string;
}

interface UpdateUserInput {
    name?: string;
    about?: string;
    imageBase64String?: string;
    fcmToken?: string;
}

export default class UserService {

    static getAllUsers = async () => {
        try {
            const users = await User.find();
            return users;
        } catch (error) {
            throw internalServerError;
        }
    }

    static getOneUserByAuthId = async (authId: string) => {
        try {
            const user = await User.findOne({ auth_id: authId });
            return user;
        } catch (error) {
            throw internalServerError;
        }
    }

    static getOneUserByEmail = async (userEmail: string) => {
        try {
            const user = await User.findOne({ email: userEmail });
            return user;
        } catch (error) {
            throw internalServerError;
        }
    }

    static createNewUser = async (userData: NewUserInput) => {
        try {
            const newUser = User.build({
                email: userData.email,
                name: userData.name,
                about: '',
                image: {
                    url: userData.photoURL,
                    public_id: '',
                },
                auth_id: userData.auth_id,
            });

            await newUser.save();
            console.log(chalk.green('created new user'));

            return newUser;
        } catch (error) {
            throw internalServerError;
        }
    }

    static getAndUpdateOneUser = async (userEmail: string, newUserData: UpdateUserInput) => {
        try {

            let profileImageData: ProfileImageInput = {
                public_id: '',
                url: '',
            }

            // if (newUserData.imageBase64String) {
            //     try {
            //         const result = await cloudinary.uploader.upload(newUserData.imageBase64String, {
            //             public_id: `${Date.now()}`,
            //             upload_preset: `social_app_graphql_profile_pics`,
            //         });

            //         profileImageData = {
            //             public_id: result.public_id,
            //             url: result.url,
            //         };

            //     } catch (error) {
            //         throw Error(`error uploading image`);
            //     }
            // }

            delete newUserData.imageBase64String;

            // const dataToBeUpdated = { ...newUserData };

            const updatedUser = await User.findOneAndUpdate({
                email: userEmail
            }, {
                ...newUserData,
                image: profileImageData,
            }, {
                new: true
            }).exec();

            return updatedUser;
        } catch (error) {
            throw internalServerError;
        }
    }

    static saveFcmTokenForUser = async (userEmail: string, fcmToken: string) => {
        try {
            const updatedUser = await User.findOneAndUpdate({
                email: userEmail
            }, {
                fcmToken,
            }, {
                new: true
            }).exec();

            return updatedUser;
        } catch (error) {
            throw internalServerError;
        }
    }

    static searchUsers = async (searchQuery: string) => {
        try {
            const results = await User.find({ $text: { $search: searchQuery } });
            return results;
        } catch (error) {
            throw internalServerError;
        }
    }
}