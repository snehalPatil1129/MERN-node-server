const express = require("express");
const router = express.Router();

//@route    GET /api/users
//@desc     GET users data
//@access   Public
router.get("/", (req, res) => res.json({ message: "Hello", name: "Snehal" }));

module.exports = router;
