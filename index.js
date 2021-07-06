const dotenv = require('dotenv').config();

const express = require('express');
const app = express();

const bodySanitizer = require('./app/middlewares/body-sanitizer');
const router = require('./app/router');

// cors
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:8085');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Accept, Authorization'
  );
  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE'
  );

  // response to preflight request
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
// body formated in JSON
app.use(express.json());

app.use(bodySanitizer);

app.use(router);

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
