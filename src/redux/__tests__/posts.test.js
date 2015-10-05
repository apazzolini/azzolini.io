import {expect} from 'chai';
import {fromJS} from 'immutable';
import reducer from '../modules/posts';

describe('redux', () => {
  describe('reducers', () => {
    describe('posts', () => {
      const testPost = {
        0: {
          _id: 0,
          slug: 'test-post',
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
              slug: 'test-post'
            }, {
              _id: 1,
              slug: 'new-post'
            }, {
              _id: 2,
              slug: 'new-post-2'
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
              slug: 'new-post'
            },
            2: {
              _id: 2,
              slug: 'new-post-2'
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


      it('handles CREATE', () => {
        const newState = reducer(initialState, {
          type: 'posts/CREATE'
        });

        expect(newState).to.equal(fromJS({
          loaded: false,
          creating: true,
          data: {
            ...testPost
          }
        }));
      });

      it('handles CREATE_SUCCESS', () => {
        const newState = reducer(initialState, {
          type: 'posts/CREATE_SUCCESS',
          result: {
            id: 3
          }
        });

        expect(newState).to.equal(fromJS({
          loaded: false,
          creating: false,
          data: {
            ...testPost,
            3: {
              _id: 3,
              title: 3,
              slug: 3
            }
          }
        }));
      });

      it('handles CREATE_FAIL', () => {
        const error = new Error('Create Fail');
        const newState = reducer(initialState, {
          type: 'posts/CREATE_FAIL',
          error
        });

        expect(newState).to.equal(fromJS({
          loaded: false,
          creating: false,
          createError: error.toString(),
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
          postSlug: 'new-post'
        });

        expect(newState).to.equal(fromJS({
          loaded: false,
          data: {
            ...testPost
          }
        }));
      });

      it('handles LOAD of a partially loaded post', () => {
        partiallyLoadingState = reducer(loadedState, {
          type: 'posts/LOAD_SINGLE',
          postSlug: 'new-post'
        });

        expect(partiallyLoadingState).to.equal(fromJS({
          loaded: true,
          loading: false,
          data: {
            ...testPost,
            1: {
              _id: 1,
              slug: 'new-post',
              loading: true
            },
            2: {
              _id: 2,
              slug: 'new-post-2'
            },
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
              slug: 'new-post',
              loading: false,
              loaded: true,
              html: '<h1>New</h1>'
            },
            2: {
              _id: 2,
              slug: 'new-post-2'
            }
          }
        }));
      });

      it('handles LOAD_SINGLE_FAIL', () => {
        const error = new Error('Load Fail');
        const newState = reducer(partiallyLoadingState, {
          type: 'posts/LOAD_SINGLE_FAIL',
          postSlug: 'new-post',
          error
        });

        expect(newState).to.equal(fromJS({
          loaded: true,
          loading: false,
          data: {
            ...testPost,
            1: {
              _id: 1,
              slug: 'new-post',
              loading: false,
              loaded: false,
              error
            },
            2: {
              _id: 2,
              slug: 'new-post-2'
            }
          }
        }));
      });

      it('handles UPDATE_CONTENT', () => {
        const newContent = [
          '---',
          'title: Test Post Updated',
          'slug: test-post-updated',
          '---',
          '',
          '## Test Update'
        ].join('\n');

        const newState = reducer(initialState, {
          type: 'posts/UPDATE_CONTENT',
          post: {
            _id: 0
          },
          newContent
        });

        expect(newState).to.equal(fromJS({
          loaded: false,
          data: {
            0: {
              _id: 0,
              title: 'Test Post Updated',
              slug: 'test-post-updated',
              loaded: true,
              content: newContent,
              html: '<h2 id="test-update">Test Update</h2>\n'
            }
          }
        }));
      });

      it('handles SAVE', () => {
        const newState = reducer(initialState, {
          type: 'posts/SAVE',
          post: {
            _id: 0
          }
        });

        expect(newState).to.equal(fromJS({
          loaded: false,
          data: {
            0: {
              _id: 0,
              slug: 'test-post',
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
          post: {
            _id: 0
          }
        });

        expect(newState).to.equal(fromJS({
          loaded: false,
          data: {
            0: {
              _id: 0,
              slug: 'test-post',
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
          post: {
            _id: 0
          },
          error
        });

        expect(newState).to.equal(fromJS({
          loaded: false,
          data: {
            0: {
              _id: 0,
              slug: 'test-post',
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

