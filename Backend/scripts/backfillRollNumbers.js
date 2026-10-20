import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Member from '../models/memberModel.js';
import GymCounter from '../models/gymCounterModel.js';

dotenv.config();

const applyChanges = process.argv.includes('--apply');

const run = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing from the environment.');
  }

  await mongoose.connect(process.env.MONGO_URI);

  try {
    const members = await Member.find({})
      .sort({ createdAt: 1, _id: 1 })
      .lean();

    const byOwner = new Map();

    for (const member of members) {
      if (!member.createdBy) {
        throw new Error(
          `Member ${member._id} has no createdBy; fix this record before backfilling.`
        );
      }

      const ownerId = String(member.createdBy);

      if (!byOwner.has(ownerId)) byOwner.set(ownerId, []);
      byOwner.get(ownerId).push(member);
    }

    const updates = [];
    const counterUpdates = [];

    for (const [ownerId, ownerMembers] of byOwner) {
      const used = new Set();
      let maxSequence = 0;

      for (const member of ownerMembers) {
        if (!member.rollNumber) continue;

        const match = /^G(\d+)$/.exec(member.rollNumber);
        if (!match) {
          throw new Error(
            `Invalid roll number "${member.rollNumber}" on member ${member._id}.`
          );
        }

        const number = Number(match[1]);

        if (used.has(number)) {
          throw new Error(
            `Duplicate roll number "${member.rollNumber}" for gym ${ownerId}.`
          );
        }

        used.add(number);
        maxSequence = Math.max(maxSequence, number);
      }

      for (const member of ownerMembers) {
        if (member.rollNumber) continue;

        while (used.has(maxSequence + 1)) maxSequence++;

        const next = maxSequence + 1;
        const rollNumber = `G${String(next).padStart(3, '0')}`;

        used.add(next);
        maxSequence = next;

        updates.push({
          updateOne: {
            filter: { _id: member._id, createdBy: member.createdBy },
            update: { $set: { rollNumber } },
          },
        });

        console.log(
          `${applyChanges ? 'ASSIGN' : 'DRY-RUN'} ${member.name}: ${rollNumber}`
        );
      }

      counterUpdates.push({
        updateOne: {
          filter: { ownerId: new mongoose.Types.ObjectId(ownerId) },
          update: { $max: { sequence: maxSequence } },
          upsert: true,
        },
      });
    }

    if (!applyChanges) {
      console.log(
        `Dry-run complete: ${updates.length} member(s) need roll numbers. No member changes were written.`
      );
      console.log('Run with --apply to save the assignments.');
      return;
    }

    // Use the native collection so Mongoose's immutable-field protection does
    // not strip the migration's rollNumber assignments.
    if (updates.length) {
      await Member.collection.bulkWrite(updates, { ordered: true });
    }

    if (counterUpdates.length) {
      await GymCounter.bulkWrite(counterUpdates, { ordered: true });
    }

    console.log(`Backfill complete: ${updates.length} member(s) updated.`);
  } finally {
    await mongoose.disconnect();
  }
};

run().catch((error) => {
  console.error('Roll-number backfill failed:', error);
  process.exitCode = 1;
});
