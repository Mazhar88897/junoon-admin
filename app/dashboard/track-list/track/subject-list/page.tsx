'use client';

import { redirect, useRouter } from 'next/navigation';
import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

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
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    thumbnail: null as File | null,
    thumbnailPreview: '',
  });
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

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks_app/subjects/?track_id=${trackId}`, {
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({
        ...prev,
        thumbnail: file,
        thumbnailPreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError('');
    try {
      const token = sessionStorage.getItem('Authorization');
      const track = sessionStorage.getItem('id_track');
      if (!token) throw new Error('No authorization token found');
      if (!track) throw new Error('No track ID found');
      const formDataToSend = new FormData();
      formDataToSend.append('track', track);
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('thumbnail', formData.thumbnail || '');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks_app/subjects/`, {
        method: 'POST',
        headers: {
          'Authorization': token,
        },
        body: formDataToSend,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create subject');
      }
      setFormData({ name: '', description: '', thumbnail: null, thumbnailPreview: '' });
      setShowModal(false);
      // Refresh subjects
      setLoading(true);
      const refreshed = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks_app/subjects/?track_id=${track}`, {
        headers: { 'Authorization': token },
      });
      if (refreshed.ok) {
        const data = await refreshed.json();
        setSubjects(data);
      }
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ name: '', description: '', thumbnail: null, thumbnailPreview: '' });
    setModalError('');
  };

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
      <h1 className="text-xl font-bold mb-6 flex items-center justify-between">
        <span>Subjects</span>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 text-sm bg-purple-800 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors"
        >
          + Add New Subject
        </button>
      </h1>
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
                  <td
                    className="p-3 text-gray-700 max-w-xs text-slate-600 truncate"
                    title={row.description}
                  >
                    <span
                      dangerouslySetInnerHTML={{ __html: row.description }}
                    />
                  </td>
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
      {/* Add New Subject Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="relative w-full max-w-2xl mx-auto bg-white rounded-lg shadow-2xl p-0 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between px-8 py-2 bg-purple-800 rounded-t-lg">
              <h3 className="text-lg font-semibold text-white">Add New Subject</h3>
              <button
                onClick={closeModal}
                className="text-white hover:text-gray-200 text-2xl font-bold focus:outline-none"
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleAddSubject} className="px-8 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#6d7efc] focus:border-[#6d7efc]"
                  placeholder="Enter subject name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <div className="bg-white rounded border border-gray-300">
                  <ReactQuill
                    value={formData.description}
                    onChange={(val: string) => setFormData(prev => ({ ...prev, description: val }))}
                    theme="snow"
                    className="min-h-[120px]"
                    placeholder="Enter subject description..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Thumbnail</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {formData.thumbnailPreview && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-2">Preview:</p>
                    <img
                      src={formData.thumbnailPreview}
                      alt="Thumbnail preview"
                      className="w-24 h-24 object-cover rounded border"
                    />
                  </div>
                )}
              </div>
              {modalError && (
                <div className="text-red-500 text-sm mt-2 text-center">{modalError}</div>
              )}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-purple-800 text-white rounded-md font-medium hover:bg-[#5a6edc] focus:outline-none disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
