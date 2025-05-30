'use client';

import Link from 'next/link';

export default function NavigationSection() {
  return (
    <section className="p-6 w-full flex items-center justify-center text-center">
      <div className="flex flex-col items-center max-w-2xl w-full gap-6">
        <h2 className="text-2xl font-bold">Explore Our Pages</h2>
        <div className="flex flex-col pt-5 justify-center gap-4 w-full">
          <Link
            href="/tracks/subjects/create/by-chapters"
            className="border-2 py-2 px-6 font-bold border-black rounded hover:bg-black hover:text-white transition"
          >
            By Chapters
          </Link>
          <Link
            href="/tracks/subjects/create/grand"
            className="border-2 py-2 px-6 font-bold border-black rounded hover:bg-black hover:text-white transition"
          >
           Grand tests
          </Link>
          <Link
              href="/tracks/subjects/create/university"
            className="border-2 py-2 px-6 font-bold border-black rounded hover:bg-black hover:text-white transition"
          >
            University Test
          </Link>
         
        </div>
      </div>
    </section>
  );
}
