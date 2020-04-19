const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

// connecting to heroku db
const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

client.connect();



const app = express();
const routes = require('./routes');


// middleware
// app.use(cors());
app.use(bodyParser.json());
app.use('/', routes);

app.use(express.json())

app.use((err, req, res, next) => {
  res.json(err);
});


const port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/dist'));
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
app.get('*', (req, res) => {
  // client.query("SELECT * FROM users", function(error, result) {
  //   if (error) {
  //     res.json(error)
  //   } else {
  //     res.json(result)
  //   }
  // })
  res.sendFile(__dirname + '/index.html');
});

app.listen(port, ()=>{
  console.log(`the combined server is up on port ${port}`);
});

module.exports = app;
