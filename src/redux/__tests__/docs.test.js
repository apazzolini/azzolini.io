import {expect} from 'chai';
import Immutable from 'immutable';
import reducer from '../modules/docs';
import {fromError} from '../utils';

describe('redux', () => {
  describe('reducers', () => {
    describe('docs', () => {
      const testDoc = {
        0: {
          _id: 0,
          type: 'post',
          slug: 'test-post',
          html: '<h1>Test</h1>',
          loaded: true
        }
      };

      const initialState = Immutable.fromJS({
        loaded: false,
        entities: {
          ...testDoc
        }
      });

      let loadPendingState;
      let loadedState;

      it('handles LOAD_LIST', () => {
        loadPendingState = reducer(initialState, {
          type: 'docs/LOAD_LIST'
        });

        expect(loadPendingState.toJS()).to.deep.equal({
          loaded: false,
          loading: true,
          entities: {
            ...testDoc
          }
        });
      });

      it('handles LOAD_LIST_OK', () => {
        loadedState = reducer(loadPendingState, {
          type: 'docs/LOAD_LIST_OK',
          result: [
            {
              _id: 0,
              type: 'post',
              slug: 'test-post'
            }, {
              _id: 1,
              type: 'post',
              slug: 'new-post'
            }, {
              _id: 2,
              type: 'post',
              slug: 'new-post-2'
            }
          ]
        });

        expect(loadedState.toJS()).to.deep.equal({
          loaded: true,
          loading: false,
          entities: {
            ...testDoc,
            1: {
              _id: 1,
              type: 'post',
              slug: 'new-post'
            },
            2: {
              _id: 2,
              type: 'post',
              slug: 'new-post-2'
            }
          }
        });
      });

      it('handles LOAD_LIST_FAIL', () => {
        const error = new Error('Load Fail');
        const newState = reducer(loadPendingState, {
          type: 'docs/LOAD_LIST_FAIL',
          error
        });

        expect(newState.toJS()).to.deep.equal({
          loaded: false,
          loading: false,
          loadError: fromError(error),
          entities: {
            ...testDoc
          }
        });
      });

      let partiallyLoadingState;

      it('handles LOAD from scratch', () => {
        const newState = reducer(initialState, {
          type: 'docs/LOAD_DOC',
          docType: 'post',
          slug: 'new-post'
        });

        expect(newState.toJS()).to.deep.equal({
          loaded: false,
          entities: {
            ...testDoc
          }
        });
      });

      it('handles LOAD of a partially loaded post', () => {
        partiallyLoadingState = reducer(loadedState, {
          type: 'docs/LOAD_DOC',
          docType: 'post',
          slug: 'new-post'
        });

        expect(partiallyLoadingState.toJS()).to.deep.equal({
          loaded: true,
          loading: false,
          entities: {
            ...testDoc,
            1: {
              _id: 1,
              type: 'post',
              slug: 'new-post',
              loading: true
            },
            2: {
              _id: 2,
              type: 'post',
              slug: 'new-post-2'
            },
          }
        });
      });

      it('handles LOAD_DOC_OK', () => {
        const newState = reducer(partiallyLoadingState, {
          type: 'docs/LOAD_DOC_OK',
          result: {
            _id: 1,
            html: '<h1>New</h1>'
          }
        });

        expect(newState.toJS()).to.deep.equal({
          loaded: true,
          loading: false,
          entities: {
            ...testDoc,
            1: {
              _id: 1,
              type: 'post',
              slug: 'new-post',
              loading: false,
              loaded: true,
              html: '<h1>New</h1>'
            },
            2: {
              _id: 2,
              type: 'post',
              slug: 'new-post-2'
            }
          }
        });
      });

      it('handles LOAD_DOC_FAIL', () => {
        const error = new Error('Load Fail');
        const newState = reducer(partiallyLoadingState, {
          type: 'docs/LOAD_DOC_FAIL',
          docType: 'post',
          slug: 'new-post',
          error
        });

        expect(newState.toJS()).to.deep.equal({
          loaded: true,
          loading: false,
          entities: {
            ...testDoc,
            1: {
              _id: 1,
              type: 'post',
              slug: 'new-post',
              loading: false,
              loaded: false,
              loadError: fromError(error)
            },
            2: {
              _id: 2,
              type: 'post',
              slug: 'new-post-2'
            }
          }
        });
      });

      it('handles UPDATE_CONTENT', () => {
        const newContent = [
          '---',
          'type: post',
          'title: Test Post Updated',
          'slug: test-post-updated',
          '---',
          '',
          '## Test Update'
        ].join('\n');

        const newState = reducer(initialState, {
          type: 'docs/UPDATE_CONTENT',
          doc: {
            _id: 0
          },
          newContent
        });

        expect(newState.toJS()).to.deep.equal({
          loaded: false,
          entities: {
            0: {
              _id: 0,
              type: 'post',
              title: 'Test Post Updated',
              slug: 'test-post-updated',
              loaded: true,
              content: newContent,
              html: '<h1 id=\"test-post-updated\">Test Post Updated</h1>\n<h2 id="test-update">Test Update</h2>\n',
              updateError: false,
              dirty: true
            }
          }
        });
      });

      it('handles UPDATE_CONTENT_FAIL', () => {
        const newState = reducer(initialState, {
          type: 'docs/UPDATE_CONTENT_FAIL',
          doc: {
            _id: 0
          },
          newContent: 'Something',
          message: 'Error Message'
        });

        expect(newState.toJS()).to.deep.equal({
          loaded: false,
          entities: {
            0: {
              _id: 0,
              type: 'post',
              slug: 'test-post',
              content: 'Something',
              html: '<h1>Test</h1>',
              loaded: true,
              updateError: 'Error Message'
            }
          }
        });
      });

      it('handles SAVE', () => {
        const newState = reducer(initialState, {
          type: 'docs/SAVE',
          doc: {
            _id: 0
          }
        });

        expect(newState.toJS()).to.deep.equal({
          loaded: false,
          entities: {
            0: {
              _id: 0,
              type: 'post',
              slug: 'test-post',
              html: '<h1>Test</h1>',
              loaded: true,
              saving: true
            }
          }
        });
      });

      it('handles SAVE_OK', () => {
        const newState = reducer(initialState, {
          type: 'docs/SAVE_OK',
          doc: {
            _id: 0
          }
        });

        expect(newState.toJS()).to.deep.equal({
          loaded: false,
          entities: {
            0: {
              _id: 0,
              type: 'post',
              slug: 'test-post',
              html: '<h1>Test</h1>',
              loaded: true,
              saving: false,
              saved: true,
              dirty: false
            }
          }
        });
      });

      it('handles SAVE_FAIL', () => {
        const error = new Error('Save Fail');
        const newState = reducer(initialState, {
          type: 'docs/SAVE_FAIL',
          doc: {
            _id: 0
          },
          error
        });

        expect(newState.toJS()).to.deep.equal({
          loaded: false,
          entities: {
            0: {
              _id: 0,
              type: 'post',
              slug: 'test-post',
              html: '<h1>Test</h1>',
              loaded: true,
              saving: false,
              saved: false,
              saveError: fromError(error)
            }
          }
        });
      });

      it('handles CREATE', () => {
        const newState = reducer(initialState, {
          type: 'docs/CREATE'
        });

        expect(newState.toJS()).to.deep.equal({
          loaded: false,
          creating: true,
          entities: {
            ...testDoc
          }
        });
      });

      it('handles CREATE_OK', () => {
        const newState = reducer(initialState, {
          type: 'docs/CREATE_OK',
          result: {
            _id: 3,
            type: 'post',
            title: 3,
            slug: 3
          }
        });

        expect(newState.toJS()).to.deep.equal({
          loaded: false,
          creating: false,
          entities: {
            ...testDoc,
            3: {
              _id: 3,
              type: 'post',
              title: 3,
              slug: 3
            }
          }
        });
      });

      it('handles CREATE_FAIL', () => {
        const error = new Error('Create Fail');
        const newState = reducer(initialState, {
          type: 'docs/CREATE_FAIL',
          error
        });

        expect(newState.toJS()).to.deep.equal({
          loaded: false,
          creating: false,
          createError: fromError(error),
          entities: {
            ...testDoc
          }
        });
      });

      it('handles DELETE', () => {
        const newState = reducer(initialState, {
          type: 'docs/DELETE',
          docId: '0'
        });

        expect(newState.toJS()).to.deep.equal({
          loaded: false,
          entities: {
            0: {
              _id: 0,
              type: 'post',
              slug: 'test-post',
              html: '<h1>Test</h1>',
              loaded: true,
              deleting: true
            }
          }
        });
      });

      it('handles DELETE_OK', () => {
        const newState = reducer(initialState, {
          type: 'docs/DELETE_OK',
          docId: '0'
        });

        expect(newState.toJS()).to.deep.equal({
          loaded: false,
          entities: {}
        });
      });

      it('handles DELETE_FAIL', () => {
        const error = new Error('Delete Fail');
        const newState = reducer(initialState, {
          type: 'docs/DELETE_FAIL',
          docId: '0',
          error
        });

        expect(newState.toJS()).to.deep.equal({
          loaded: false,
          entities: {
            0: {
              _id: 0,
              type: 'post',
              slug: 'test-post',
              html: '<h1>Test</h1>',
              loaded: true,
              deleting: false,
              deleteError: fromError(error)
            }
          }
        });
      });
    });
  });
});
