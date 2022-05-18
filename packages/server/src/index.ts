import express from "express";
import http from "http";
// import socketio from 'socket.io';
import mongoose from "mongoose";
import morgan from "morgan";
import * as rfs from "rotating-file-stream";
import cors from "cors";
import path from "path";
import passport from "passport";
import OAuth1Strategy from "passport-oauth1";
import OAuth from "oauth";
import session from "express-session";
import cookieParser from "cookie-parser";
import cron from "node-cron";

// import {riddleController} from './controllers/riddle/riddle.controller';
// import {riddlethonController} from './controllers/riddlethon/riddlethon.controller';
// import {hardToClickController} from './controllers/hard-to-click/hard-to-click.controller';
import AuthController from "./controllers/auth.controller";
import houseService from "./services/house.service";
import userService from "./services/user.service";
import Routes from "./routes";

import 'dotenv/config'
const { env } = process;

const app = express();
const port = process.env.PORT || 8080;

const corsConfig = {
  origin: [
    env.FRONTEND_URL,
    env.FRONTEND_LOCAL_URL,
    env.BACKOFFICE_URL,
    env.BACKOFFICE_LOCAL_URL,
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

const httpServer = http.createServer(app);
// const io = socketio(httpServer, {cors: corsConfig});

// riddleController(io);
// riddlethonController(io);
// hardToClickController(io);

app.use(cors(corsConfig));

cron.schedule("*/15 * * * *", () => {
  houseService.checkAchievements();
  userService.checkAchievements();
});

// create a rotating write stream
const accessLogStream = rfs.createStream("access.log", {
  interval: "1d", // rotate daily
  path: path.join(__dirname, "..", "logs"),
});
app.use(morgan("combined", { stream: accessLogStream }));

app.use(express.static(path.join(__dirname, "./assets")));
app.use(express.static(path.join(__dirname, env.FRONTEND_PATH)));

app.use(cookieParser());
app.use(express.json());

const sessionConfig = {
  saveUninitialized: false,
  secret: env.SESSION_KEY,
  resave: false,
  cookie: { maxAge: 1 * 60 * 1000, httpOnly: true, secure: true }, // One minute in milliseconds
};
if (env.NODE_ENV === "production") {
  const redis = require("redis");
  const RedisStore = require("connect-redis")(session);
  const redisConnectionString = process.env.REDIS_URL;
  const redisClient = redis.createClient({ url: redisConnectionString });

  app.use(
    session({
      store: new RedisStore({ client: redisClient }),
      ...sessionConfig,
    })
  );
} else {
  app.use(session(sessionConfig));
}

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());

passport.use(
  "provider",
  new OAuth1Strategy(
    {
      requestTokenURL: env.OAUTH_REQUEST_TOKEN_URL,
      accessTokenURL: env.OAUTH_ACCESS_TOKEN_URL,
      userAuthorizationURL: env.OAUTH_USER_AUTHORIZATION_URL,
      consumerKey: env.OAUTH_CONSUMER_KEY,
      consumerSecret: env.OAUTH_CONSUMER_SECRET,
      callbackURL: "/api/auth/redirect",
    },
    (token, tokenSecret, profile, done) => {
      const oauth = new OAuth.OAuth(
        env.OAUTH_REQUEST_TOKEN_URL,
        env.OAUTH_ACCESS_TOKEN_URL,
        env.OAUTH_CONSUMER_KEY,
        env.OAUTH_CONSUMER_SECRET,
        "1.0",
        null,
        "HMAC-SHA1"
      );

      oauth.post(
        env.OAUTH_USER_RESOURCE_URL,
        token,
        tokenSecret,
        null,
        null,
        async (err, data) => {
          if (err) {
            console.error(err);
          }

          await AuthController.authenticateUser(data, done);
        }
      );
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.get("/api/auth/", passport.authenticate("provider"));

app.get(
  "/api/auth/redirect",
  passport.authenticate("provider", {
    successRedirect: `/auth-usp`,
    failureRedirect: "/api/auth/failure",
  })
);

app.use("/api", Routes);

app.use((error, req, res, next) => {
  return res.status(error.statusCode).json({ message: error.errors });
});

app.get("/semcomp-mente", (req, res) =>
  res.sendFile(path.join(__dirname, "./assets", "semcomp-mente.html"))
);
app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, env.FRONTEND_PATH, "index.html"))
);

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
