const path = require('path');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/dist'));

app.get('*', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.listen(port, ()=>{
  console.log(`server is up on port ${port}`);
});
