import { Message, MessageAttributes } from '../models/message.model';
import { internalServerError } from '../errors';

export default class MessageService {
    static getAllMessages = async () => {
        try {
            const messages = await Message.find().sort({ createdAt: -1 });
            return messages;
        } catch (error) {
            throw internalServerError;
        }
    }

    static getChatMessages = async (from: string, to: string, familyId: string) => {
        try {
            const messages = await Message.find({
                from: from,
                to: to,
                family: familyId,
            }).sort({ createdAt: -1 });
            return messages;
        } catch (error) {
            throw internalServerError;
        }
    }

    static createNewMessage = async (attrs: MessageAttributes) => {
        try {
            const newMessage = Message.build({
                ...attrs,
            });

            await newMessage.save();
            return newMessage;
        } catch (error) {
            throw internalServerError;
        }
    }
}