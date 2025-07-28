'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState, useMemo } from 'react';
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

export default function ChaptersPage() {
  const router = useRouter();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pageSize = 10;

  // Form state for adding new chapter
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    thumbnail: null as File | null,
    thumbnailPreview: ''
  });

  useEffect(() => {
    const id = sessionStorage.getItem('id_subject');
    if (id) {
      setSubjectId(id);
    } else {
      setError('Subject ID not found in session storage.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchChapters = async () => {
      if (!subjectId) return;

      try {
        const token = sessionStorage.getItem('Authorization');
        if (!token) {
          throw new Error('No authorization token found');
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks_app/chapters?subject_id=${subjectId}`, {
          headers: {
            'Authorization': token,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch chapters');
        }

        const data = await response.json();
        setChapters(data);
       
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchChapters();
  }, [subjectId]);

  // Search filter (search by name, description)
  const filteredData = useMemo(() => {
    if (!search) return chapters;
    return chapters.filter(row =>
      row.name.toLowerCase().includes(search.toLowerCase()) ||
      (row.description && row.description.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search, chapters]);

  // Pagination
  const pageCount = Math.ceil(filteredData.length / pageSize);
  const pagedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  const handleChapterClick = (chapter: Chapter) => {
    // Store chapter details in session storage for the next page
    sessionStorage.setItem('chapter_id', chapter.id.toString());
   
    // Navigate to chapter detail page or perform other actions
    router.push('/dashboard/track-list/track/subject-list/subject');
  };

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

  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = sessionStorage.getItem('Authorization');
      if (!token) {
        throw new Error('No authorization token found');
      }

      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('subject', subjectId!);
      
      if (formData.thumbnail) {
        formDataToSend.append('thumbnail', formData.thumbnail);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks_app/chapters/`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          // Don't set Content-Type for FormData, let browser set it with boundary
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create chapter');
      }

      const newChapter = await response.json();
      setChapters(prev => [...prev, newChapter]);
      setFormData({ name: '', description: '', thumbnail: null, thumbnailPreview: '' });
      setShowModal(false);
      alert('Chapter created successfully!');
      
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ name: '', description: '', thumbnail: null, thumbnailPreview: '' });
  };

  if (error) {
    return <div className="text-red-500 p-6">Error: {error}</div>;
  }

  if (loading) {
    return <div className="p-6">Loading chapters...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Chapters</h1>
        <p className="text-gray-600">Manage chapters for this subject</p>
      </div>

      {/* Search and Add Button */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search chapters..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-purple-800  px-4 py-2 text-sm font-bold text-white rounded-lg">
          + Add New Chapter
        </button>
      </div>

      {/* Chapters Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full border-grey-800 border-2 text-sm">
          <thead>
            <tr>
              <th className="p-3">#</th>
              <th className="p-3 text-left">Thumbnail</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Description</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody className='border-grey-800 text-xs border-2'>
            {pagedData.map((row, i) => (
              <tr
                key={row.id}
                className="border-t border-grey-800 border-2 hover:bg-blue-50 cursor-pointer transition"
                onClick={() => handleChapterClick(row)}
              >
                <td className="p-3 font-semibold text-slate-800">{(page - 1) * pageSize + i + 1}</td>
                <td className="p-3">
                  {row.thumbnail ? (
                    <img src={row.thumbnail} alt={row.name} className="w-8 h-8 object-cover rounded" />
                  ) : (
                    <div className="w-8 h-8 bg-gray-100 flex items-center text-xs justify-center rounded text-gray-400">Null</div>
                  )}
                </td>
                <td className="p-3 font-bold">{row.name}</td>
                <td className="p-3 text-gray-700 max-w-xs text-slate-600 truncate" title={row.description?.replace(/<[^>]+>/g, '') || ''}>
                  <div
                    className="line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: row.description || 'No description' }}
                  />
                </td>
                <td className="p-3">
                  <button className="text-blue-600 hover:text-blue-800">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-1">
              Page {page} of {pageCount}
            </span>
            <button
              onClick={() => setPage(prev => Math.min(prev + 1, pageCount))}
              disabled={page === pageCount}
              className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Add Chapter Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative w-full max-w-md mx-auto bg-white rounded-lg shadow-2xl p-0">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-purple-800 rounded-t-lg">
              <h3 className="text-lg font-semibold text-white">Create New Chapter</h3>
              <button
                onClick={closeModal}
                className="text-white hover:text-gray-200 transition-colors"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Body */}
            <div className="p-6">
              <form onSubmit={handleAddChapter} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chapter Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                    placeholder="Enter chapter name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <div className="bg-white rounded border border-gray-300">
                    <ReactQuill
                      value={formData.description}
                      onChange={(val: string) => setFormData(prev => ({ ...prev, description: val }))}
                      theme="snow"
                      className="min-h-[120px]"
                      placeholder="Enter chapter description..."
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thumbnail
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  {formData.thumbnailPreview && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-2">Preview:</p>
                      <img
                        src={formData.thumbnailPreview}
                        alt="Thumbnail preview"
                        className="w-32 h-32 object-cover rounded-md border border-gray-300"
                      />
                    </div>
                  )}
                </div>
                {/* Footer */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-purple-800 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Chapter'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {chapters.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          No chapters found for this subject.
        </div>
      )}
    </div>
  );
} 