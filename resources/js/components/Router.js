import React from 'react';
import Admin from './Admin';
import User from './User';
import Login from './general/Login';
import { baseURL, Context, rootURL } from './Global';
import { createMuiTheme, Snackbar, ThemeProvider, Typography, withTheme } from '@material-ui/core';
import { Route, Switch } from 'react-router-dom';
import PasswordReset from './general/PasswordReset';
import { deepPurple, purple } from '@material-ui/core/colors';
import { Alert } from '@material-ui/lab';

class Router extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    axios.defaults.baseURL = baseURL();
    axios.get('api/checkLogin').then( res => {
      const user = res.data;
      if (user)
        this.context.setState({ login: { status: 'yes', user: user } });
      else {
        this.context.setState({ login: { status: 'no'} });
      }
    });
  }

  onSnackbarClose(reason) {
    if (reason === 'timeout')
      this.context.setState({notification: null});
  }

  render() {
    const theme = createMuiTheme({
      palette: {
        primary1Color: "#03a9f4",
        primary2Color: "#1976d2",
        accent1Color: "#7c4dff",
        canvasColor: "rgba(255, 255, 255, 0.54)"
    }
    });

    const { login, notification } = this.context.state;

    return (
        <ThemeProvider theme={theme}>
          {login.status === 'no' ?
            <Switch>
              <Route exact path={rootURL}><User /></Route>
              <Route exact path={rootURL + '/reset_password'}><PasswordReset /></Route>
              <Route exact path={rootURL + '/reset_password/:email'} render={(props) => <PasswordReset {...props} />} />
              <Route path={rootURL + '/'}><Login /></Route>
            </Switch>
            : login.status === 'yes' ? (
              <Switch>
                <Route exact path={rootURL + '/reset_password/:email'} render={(props) => <PasswordReset {...props} />} />
                <Route path={rootURL + '/'}><User /></Route>
              </Switch>
            )
            : <Typography>Lỗi, vui lòng tải lại trang</Typography>
          }
            <Snackbar
              open={Boolean(notification)}
              autoHideDuration={6000}
              onClose={(event, reason) => this.onSnackbarClose(reason)}
            >
              <Alert
                onClose={() => this.onSnackbarClose('timeout')}
                severity={notification ? (notification.type ? notification.type : 'info') : 'info'}
              >
                {notification ? notification.text : ''}
              </Alert>
          </Snackbar>
        </ThemeProvider>
    );
  }
}

Router.contextType = Context;

export default Router;