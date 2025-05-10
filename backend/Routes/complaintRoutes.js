const express = require("express");
const {
  authMiddleware,
  roleAuthorization,
} = require("../Middlewares/authMiddleware");
const {
  submitController,
  assignComplaintController,
  uploadCleanedPhotoController,
  markComplaintResolvedNoPhotoController,
  reassignComplaintController,
} = require("../Controllers/complaintController");
const upload = require("../Middlewares/upload");

const router = express.Router();

//create-complaint
router.post(
  "/create-complaint",
  authMiddleware,
  roleAuthorization(["citizen"]),
  upload.single("image"),
  submitController
);

//assign complaint
router.put(
  "/assign-complaint/:complaintId",
  authMiddleware,
  roleAuthorization(["admin", "supervisor"]),
  assignComplaintController
);

//cleaned photo upload and resolve-complaint by worker
router.put(
  "/upload-cleaned-photo/:complaintId",
  authMiddleware,
  roleAuthorization(["worker"]),
  upload.single("image"), // Handles the image upload
  uploadCleanedPhotoController
);

// without photo upload, resolved-complaint by supervisor
router.put(
  "/mark-resolved-no-photo/:complaintId",
  authMiddleware,
  roleAuthorization(["supervisor"]),
  markComplaintResolvedNoPhotoController
);

//reassign task by supervisor
router.put(
  "/reassign/:complaintId",
  authMiddleware,
  roleAuthorization(["supervisor", "admin"]),
  reassignComplaintController
);

module.exports = router;
