import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema({
  Id: {
    type: Number,
    required: true   // keep Id required
  },
  Created: {
    type: Date,
    required: false,
    default: Date.now
  },
  Updated: {
    type: Date,
    required: false,
    default: Date.now
  },
  DeviceType: {
    type: String,
    required: false,
    trim: true
  },
  Description: {
    type: String,
    required: false,
    trim: true
  },
  IpAddress: {
    type: String,
    required: false,
    trim: true
  },
  Status: {
    type: Boolean,
    required: false,
    default: false
  },
  LastStatusWhen: {
    type: Date,
    required: false,
    default: Date.now
  },
  IsEnabled: {
    type: Boolean,
    required: false,
    default: true
  }
});

const platformSchema = new mongoose.Schema({
  PlatformNumber: {
    type: String,
    required: false,
    trim: true
  },
  PlatformType: {
    type: String,
    required: false,
    trim: true
  },
  Description: {
    type: String,
    required: false,
    trim: true
  },
  Subnet: {
    type: String,
    required: false,
    trim: true
  },
  Devices: [deviceSchema]
});

const platformDeviceSchema = new mongoose.Schema({
  stationCode: {
    type: String,
    required: true,   // keep stationCode required (like Id)
    trim: true,
    uppercase: true,
    unique: true
  },
  stationName: {
    type: String,
    required: false,
    trim: true
  },
  platforms: [platformSchema]
}, {
  timestamps: true
});

export const PlatformDevice =
  mongoose.models.PlatformDevice || mongoose.model('PlatformDevice', platformDeviceSchema);
