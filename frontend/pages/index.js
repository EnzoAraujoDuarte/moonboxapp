import Link from 'next/link';

export default function Home() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Moonbox App</h1>
      <p className="text-gray-600 mt-2">Admin UI</p>
      <div className="mt-4">
        <Link href="/settings" className="text-blue-600 underline">
          Go to Settings
        </Link>
      </div>
    </div>
  );
}


