import { Message, MessageAttributes, MessageDoc } from '../models/message.model';
import { internalServerError, MessageErrors } from '../errors';

export default class MessageService {
    static getAllMessages = async () => {
        try {
            const messages = await Message.find().sort({ createdAt: 1 })
                .populate('from')
                .populate('to');

            return messages;
        } catch (error) {

            throw internalServerError;
        }
    }

    static getChatMessages = async (from: string, to: string, familyId: string) => {
        try {
            const messages = await Message.find()
                .or([
                    {
                        from: from,
                        to: to,
                        family: familyId,
                    },
                    {
                        from: to,
                        to: from,
                        family: familyId,
                    }
                ])
                .sort({ createdAt: 1 })
                .populate('from')
                .populate('to');

            return messages;
        } catch (error) {
            console.log(error);

            throw internalServerError;
        }
    }

    static getMessageById = async (messageId: string) => {
        try {
            const message = await Message.findById(messageId)
                .populate('from')
                .populate('to');

            return message;
        } catch (error) {
            throw internalServerError;
        }
    }

    static createNewMessage = async (attrs: MessageAttributes) => {

        const { family, from, text, to } = attrs;

        if (!family.trim()) {
            throw MessageErrors.userInput.familyRequired;
        }

        if (!from.trim()) {
            throw MessageErrors.userInput.fromRequired;
        }

        if (!to.trim()) {
            throw MessageErrors.userInput.toRequired;
        }

        if (!text.trim()) {
            throw MessageErrors.userInput.textRequired;
        }

        if (text.trim().length > 1500) {
            throw MessageErrors.userInput.textTooLong;
        }

        try {
            const newMessage = Message.build({
                ...attrs,
            });

            await newMessage.save();
            const messageResult = await newMessage
                .populate('from')
                .populate('to')
                .execPopulate();

            return messageResult;
        } catch (error) {
            throw internalServerError;
        }
    }

    static deleteMessageById = async (messageId: string) => {
        try {
            const messageToBeDeleted = await Message.findById(messageId);

            if (!messageToBeDeleted) {
                throw MessageErrors.general.messageNotFound;
            }

            const messageData: MessageDoc = await messageToBeDeleted.populate('from').populate('to').execPopulate();

            await Message.findByIdAndDelete(messageId);

            return messageData;
        } catch (error) {
            throw internalServerError;
        }
    }
}