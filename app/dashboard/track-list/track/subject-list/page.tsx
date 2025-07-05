'use client';

import { redirect, useRouter } from 'next/navigation';
import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';

interface Chapter {
  id: number;
  name: string;
  description: string | null;
  thumbnail: string | null;
  subject: number;
}




interface Subject {
  id: number;
  name: string;
  description: string;
  thumbnail: string | null;
  chapters: Chapter[];
}

export default function SubjectsPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [trackId, setTrackId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const id = sessionStorage.getItem('id_track');
    if (id) {
      setTrackId(id);
    } else {
      setError('Track ID not found in session storage.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchSubjects = async () => {
      if (!trackId) return; // Don't fetch if trackId is not available

      try {
        const token = sessionStorage.getItem('Authorization');
        if (!token) {
          throw new Error('No authorization token found');
        }

        const response = await fetch(`https://junoon-vatb.onrender.com/api/tracks_app/subjects/?track_id=${trackId}`, {
          headers: {
            'Authorization': token,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch subjects');
        }

        const data = await response.json();
        setSubjects(data);
       
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [trackId]); // Refetch when trackId changes

  // Search filter (search by name, description)
  const filteredData = useMemo(() => {
    if (!search) return subjects;
    return subjects.filter(row =>
      row.name.toLowerCase().includes(search.toLowerCase()) ||
      row.description.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, subjects]);

  // Pagination
  const pageCount = Math.ceil(filteredData.length / pageSize);
  const pagedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  if (error) {
    return <div className="text-red-500 p-6">Error: {error}</div>;
  }

  if (loading) {
    return <div className="p-6">Loading subjects...</div>;
  }

  if (subjects.length === 0) {
    return <div className="p-6">No subjects found for this track.</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-xl font-bold mb-6">Subjects</h1>
      <div className='border-grey-800 border-2 rounded-lg p-4'>
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <input
            type="text"
            placeholder="Type in to Search"
            className="border text-sm focus:outline-none px-3 py-2 rounded w-full sm:w-72"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full border-grey-800 border-2 text-sm">
            <thead>
              <tr>
                <th className="p-3">#</th>
                <th className="p-3 text-left">Thumbnail</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-left">Chapters</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody className='border-grey-800 text-xs border-2'>
              {pagedData.map((row, i) => (
                <tr
                  key={row.id}
                  className="border-t border-grey-800 border-2 hover:bg-blue-50 cursor-pointer transition"
                  onClick={() => {
                    sessionStorage.setItem('id_subject', row.id.toString());
                    sessionStorage.setItem('subject_name', row.name);
                    sessionStorage.setItem('subject_description', row.description);
                    router.push('/dashboard/track-list/track/subject-list/subject');
                  }}
                >
                  <td className="p-3 font-semibold text-slate-800">{(page - 1) * pageSize + i + 1}</td>
                  <td className="p-3">
                    {row.thumbnail ? (
                      <img src={row.thumbnail} alt={row.name} className="w-8 h-8 object-cover rounded" />
                    ) : (
                      <div className="w-8 h-8 bg-gray-100 flex items-center text-xs justify-center rounded text-gray-400">Null</div>
                    )}
                  </td>
                  <td className="p-3 font-bold ">{row.name}</td>
                  <td className="p-3 text-gray-700 max-w-xs text-slate-600 truncate" title={row.description}>{row.description}</td>
                  <td className="p-3">{row.chapters.length}</td>
                  <td className="p-3 text-right">
                    <button className="px-2 py-1 text-gray-400 hover:text-gray-700" tabIndex={-1} onClick={e => e.stopPropagation()}>
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="2" fill="currentColor"/><circle cx="19" cy="12" r="2" fill="currentColor"/><circle cx="5" cy="12" r="2" fill="currentColor"/></svg>
                    </button>
                  </td>
                </tr>
              ))}
              {pagedData.length === 0 && (
                <tr><td colSpan={6} className="text-center p-6 text-gray-400">No data found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex">
            <button
              className={`px-2 text-xs border ${page === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white hover:bg-gray-50'}`}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >Prev</button>
            {[...Array(pageCount)].map((_, idx) => (
              <button
                key={idx}
                className={`px-2 py-1 text-xs border ${page === idx + 1 ? 'bg-[#6d7efc] text-white' : 'bg-white hover:bg-gray-50'}`}
                onClick={() => setPage(idx + 1)}
              >{idx + 1}</button>
            ))}
            <button
              className={`px-2 text-xs border ${page === pageCount || pageCount === 0 ? 'bg-gray-100 text-gray-400' : 'bg-white hover:bg-purple1050'}`}
              onClick={() => setPage(p => Math.min(pageCount, p + 1))}
              disabled={page === pageCount || pageCount === 0}
            >Next</button>
          </div>
          <div className="text-xs text-gray-500">
            {pagedData.length > 0 && (
              <span>{(page - 1) * pageSize + 1}-{(page - 1) * pageSize + pagedData.length} of {filteredData.length}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
