import chalk from 'chalk';
import { FamilyDoc } from '../models/family.model';
import { Membership, MembershipAttributes, MembershipDoc } from '../models/membership.model';
import { UserDoc } from '../models/user.model';

export default class MembershipService {
    static async getAllMemberships() {
        const memberships = await Membership.find().populate('creator');
        return memberships;
    }

    static async createNewMembership(attrs: MembershipAttributes): Promise<MembershipDoc> {
        const newMembership = Membership.build({
            ...attrs,
        });
        await newMembership.save();

        const result = await newMembership.populate('user').populate('family').execPopulate();
        return result;
    }
}
