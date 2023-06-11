import express from "express";
import User from "../models/user.js";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
const router = express.Router();
import protect from "../middleware/authMiddleware.js";

//function to create the JWT token and return it
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

//endpoint for signup
router.route("/").post(
  asyncHandler(
    //using express asynchandler to validate the signup form
    async (req, res) => {
      const { name, email, password, pic } = req.body;
      if (!name || !email || !password) {
        res.status(400);
        throw new Error("Please fill all the Fields");
      }

      //checking if the user already exists
      const user = await User.findOne({ email });
      if (user) {
        res.status(400);
        throw new Error("User already exists");
      }

      //generating the encrypted pass
      const salt = await bcrypt.genSalt(10);
      const encPass = await bcrypt.hash(password, salt);

      //Creating a new user
      const newUser = await User.create({
        name,
        email,
        password: encPass, //assigning encrypted password
        pic,
      });

      if (newUser) {
        res.status(201).json({
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          pic: newUser.pic,

          //sending a JWT token with the user Info
          token: generateToken(newUser._id),
        });
      } else {
        res.status(400);
        throw new Error("Error creating user");
      }
    }
  )
);

//endpoint for login
router.route("/login").post(
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    //throwing error if the fields are not filled
    if (!email || !password) {
      res.status(400);
      throw new Error("Please fill all the Fields");
    }

    const user = await User.findOne({ email: email }); // checking if the user with email exists
    if (user) {
      const cmpPass = await bcrypt.compare(password, user.password); // matching the password
      if (!cmpPass) {
        //if password doesnt match, throw error
        res.status(400);
        throw new Error("Invalid Credentials");
      }

      //if password matches, send the user info with authtoken
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        pic: user.pic,
        //sending a JWT token with the user Info
        token: generateToken(user._id),
      });
    } else {
      // if the user with email does not exists, throw error
      res.status(400);
      throw new Error("Invalid Credentials");
    }
  })
);

//endpoint to search users (/api/user?search=adi)
router.route("/").get(
  protect,
  asyncHandler(async (req, res) => {
    const keyword = req.query.search
      ? {
          // if there is query in request then do following
          $or: [
            // if any of the two is true then return true. It is written here to be used in User.find func
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};
    //finding the user with given keyword bt except the current user
    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
    res.send(users);
  })
);
export default router;
