import dotenv from "dotenv";
dotenv.config();

import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./utils/db.js";


const app = express();

app.get('/',(_,res)=>{
  return res.status(200).json({
    message: "I am coming from backend!!!!!",
    success: true,
  })
})


app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));

const corsOption = {
  origin: "http://localhost:5173",
  credentials: true,
};
app.use(cors());

const PORT = process.env.PORT || 8080;
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server listening at port ${PORT}`);
  });
};

startServer();
