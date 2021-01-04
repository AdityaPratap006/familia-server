import chalk from 'chalk';
import { User } from '../models/user.model';
import { internalServerError } from '../errors';
import { cloudinary } from '../utils/cloudinary';

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

interface UserDataToBeUpdated {
    name?: string;
    about?: string;
    image?: ProfileImageInput;
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

    static getAndUpdateOneUser = async (userAuthId: string, newUserData: UpdateUserInput) => {
        try {


            const user = await User.findOne({ auth_id: userAuthId });

            if (!user) {
                throw Error('user not found');
            }


            const dataToBeUpdated: UserDataToBeUpdated = {};

            if (newUserData.imageBase64String) {

                if (user.image.public_id.trim()) {
                    try {
                        await cloudinary.uploader.destroy(user.image.public_id);
                    } catch (error) {
                        throw internalServerError;
                    }
                }

                try {
                    const result = await cloudinary.uploader.upload(newUserData.imageBase64String, {
                        upload_preset: `profile_pics`,
                    });

                    dataToBeUpdated.image = {
                        public_id: result.public_id,
                        url: result.url,
                    };

                } catch (error) {
                    throw internalServerError;
                }
            }


            if (newUserData.name && newUserData.name.trim() !== '') {
                dataToBeUpdated.name = newUserData.name;
            }

            if (newUserData.about) {
                dataToBeUpdated.about = newUserData.about;
            }

            const updatedUser = await User.findOneAndUpdate({
                auth_id: userAuthId,
            }, {
                ...dataToBeUpdated,
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