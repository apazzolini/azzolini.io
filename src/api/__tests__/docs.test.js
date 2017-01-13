import { expect } from 'chai';
import { docs } from '../db';
import { server } from 'rook/lib/tests/setup';

describe('api', () => {
  describe('docs', () => {
    const docsDb = docs.__collection;

    // -------------------------------------------------------------------------
    // Expected test result helpers --------------------------------------------
    // -------------------------------------------------------------------------

    let testPostId;
    const credentials = {
      credentials: 'some-value'
    };

    // -------------------------------------------------------------------------
    // Setup -------------------------------------------------------------------
    // -------------------------------------------------------------------------

    before(async (done) => {
      try {
        await docsDb.dropAsync();
      } catch (e) {
        // Do nothing
      }

      await docsDb.saveAsync({
        type: 'post',
        title: 'Test Post',
        slug: 'test-post',
        content: '# Test Post Headline',
        date: '2015-09-01'
      });

      await docsDb.saveAsync({
        type: 'page',
        title: 'Test Page',
        slug: 'test-page',
        content: '# Test Page Headline',
        date: '2015-09-02'
      });

      docsDb.findOneAsync({ slug: 'test-post' }).then((doc) => {
        testPostId = doc._id;
        done();
      });
    });

    // -------------------------------------------------------------------------
    // Begin route tests -------------------------------------------------------
    // -------------------------------------------------------------------------

    it('responds with an array of posts', (done) => {
      server.inject({ method: 'GET', url: '/docs?type=post' }, (res) => {
        expect(res.result).to.be.an('array');
        expect(res.result).to.have.length(1);
        done();
      });
    });

    it('responds with an array of docs', (done) => {
      server.inject({ method: 'GET', url: '/docs' }, (res) => {
        expect(res.result).to.be.an('array');
        expect(res.result).to.have.length(2);
        done();
      });
    });

    it('responds with the requested post by slug', (done) => {
      server.inject({ method: 'GET', url: '/docs/post/test-post' }, (res) => {
        expect(res.result.title).to.equal('Test Post');
        done();
      });
    });

    it('responds with the requested page by slug', (done) => {
      server.inject({ method: 'GET', url: '/docs/page/test-page' }, (res) => {
        expect(res.result.title).to.equal('Test Page');
        done();
      });
    });

    it('responds with the requested post by id', (done) => {
      server.inject({ method: 'GET', url: `/docs/${testPostId}` }, (res) => {
        expect(res.result.title).to.equal('Test Post');
        done();
      });
    });

    it('ensures id is a mongo ObjectId', (done) => {
      const badId = testPostId + 'xx';
      server.inject({ method: 'GET', url: `/docs/${badId}` }, (res) => {
        expect(res.statusCode).to.equal(400);
        done();
      });
    });

    it('creates a new post', (done) => {
      server.inject({ ...credentials, method: 'POST', url: `/docs/post/create` }, (res) => {
        expect(res.result).to.have.property('_id');
        expect(res.result.type).to.equal('post');
        done();
      });
    });

    it('updates a post', (done) => {
      const payload = [
        '---',
        'type: post',
        'title: Test Post Updated',
        'slug: test-post-updated',
        '---',
        '',
        '## Test Post Headline Updated'
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

    it('retrieves the updated post', (done) => {
      server.inject({ method: 'GET', url: '/docs/post/test-post-updated' }, (res) => {
        expect(res.result.title).to.equal('Test Post Updated');
        expect(res.result.html).to.equal('<h1 id="test-post-updated">Test Post Updated</h1>\n<h2 id="test-post-headline-updated">Test Post Headline Updated</h2>\n');
        done();
      });
    });

    it('deletes a doc', (done) => {
      server.inject({ ...credentials, method: 'DELETE', url: `/docs/${testPostId}` }, (res) => {
        expect(res.result.n).to.equal(1);
        done();
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
