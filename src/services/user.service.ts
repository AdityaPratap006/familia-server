import chalk from 'chalk';
import { User } from '../models/user.model';
// import { cloudinary } from '../utils/cloudinary';

interface NewUserInput {
    email: string;
    name: string;
    photoURL: string;
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
        const users = await User.find();
        return users;
    }

    static getOneUserByEmail = async (userEmail: string) => {
        const user = await User.findOne({ email: userEmail });
        return user;
    }

    static createNewUser = async (userData: NewUserInput) => {
        const newUser = User.build({
            email: userData.email as string,
            name: userData.name,
            about: '',
            image: {
                url: userData.photoURL,
                public_id: '',
            }
        });

        await newUser.save();
        console.log(chalk.green('created new user'));

        return newUser;
    }

    static getAndUpdateOneUser = async (userEmail: string, newUserData: UpdateUserInput) => {

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

        // delete newUserData.imageBase64String;

        const updatedUser = await User.findOneAndUpdate({
            email: userEmail
        }, {
            ...newUserData,
            images: profileImageData,
        }, {
            new: true
        }).exec();

        return updatedUser;
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

            if (!updatedUser) {
                throw Error(`Token Not Saved: User with email ${userEmail} not found!`);
            }

            return updatedUser;
        } catch (error) {
            throw error;
        }
    }
}