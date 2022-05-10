import React from 'react'
import AuthenticationService from '../../services/auth-service'
import { QueryClientProvider, QueryClient } from 'react-query'
import { ThemeProvider, createTheme } from '@material-ui/core'
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom'
import { Nav, Home, ResetPassword, Signup, Settings, Login } from '..'
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
          if (res.data.authenticated) {
            this.setState({ loggedIn: true }, () => AuthenticationService.setUserLoggedIn())
          } else {
            this.setState({ loggedIn: false }, () => AuthenticationService.setUserLoggedOut())
          }

          this.setState({ authenticationStateDetermined: true })
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
