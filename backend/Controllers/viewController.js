const Complaint = require("../Model/complaintModel");

//get or view complaint by citizen
const getCitizenComplaints = async (req, res) => {
  try {
    const citizenId = req.user._id;
    console.log(req.user._id);
    const complaints = await Complaint.find({ citizen: citizenId })
      .populate("assignedTo", "name role")
      .sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: "Get message to citizen successfully",
      complaints,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal server Error",
    });
  }
};

//get or view complaint by worker
const getWorkerComplaints = async (req, res) => {
  try {
    const workerId = req.user._id;
    const complaints = await Complaint.find({ assignedTo: workerId })
      .populate("citizen", "name")
      .sort({ createdAt: -1 });

    if (!complaints.length) {
      return res.status(404).json({
        success: false,
        message: "No complaints assigned to you.",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Complaints fetched successfully",
      complaints,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = { getCitizenComplaints, getWorkerComplaints };
