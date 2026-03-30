# API folder

This folder contains the files responsible for handling the communication between the front-end and the back-end. It should only have the four files that were initially created, and should generally not be touched. The only file that requires actual touching is the `handlers.js` file, which contains all API calls to the backend.

## Creating a new request for your backend

Whenever you need to make a request for a route on your backend, go to the `handlers.js` file and add a new entry in the `Handlers` variable. A handler should be something like this:
```js
const Handlers = {
  // POST request
  myNewPostHandler: (arg1, arg2) => API.post('/my/backend/api/path', { arg1, arg2 }),

  // GET request
  myNewGETHandler: () => API.get('/my/backend/api/path'),

  // POST request with custom header
  myNewPostHandler: (arg1, arg2) => API.post('/my/backend/api/path', { arg1, arg2 }, { headers: { customHeader: 'customValue' } }),
}
```

And whenever you need to execute the handler, you should do something like this:

```js
import API from '/src/api';

API.myNewPOSTHandler('my arg 1', 'my arg 2');
```

This will send a `POST` request to `https://your-backend-url.com/my/backend/api/path`, with a JSON body like this: `{ "arg1": "my arg 1", "arg2": "my arg 2" }`. If the request fails for some reason (unable to connect to your server, or the status code of the response was smaller than 200, or larger than 300), it will `throw` an error, and will show a Toast with a generic message according to the status code (these messages are defined on `/src/api/error-message.js`.

If you'd like to show a custom message to your user, you could do something like this:
```js
import { withCustomError } from './error-message';

const Handlers = {
  myNewGETHandler: withCustomError(
    // The handler, like you'd normaly do
    () => API.get('/my/backend/api/path'),

    // An object with custom messages according to the status code.
    { 404: "custom 404 message", 500: "Custom 500 message" },
  ),
}
```

The `withCustomError` is a higher-order-function (HOF) that will change the error default error message to the one you specify. It's first argument is the handler, like you'd normaly define. The second argument is an object that maps each status code with an error message.

If you need more flexibility, instead of providing a message, you could provide a function that receives a single `response` argument, which is the server response provided by Axios. The return value of that function will be used as the message. If nothing is returned by the function (returned `undefined`), the default message for that status code is displayed. Her's an example:

```js
import { withCustomError } from './error-message';

const Handlers = {
  myNewGETHandler: withCustomError(
    // The handler, like you'd normaly do
    () => API.get('/my/backend/api/path'),

    // An object with custom messages according to the status code.
    { 404:
      // A function with a response object as it's only argument.
      function (res) {
        if (res && res.data && res.data.error) {
          // In this case, `res.data.error` will be used as the error message.
          return res.data.error;
        }
        // If the function doesn't return anything, the default error will be displayed.
      }
    },
  ),
}
```

If you need even more flexibility, the second argument of `withCustomError` could be a single function,  that will be called on every error, receiving a single response object as argument. The return value of that funcion would be used as an error message. Here's and example:

```js
import { withCustomError } from './error-message';

const Handlers = {
  myNewGETHandler: withCustomError(
    // The handler, like you'd normaly do
    () => API.get('/my/backend/api/path'),

    function (res) {
      if (res && res.data && res.data.error) {
        // In this case, `res.data.error` will be used as the error message.
        return res.data.error;
      }
      // If the function doesn't return anything, the default error will be displayed.
    },
  ),
}
```

### Limitations

The `withCustomError` function cannot override the error message when a response was not received (usually when the user lost their internet connection.

## About authentication (JWT tokens)

Whenever the API receives a response, it will automaticaly check for an `authorization` header, containing a JWT token. If the header has something, the API will automaticaly update the Redux's value of the JWT token with the new value received by the server (effectively refresing the user's token).

Whenever the API sends a request, it will always attach the user's JWT token with it, making sure the server can authorize the user to to the necessary operations.