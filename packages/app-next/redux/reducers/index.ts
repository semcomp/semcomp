import { combineReducers } from "redux";

import AuthReducer from "./auth";

const reducers = combineReducers({
  auth: AuthReducer,
});

export default reducers;
