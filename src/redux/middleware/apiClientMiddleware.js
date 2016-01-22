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
export default function (apiClient) {
  return ({getState, dispatch}) => next => action => {
    // We only handle actions that have a `promise` field.
    const {promise, type, ...rest} = action;
    if (!promise) {
      return next(action);
    }

    // TODO: Check type field, auto generate names
    // Immediately dispatch the REQUEST action.

    const REQUEST = type;
    const OK = `${type}Ok`;
    const FAIL = `$Ptype}Fail`;

    next({...rest, type: REQUEST});

    // Execute the API promise call and then dispatch either the
    // OK or FAIL action types.
    return promise(apiClient).then(
      (result) => {
        if (result.error) {
          return next({...rest, error: result.error, type: FAIL});
        }

        return next({...rest, result, type: OK});
      },
      (error) => next({...rest, error, type: FAIL})
    );
  };
}
