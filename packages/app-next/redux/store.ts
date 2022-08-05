import { createStore } from "redux";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";

import reducers from "./reducers";

const persistConfig = {
  key: "root",
  storage,
  version: 9, // Change the version to clear client state
  whitelist: ["auth", "presence"],
};

const persistedReducers = persistReducer(persistConfig, reducers);

export const store = createStore(persistedReducers);

export const persistor = persistStore(store);
