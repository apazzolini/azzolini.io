import { ReactNode, useMemo } from 'react';
import { RouteObject } from 'react-router';
import { Link } from 'react-router-dom';
import useMetaTags from 'src/hooks/useMetaTags';

type HomeProps = {
  aboutContent: ReactNode;
  blogPages: RouteObject[];
};

export default function Home({ aboutContent, blogPages }: HomeProps) {
  useMetaTags('Home | Andre Azzolini');

  const blogsByYear = useMemo(() => {
    const toRender = blogPages
      .filter((p) => p.meta.published)
      .sort((a, b) => b.meta.date.localeCompare(a.meta.date));

    return toRender.reduce((acc: Record<string, RouteObject[]>, p) => {
      const year = p.meta.date.substring(0, 4);
      if (!acc[year]) acc[year] = [];
      acc[year].push(p);
      return acc;
    }, {});
  }, [blogPages]);

  return (
    <>
      {Object.keys(blogsByYear)
        .sort((a, b) => b.localeCompare(a))
        .map((year) => {
          return (
            <div key={year}>
              <h3 className="font-mono text-sm mb-2 border-b border-zinc-800 inline-block">{year}</h3>
              <ul className="mb-10">
                {blogsByYear[year].map((p) => {
                  return (
                    <li className="mb-4" key={p.path}>
                      <Link to={p.path!} className="no-underline">
                        {p.meta.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      <hr className="mt-16 mb-10 border-zinc-800 w-16" />
      <div className="about-content max-w-xs text-sm text-zinc-300 tracking-normal">{aboutContent}</div>
    </>
  );
}
