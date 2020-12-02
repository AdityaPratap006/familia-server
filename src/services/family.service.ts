import chalk from 'chalk';
import mongoose from 'mongoose';
import { Family, FamilyAttributes, FamilyDoc } from '../models/family.model';
import { UserDoc } from '../models/user.model';
import { Membership } from '../models/membership.model';
import MembershipService from '../services/membership.service';

export default class FamilyService {
    static async getAllFamilies() {
        const families = await Family.find().populate('creator');
        return families;
    }

    private static async createNewFamily(attrs: FamilyAttributes, session?: mongoose.ClientSession): Promise<FamilyDoc> {
        try {
            const newFamily = Family.build({
                ...attrs,
            });
            await newFamily.save({ session: session });
            const familyResult = await newFamily.populate('creator').execPopulate();

            const creator = familyResult.creator as UserDoc;
            console.log(`${creator.name} created family '${familyResult.name}'`);

            return familyResult;
        } catch (error) {
            throw error;
        }
    }

    static async createFamilyAndAddMembership(attrs: FamilyAttributes): Promise<FamilyDoc> {
        try {
            const session = await mongoose.startSession();
            session.startTransaction();

            const createdFamily = await this.createNewFamily(attrs, session);
            const creator = createdFamily.creator as UserDoc;

            await MembershipService.createNewMembership({
                user: creator._id,
                family: createdFamily._id,
            }, session);

            createdFamily.memberCount += 1;
            await createdFamily.save({ session: session });

            await session.commitTransaction();
            return createdFamily;
        } catch (error) {
            throw error;
        }
    }
}
