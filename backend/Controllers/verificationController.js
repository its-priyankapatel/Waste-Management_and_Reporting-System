const Complaint = require("../Model/complaintModel");

const toRadians = (deg) => (deg * Math.PI) / 180;
const calculateDistance = (coord1, coord2) => {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;

  const R = 6371e3; // meters
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δφ = toRadians(lat2 - lat1);
  const Δλ = toRadians(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Supervisor verifies after worker uploads cleaned photo
const verificationComplaintController = async (req, res) => {
  const { complaintId } = req.params;
  const { verificationStatus, supervisorNote } = req.body;

  try {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    // Check if the complaint is resolved and ready for verification
    if (complaint.status !== "resolved" && complaint.status !== "reopened") {
      return res.status(400).json({
        success: false,
        message: "Complaint is not ready for verification",
      });
    }

    // Handle GPS-based auto-verification for complaints that have both cleaned location and original location
    if (complaint.cleanedLocation && complaint.locationCoords) {
      const distance = calculateDistance(
        complaint.locationCoords.coordinates,
        complaint.cleanedLocation.coordinates
      );

      // If the complaint is within 20 meters, automatically mark it as verified
      if (distance <= 20) {
        complaint.verificationStatus = "verified";
        complaint.verifiedBySupervisor = true;
        complaint.verificationNote = "Auto-verified by GPS (within 20m)";
        await complaint.save();
        return res.status(200).json({
          success: true,
          message: "Complaint auto-verified based on GPS",
          complaint,
        });
      }
    }

    // Manual verification process fallback
    if (verificationStatus === "verified") {
      complaint.verificationStatus = "verified";
      complaint.verifiedBySupervisor = true;
      complaint.verificationNote = supervisorNote || "Verified by supervisor";
      complaint.status = "resolved"; // Mark as resolved after verification
    } else if (verificationStatus === "reopened") {
      complaint.status = "reopened";
      complaint.verificationStatus = "reopened";
      complaint.verifiedBySupervisor = false;
      complaint.verificationNote =
        supervisorNote || "Issue not resolved. Reopened.";
      complaint.imageUploadedByWorker = false; // Clear worker's photo status
      complaint.cleanedImage = ""; // Optionally clear the previous image
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid verification status. Use 'verified' or 'reopened'.",
      });
    }

    await complaint.save();
    return res.status(200).json({
      success: true,
      message: `Complaint ${verificationStatus} successfully by supervisor.`,
      complaint,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = verificationComplaintController;
