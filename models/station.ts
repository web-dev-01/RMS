import mongoose from 'mongoose';

const stationSchema = new mongoose.Schema({
  StationCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  StationNameEnglish: {
    type: String,
    required: true,
    trim: true
  },
  RegionalLanguage: {
    type: String,
    required: true,
    trim: true
  },
  StationNameHindi: {
    type: String,
    required: true,
    trim: true
  },
  StationNameRegional: {
    type: String,
    required: true,
    trim: true
  },
  Latitude: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  Longitude: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  },
  Altitude: {
    type: Number,
    required: true,
    min: 0
  },
  NumberOfPlatforms: {
    type: Number,
    required: true,
    min: 1
  },
  NumberOfSplPlatforms: {
    type: Number,
    required: true,
    min: 0
  },
  NumberOfStationEntrances: {
    type: Number,
    required: true,
    min: 1
  },
  NumberOfPlatformBridges: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

export const Station = mongoose.models.Station || mongoose.model('Station', stationSchema);