const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const routes = require('./routes');


// middleware
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
  res.sendFile(__dirname + '/index.html');
});

app.listen(port, () => {
  console.log('project up on port', port)
})

module.exports = app;
