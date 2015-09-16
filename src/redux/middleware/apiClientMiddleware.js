/**
 * Redux middleware for dispatching actions that have a promise payload that
 * execute an async action against the API server. This middleware handles
 * actions that adhere to the following format:
 *
 * {
 *   types: [requestType, requestSuccessType, requestFailureType],
 *   promise: (apiClient) => Promise
 * }
 *
 * When installing this middleware, be sure it comes after a thunk handling
 * middleware, such as redux-thunk.
 */
export default function apiClientMiddleware(apiClient) {
  return store => next => action => { // eslint-disable-line
    // We only handle actions that have a `promise` field.
    const { promise, types, ...rest } = action;
    if (!promise) {
      return next(action);
    }

    // Immediately dispatch the REQUEST action.
    const [REQUEST, SUCCESS, FAILURE] = types;
    next({...rest, type: REQUEST});

    // Execute the API promise call and then dispatch either the
    // SUCCESS or FAILURE action types.
    return promise(apiClient).then(
      (result) => next({...rest, result, type: SUCCESS}),
      (error) => next({...rest, error, type: FAILURE})
    );
  };
}