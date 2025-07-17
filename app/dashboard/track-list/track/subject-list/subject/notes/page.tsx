'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface Note {
  id: number;
  is_deleted: boolean;
  deleted_by: string | null;
  deleted_on: string | null;
  created_by: string;
  created_on: string;
  modified_by: string | null;
  modified_on: string | null;
  name: string;
  description: string;
  thumbnail: string | null;
  source: string;
  chapter: number;
  topic: number | null;
}

interface Chapter {
  id: number;
  name: string;
}



export default function NotesPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pageSize = 10;

  // Form state
  const [formData, setFormData] = useState({
    chapter: '',
    name: '',
    description: '',
    source: null as File | null,
    sourcePreview: '',
    thumbnail: null as File | null,
    thumbnailPreview: '',
    created_by: 'Ateeq Ur Rehman',
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
    const fetchNotes = async () => {
      if (!subjectId) return;

      try {
        const token = sessionStorage.getItem('Authorization');
        if (!token) {
          throw new Error('No authorization token found');
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contents_app/notes?subject_id=${subjectId}`, {
          headers: {
            'Authorization': token,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch notes');
        }

        const data = await response.json();
        setNotes(data);
       
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [subjectId]);

  // Fetch chapters for the form
  useEffect(() => {
    const fetchChapters = async () => {
      if (!subjectId) return;

      try {
        const token = sessionStorage.getItem('Authorization');
        if (!token) return;

        // Fetch chapters
        const chaptersResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks_app/chapters/?subject_id=${subjectId}`, {
          headers: {
            'Authorization': token,
          },
        });

        if (chaptersResponse.ok) {
          const chaptersData = await chaptersResponse.json();
          setChapters(chaptersData);
        }

      } catch (err) {
        console.error('Error fetching chapters:', err);
      }
    };

    fetchChapters();
  }, [subjectId]);

  // Search filter (search by name, description)
  const filteredData = useMemo(() => {
    if (!search) return notes;
    return notes.filter(row =>
      row.name.toLowerCase().includes(search.toLowerCase()) ||
      row.description.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, notes]);

  // Pagination
  const pageCount = Math.ceil(filteredData.length / pageSize);
  const pagedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  const handleNoteClick = (note: Note) => {
    // Store note details in session storage for the next page
    sessionStorage.setItem('note_id', note.id.toString());
    sessionStorage.setItem('note_name', note.name);
    sessionStorage.setItem('note_description', note.description);
    sessionStorage.setItem('note_source', note.source);
    sessionStorage.setItem('note_thumbnail', note.thumbnail || '');
    
    // Navigate to note detail page or open PDF
    if (note.source) {
      window.open(note.source, '_blank');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    const file = files?.[0] || null;
    if (file) {
      setFormData(prev => ({
        ...prev,
        [name]: file,
        [`${name}Preview`]: name === 'thumbnail' ? URL.createObjectURL(file) : '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = sessionStorage.getItem('Authorization');
      if (!token) {
        throw new Error('No authorization token found');
      }

      const formDataToSend = new FormData();
      formDataToSend.append('chapter', formData.chapter);
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      if (formData.source) formDataToSend.append('source', formData.source);
      if (formData.thumbnail) formDataToSend.append('thumbnail', formData.thumbnail);
      formDataToSend.append('created_by', formData.created_by);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contents_app/notes/`, {
        method: 'POST',
        headers: {
          'Authorization': token,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error('Failed to create note');
      }

      // Reset form and close modal
      setFormData({
        chapter: '',
        name: '',
        description: '',
        source: null,
        sourcePreview: '',
        thumbnail: null,
        thumbnailPreview: '',
        created_by: 'Ateeq Ur Rehman',
      });
      setShowModal(false);

      // Refresh notes list
      const notesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contents_app/notes?subject_id=${subjectId}`, {
        headers: {
          'Authorization': token,
        },
      });

      if (notesResponse.ok) {
        const data = await notesResponse.json();
        setNotes(data);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({
      chapter: '',
      name: '',
      description: '',
      source: null,
      sourcePreview: '',
      thumbnail: null,
      thumbnailPreview: '',
      created_by: 'Ateeq Ur Rehman',
    });
  };

  if (error) {
    return <div className="text-red-500 p-6">Error: {error}</div>;
  }

  if (loading) {
    return <div className="p-6">Loading notes...</div>;
  }

  if (notes.length === 0) {
    return <div className="p-6">No notes found for this subject.</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Notes</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-purple-800  px-4 py-2 text-sm font-bold text-white rounded-lg">
           
          + Add New Note
        </button>
      </div>
      
      <div className='border-grey-800 border-2 rounded-lg p-4'>
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <input
            type="text"
            placeholder="Search notes..."
            className="border text-sm focus:outline-none px-3 py-2 rounded w-full sm:w-72"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
          <div className="text-sm text-gray-500">
            {filteredData.length} note{filteredData.length !== 1 ? 's' : ''} found
          </div>
        </div>
        
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full border-grey-800 border-2 text-sm">
            <thead>
              <tr>
                <th className="p-3">#</th>
                <th className="p-3 text-left">Thumbnail</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-left">Chapter</th>
                <th className="p-3 text-left">Created</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedData.map((row, index) => (
                <tr key={row.id} onClick={() => handleNoteClick(row)} className="hover:bg-gray-100 cursor-pointer">
                  <td className="p-3">{page * pageSize - pageSize + index + 1}</td>
                  <td className="p-3">
                    {row.thumbnail ? (
                      <img src={row.thumbnail} alt="Thumbnail" className="w-10 h-10 object-cover rounded-full" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-500 text-sm">
                        N
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-left text-gray-800 font-medium">{row.name}</td>
                  <td
                    className="p-3 text-gray-700 max-w-xs text-slate-600 truncate"
                    title={row.description.replace(/<[^>]+>/g, '')}
                  >
                    <div
                      className="line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: row.description }}
                    />
                  </td>
                  <td className="p-3 text-left text-gray-600">{chapters.find(c => c.id === row.chapter)?.name}</td>
                  <td className="p-3 text-left text-gray-600">{formatDate(row.created_on)}</td>
                  <td className="p-3 text-left">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent row click
                        handleNoteClick(row);
                      }}
                      className="text-blue-500 hover:text-blue-700 text-sm mr-2"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {pageCount > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="flex">
              <button
                className={`px-2 text-xs border ${page === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white hover:bg-gray-50'}`}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Prev
              </button>
              {[...Array(pageCount)].map((_, idx) => (
                <button
                  key={idx}
                  className={`px-2 py-1 text-xs border ${page === idx + 1 ? 'bg-[#6d7efc] text-white' : 'bg-white hover:bg-gray-50'}`}
                  onClick={() => setPage(idx + 1)}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                className={`px-2 text-xs border ${page === pageCount || pageCount === 0 ? 'bg-gray-100 text-gray-400' : 'bg-white hover:bg-purple1050'}`}
                onClick={() => setPage(p => Math.min(pageCount, p + 1))}
                disabled={page === pageCount || pageCount === 0}
              >
                Next
              </button>
            </div>
            <div className="text-xs text-gray-500">
              {pagedData.length > 0 && (
                <span>
                  {(page - 1) * pageSize + 1}-{(page - 1) * pageSize + pagedData.length} of {filteredData.length}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add New Note Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="relative w-full max-w-2xl mx-auto bg-white rounded-lg shadow-2xl p-0  overflow-y-auto">
            <div className="flex items-center justify-between px-8 py-2 bg-purple-800 rounded-t-lg">
              <h3 className="text-lg font-semibold text-white">Add New Note</h3>
              <button
                onClick={closeModal}
                className="text-white hover:text-gray-200 text-2xl font-bold focus:outline-none"
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-8 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Chapter<span className="text-red-500">*</span></label>
                <select
                  name="chapter"
                  value={formData.chapter}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Chapter</option>
                  {chapters.map(chapter => (
                    <option key={chapter.id} value={chapter.id}>
                      {chapter.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Name<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#6d7efc] focus:border-[#6d7efc]"
                  placeholder="Enter note name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description<span className="text-red-500">*</span></label>
                <div className="bg-white rounded border border-gray-300">
                  <ReactQuill
                    value={formData.description}
                    onChange={(val: string) => setFormData(prev => ({ ...prev, description: val }))}
                    theme="snow"
                    className="min-h-[120px]"
                  />
                </div>
              </div>
              <div className='flex gap-2'>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Source (PDF)</label>
                  <input
                    type="file"
                    name="source"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {formData.source && (
                    <div className="mt-2 text-xs text-gray-600">{formData.source.name}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Thumbnail</label>
                  <input
                    type="file"
                    name="thumbnail"
                    accept="image/*"
                    onChange={handleFileChange}
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
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Created By</label>
                <input
                  type="text"
                  name="created_by"
                  value={formData.created_by}
                  onChange={handleInputChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm px-2 py-1 focus:ring-[#6d7efc] focus:border-[#6d7efc]"
                />
              </div>
              {error && showModal && (
                <div className="text-red-500 text-sm mt-2 text-center">{error}</div>
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
                  {isSubmitting ? 'Creating...' : 'Create Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
