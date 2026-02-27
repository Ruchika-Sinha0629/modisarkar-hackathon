import mongoose from "mongoose"

const ZoneSchema = new mongoose.Schema(
  {
    name: String,
    code: String,

    sizeScore: {
      type: Number,
      min: 1,
      max: 10
    },

    densityScore: {
      type: Number,
      min: 1,
      max: 10
    },

    baseDensity: Number,

    zScore: Number,
    allocation: { type: Number, default: 0 },
    currentDeployment: { type: Number, default: 0 },
    safeThreshold: Number,

    geometry: {
      type: {
        type: String,
        enum: ["Polygon"]
      },
      coordinates: [[[Number]]]
    },

    centroid: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: [Number]
    },

    adjacency: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Zone"
      }
    ],

    distanceMatrix: [
      {
        zoneId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Zone"
        },
        distanceKm: Number,  // fixed: was "distance"
        travelTimeMinutes: Number,  // fixed: was missing
      }
    ],

    heatmapColor: String,

    isActive: Boolean,

    version: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
)

ZoneSchema.index({ centroid: "2dsphere" })
ZoneSchema.index({ zScore: -1 })

export default mongoose.models.Zone ||
  mongoose.model("Zone", ZoneSchema)