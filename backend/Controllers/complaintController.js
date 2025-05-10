const Complaint = require("../Model/complaintModel");
const cloudinary = require("../config/cloudinary");

//submit-complaint by citizen
const submitController = async (req, res) => {
  const { title, description, location } = req.body;
  try {
    if (!title || !description || !location) {
      return res.status(400).send({
        success: false,
        message: "All fields are required",
      });
    }
    const newComplaint = new Complaint({
      title,
      description,
      location,
      image: req.file?.path,
      citizen: req.user._id,
    });
    await newComplaint.save();
    return res.status(200).send({
      success: true,
      message: "Complaint submitted successfully",
      Complaint: newComplaint,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

//assign-complaint to workers by supervisor or admin
const assignComplaintController = async (req, res) => {
  const { complaintId } = req.params; // Complaint ID from route parameters

  const { assignedTo } = req.body; // Worker ID from request body
  try {
    // Check if the complaint exists
    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
      return res.status(404).send({
        success: false,
        message: "Complaint not found",
      });
    }

    // Assign the complaint to the worker
    complaint.assignedTo = assignedTo;
    await complaint.save();

    return res.status(200).send({
      success: true,
      message: "Complaint assigned successfully",
      complaint,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// complaint solved by worker with cleaned photo
const uploadCleanedPhotoController = async (req, res) => {
  const { complaintId } = req.params;
  const { latitude, longitude } = req.body;
  try {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).send({
        success: false,
        message: "Complaint not found",
      });
    }
    // Upload the cleaned photo to Cloudinary
    let cleanedImageUrl = "";
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "complaints",
      });
      cleanedImageUrl = result.secure_url; // Get the URL of the uploaded image
    }

    // If an image was uploaded, save it to the complaint document and update the flag
    if (cleanedImageUrl) {
      complaint.cleanedImage = cleanedImageUrl;
      complaint.imageUploadedByWorker = true; // Mark that the worker has uploaded the image
      complaint.cleanedAt = new Date(); // Save timestamp
    }

    // Save GPS location
    if (latitude && longitude) {
      complaint.cleanedLocation = {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      };

      complaint.status = "resolved";
    }
    await complaint.save();

    return res.status(200).send({
      success: true,
      message: "Cleaned photo uploaded successfully",
      complaint,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

//complaint solved by supervisor with no cleaned photo
const markComplaintResolvedNoPhotoController = async (req, res) => {
  const { complaintId } = req.params;

  try {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res
        .status(404)
        .json({ success: false, message: "Complaint not found" });
    }
    complaint.status = "resolved";
    complaint.resolvedBy = req.user._id;
    complaint.resolvedAt = new Date();
    complaint.resolutionNote =
      "Resolved based on supervisor's verification. No image available.";
    await complaint.save();
    return res.status(200).json({
      success: true,
      message: "Complaint marked as resolved by supervisor without image",
      complaint,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server error", error });
  }
};

//reassign complaint by supervisor

const reassignComplaintController = async (req, res) => {
  const { complaintId } = req.params;
  const { newWorkerId } = req.body;

  try {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res
        .status(404)
        .json({ success: false, message: "Complaint not found" });
    }

    // Limit total number of reassignments (e.g., 2 max)
    if (complaint.reassignmentsCount > 1) {
      return res.status(400).json({
        success: false,
        message:
          "This complaint has been reassigned maximum times. Cannot reassign further.",
      });
    }

    // Check if the same worker has been assigned more than twice
    const workerRecord = complaint.assignmentHistory.find(
      (record) => record.workerId.toString() === newWorkerId
    );

    if (workerRecord && workerRecord.count >= 2) {
      return res.status(400).json({
        success: false,
        message:
          "This worker has already been assigned to this complaint twice.",
      });
    }

    // Assign complaint
    complaint.assignedTo = newWorkerId;
    complaint.status = "in_progress";
    complaint.reassignmentsCount += 1;
    complaint.verificationStatus = "pending";
    complaint.imageUploadedByWorker = false;
    complaint.cleanedImage = "";

    // Update assignment history
    if (workerRecord) {
      workerRecord.count += 1;
    } else {
      complaint.assignmentHistory.push({ workerId: newWorkerId, count: 1 });
    }

    await complaint.save();

    return res.status(200).json({
      success: true,
      message: "Complaint reassigned successfully",
      complaint,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  submitController,
  assignComplaintController,
  uploadCleanedPhotoController,
  markComplaintResolvedNoPhotoController,
  reassignComplaintController,
};
