import { expect } from 'chai';
import Immutable from 'immutable';
import { createReducer } from 'rook/lib/redux/createStore';
import reducers from '../modules';
import fromError from '../utils/fromError';
const reducer = createReducer(reducers.admin);

describe('redux', () => {
  describe('reducers', () => {
    describe('admin', () => {
      const initialState = Immutable.fromJS({
        isAdmin: false
      });

      const initialStateAdmin = Immutable.fromJS({
        isAdmin: true
      });

      it('handles login', () => {
        const newState = reducer(initialState, {
          type: 'admin/login'
        });

        expect(newState.toJS()).to.deep.equal({
          isAdmin: false,
          loggingIn: true,
          loginError: false
        });
      });

      it('handles loginOk', () => {
        const newState = reducer(initialState, {
          type: 'admin/loginOk'
        });

        expect(newState.toJS()).to.deep.equal({
          isAdmin: true,
          loggingIn: false
        });
      });

      it('handles loginFail', () => {
        const error = new Error('Login Fail');
        const newState = reducer(initialState, {
          type: 'admin/loginFail',
          error
        });

        expect(newState.toJS()).to.deep.equal({
          isAdmin: false,
          isEditing: false,
          loggingIn: false,
          loginError: fromError(error)
        });
      });

      it('handles toggleEditMode', () => {
        const newState = reducer(initialStateAdmin, {
          type: 'admin/toggleEditMode'
        });

        expect(newState.toJS()).to.deep.equal({
          isAdmin: true,
          isEditing: true
        });

        const newState2 = reducer(newState, {
          type: 'admin/toggleEditMode'
        });

        expect(newState2.toJS()).to.deep.equal({
          isAdmin: true,
          isEditing: false
        });
      });
    });
  });
});
