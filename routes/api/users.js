const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const key = require("../../config/keys").secretOrKey;
const passport = require("passport");
//@route    GET /api/users
//@desc     GET users data
//@access   Public
router.get("/", (req, res) => res.json({ message: "Hello", name: "Snehal" }));

//@route    POST /api/users
//@desc     POST users data
//@access   Public
router.post("/", (req, res) => {
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({ message: "Email already exists" });
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: "200", //Size
        r: "pg", //Rating
        d: "mm" //default
      });
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password
      });
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log("err", err));
        });
      });
    }
  });
});

//@route    POST /api/users/login
//@desc     Login functionality
//@access   Public
router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email }).then(user => {
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    } else {
      bcrypt.compare(password, user.password).then(isMatch => {
        if (isMatch) {
          //Password matched
          const payload = {
            id: user._id,
            name: user.name,
            avatar: user.avatar
          };

          jwt.sign(payload, key, { expiresIn: 3600 }, (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token
            });
          });
        } else {
          return res.status(400).json({ password: "Incorrect password" });
        }
      });
    }
  });
});

//@route    GET /api/users/currentUser
//@desc     returns current user
//@access   Private
router.get(
  "/currentUser",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({ message: "Success" });
  }
);
module.exports = router;
