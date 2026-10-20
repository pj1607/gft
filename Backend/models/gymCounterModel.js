import mongoose from 'mongoose';

const gymCounterSchema = new mongoose.Schema({
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    sequence: {
        type: Number,
        default: 0,
        min: 0,
    },
});

const GymCounter = mongoose.model('GymCounter', gymCounterSchema);

export default GymCounter;
