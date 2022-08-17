import {combineReducers} from 'redux';

import AuthReducer from './auth';

/**
 * All reducers combined into one
 */
const reducers = combineReducers({
  /** All auth-related operations */
  auth: AuthReducer,
});

export default reducers;
