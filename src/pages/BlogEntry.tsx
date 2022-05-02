import { PropsWithChildren } from 'react';
import { RouteObject } from 'react-router';
import useMetaTags from 'src/hooks/useMetaTags';
import { parseISO } from 'date-fns';
import { format, utcToZonedTime } from 'date-fns-tz';

type BlogEntryProps = PropsWithChildren<{
  page: RouteObject;
}>;

function formatBlogDate(dateStr: string): string {
  return format(utcToZonedTime(parseISO(dateStr), 'UTC'), 'MMM dd, yyyy', { timeZone: 'UTC' });
}

export default function BlogEntry({ page }: BlogEntryProps) {
  useMetaTags(page.meta.title);

  return (
    <div>
      <h1 className="text-2xl mb-2 font-black md:text-3xl">{page.meta.title}</h1>
      <h2 className="mb-8 md:mb-16 font-mono text-xs">{formatBlogDate(page.meta.date)}</h2>
      <div className="blog-content">{page.element}</div>
    </div>
  );
}
