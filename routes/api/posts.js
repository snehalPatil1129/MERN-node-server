const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
const Posts = require("../../models/Post");
const Profile = require("../../models/Profile");
const validatePostInput = require("../../validations/post");
//@route    GET /api/posts
//@desc     GET posts
//@access   Public
router.get("/", (req, res) => {
  Posts.find()
    .sort({
      date: -1
    })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({
      noPostsFound: "No posts found"
    }));
});

//@route    GET /api/posts/:id
//@desc     GET posts by id
//@access   Public
router.get("/:id", (req, res) => {
  Posts.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err =>
      res.status(404).json({
        noPostFound: "No post found for this id"
      })
    );
});
//@route    POST /api/posts
//@desc     POST create posts
//@access   Private
router.post(
  "/",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    const {
      errors,
      isValid
    } = validatePostInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }
    const newPost = new Posts({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });
    newPost.save().then(post => res.json(post));
  }
);

//@route    DELETE /api/posts/:id
//@desc     DELETE posts
//@access   Private
router.delete(
  "/:id",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    Profile.findOne({
      user: req.user.id
    }).then(profile => {
      Posts.findById(req.params.id)
        .then(post => {
          //check post owner
          if (post.user.toString() !== req.user.id) {
            return res
              .status(401)
              .json({
                notAuthorized: "User not authorized"
              });
          }
          post.remove().then(() => res.json({
            success: true
          }));
        })
        .catch(err => res.status(404).json({
          postNotFound: "Post not found"
        }));
    });
  }
);

//@route    POST /api/posts/like/:id
//@desc     Like posts
//@access   Private
router.post(
  "/like/:id",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    Profile.findOne({
      user: req.user.id
    }).then(profile => {
      Posts.findById(req.params.id)
        .then(post => {
          //check if user already liked the post
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
            .length > 0
          ) {
            return res
              .status(400)
              .json({
                alreadyLiked: "Use already liked the post"
              });
          }

          //add like to likes array
          post.likes.unshift({
            user: req.user.id
          });
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({
          postNotFound: "Post not found"
        }));
    });
  }
);
//@route    POST /api/posts/unlike/:id
//@desc     Unlike posts
//@access   Private
router.post(
  "/unlike/:id",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    Profile.findOne({
      user: req.user.id
    }).then(profile => {
      Posts.findById(req.params.id)
        .then(post => {
          //check if user already liked the post
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
            .length === 0
          ) {
            return res
              .status(400)
              .json({
                alreadyLiked: "You have not yet liked this post"
              });
          }
          //Get remove index
          const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);

          post.likes.splice(removeIndex, 1);
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({
          postNotFound: "Post not found"
        }));
    });
  }
);

//@route    POST /api/posts/comment/:id
//@desc     comment on posts
//@access   Private
router.post(
  "/comment/:id",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    const {
      errors,
      isValid
    } = validatePostInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }
    Posts.findById(req.params.id)
      .then(post => {
        const newComment = {
          text: req.body.text,
          name: req.body.name,
          avatar: req.body.avatar,
          user: req.user.id
        };
        post.comments.unshift(newComment);
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({
        noPostFound: "No post found"
      }));
  }
);

//@route    DELETE /api/posts/comment/:id/:comment_id
//@desc     delete comment from posts
//@access   Private
router.delete(
  "/comment/:id/:comment_id",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    Posts.findById(req.params.id)
      .then(post => {
        if (post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0) {
          return res.status(404).json({
            commentnotexists: "Comment doesnot exists"
          });
        }
        //Get remove index
        const removeIndex = post.comments
          .map(item => item._id.toString())
          .indexOf(req.params.comment_id);

        post.comments.splice(removeIndex, 1);
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({
        noPostFound: "No post found"
      }));
  }
);

module.exports = router;