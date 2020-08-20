import React from 'react';
import icon from '../../images/apple-touch-icon.png';
import whisk from '../../images/cooking.svg';


import './Home.scss';

class Home extends React.Component {

  state = {
    message: 'All of your recipes.',
    messageNum: 0
  }

  start = () => {
    if (this.props.loggedIn) {
      this.props.history.push('/dashboard');
    } else {
      this.props.history.push('/signup');
    }
  }
  componentDidMount() {
    let faded = document.querySelectorAll('.fade');

    let Appear = () => {
      for (let i = 0; i <faded.length; i++) {
      faded[i].classList.add('fade-in');
      }
    }
    setTimeout(Appear, 500);
}

  render() {
    return (
      <div id="home">
        <div id="picture">
          <div className="flex">
            <img src={icon} alt="logo" /><h1>Virtual Cookbook</h1>
          </div>
          <div className="blurbs">
            <h2 className="fade">All of your recipes.</h2>
            <h2 className="fade">All in one place.</h2>
            <h2 className="fade">And it's free.</h2>
          </div>

          </div>
          <div id="skew">
            <img id="whisk" className="fade" src={whisk} alt="whisk" />
            <div>
              <h1 className="fade">Why Virtual Cookbook?</h1>
              <h2 className="fade">Are you tired of pinning a recipe only to later discover the link just redirects you to tumblr, or that the domain is no longer active?</h2>
              <div id="question">
                <h2 className="fade">Or have you ever caught yourself wondering "What if my house burns down and I lose this?" as you take pen in hand to handwrite a recipe?</h2>
                  <h2 className="fade">Create an acount and start saving your recipes</h2>
                  <h1 className="fade" id="forever">FOREVER 7</h1>
                  <button className="waves-effect waves-light btn fade" onClick={this.start}>Start Cooking</button>
              </div>
            </div>
          </div>
     </div>
    )
  }
}


export default Home;
