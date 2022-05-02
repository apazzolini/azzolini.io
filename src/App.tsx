import React, { Suspense, useMemo } from 'react';
import { Route } from 'react-router';
import { BrowserRouter as Router, Routes } from 'react-router-dom';
import Nav from 'src/components/Nav';
import BlogEntry from 'src/pages/BlogEntry';
import Home from 'src/pages/Home';
import NotFound from 'src/pages/NotFound';
import slug from 'src/util/slug';
import pages from '~react-pages'; // eslint-disable-line -- this is dynamically created by vite-plugin-pages

function App() {
  const rawBlogPages = pages.find((p) => p.path === 'posts')!.children!;
  const aboutPage = pages.find((p) => p.path === 'about')!;

  const blogPages = useMemo(() => {
    return rawBlogPages.map((p) => ({ ...p, path: `/posts/${slug(p.meta.title)}` }));
  }, [rawBlogPages]);

  return (
    <div className="mx-4 mt-4 md:ml-24 md:mt-24 max-w-2xl">
      <Suspense fallback={<div />}>
        <Router>
          <Nav />
          <Routes>
            <Route path="" element={<Home blogPages={blogPages} aboutContent={aboutPage.element} />} />
            {blogPages.map((p) => (
              <Route key={p.path} path={p.path} element={<BlogEntry page={p} />} />
            ))}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </Suspense>
    </div>
  );
}

export default App;
