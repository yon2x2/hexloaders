import { Link } from 'react-router';
import Kicker from '@/components/Kicker';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[1440px] px-6 py-16 md:px-10">
      <Kicker>■ 404 / OUT OF RANGE</Kicker>
      <h1 className="mt-6 font-grotesk text-display-lg uppercase">STATE NOT FOUND</h1>
      <p className="mt-6 max-w-[68ch] text-body">
        The address space holds 64 states. This is not one of them.
      </p>
      <Link
        to="/"
        className="mt-8 inline-block border border-hexl-fg bg-hexl-fg px-6 py-4 font-mono text-mono-label uppercase text-hexl-bg hover:bg-hexl-bg hover:text-hexl-fg"
      >
        RETURN TO THE MATRIX →
      </Link>
    </div>
  );
}
