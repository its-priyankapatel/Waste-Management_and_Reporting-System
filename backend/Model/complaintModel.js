const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String, // File path or URL to garbage image
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "resolved", "reopened"],
      default: "pending",
    },
    location: {
      type: String,
      required: true,
    },
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Worker or Supervisor
    },
    resolutionNote: {
      type: String,
      default: "",
    },
    cleanedImage: String, // URL of the image uploaded by the worker
    imageUploadedByWorker: { type: Boolean, default: false }, // Flag to track if worker uploaded the photo
    verificationNote: {
      type: String,
      default: "",
    },
    verifiedBySupervisor: {
      type: Boolean,
      default: false,
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "reopened"],
      default: "pending",
    },
    cleanedAt: { type: Date },
    cleanedLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },

    locationCoords: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    reassignmentsCount: { type: Number, default: 0 },
    assignmentHistory: [
      {
        workerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        count: {
          type: Number,
          default: 0,
        },
      },
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },

  { timestamps: true }
);

const Complaint = mongoose.model("Complaint", complaintSchema);
module.exports = Complaint;
