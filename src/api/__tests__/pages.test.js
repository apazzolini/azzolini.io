import {expect} from 'chai';
import * as Pages from '../routes/pages/get';
import db from '../lib/db';
import {server} from '../../../test/helper';

describe('api', () => {
  describe('pages', () => {
    const pagesDb = db.collection('pages');

    // -------------------------------------------------------------------------
    // Setup -------------------------------------------------------------------
    // -------------------------------------------------------------------------

    before(() => {
      pagesDb.drop();
      pagesDb.save({
        name: 'testPage',
        content: '# Test Page Headline'
      });
    });

    // -------------------------------------------------------------------------
    // Begin exported function tests -------------------------------------------
    // -------------------------------------------------------------------------

    describe('exported functions', () => {
      it('gets a page', async () => {
        const page = await Pages.getPage('testPage');
        expect(page).to.have.property('content');
      });

      it('updates content on that page', async() => {
        const result = await Pages.savePage('testPage', '# Test Page Headline Updated');
        expect(result.ok).to.equal(1);
      });
    });


    // -------------------------------------------------------------------------
    // Begin route tests -------------------------------------------------------
    // -------------------------------------------------------------------------

    describe('routes', () => {
      it('responds with the requested page', (done) => {
        server.inject({method: 'GET', url: '/pages/testPage'}, (res) => {
          expect(res.result.name).to.equal('testPage');
          expect(res.result.html).to.equal('<h1 id="test-page-headline-updated">Test Page Headline Updated</h1>\n');
          done();
        });
      });

      it('saves new content for a page', (done) => {
        server.inject({method: 'POST', url: '/pages/testPage'}, (res) => {
          expect(res.result).to.equal(1);
          done();
        });
      });
    });

    // -------------------------------------------------------------------------
    // Teardown ----------------------------------------------------------------
    // -------------------------------------------------------------------------

    after(() => {
      pagesDb.drop();
    });
  });
});
