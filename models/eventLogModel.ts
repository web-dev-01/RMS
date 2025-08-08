import mongoose, { Schema, model, models } from 'mongoose';

const eventLogSchema = new Schema({
  Timestamp: { 
    type: Date, 
    required: true,
    default: Date.now 
  },
  EventID: { 
    type: Number, 
    required: true,
    unique: true, // Ensure EventID is unique
    index: true // For faster lookup
  },
  EventType: { 
    type: String, 
    required: true 
  },
  Source: { 
    type: String, 
    required: true 
  },
  Description: { 
    type: String, 
    required: false 
  },
  IsSentToServer: { 
    type: Boolean, 
    required: true,
    default: false 
  },
  stationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Station', 
    required: true,
    index: true // For faster lookup
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

export const EventLog = models.EventLog || model('EventLog', eventLogSchema);