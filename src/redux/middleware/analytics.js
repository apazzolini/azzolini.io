import { UPDATE_LOCATION } from 'react-router-redux';
import ga from 'react-ga';

export default ({ getState, dispatch }) => next => action => {
  if (action.type === UPDATE_LOCATION) {
    const isNotBackClick = action.payload.action === 'PUSH' || action.payload.action === 'REPLACE';
    const isNotAdminUser = !getState().admin.get('isAdmin');

    if (isNotBackClick && isNotAdminUser) {
      ga.pageview(action.payload.pathname);
    }
  }

  return next(action);
};
