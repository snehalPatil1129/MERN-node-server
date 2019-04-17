const express = require("express");
const router = express.Router();

//@route    GET /api/posts
//@desc     GET user posts
//@access   Private
router.get("/", (req, res) => res.send("hello from posts"));

module.exports = router;
