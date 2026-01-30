import mongoose, { Schema, Document } from 'mongoose';
import { ISession } from '../types';

export interface ISessionDocument extends ISession, Document {}

const MovementDataSchema: Schema = new Schema({
  timestamp: {
    type: Date,
    required: true,
  },
  stepCount: {
    type: Number,
    required: true,
  },
  speed: {
    type: Number,
    required: true,
  },
  cadence: {
    type: Number,
    required: true,
  },
  elevation: Number,
  heartRate: Number,
}, { _id: false });

const SessionSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    steps: {
      type: Number,
      required: true,
    },
    distance: {
      type: Number,
      required: true,
    },
    avgPace: {
      type: Number,
      required: true,
    },
    calories: {
      type: Number,
      required: true,
    },
    movementData: [MovementDataSchema],
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
SessionSchema.index({ userId: 1, startTime: -1 });

export default mongoose.model<ISessionDocument>('Session', SessionSchema);
