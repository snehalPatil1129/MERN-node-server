const express = require("express");
const router = express.Router();

//@route    GET /api/profiles
//@desc     GET user profiles
//@access   Public
router.get("/", (req, res) => res.send("hello from profiles"));

module.exports = router;
