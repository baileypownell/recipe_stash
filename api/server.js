const express = require('express');
//const { createProxyMiddleware } = require('http-proxy-middleware');
const bodyParser = require('body-parser');
var cors = require('cors');

const app = express();
const routes = require('./routes');

// middleware
app.use(cors());
//app.use('/api', createProxyMiddleware({ target: 'http://localhost:3000', changeOrigin: true }));
app.use(bodyParser.json());
app.use('/', routes);

app.use((err, req, res, next) => {
  res.json(err);
});

const port = 3000;

app.listen(port, () => {
   console.log(`listening on port ${port}`)
 });


// export app so www file can access it
module.exports = app;
