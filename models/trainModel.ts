// models/trainModel.ts

import mongoose from 'mongoose';

const trainSchema = new mongoose.Schema({
  TrainNumber: { type: String, required: true, trim: true },
  TrainNameEnglish: { type: String, required: true, trim: true },
  TrainNameHindi: { type: String, required: true, trim: true },
  Ref: { type: String, required: true, trim: true, enum: ['NTES', 'User'] },
  SrcCode: { type: String, required: true, trim: true, uppercase: true },
  SrcNameEnglish: { type: String, required: true, trim: true },
  SrcNameHindi: { type: String, required: true, trim: true },
  DestCode: { type: String, required: true, trim: true, uppercase: true },
  DestNameEnglish: { type: String, required: true, trim: true },
  DestNameHindi: { type: String, required: true, trim: true },
  STA: { type: String, required: true, trim: true },
  STD: { type: String, required: true, trim: true },
  LateBy: { type: String, required: true, trim: true },
  ETA: { type: String, required: true, trim: true },
  ETD: { type: String, required: true, trim: true },
  PFNo: { type: String, required: true, trim: true },
  Status: { 
    type: String, 
    required: true, 
    trim: true, 
    enum: ['Running Late', 'On Time', 'Arriving Soon', 'Arrived', 'Departed'] 
  },
  TypeAorD: { type: String, required: true, trim: true, enum: ['A', 'D'] },
  CoachList: {
    type: [String],
    required: true,
    validate: {
      validator: (v: string[]) => v.length > 0,
      message: 'CoachList must contain at least one coach'
    }
  },
  lastUpdated: { type: Date, default: Date.now } // ✅ new field
}, {
  timestamps: true
});

export const Train = mongoose.models.Train || mongoose.model('Train', trainSchema);
