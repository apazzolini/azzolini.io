import { useEffect } from 'react';

export default function useMetaTags(title: string, description?: string) {
  useEffect(() => {
    document.title = `${title} | Andre Azzolini`;
  }, [title]);
}