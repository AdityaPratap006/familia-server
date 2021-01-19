import mongoose from 'mongoose';
import { UserDoc } from './user.model';

// An interface that desribes the properties
// that are required to create a new Location
export interface LocationAttributes {
    latitude: number;
    longitude: number;
    userId: string;
}

interface UserLocation {
    type: 'Point';
    coordinates: [longitude: number, latitude: number];
}

// An interface that describes the properties
// that a Location Model has
interface LocationModel extends mongoose.Model<LocationDoc> {
    build: (attrs: LocationAttributes) => LocationDoc;
}

// An interface that describes the properties
// that a Location Document has
interface LocationDoc extends mongoose.Document {
    location: UserLocation;
    user: string | UserDoc;
    createdAt: string;
    updatedAt: string;
}

const LocationSchema = new mongoose.Schema({
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    user: {
        type: mongoose.Types.ObjectId,
        required: true,
        index: true,
        ref: 'User',
        unique: true,
    },
}, { timestamps: true });

LocationSchema.index({
    location: '2dsphere',
});

LocationSchema.statics.build = (attrs: LocationAttributes) => {
    const { latitude, longitude, userId } = attrs;
    return new Location({
        user: userId,
        location: {
            type: 'Point',
            coordinates: [longitude, latitude],
        },
    });
};

const Location = mongoose.model<LocationDoc, LocationModel>('Location', LocationSchema);

export { Location, LocationDoc };