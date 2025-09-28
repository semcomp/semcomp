import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import morgan from "morgan";
import * as rfs from "rotating-file-stream";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import cron from "node-cron";

import GameController from './controllers/game/game.controller';
import houseService from "./services/house.service";
import userService from "./services/user.service";
import Routes from "./routes";

import { config } from "dotenv";
import Game from "./lib/constants/game-enum";
config({ path: `./config/env/${process.env.NODE_ENV === "production" ? "production" : "development"}.env` });

const { env } = process;

const app = express();
const port = process.env.PORT || 8080;

const corsConfig = {
  origin: [
    env.FRONTEND_URL,
    env.FRONTEND_NETLIFY_URL,
    env.FRONTEND_LOCAL_URL,
    env.BACKOFFICE_URL,
    env.BACKOFFICE_LEGACY_URL,
    env.BACKOFFICE_LOCAL_URL,
    "https://semcomp-presencas.netlify.app",
    "https://semcomp-qr-code.netlify.app",
  ],
  exposedHeaders: [
    "authorization",
    "X-Forwarded-For",
    "Host",
    "Upgrade",
    "Connection",
  ],
  credentials: true,
};

const httpServer = createServer(app);
const io = new Server(httpServer, {
  transports: ['websocket'],
  cors: corsConfig,
});

new GameController(io, Game.RIDDLE);

app.use(cors(corsConfig));

cron.schedule("*/15 * * * *", () => {
  houseService.checkAchievements();
  userService.checkAchievements();
});
cron.schedule("*/5 * * * *", () => {
  userService.deleteAllCron();
})

// create a rotating write stream
const accessLogStream = rfs.createStream("access.log", {
  interval: "1d", // rotate daily
  path: path.join(__dirname, "..", "logs"),
});

app.use(morgan("dev"));
app.use(morgan("combined", { stream: accessLogStream }));

app.use(cookieParser());
app.use(express.json());

app.use("/api", Routes);

app.use((error, req, res, next) => {
  return res.status(error.statusCode).json({ message: error.errors });
});

// MongoAtlas Url
const backendUrl = env.MONGO_ATLAS_URL;

const connectWithRetry = () =>
  mongoose.connect(
    backendUrl,
    {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
      monitorCommands: true,
    },
    (err) => {
      if (err) {
        console.error(
          "Failed to connect to mongo on startup - retrying in 1 sec",
          err
        );
        setTimeout(connectWithRetry, 1000);
      }
    }
  );
connectWithRetry();

mongoose.connection.on("error", (e) => {
  console.error("Error connecting to MongoDB!");
  console.error(e);
});

mongoose.connection.on("open", () => {
  console.log("Connected successfuly to MongoDB!");
  httpServer.listen(port, () => {
    console.log(`Now listening at port ${port} for requests!`);
  });
});

mongoose.connection.on("commandFailed", (e) => {
  console.log("Mongo command failed!");
  console.log(e);
});


mongoose.connection.on("commandSucceeded", (e) => {
  console.log("Mongo command success-------------");
  console.log(e);
});