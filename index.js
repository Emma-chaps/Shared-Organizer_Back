const dotenv = require("dotenv").config();

const express = require("express");
const app = express();

// cors
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:8080");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Accept, Authorization"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // response to preflight request
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const router = require("./app/router");

app.use(router);

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
