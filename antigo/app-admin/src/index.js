import React from 'react';
import ReactDOM from 'react-dom';

import {ToastContainer, toast} from 'react-toastify';
import {BrowserRouter} from 'react-router-dom';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';

import Content from './router';
import {store, persistor} from './redux/store';
import {initializeAPI} from './api/base-api';

import baseURL from './constants/api-url';
import {setToken} from './redux/actions/auth';

import 'react-toastify/dist/ReactToastify.css';
import './styles.css';

// The API initialization is done here so we can link it with things like the toast, and Redux
initializeAPI({
  baseURL,
  onError: toast.error,
  tokenSelector: () => store.getState().auth.token,
  tokenDispatcher: (token) => store.dispatch(setToken(token)),
});

/**
 * @return {object}
 */
function App() {
  return (
    <Provider store={store}> {/* Required by Redux */}
      {/* This is to display a blank page to the user while Redux Persist is loading it's state. */}
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter> {/* Required by react-router-dom */}
          <ToastContainer hideProgressBar /> {/* Required to show the toasts */}
          <Content /> {/* This represents the actual content of the page */}
        </BrowserRouter>
      </PersistGate>
    </Provider>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
