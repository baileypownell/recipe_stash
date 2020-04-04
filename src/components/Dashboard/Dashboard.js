import React from 'react';
import ReactDOM from 'react-dom';
const axios = require('axios');
// let DEV_URL = '';
// if (process.env.NODE_ENV === 'development') {
//   console.log('computing')
//  DEV_URL = 'http://localhost:5000';
// }

class Home extends React.Component {

componentDidMount() {
  // fails:
  // axios.get('/users')
  // .then((response) => {
  //   console.log(response)
  // })
  // .catch((err) => {
  //   console.log(err);
  //   console.log(err.response)
  // })

  // works fine:
  axios.get('http://localhost:3000/users')
  .then((response) => {
    console.log(response)
  })
  .catch((err) => {
    console.log(err)
  })
}

  render() {
    return (
      <div>
        <h1>Dashboard</h1>
     </div>
    )
  }
}

export default Home;
