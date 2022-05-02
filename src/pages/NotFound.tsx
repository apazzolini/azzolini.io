import useMetaTags from 'src/hooks/useMetaTags';

export default function NotFound() {
  useMetaTags('Not Found | Andre Azzolini');
  return <h2>Not Found</h2>;
}
