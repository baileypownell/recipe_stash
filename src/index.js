import React from 'react'
import ReactDOM from 'react-dom'
import {
  Redirect
} from 'react-router-dom'
import {
  App
} from './components/index'
import GuardedRoute from './GuardedRoute'

import 'materialize-css/dist/css/materialize.min.css'
import './scss/main.scss'

// const theme = createTheme({
//   palette: {
//     primary: {
//       main: '#e66c6c',
//       dark: '#d35151'
//     },
//     secondary: {
//       main: '#87ad6a',
//       contrastText: '#fff'
//     },
//     error: {
//       main: '#dd7244',
//       dark: '#c23c3c'
//     },
//     info: {
//       main: '#dbdbdb'
//     }
//   }
// })

// export const queryClient = new QueryClient()

ReactDOM.render(
  <App></App>,
  // <QueryClientProvider client={queryClient}>
  //   <ThemeProvider theme={theme}>
  //     <BrowserRouter>
  //       <Nav />
  //       <Switch>
  //         <Route exact={true} path="/" component={Home}/>
  //         <Route path="/login" component={Login}/>
  //         <Route path="/signup" component={Signup}/>
  //         <Route path="/reset/:token" component={ResetPassword}/>
  //         <GuardedRoute
  //           path='/recipes'
  //           exact={true}
  //           component={RecipeCache}>
  //         </GuardedRoute>
  //         <GuardedRoute
  //           path='/settings'
  //           component={Settings}>
  //         </GuardedRoute>
  //         <GuardedRoute
  //           path='/recipes/:id'
  //           component={RecipeCache}>
  //         </GuardedRoute>
  //         <Redirect to="/" />
  //       </Switch>
  //     </BrowserRouter>
  //   </ThemeProvider>
  // </QueryClientProvider>,
  document.getElementById('app')
)
