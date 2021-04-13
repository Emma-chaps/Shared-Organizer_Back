const dotenv = require('dotenv').config();

const express = require('express');
const app = express();

app.use(
  cors({
    origin: '*',
  }),
);

const router = require('./app/router');

app.use(express.urlencoded({ extended: true }));

app.use(router);

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
