'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Upload, X } from 'lucide-react';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface Chapter {
  id: number;
  name: string;
  description: string | null;
  thumbnail: string | null;
  subject: number;
  created_on: string;
  modified_on: string;
  created_by: string;
  modified_by: string | null;
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [chapterToDelete, setChapterToDelete] = useState<Chapter | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const pageSize = 10;

  // Form state for adding new chapter
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    thumbnail: null as File | null,
    thumbnailPreview: ''
  });

  // Drag and drop refs
  const createDropRef = useRef<HTMLDivElement>(null);
  const editDropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if we're on the client side
    if (typeof window !== 'undefined') {
      const id = sessionStorage.getItem('id_subject');
      if (id) {
        setSubjectId(id);
      } else {
        setError('Subject ID not found in session storage.');
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const fetchChapters = async () => {
      if (!subjectId) return;

      try {
        // Check if we're on the client side
        if (typeof window === 'undefined') {
          return;
        }
        
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

    // Only fetch chapters on the client side
    if (typeof window !== 'undefined') {
      fetchChapters();
    }
  }, [subjectId]);

  // Sort chapters by modified date (newest first) and apply search filter
  const filteredData = useMemo(() => {
    // First sort chapters by modified date (newest first)
    const sortedChapters = [...chapters].sort((a, b) => {
      const dateA = new Date(a.modified_on);
      const dateB = new Date(b.modified_on);
      return dateB.getTime() - dateA.getTime(); // Descending order (newest first)
    });

    // Then apply search filter
    if (!search) return sortedChapters;
    return sortedChapters.filter(row =>
      row.name.toLowerCase().includes(search.toLowerCase()) ||
      (row.description && row.description.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search, chapters]);

  // Pagination
  const pageCount = Math.ceil(filteredData.length / pageSize);
  const pagedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  const handleChapterClick = (chapter: Chapter) => {
    // Check if we're on the client side
    if (typeof window !== 'undefined') {
      // Store chapter details in session storage for the next page
      sessionStorage.setItem('chapter_id', chapter.id.toString());
      sessionStorage.setItem('chapter_name', chapter.name);
      sessionStorage.setItem('chapter_description', chapter.description || '');
     
      // Navigate to chapter detail page or perform other actions
      router.push('/dashboard/track-list/track/subject-list/subject-cards/chapters/content');
    }
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent, isEdit: boolean = false) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setFormData(prev => ({
        ...prev,
        thumbnail: file,
        thumbnailPreview: URL.createObjectURL(file)
      }));
    }
  };

  const removeThumbnail = () => {
    setFormData(prev => ({ ...prev, thumbnail: null, thumbnailPreview: '' }));
  };

  const handleDropZoneClick = (ref: React.RefObject<HTMLDivElement>) => {
    const input = ref.current?.querySelector('input[type="file"]') as HTMLInputElement;
    if (input) {
      input.click();
    }
  };

  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Check if we're on the client side
      if (typeof window === 'undefined') {
        throw new Error('Client-side only operation');
      }

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
    setModalError('');
  };

  const handleEditChapter = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setFormData({
      name: chapter.name,
      description: chapter.description || '',
      thumbnail: null,
      thumbnailPreview: chapter.thumbnail || '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError('');

    if (!formData.name) {
      setModalError('Chapter name is mandatory.');
      setIsSubmitting(false);
      return;
    }

    if (!editingChapter) return;

    try {
      const token = sessionStorage.getItem('Authorization');
      if (!token) {
        throw new Error('No authorization token found');
      }

      // Create FormData for file upload if thumbnail is changed
      if (formData.thumbnail) {
        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('subject', subjectId!);
        formDataToSend.append('thumbnail', formData.thumbnail);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks_app/chapters/${editingChapter.id}/`, {
          method: 'PUT',
          headers: {
            'Authorization': token,
            // Don't set Content-Type for FormData
          },
          body: formDataToSend,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update chapter');
        }
      } else {
        // No thumbnail change, use JSON
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks_app/chapters/${editingChapter.id}/`, {
          method: 'PUT',
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            subject: subjectId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update chapter');
        }
      }

      setIsEditModalOpen(false);
      setEditingChapter(null);
      setFormData({ name: '', description: '', thumbnail: null, thumbnailPreview: '' });
      
      // Refresh chapters list
      setLoading(true);
      const refreshed = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks_app/chapters?subject_id=${subjectId}`, {
        headers: { 'Authorization': token },
      });
      if (refreshed.ok) {
        const data = await refreshed.json();
        setChapters(data);
      }
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Failed to update chapter');
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const handleDeleteClick = (chapter: Chapter) => {
    setChapterToDelete(chapter);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteChapter = async () => {
    if (!chapterToDelete) return;

    try {
      const token = sessionStorage.getItem('Authorization');
      if (!token) {
        throw new Error('No authorization token found');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks_app/chapters/${chapterToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete chapter');
      }

      // Refresh the chapters list
      setLoading(true);
      const refreshed = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks_app/chapters?subject_id=${subjectId}`, {
        headers: { 'Authorization': token },
      });
      if (refreshed.ok) {
        const data = await refreshed.json();
        setChapters(data);
      }
      
      setIsDeleteModalOpen(false);
      setChapterToDelete(null);
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Failed to delete chapter');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return <div className="text-red-500 p-6">Error: {error}</div>;
  }

  if (loading) {
    return <div className="p-6">Loading chapters...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> */}
        {/* Header */}
        <div className="max-w-sm p-4 rounded-2xl shadow-md bg-white border border-gray-200 mb-6">
        <p className="text-sm font-medium">
          <span className="font-medium text-gray-700">Track:</span>{" "}
            {sessionStorage.getItem("track_name")}
        </p>
        <p className="text-sm mt-2 font-medium">
          <span className="font-medium text-gray-700">Subject:</span>{" "}
            {sessionStorage.getItem("subject_name")}
        </p>
      </div>
      {/* </div> */}
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
          className="bg-[#1A4D2E]  px-4 py-2 text-sm font-bold text-white rounded-lg">
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
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditChapter(row);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(row);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
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
            <div className="flex items-center justify-between px-6 py-4 bg-[#1A4D2E] rounded-t-lg">
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
                  <div
                    ref={createDropRef}
                    className={`relative w-full border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      isDragOver 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, false)}
                    onClick={() => handleDropZoneClick(createDropRef)}
                  >
                    {formData.thumbnailPreview ? (
                      <div className="relative">
                        <img
                          src={formData.thumbnailPreview}
                          alt="Thumbnail preview"
                          className="w-32 h-32 object-cover rounded-lg mx-auto"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeThumbnail();
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          aria-label="Remove thumbnail"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            {isDragOver ? 'Drop image here' : 'Click to upload or drag and drop'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </div>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                </div>
                {modalError && (
                  <div className="text-red-500 text-sm mt-2 text-center">{modalError}</div>
                )}
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
                    className="px-4 py-2 bg-[#1A4D2E] text-white rounded-md hover:bg-[#1A4D2E] disabled:opacity-50 transition-colors"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Chapter'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Chapter Modal */}
      {isEditModalOpen && editingChapter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative w-full max-w-md mx-auto bg-white rounded-lg shadow-2xl p-0">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#1A4D2E] rounded-t-lg">
              <h3 className="text-lg font-semibold text-white">Edit Chapter</h3>
              <button
                onClick={() => { 
                  setIsEditModalOpen(false); 
                  setEditingChapter(null); 
                  setModalError(''); 
                  setFormData({ name: '', description: '', thumbnail: null, thumbnailPreview: '' });
                }}
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
              <form onSubmit={handleUpdateChapter} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chapter Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  <div
                    ref={editDropRef}
                    className={`relative w-full border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      isDragOver 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, true)}
                    onClick={() => handleDropZoneClick(editDropRef)}
                  >
                    {formData.thumbnailPreview ? (
                      <div className="relative">
                        <img
                          src={formData.thumbnailPreview}
                          alt="Thumbnail preview"
                          className="w-32 h-32 object-cover rounded-lg mx-auto"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeThumbnail();
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          aria-label="Remove thumbnail"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            {isDragOver ? 'Drop image here' : 'Click to upload or drag and drop'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </div>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                </div>
                {modalError && (
                  <div className="text-red-500 text-sm mt-2 text-center">{modalError}</div>
                )}
                {/* Footer */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => { 
                      setIsEditModalOpen(false); 
                      setEditingChapter(null); 
                      setModalError(''); 
                      setFormData({ name: '', description: '', thumbnail: null, thumbnailPreview: '' });
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-[#1A4D2E] text-white rounded-md  disabled:opacity-50 transition-colors"
                  >
                    {isSubmitting ? 'Updating...' : 'Update Chapter'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && chapterToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="relative w-full max-w-md mx-auto bg-white rounded-lg shadow-2xl p-0">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-red-600 rounded-t-lg">
              <h3 className="text-lg font-semibold text-white">Delete Chapter</h3>
              <button
                onClick={() => { 
                  setIsDeleteModalOpen(false); 
                  setChapterToDelete(null); 
                }}
                className="text-white hover:text-gray-200 text-2xl font-bold focus:outline-none"
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            {/* Content */}
            <div className="px-6 py-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">Are you sure?</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone.</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Chapter:</span> {chapterToDelete.name}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  This will permanently delete the chapter and all associated data.
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { 
                    setIsDeleteModalOpen(false); 
                    setChapterToDelete(null); 
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteChapter}
                  className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 focus:outline-none"
                >
                  Delete Chapter
                </button>
              </div>
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