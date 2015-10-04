import {expect} from 'chai';
import {fromJS} from 'immutable';
import reducer from '../modules/posts';

describe('redux', () => {
  describe('reducers', () => {
    describe('posts', () => {
      const testPost = {
        0: {
          _id: 0,
          normalizedTitle: 'testPost',
          html: '<h1>Test</h1>',
          loaded: true
        }
      };

      const initialState = fromJS({
        loaded: false,
        data: {
          ...testPost
        }
      });

      let loadPendingState;
      let loadedState;

      // -----------------------------------------------------------------------
      // Post list reducers ----------------------------------------------------
      // -----------------------------------------------------------------------

      it('handles LOAD', () => {
        loadPendingState = reducer(initialState, {
          type: 'posts/LOAD'
        });

        expect(loadPendingState).to.equal(fromJS({
          loaded: false,
          loading: true,
          data: {
            ...testPost
          }
        }));
      });

      it('handles LOAD_SUCCESS', () => {
        loadedState = reducer(loadPendingState, {
          type: 'posts/LOAD_SUCCESS',
          result: [
            {
              _id: 0,
              normalizedTitle: 'testPost'
            }, {
              _id: 1,
              normalizedTitle: 'newPost'
            }, {
              _id: 2,
              normalizedTitle: 'newPost2'
            }
          ]
        });

        expect(loadedState).to.equal(fromJS({
          loaded: true,
          loading: false,
          data: {
            ...testPost,
            1: {
              _id: 1,
              normalizedTitle: 'newPost'
            },
            2: {
              _id: 2,
              normalizedTitle: 'newPost2'
            }
          }
        }));
      });

      it('handles LOAD_FAIL', () => {
        const error = new Error('Load Fail');
        const newState = reducer(loadPendingState, {
          type: 'posts/LOAD_FAIL',
          error
        });

        expect(newState).to.equal(fromJS({
          loaded: false,
          loading: false,
          error,
          data: {
            ...testPost
          }
        }));
      });

      // -----------------------------------------------------------------------
      // Single post reducers --------------------------------------------------
      // -----------------------------------------------------------------------

      let partiallyLoadingState;

      it('handles LOAD from scratch', () => {
        const newState = reducer(initialState, {
          type: 'posts/LOAD_SINGLE',
          postTitle: 'newPost'
        });

        expect(newState).to.equal(fromJS({
          loaded: false,
          data: {
            ...testPost
          },
          singleLoading: {
            'newPost': {
              loading: true
            }
          }
        }));
      });

      it('handles LOAD of a partially loaded post', () => {
        partiallyLoadingState = reducer(loadedState, {
          type: 'posts/LOAD_SINGLE',
          postTitle: 'newPost'
        });

        expect(partiallyLoadingState).to.equal(fromJS({
          loaded: true,
          loading: false,
          data: {
            ...testPost,
            1: {
              _id: 1,
              normalizedTitle: 'newPost',
            },
            2: {
              _id: 2,
              normalizedTitle: 'newPost2'
            },
          },
          singleLoading: {
            newPost: {
              loading: true
            }
          }
        }));
      });

      it('handles LOAD_SINGLE_SUCCESS', () => {
        const newState = reducer(partiallyLoadingState, {
          type: 'posts/LOAD_SINGLE_SUCCESS',
          postTitle: 'newPost',
          result: {
            _id: 1,
            html: '<h1>New</h1>'
          }
        });

        expect(newState).to.equal(fromJS({
          loaded: true,
          loading: false,
          data: {
            ...testPost,
            1: {
              _id: 1,
              normalizedTitle: 'newPost',
              loading: false,
              loaded: true,
              html: '<h1>New</h1>'
            },
            2: {
              _id: 2,
              normalizedTitle: 'newPost2'
            }
          },
          singleLoading: {
            newPost: null
          }
        }));
      });

      it('handles LOAD_SINGLE_FAIL', () => {
        const error = new Error('Load Fail');
        const newState = reducer(partiallyLoadingState, {
          type: 'posts/LOAD_SINGLE_FAIL',
          postTitle: 'newPost',
          error
        });

        expect(newState).to.equal(fromJS({
          loaded: true,
          loading: false,
          data: {
            ...testPost,
            1: {
              _id: 1,
              normalizedTitle: 'newPost',
            },
            2: {
              _id: 2,
              normalizedTitle: 'newPost2'
            }
          },
          singleLoading: {
            newPost: {
              loading: false,
              loaded: false,
              error
            }
          }
        }));
      });
    });
  });
});

