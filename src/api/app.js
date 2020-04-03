const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// middleware
app.use(bodyParser.json());

const fortunes = require('./data/fortunes');

const port = 3000;

app.listen(port, () => {
   console.log(`listening on port ${port}`)
 });


// export app so www file can access it
module.exports = app;
