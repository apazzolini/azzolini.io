import {expect} from 'chai';
import * as Posts from '../routes/posts';
import db from '../lib/db';
import {server} from '../../../test/helper';

describe('api', () => {
  describe('posts', () => {
    const postsDb = db.collection('posts');
    let testPostId;

    // -------------------------------------------------------------------------
    // Setup -------------------------------------------------------------------
    // -------------------------------------------------------------------------

    before((done) => {
      postsDb.drop();

      postsDb.save({
        title: 'Test Title',
        slug: 'test-title',
        content: '# Test Title Headline',
        date: new Date(2015, 8, 24)
      });

      postsDb.findOne({title: 'Test Title'}).then((doc) => {
        testPostId = doc._id;
        done();
      });
    });

    // -------------------------------------------------------------------------
    // Begin exported function tests -------------------------------------------
    // -------------------------------------------------------------------------

    describe('exported functions', () => {
      it('fetches all posts without content', async () => {
        const posts = await Posts.getPosts();
        expect(posts).to.have.length(1);
        expect(posts[0]).to.not.have.property('content');
      });

      it('fetches a post by URL slug', async () => {
        const post = await Posts.getPostBySlug('test-title');
        expect(post.title).to.equal('Test Title');
        expect(post.html).to.equal('<h1 id="test-title-headline">Test Title Headline</h1>\n');
      });

      it('fetches a post by id', async() => {
        const post = await Posts.getPostById(testPostId);
        expect(post.title).to.equal('Test Title');
        expect(post.html).to.equal('<h1 id="test-title-headline">Test Title Headline</h1>\n');
      });

      it('updates content on that post', async() => {
        const newContent = [
          '---',
          'title: Test Title Updated',
          'slug: test-title-updated',
          '---',
          '',
          '## Test Updated'
        ].join('\n');

        const result = await Posts.savePost(testPostId, newContent);
        expect(result.nModified).to.equal(1);
      });

      it('creates a new post', async() => {
        const result = await Posts.createPost();
        expect(result._id.toString()).to.equal(result.title);
        expect(result._id.toString()).to.equal(result.slug);
      });
    });

    // -------------------------------------------------------------------------
    // Begin route tests -------------------------------------------------------
    // -------------------------------------------------------------------------

    describe('routes', () => {
      it('responds with an array of posts', (done) => {
        server.inject({method: 'GET', url: '/posts'}, (res) => {
          expect(res.result).to.be.an('array');
          done();
        });
      });

      it('responds with the requested post by slug', (done) => {
        server.inject({method: 'GET', url: '/posts/s/test-title-updated'}, (res) => {
          expect(res.result.title).to.equal('Test Title Updated');
          done();
        });
      });

      it('responds with the requested post by id', (done) => {
        server.inject({method: 'GET', url: `/posts/${testPostId}`}, (res) => {
          expect(res.result.title).to.equal('Test Title Updated');
          expect(res.result.html).to.equal('<h2 id="test-updated">Test Updated</h2>\n');
          done();
        });
      });

      it('ensures id is a mongo ObjectId', (done) => {
        const badId = testPostId + 'xx';
        server.inject({method: 'GET', url: `/posts/${badId}`}, (res) => {
          expect(res.statusCode).to.equal(400);
          done();
        });
      });

      it('creates a new post', (done) => {
        server.inject({method: 'POST', url: `/posts/create`}, (res) => {
          expect(res.result.id).to.exist;
          done();
        });
      });

      it('updates a post', (done) => {
        const payload = [
          '---',
          'title: Test Title Updated2',
          'slug: test-title-updated-2',
          '---',
          '',
          '## Test Updated 2'
        ].join('\n');

        server.inject({
          method: 'POST',
          url: `/posts/${testPostId}`,
          payload,
          headers: {
            'Content-Type': 'text/*'
          }
        }, (res) => {
          expect(res.result).to.equal(1);
          done();
        });
      });
    });

    // -------------------------------------------------------------------------
    // Teardown ----------------------------------------------------------------
    // -------------------------------------------------------------------------

    after(() => {
      postsDb.drop();
    });
  });
});
