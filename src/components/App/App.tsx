import React from 'react'
import AuthenticationService from '../../services/auth-service'
import { QueryClientProvider, QueryClient } from 'react-query'
import { ThemeProvider, createTheme } from '@material-ui/core'
import { BrowserRouter, Switch, Route, Redirect, withRouter } from 'react-router-dom'
import { Nav, Home, Login, ResetPassword, Signup, Settings } from '..'
import GuardedRoute from '../../GuardedRoute'
import RecipeCache from '../RecipeCache/RecipeCache'

export const queryClient = new QueryClient()

class App extends React.Component<any> {
    state = {
      authenticationStateDetermined: false,
      loggedIn: null
    }

    componentDidMount () {
      AuthenticationService.verifyUserSession()
        .then(res => {
          res.data.authenticated = false
          if (res.data.authenticated) {
            this.setState({
              // authenticationStateDetermined: true,
              loggedIn: true,

            }, () => {
              AuthenticationService.setUserLoggedIn()
            })
          } else {
            this.setState({
              // authenticationStateDetermined: true,
              loggedIn: false
            }, () => {
              AuthenticationService.setUserLoggedOut()
            })
          }

          this.setState({
            authenticationStateDetermined: true
          })
        })
        .catch(err => console.log(err))
    }

    render () {
      const theme = createTheme({
        palette: {
          primary: {
            main: '#e66c6c',
            dark: '#d35151'
          },
          secondary: {
            main: '#87ad6a',
            contrastText: '#fff'
          },
          error: {
            main: '#dd7244',
            dark: '#c23c3c'
          },
          info: {
            main: '#dbdbdb'
          }
        }
      })

      if (!this.state.authenticationStateDetermined) return null

      if (this.state.loggedIn !== null) {
        console.log('RENDERING')
        console.log('loggedIn = ', this.state.loggedIn)
        return (
          <QueryClientProvider client={queryClient}>
              <ThemeProvider theme={theme}>
              <BrowserRouter>
                  <Nav />
                  <Switch>
                  <Route exact={true} path="/" component={Home}/>
                  <Route path="/login" component={Login}/>
                  <Route path="/signup" component={Signup}/>
                  <Route path="/reset/:token" component={ResetPassword}/>
                  <GuardedRoute
                      path='/recipes'
                      loggedIn={this.state.loggedIn}
                      exact={true}
                      component={RecipeCache}>
                  </GuardedRoute>
                  <GuardedRoute
                      path='/settings'
                      component={Settings}>
                  </GuardedRoute>
                  <GuardedRoute
                      path='/recipes/:id'
                      component={RecipeCache}>
                  </GuardedRoute>
                  <Redirect to="/" />
                  </Switch>
              </BrowserRouter>
              </ThemeProvider>
          </QueryClientProvider>
        )
      }
    }
}

export default App
