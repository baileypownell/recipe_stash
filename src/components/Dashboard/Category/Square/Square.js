import React from 'react';
import { withRouter } from "react-router-dom";
import './Square.scss'
import Fade from 'react-reveal/Fade'

class Square extends React.Component {

  state = {
    imageLoaded: false
  }

  viewRecipe = () => {
    this.props.history.push(`/recipes/${this.props.data.id}`);
  }

  triggerDiv = () => {
    this.setState({
      imageLoaded: true
    })
  }

  // a <Square/> should not render until the background image (if there is one) is fully loaded 
  // this means, we need to technically render an <img/> so that we can react with the onLoad listener 
  // then, render the div 
  render() {
    const { data, key, rawTitle, awsUrl } = this.props;
    return (
      <>
      { !!awsUrl ? 
        <>
          { this.state.imageLoaded ? 
          <Fade>
            <div
            style={{ backgroundImage: `url(${awsUrl})`}}
            id={'default-tile-image'}
            className={'recipe-card z-depth-4 red-background'}
            key={key}
            data={data}
            onClick={this.viewRecipe}
          >
            <h4>{rawTitle}</h4>
          </div>
          </Fade>
           : 
          <img
            src={awsUrl}
            style={{ display: `none`}}
            onLoad={this.triggerDiv}
            />
          }
        </>
      : 
        <Fade>
            <div
                className={'recipe-card z-depth-4'}
                key={key}
                data={data}
                onClick={this.viewRecipe}
              >
            <h4>{rawTitle}</h4>
          </div>
        </Fade>
      }
      </>
    )
  }
}

export default withRouter(Square);
