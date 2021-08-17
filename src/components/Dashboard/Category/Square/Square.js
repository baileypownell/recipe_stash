import React from 'react';
import { withRouter } from "react-router-dom";
import './Square.scss'
import Fade from 'react-reveal/Fade'
import Skeleton from 'react-loading-skeleton';

class Square extends React.Component {

  state = {
    imageLoaded: false,
    skeletonWidth: 120, 
    skeletonHeight: 120
  }

  viewRecipe = () => {
    this.props.history.push(`/recipes/${this.props.data.id}`);
  }

  triggerDiv = () => {
    this.setState({
      imageLoaded: true
    })
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleWindowSizeChange)
    this.handleWindowSizeChange() 
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowSizeChange)
  }

  handleWindowSizeChange = () => {
    let skeletonHeight, skeletonWidth
    if (window.innerWidth >= 600) {
      skeletonHeight = 100 
      skeletonWidth = 175
    } else {
      skeletonHeight = 120 
      skeletonWidth = 120
    } 
    this.setState({
      skeletonWidth,
      skeletonHeight
    })
  }

  // a <Square/> should not render until the background image (if there is one) is fully loaded 
  // this means, we need to technically render an <img/> so that we can react with the onLoad listener 
  // then, render the div 
  render() {
    const { data, key, rawTitle, awsUrl } = this.props;
    const { skeletonHeight, skeletonWidth, imageLoaded } = this.state;
    return (
      <>
      { !!awsUrl ? 
        <>
          { imageLoaded ? 

            <div
              style={{ backgroundImage: `url(${awsUrl})`}}
              id={'default-tile-image'}
              className={'recipe-card z-depth-4 red-background'}
              key={key}
              data={data}
              onClick={this.viewRecipe}>
            <h4>{rawTitle}</h4>
          </div>

           : 
           <>
              <img
                src={awsUrl}
                style={{ display: `none`}}
                onLoad={this.triggerDiv}
                />
               <Skeleton width={skeletonWidth} height={skeletonHeight} className="skeleton" /> 
          </>
          }
        </>
      : 
 
            <div
                className={'recipe-card z-depth-4'}
                key={key}
                data={data}
                onClick={this.viewRecipe}
              >
            <h4>{rawTitle}</h4>
          </div>
        }
      </>
    )
  }
}

export default withRouter(Square);
