import chalk from 'chalk';
import mongoose from 'mongoose';
import { FamilyDoc } from '../models/family.model';
import { Membership, MembershipAttributes, MembershipDoc } from '../models/membership.model';
import { UserDoc } from '../models/user.model';

export default class MembershipService {
    static async getAllMemberships() {
        const memberships = await Membership.find().populate('creator');
        return memberships;
    }

    static async getMembershipsOfAUser(userId: string) {
        const memberships = await Membership.find({ user: userId }).populate({
            path: 'family',
            populate: {
                path: 'creator',
            }
        });

        const families = memberships.map(membership => {
            const family = membership.family as FamilyDoc;
            return family;
        });

        return families;
    }

    static async getMembersOfAFamily(familyId: string) {
        const memberships = await Membership.find({ family: familyId }).populate({
            path: 'user',
        });

        const members = memberships.map(membership => {
            const member = membership.user as UserDoc;
            return member;
        });

        return members;
    }

    static async createNewMembership(attrs: MembershipAttributes, session?: mongoose.ClientSession): Promise<MembershipDoc> {
        const newMembership = Membership.build({
            ...attrs,
        });

        await newMembership.save({ session: session });

        const result = await newMembership.populate('user').populate('family').execPopulate();

        const user = result.user as UserDoc;
        const family = result.family as FamilyDoc;

        console.log(chalk.blueBright(`${user.name} added to family '${family.name}'`));

        return result;
    }
}
