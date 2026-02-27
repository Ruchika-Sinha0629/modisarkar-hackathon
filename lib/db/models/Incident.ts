import mongoose from "mongoose"

const IncidentSchema = new mongoose.Schema(
{
  zoneId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Zone"
  },

  triggeredBy: mongoose.Schema.Types.ObjectId,

  triggeredAt: Date,
  originalDensity: Number,
  newDensity: Number,
  delta: Number,

  resolution: {
    status: {
      type: String,
      enum: [
        "Pending",
        "AdjacentPool",
        "GlobalReserve",
        "Escalation",
        "Resolved",
        "Failed"
      ]
    },

    steps: [
      {
        step: {
          type: String,
          enum: ["A", "B", "C"]  // fixed: was Number
        },
        action: String,
        troopsMoved: Number,
        sourceZones: [mongoose.Schema.Types.ObjectId],
        timestamp: Date
      }
    ],

    finalStrength: Number,
    deficitResolved: Boolean,
    remainingDeficit: Number
  },

  manualOverride: {
    applied: Boolean,
    by: mongoose.Schema.Types.ObjectId,
    notes: String,
    troopsAdded: Number
  }
},
{ timestamps: true }
)

IncidentSchema.index({ zoneId: 1, triggeredAt: -1 })
IncidentSchema.index({ "resolution.status": 1 })

export default mongoose.models.Incident ||
mongoose.model("Incident", IncidentSchema)