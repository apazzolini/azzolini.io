import {expect} from 'chai';
import {fromJS} from 'immutable';
import reducer from '../modules/pages';

describe('redux', () => {
  describe('reducers', () => {
    describe('pages', () => {
      const initialState = fromJS({
        data: {
          // We want to make sure the reducer that acts on a given page
          // doesn't alter states for other pages
          secondaryPage: {}
        }
      });

      let loadPendingState;

      it('handles LOAD', () => {
        loadPendingState = reducer(initialState, {
          type: 'pages/LOAD',
          pageName: 'testPage'
        });

        expect(loadPendingState).to.equal(fromJS({
          data: {
            testPage: {
              loading: true
            },
            secondaryPage: {}
          }
        }));
      });

      it('handles LOAD_SUCCESS', () => {
        const newState = reducer(loadPendingState, {
          type: 'pages/LOAD_SUCCESS',
          pageName: 'testPage',
          result: {
            html: '<h1>Sample</h1>'
          }
        });

        expect(newState).to.equal(fromJS({
          data: {
            testPage: {
              loading: false,
              loaded: true,
              html: '<h1>Sample</h1>'
            },
            secondaryPage: {}
          }
        }));
      });

      it('handles LOAD_FAIL', () => {
        const error = new Error('Load Fail');
        const newState = reducer(loadPendingState, {
          type: 'pages/LOAD_FAIL',
          pageName: 'testPage',
          error
        });

        expect(newState).to.equal(fromJS({
          data: {
            testPage: {
              loading: false,
              loaded: false,
              error
            },
            secondaryPage: {}
          }
        }));
      });
    });
  });
});
