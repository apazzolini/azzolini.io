import { Link } from 'react-router-dom';

export default function Nav() {
  return (
    <nav className="mb-16">
      <Link to="/" className="no-underline text-zinc-300 tracking-widest font-mono text-xs font-medium">
        Andre Azzolini
      </Link>
    </nav>
  );
}
