import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema({
  Id: {
    type: Number,
    required: true
  },
  Created: {
    type: Date,
    required: true,
    default: Date.now
  },
  Updated: {
    type: Date,
    required: true,
    default: Date.now
  },
  DeviceType: {
    type: String,
    required: true,
    trim: true,
    enum: ['CDS', 'PDC', 'CGDB', 'AGDB']
  },
  Description: {
    type: String,
    required: true,
    trim: true
  },
  IpAddress: {
    type: String,
    required: true,
    trim: true
  },
  Status: {
    type: Boolean,
    required: true,
    default: false
  },
  LastStatusWhen: {
    type: Date,
    required: true,
    default: Date.now
  },
  IsEnabled: {
    type: Boolean,
    required: true,
    default: true
  }
});

const platformSchema = new mongoose.Schema({
  PlatformNumber: {
    type: String,
    required: true,
    trim: true
  },
  PlatformType: {
    type: String,
    required: true,
    trim: true
  },
  Description: {
    type: String,
    required: true,
    trim: true
  },
  Subnet: {
    type: String,
    required: true,
    trim: true
  },
  Devices: [deviceSchema]
});

const platformDeviceSchema = new mongoose.Schema({
  stationCode: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    unique: true
  },
  stationName: {
    type: String,
    required: true,
    trim: true
  },
  platforms: [platformSchema]
}, {
  timestamps: true
});

export const PlatformDevice = mongoose.models.PlatformDevice || mongoose.model('PlatformDevice', platformDeviceSchema);