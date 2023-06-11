import jwt from "jsonwebtoken";
import User from "../models/user.js";
import expressAsyncHandler from "express-async-handler";

const protect = expressAsyncHandler(async (req, res, next) => {
  let token;
  if (
    // if the authorization is present and the authorization starts with Bearer
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      //the token would be like (Bearer asdjbs34rbsbjsdfhg44b34n) so to split bearer and token we use split()
      token = req.headers.authorization.split(" ")[1];
      //decode the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // getting the user info back with the id provided except the logged in user and without the password of user
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized");
    }
  }

  //if no token is provided
  if (!token) {
    res.status(401);
    throw new Error("Not authorized");
  }
});

export default protect;
