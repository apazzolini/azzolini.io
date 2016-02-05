export default {
  admin: require('./admin'),
  docs: require('./docs')
};

export const updateInitialServerState = (request, initialState) => {
  if (request.auth.isAuthenticated) {
    initialState.admin = {
      isAdmin: true,
      isEditing: false
    };
  }
};
