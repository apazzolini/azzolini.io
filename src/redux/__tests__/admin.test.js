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
          loggingIn: false,
          loginError: fromError(error)
        });
      });
    });
  });
});

