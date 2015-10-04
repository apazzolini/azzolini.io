import {expect} from 'chai';
import {fromJS} from 'immutable';
import reducer from '../modules/posts';

describe('redux', () => {
  describe('reducers', () => {
    describe('posts', () => {
      const testPost = {
        testPost: {
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
              normalizedTitle: 'testPost'
            }, {
              normalizedTitle: 'newPost'
            }, {
              normalizedTitle: 'newPost2'
            }
          ]
        });

        expect(loadedState).to.equal(fromJS({
          loaded: true,
          loading: false,
          data: {
            ...testPost,
            newPost: {
              normalizedTitle: 'newPost'
            },
            newPost2: {
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
            ...testPost,
            newPost: {
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
            newPost: {
              normalizedTitle: 'newPost',
              loading: true
            },
            newPost2: {
              normalizedTitle: 'newPost2'
            },
          }
        }));
      });

      it('handles LOAD_SINGLE_SUCCESS', () => {
        const newState = reducer(partiallyLoadingState, {
          type: 'posts/LOAD_SINGLE_SUCCESS',
          postTitle: 'newPost',
          result: {
            html: '<h1>New</h1>'
          }
        });

        expect(newState).to.equal(fromJS({
          loaded: true,
          loading: false,
          data: {
            ...testPost,
            newPost: {
              normalizedTitle: 'newPost',
              loading: false,
              loaded: true,
              html: '<h1>New</h1>'
            },
            newPost2: {
              normalizedTitle: 'newPost2'
            }
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
            newPost: {
              normalizedTitle: 'newPost',
              loading: false,
              loaded: false,
              error
            },
            newPost2: {
              normalizedTitle: 'newPost2'
            }
          }
        }));
      });


      it('handles UPDATE_CONTENT', () => {
        const newState = reducer(initialState, {
          type: 'posts/UPDATE_CONTENT',
          postTitle: 'testPost',
          newContent: '## Test Update'
        });

        expect(newState).to.equal(fromJS({
          loaded: false,
          data: {
            testPost: {
              normalizedTitle: 'testPost',
              loaded: true,
              content: '## Test Update',
              html: '<h2 id="test-update">Test Update</h2>\n'
            }
          }
        }));
      });

      it('handles SAVE', () => {
        const newState = reducer(initialState, {
          type: 'posts/SAVE',
          postTitle: 'testPost'
        });

        expect(newState).to.equal(fromJS({
          loaded: false,
          data: {
            testPost: {
              normalizedTitle: 'testPost',
              html: '<h1>Test</h1>',
              loaded: true,
              saving: true
            }
          }
        }));
      });

      it('handles SAVE_SUCCESS', () => {
        const newState = reducer(initialState, {
          type: 'posts/SAVE_SUCCESS',
          postTitle: 'testPost'
        });

        expect(newState).to.equal(fromJS({
          loaded: false,
          data: {
            testPost: {
              normalizedTitle: 'testPost',
              html: '<h1>Test</h1>',
              loaded: true,
              saving: false,
              saved: true
            }
          }
        }));
      });

      it('handles SAVE_FAIL', () => {
        const error = new Error('Save Fail');
        const newState = reducer(initialState, {
          type: 'posts/SAVE_FAIL',
          postTitle: 'testPost',
          error
        });

        expect(newState).to.equal(fromJS({
          loaded: false,
          data: {
            testPost: {
              normalizedTitle: 'testPost',
              html: '<h1>Test</h1>',
              loaded: true,
              saving: false,
              saved: false,
              error
            }
          }
        }));
      });
    });
  });
});

