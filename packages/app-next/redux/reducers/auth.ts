const defaultState = {
  user: null,
  token: null,
};

export default function authReducers(state = defaultState, action) {
  if (action.type === "AUTH_SET_USER") {
    return { ...state, user: action.user };
  } else if (action.type === "AUTH_SET_TOKEN") {
    return { ...state, token: action.token };
  } else if (action.type === "AUTH_LOGOUT") {
    return { ...state, user: null, token: null };
  } else {
    return state;
  }
}
