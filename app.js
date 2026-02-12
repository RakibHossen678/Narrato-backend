const cors = require("cors");
const express = require("express");
const router = require("./src/routes/index");
const notFoundErrorHandler = require("./src/errors/notFound");
const globalErrorHandler = require("./src/errors/errorHandler");

const app = express();

// parser
app.use(express.json());
app.use(cors());

// parent application route
app.use("/api/v1/", router);

app.get("/", (req, res) => {
  res.send("Welcome to Narrato Server V1");
});

// global error handler
app.use(globalErrorHandler);

// not found
app.use(notFoundErrorHandler);

module.exports = app;
