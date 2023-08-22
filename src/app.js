const express = require("express");
require("dotenv/config");
const passport = require("passport");
require("./helpers/passport.helper");
const session = require("express-session");

const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const { sendResponse, AppError } = require("./helpers/utils.js");

const indexRouter = require("./routes/index");

const app = express();


// Use express-session middleware
app.use(
  session({
    secret: "mysecretkey", // A secret key for session encryption (store this securely)
    resave: false, // Don't save session data if not modified
    saveUninitialized: true, // Save uninitialized sessions (e.g., new sessions)
    cookie: { secure: false }, // You can configure other options like cookie settings here
  })
);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);

// Connect to MONGODB
const mongoose = require("mongoose");
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log(`Connected to Database! ${process.env.MONGO_URI}`))
  .catch((err) => console.log(err, "Error"));

// catch 404 and forard to error handler
app.use((req, res, next) => {
  const err = new AppError(404, "Not Found", "Bad Request");
  next(err);
});

/* Initialize Error Handling */
app.use((err, req, res, next) => {
  console.log("ERROR", err);
  return sendResponse(
    res,
    err.statusCode ? err.statusCode : 500,
    false,
    null,
    { message: err.message },
    err.isOperational ? err.errorType : "Internal Server Error"
  );
});

module.exports = app;
