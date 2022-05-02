import { PropsWithChildren } from 'react';
import { RouteObject } from 'react-router';
import useMetaTags from 'src/hooks/useMetaTags';
import { formatDateLong } from 'src/util/dates';

type BlogEntryProps = PropsWithChildren<{
  page: RouteObject;
}>;

export default function BlogEntry({ page }: BlogEntryProps) {
  useMetaTags(page.meta.title);

  return (
    <div>
      <h1 className="text-2xl mb-2 font-black md:text-3xl">{page.meta.title}</h1>
      <h2 className="mb-8 md:mb-16 font-mono text-xs">{formatDateLong(page.meta.date)}</h2>
      <div className="blog-content">{page.element}</div>
    </div>
  );
}
