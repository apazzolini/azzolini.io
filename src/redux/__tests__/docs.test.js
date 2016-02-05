import {expect} from 'chai';
import Immutable from 'immutable';
import {createReducer} from 'rook/lib/redux/createStore';
import reducers from '../modules';
import fromError from '../utils/fromError';
const reducer = createReducer(reducers.docs);

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

      it('handles loadList', () => {
        loadPendingState = reducer(initialState, {
          type: 'docs/loadList'
        });

        expect(loadPendingState.toJS()).to.deep.equal({
          loaded: false,
          loading: true,
          entities: {
            ...testDoc
          }
        });
      });

      it('handles loadListOk', () => {
        loadedState = reducer(loadPendingState, {
          type: 'docs/loadListOk',
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

      it('handles loadListFail', () => {
        const error = new Error('Load Fail');
        const newState = reducer(loadPendingState, {
          type: 'docs/loadListFail',
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

      it('handles loadDoc from scratch', () => {
        const newState = reducer(initialState, {
          type: 'docs/loadDoc',
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

      it('handles loadDoc of a partially loaded post', () => {
        partiallyLoadingState = reducer(loadedState, {
          type: 'docs/loadDoc',
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
            }
          }
        });
      });

      it('handles loadDocOk', () => {
        const newState = reducer(partiallyLoadingState, {
          type: 'docs/loadDocOk',
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

      it('handles loadDocFail', () => {
        const error = new Error('Load Fail');
        const newState = reducer(partiallyLoadingState, {
          type: 'docs/loadDocFail',
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

      it('handles updateContent', () => {
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
          type: 'docs/updateContent',
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

      it('handles updateContentFail', () => {
        const newState = reducer(initialState, {
          type: 'docs/updateContentFail',
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

      it('handles save', () => {
        const newState = reducer(initialState, {
          type: 'docs/save',
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

      it('handles saveOk', () => {
        const newState = reducer(initialState, {
          type: 'docs/saveOk',
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

      it('handles saveFail', () => {
        const error = new Error('Save Fail');
        const newState = reducer(initialState, {
          type: 'docs/saveFail',
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

      it('handles create', () => {
        const newState = reducer(initialState, {
          type: 'docs/create'
        });

        expect(newState.toJS()).to.deep.equal({
          loaded: false,
          creating: true,
          entities: {
            ...testDoc
          }
        });
      });

      it('handles createOk', () => {
        const newState = reducer(initialState, {
          type: 'docs/createOk',
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

      it('handles createFail', () => {
        const error = new Error('Create Fail');
        const newState = reducer(initialState, {
          type: 'docs/createFail',
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

      it('handles delete', () => {
        const newState = reducer(initialState, {
          type: 'docs/delete',
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

      it('handles deleteOk', () => {
        const newState = reducer(initialState, {
          type: 'docs/deleteOk',
          docId: '0'
        });

        expect(newState.toJS()).to.deep.equal({
          loaded: false,
          entities: {}
        });
      });

      it('handles deleteFail', () => {
        const error = new Error('Delete Fail');
        const newState = reducer(initialState, {
          type: 'docs/deleteFail',
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
