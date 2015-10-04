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

      it('handles UPDATE_CONTENT', () => {
        const newState = reducer(initialState, {
          type: 'pages/UPDATE_CONTENT',
          pageName: 'testPage',
          newContent: '## Test Content'
        });

        expect(newState).to.equal(fromJS({
          data: {
            testPage: {
              content: '## Test Content',
              html: '<h2 id="test-content">Test Content</h2>\n'
            },
            secondaryPage: {}
          }
        }));
      });

      it('handles SAVE', () => {
        const newState = reducer(initialState, {
          type: 'pages/SAVE',
          pageName: 'testPage'
        });

        expect(newState).to.equal(fromJS({
          data: {
            testPage: {
              saving: true
            },
            secondaryPage: {}
          }
        }));
      });

      it('handles SAVE_SUCCESS', () => {
        const newState = reducer(initialState, {
          type: 'pages/SAVE_SUCCESS',
          pageName: 'testPage'
        });

        expect(newState).to.equal(fromJS({
          data: {
            testPage: {
              saving: false,
              saved: true
            },
            secondaryPage: {}
          }
        }));
      });

      it('handles SAVE_FAIL', () => {
        const error = new Error('Save Fail');
        const newState = reducer(initialState, {
          type: 'pages/SAVE_FAIL',
          pageName: 'testPage',
          error
        });

        expect(newState).to.equal(fromJS({
          data: {
            testPage: {
              saving: false,
              saved: false,
              error
            },
            secondaryPage: {}
          }
        }));
      });
    });
  });
});
