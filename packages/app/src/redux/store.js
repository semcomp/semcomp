import { createStore } from "redux";
import reducers from "./reducers";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";

const persistConfig = {
  key: "root",
  storage,
  version: 8, // Change the version to clear client state
  migrate: async (oldState, version) => {
    // If new version, clear state
    if (oldState._persist.version !== version) return {};
    else return oldState;
  },
  whitelist: ["auth", "presence"],
};

const persistedReducers = persistReducer(persistConfig, reducers);

export const store = createStore(persistedReducers);

export const persistor = persistStore(store);
