import React from 'react';
import ReactDOM from 'react-dom';
const axios = require('axios');


class Home extends React.Component {

  render() {
    return (
      <div>
        <h1>Dashboard</h1>
        <h1>{process.env.API_URL}</h1>
     </div>
    )
  }
}

export default Home;
