import { Memory } from '../models/memory.model';
import { internalServerError } from '../errors';

interface CreateMemoryParams {
    familyId: string;
    date: string;
    type: string;
    content: string;
}

export default class MemoryService {
    static getAllMemories = async () => {
        try {
            const memories = await Memory.find().populate('family');
            return memories;
        } catch (error) {
            throw internalServerError;
        }
    }

    static getAllMemoriesOfFamily = async (familyId: string) => {
        try {
            const memories = await Memory.find({
                family: familyId,
            }).populate('family');
            return memories;
        } catch (error) {
            throw internalServerError;
        }
    }

    static createMemory = async (params: CreateMemoryParams) => {
        try {
            const { content, date, familyId, type } = params;
            const newMemory = Memory.build({
                content,
                date,
                family: familyId,
                type,
            });

            await newMemory.save();
            await newMemory.populate('family').execPopulate();
            return newMemory;
        } catch (error) {
            throw internalServerError;
        }
    }
}