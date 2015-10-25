import {expect} from 'chai';
import * as Docs from '../routes/docs';
import {docs as docsDb} from '../lib/db';
import {server} from '../../../test/helper';

describe('api', () => {
  describe('docs', () => {
    let testPostId;
    const credentials = {
      credentials: 'some-value'
    };

    // -------------------------------------------------------------------------
    // Setup -------------------------------------------------------------------
    // -------------------------------------------------------------------------

    before((done) => {
      docsDb.drop();

      docsDb.save({
        type: 'post',
        title: 'Test Post',
        slug: 'test-post',
        content: '# Test Post Headline',
        date: '2015-09-01'
      });

      docsDb.save({
        type: 'page',
        title: 'Test Page',
        slug: 'test-page',
        content: '# Test Page Headline',
        date: '2015-09-02'
      });

      docsDb.findOne({slug: 'test-post'}).then((doc) => {
        testPostId = doc._id;
        done();
      });
    });

    // -------------------------------------------------------------------------
    // Begin exported function tests -------------------------------------------
    // -------------------------------------------------------------------------

    describe('exported functions', () => {
      it('fetches all posts without content', async () => {
        const posts = await Docs.getDocs('post');
        expect(posts).to.have.length(1);
        expect(posts[0]).to.not.have.property('content');
      });

      it('fetches all docs without content', async () => {
        const posts = await Docs.getDocs();
        expect(posts).to.have.length(2);
        expect(posts[0]).to.not.have.property('content');
        expect(posts[1]).to.not.have.property('content');
      });

      it('fetches a post by URL slug', async () => {
        const post = await Docs.getDocBySlug('post', 'test-post');
        expect(post.title).to.equal('Test Post');
      });

      it('parses markdown into html', async () => {
        const post = await Docs.getDocBySlug('post', 'test-post');
        expect(post.html).to.equal('<h1 id="test-post-headline">Test Post Headline</h1>\n');
      });

      it('fetches a doc by id', async() => {
        const doc = await Docs.getDocById(testPostId);
        expect(doc.title).to.equal('Test Post');
      });

      it('updates content on a doc', async() => {
        const newContent = [
          '---',
          'type: post',
          'title: Test Post Updated',
          'slug: test-post-updated',
          '---',
          '',
          '# Test Post Headline Updated'
        ].join('\n');

        const result = await Docs.saveDoc(testPostId, newContent);
        expect(result._id).to.equal(testPostId);

        const doc = await Docs.getDocById(testPostId);
        expect(doc.html).to.equal('<h1 id="test-post-headline-updated">Test Post Headline Updated</h1>\n');
      });

      it('creates a new doc with type post', async() => {
        const result = await Docs.createDoc('post');
        expect(result._id.toString()).to.equal(result.title);
        expect(result._id.toString()).to.equal(result.slug);
        expect(result.type).to.equal('post');
      });

      it('deletes a doc by id', async() => {
        const result = await Docs.createDoc('post');
        expect(result).to.have.property('title');

        const delResult = await Docs.deleteDoc(result._id.toString());
        expect(delResult.n).to.equal(1);
      });
    });

    // -------------------------------------------------------------------------
    // Begin route tests -------------------------------------------------------
    // -------------------------------------------------------------------------

    describe('routes', () => {
      it('responds with an array of posts', (done) => {
        server.inject({method: 'GET', url: '/docs?type=post'}, (res) => {
          expect(res.result).to.be.an('array');
          expect(res.result).to.have.length(2);
          done();
        });
      });

      it('responds with an array of docs', (done) => {
        server.inject({method: 'GET', url: '/docs'}, (res) => {
          expect(res.result).to.be.an('array');
          expect(res.result).to.have.length(3);
          done();
        });
      });

      it('responds with the requested post by slug', (done) => {
        server.inject({method: 'GET', url: '/docs/post/test-post-updated'}, (res) => {
          expect(res.result.title).to.equal('Test Post Updated');
          done();
        });
      });

      it('responds with the requested page by slug', (done) => {
        server.inject({method: 'GET', url: '/docs/page/test-page'}, (res) => {
          expect(res.result.title).to.equal('Test Page');
          done();
        });
      });

      it('responds with the requested post by id', (done) => {
        server.inject({method: 'GET', url: `/docs/${testPostId}`}, (res) => {
          expect(res.result.title).to.equal('Test Post Updated');
          expect(res.result.html).to.equal('<h1 id="test-post-headline-updated">Test Post Headline Updated</h1>\n');
          done();
        });
      });

      it('ensures id is a mongo ObjectId', (done) => {
        const badId = testPostId + 'xx';
        server.inject({method: 'GET', url: `/docs/${badId}`}, (res) => {
          expect(res.statusCode).to.equal(400);
          done();
        });
      });

      it('creates a new post', (done) => {
        server.inject({...credentials, method: 'POST', url: `/docs/post/create`}, (res) => {
          expect(res.result).to.have.property('_id');
          expect(res.result.type).to.equal('post');
          done();
        });
      });

      it('updates a post', (done) => {
        const payload = [
          '---',
          'type: post',
          'title: Test Post Updated 2',
          'slug: test-post-updated-2',
          '---',
          '',
          '# Test Post Headline Updated 2'
        ].join('\n');

        server.inject({
          ...credentials,
          method: 'POST',
          url: `/docs/${testPostId}`,
          payload,
          headers: {
            'Content-Type': 'text/*'
          }
        }, (res) => {
          expect(res.result._id.toString()).to.equal(testPostId.toString());
          done();
        });
      });

      it('deletes a doc', (done) => {
        server.inject({...credentials, method: 'DELETE', url: `/docs/${testPostId}`}, (res) => {
          expect(res.result.n).to.equal(1);
          done();
        });
      });
    });

    // -------------------------------------------------------------------------
    // Teardown ----------------------------------------------------------------
    // -------------------------------------------------------------------------

    after(() => {
      docsDb.drop();
    });
  });
});
