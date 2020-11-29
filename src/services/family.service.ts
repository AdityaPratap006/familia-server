import chalk from 'chalk';
import mongoose from 'mongoose';
import { Family, FamilyAttributes, FamilyDoc } from '../models/family.model';
import { UserDoc } from '../models/user.model';
import { Membership } from '../models/membership.model';

export default class FamilyService {
    static async getAllFamilies() {
        const families = await Family.find().populate('creator');
        return families;
    }

    static async createNewFamily(attrs: FamilyAttributes): Promise<FamilyDoc> {
        try {
            const session = await mongoose.startSession();
            session.startTransaction();

            const newFamily = Family.build({
                ...attrs,
            });
            await newFamily.save({ session: session });
            const familyResult = await newFamily.populate('creator').execPopulate();
            const creator = familyResult.creator as UserDoc;

            const newMembership = Membership.build({
                user: creator._id,
                family: familyResult._id,
            });
            await newMembership.save({ session: session });

            await session.commitTransaction();
            return familyResult;
        } catch (error) {
            throw error;
        }
    }
}
