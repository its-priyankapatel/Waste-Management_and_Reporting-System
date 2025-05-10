const express = require("express");
const {
  authMiddleware,
  roleAuthorization,
} = require("../Middlewares/authMiddleware");
const {
  getCitizenComplaints,
  getWorkerComplaints,
} = require("../Controllers/viewController");
const router = express.Router();

//get citizen complaint
router.get(
  "/citizen/my-complaints",
  authMiddleware,
  roleAuthorization(["citizen"]),
  getCitizenComplaints
);

//get worker complaint
router.get(
  "/worker/complaints",
  authMiddleware,
  roleAuthorization(["worker"]),
  getWorkerComplaints
);
module.exports = router;
