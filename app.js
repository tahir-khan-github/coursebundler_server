import express from "express";
import { config } from "dotenv";
import course from "./routes/courseRoutes.js";
import user from "./routes/userRoutes.js";
import payment from "./routes/paymentRoutes.js";
import others from "./routes/othersRoutes.js";
import ErrorMiddleware from "./middlewares/Error.js";
import cookieParser from "cookie-parser";
import cors from "cors";

config({
  path: "./config/config.env",
});

const app = express();

//Using middlerware
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cookieParser());
//to request from this server to another website
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

//impoting and using routes
app.use("/api/v1", course);
app.use("/api/v1", user);
app.use("/api/v1", payment);
app.use("/api/v1", others);

app.use(ErrorMiddleware);

export default app;

export function startServer() {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log("Server is working on port: ", PORT);
  });

  app.get("/", (req, res) =>
    res.send(
      `<h1>Site is working. click <a href=${process.env.FRONTEND_URL}>here</a> to visit frontend.</h1>`
    )
  );
}
