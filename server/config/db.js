import mongoose from "mongoose";
import dotenv from "dotenv";
mongoose.set("strictQuery", true);
//function to connect to mongodb
const connectDb = async () => {
  dotenv.config();
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log(`MongoDb Connected`);
  } catch (error) {
    console.log(error.message);
    process.exit();
  }
};
export default connectDb;
