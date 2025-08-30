import mongoose from 'mongoose';

const stationSchema = new mongoose.Schema({
  StationCode: {
    type: String,
    required: true,   // Only StationCode is required
    unique: true,
    trim: true,
    uppercase: true
  },
  StationNameEnglish: {
    type: String,
    required: false,
    trim: true
  },
  RegionalLanguage: {
    type: String,
    required: false,
    trim: true
  },
  StationNameHindi: {
    type: String,
    required: false,
    trim: true
  },
  StationNameRegional: {
    type: String,
    required: false,
    trim: true
  },
  Latitude: {
    type: Number,
    required: false,
    min: -90,
    max: 90
  },
  Longitude: {
    type: Number,
    required: false,
    min: -180,
    max: 180
  },
  Altitude: {
    type: Number,
    required: false,
    min: 0
  },
  NumberOfPlatforms: {
    type: Number,
    required: false,
    min: 1
  },
  NumberOfSplPlatforms: {
    type: Number,
    required: false,
    min: 0
  },
  NumberOfStationEntrances: {
    type: Number,
    required: false,
    min: 0
  },
  NumberOfPlatformBridges: {
    type: Number,
    required: false,
    min: 0
  }
}, {
  timestamps: true
});

export const Station =
  mongoose.models.Station || mongoose.model('Station', stationSchema);
