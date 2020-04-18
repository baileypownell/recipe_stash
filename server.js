const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const routes = require('./api/routes');


// middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/', routes);

app.use(express.json())

app.use((err, req, res, next) => {
  res.json(err);
});


const port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/dist'));

app.get('*', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.listen(port, ()=>{
  console.log(`the combined server is up on port ${port}`);
});

module.exports = app;
