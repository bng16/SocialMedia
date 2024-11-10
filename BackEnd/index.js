import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config({});

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
  Credentials: true,
};
app.use(cors());

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server listen at port ${PORT}`);
})
