const express = require("express");
const testController = require("../Controllers/testController");
const router = express.Router();
router.get("/", testController);

module.exports = router;
