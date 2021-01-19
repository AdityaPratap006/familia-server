import { Location } from '../models/location.model';
import { internalServerError } from '../errors';

interface UserLocationInput {
    latitude: number;
    longitude: number;
}

export default class LocationService {
    static updateUserLocation = async (userId: string, { latitude, longitude }: UserLocationInput) => {
        try {
            const location = await Location.findOne({
                user: userId,
            });

            if (!location) {
                const newLocation = Location.build({
                    latitude,
                    longitude,
                    userId,
                });

                await newLocation.save();
                await newLocation.populate('user').execPopulate();
                return newLocation;
            } else {
                const updatedlocation = await Location.findOneAndUpdate({
                    user: userId,
                }, {
                    location: {
                        type: 'Point',
                        coordinates: [longitude, latitude],
                    },
                }, {
                    new: true,
                });

                await updatedlocation?.populate('user').execPopulate();
                return updatedlocation;
            }
        } catch (error) {
            throw internalServerError;
        }
    }
}