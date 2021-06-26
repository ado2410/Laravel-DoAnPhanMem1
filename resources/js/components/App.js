import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import Global from './Global';
import Router from './Router';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
    }
  }

  render() {
    return (
      <Global>
        <BrowserRouter>
          <Router />
        </BrowserRouter>
      </Global>
    );
  }
}
ReactDOM.render(<App />, document.querySelector('#app'));