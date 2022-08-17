import {createStore} from 'redux';
import reducers from './reducers';
import {persistReducer, persistStore} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

/**
 * The configuration object for redux-persist.
 */
const persistConfig = {
  key: 'root',
  storage,

  /** Will only persist the `auth` substate on local storage. */
  whitelist: ['auth'],
};

const persistedReducers = persistReducer(persistConfig, reducers);

/** The Redux store created with all reducers and redux-persist. */
export const store = createStore(persistedReducers);

/** Don't know why, but this is needed by redux-persist */
export const persistor = persistStore(store);
