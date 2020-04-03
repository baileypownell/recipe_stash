const express = require('express');
const bodyParser = require('body-parser');
var cors = require('cors');
const app = express();
const routes = require('./routes')
// middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/', routes);

app.use((err, req, res, next) => {
  res.json(err);
})

app.get('/api/customers', (req, res) => {
  const customers = [
    {id: 1, firstName: 'John', lastName: 'Doe'},
    {id: 2, firstName: 'Brad', lastName: 'Traversy'},
    {id: 3, firstName: 'Mary', lastName: 'Swanson'},
  ];

  res.json(customers);
});


const port = 3000;

app.listen(port, () => {
   console.log(`listening on port ${port}`)
 });


// export app so www file can access it
module.exports = app;
