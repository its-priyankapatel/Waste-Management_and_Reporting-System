const express = require("express");
const {
  authMiddleware,
  roleAuthorization,
} = require("../Middlewares/authMiddleware");
const verificationComplaintController = require("../Controllers/verificationController");
const router = express.Router();

router.put(
  "/verify-complaint/:complaintId",
  authMiddleware,
  roleAuthorization(["supervisor"]),
  verificationComplaintController
);
module.exports = router;
