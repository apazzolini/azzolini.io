import {expect} from 'chai';
import Immutable from 'immutable';
import reducer from '../modules/admin';
import {fromError} from '../utils';

describe('redux', () => {
  describe('reducers', () => {
    describe('admin', () => {
      const initialState = Immutable.fromJS({
        isAdmin: false
      });

      const initialStateAdmin = Immutable.fromJS({
        isAdmin: true
      });

      it('handles LOGIN', () => {
        const newState = reducer(initialState, {
          type: 'admin/LOGIN',
        });

        expect(newState.toJS()).to.deep.equal({
          isAdmin: false,
          loggingIn: true,
          loginError: false
        });
      });

      it('handles LOGIN_OK', () => {
        const newState = reducer(initialState, {
          type: 'admin/LOGIN_OK'
        });

        expect(newState.toJS()).to.deep.equal({
          isAdmin: true,
          loggingIn: false
        });
      });

      it('handles LOGIN_FAIL', () => {
        const error = new Error('Login Fail');
        const newState = reducer(initialState, {
          type: 'admin/LOGIN_FAIL',
          error
        });

        expect(newState.toJS()).to.deep.equal({
          isAdmin: false,
          isEditing: false,
          loggingIn: false,
          loginError: fromError(error)
        });
      });

      it('handles TOGGLE_EDIT_MODE', () => {
        const newState = reducer(initialStateAdmin, {
          type: 'admin/TOGGLE_EDIT_MODE'
        });

        expect(newState.toJS()).to.deep.equal({
          isAdmin: true,
          isEditing: true
        });

        const newState2 = reducer(newState, {
          type: 'admin/TOGGLE_EDIT_MODE'
        });

        expect(newState2.toJS()).to.deep.equal({
          isAdmin: true,
          isEditing: false
        });
      });
    });
  });
});
