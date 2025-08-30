// models/trainModel.ts
import mongoose from 'mongoose';

const trainSchema = new mongoose.Schema({
  StationCode: { type: String, required: true, trim: true, uppercase: true }, // Station where this train info applies
  TrainNumber: { type: String, required: true, trim: true },
  TrainNameEnglish: { type: String, required: false, trim: true },
  TrainNameHindi: { type: String, required: false, trim: true },
  Ref: { type: String, required: false, trim: true, enum: ['NTES', 'User'], default: 'NTES' },
  SrcCode: { type: String, required: true, trim: true, uppercase: true },
  SrcNameEnglish: { type: String, required: false, trim: true },
  SrcNameHindi: { type: String, required: false, trim: true },
  DestCode: { type: String, required: false, trim: true, uppercase: true },
  DestNameEnglish: { type: String, required: false, trim: true },
  DestNameHindi: { type: String, required: false, trim: true },
  STA: { type: String, required: false, trim: true },
  STD: { type: String, required: false, trim: true },
  LateBy: { type: String, required: false, trim: true },
  ETA: { type: String, required: false, trim: true },
  ETD: { type: String, required: false, trim: true },
  PFNo: { type: String, required: false, trim: true },
  Status: {
    type: String,
    required: false,
    trim: true,
    
  },
  TypeAorD: { type: String, required: false, trim: true, enum: ['A', 'D'] },
  CoachList: {
    type: [String],
    required: false,
    default: [],
    validate: {
      validator: (v: string[]) => !v || v.length >= 0, // Allow empty arrays
      message: 'CoachList must be an array'
    }
  },
  batchId: { type: String, required: true }, // To identify which batch/update this belongs to
  lastUpdated: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Index for better performance
trainSchema.index({ StationCode: 1, batchId: -1, lastUpdated: -1 });
trainSchema.index({ TrainNumber: 1, StationCode: 1 });
trainSchema.index({ batchId: -1 });

export const Train = mongoose.models.Train || mongoose.model('Train', trainSchema);