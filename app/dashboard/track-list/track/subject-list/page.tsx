'use client';

import { redirect, useRouter } from 'next/navigation';
import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

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
  created_by: string;
  modified_on: string;
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    thumbnail: null as File | null,
    thumbnailPreview: '',
  });
  const [isDragOver, setIsDragOver] = useState(false);
  const pageSize = 10;

  useEffect(() => {
    // Check if we're on the client side
    if (typeof window !== 'undefined') {
      const id = sessionStorage.getItem('id_track');
      if (id) {
        setTrackId(id);
      } else {
        setError('Track ID not found in session storage.');
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const fetchSubjects = async () => {
      if (!trackId) return; // Don't fetch if trackId is not available

      try {
        // Check if we're on the client side
        if (typeof window === 'undefined') {
          return;
        }
        
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
        console.log(data);
        setSubjects(data);
       
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch subjects on the client side
    if (typeof window !== 'undefined') {
      fetchSubjects();
    }
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setFormData(prev => ({
          ...prev,
          thumbnail: file,
          thumbnailPreview: URL.createObjectURL(file)
        }));
      }
    }
  };

  const handleBrowseClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        const file = target.files[0];
        setFormData(prev => ({
          ...prev,
          thumbnail: file,
          thumbnailPreview: URL.createObjectURL(file)
        }));
      }
    };
    input.click();
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError('');
    try {
      // Check if we're on the client side
      if (typeof window === 'undefined') {
        throw new Error('Client-side only function');
      }
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
      toast.success('Subject created successfully');
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
    setIsDragOver(false);
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      description: subject.description,
      thumbnail: null,
      thumbnailPreview: subject.thumbnail || '',
    });
    setIsEditModalOpen(true);
    setIsDragOver(false);
  };

  const handleUpdateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError('');

    if (!formData.name) {
      setModalError('Subject name is mandatory.');
      setIsSubmitting(false);
      return;
    }

    if (!editingSubject) return;

    try {
      const token = sessionStorage.getItem('Authorization');
      if (!token) {
        throw new Error('No authorization token found');
      }

      const formDataToSend = new FormData();
      formDataToSend.append('track', trackId || '');
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      if (formData.thumbnail) {
        formDataToSend.append('thumbnail', formData.thumbnail);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks_app/subjects/${editingSubject.id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': token,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update subject');
      }
      toast.success('Subject updated successfully');
      setIsEditModalOpen(false);
      setEditingSubject(null);
      setFormData({ name: '', description: '', thumbnail: null, thumbnailPreview: '' });
      
      // Refresh subjects list
      setLoading(true);
      const refreshed = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks_app/subjects/?track_id=${trackId}`, {
        headers: { 'Authorization': token },
      });
      if (refreshed.ok) {
        const data = await refreshed.json();
        setSubjects(data);
      }
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Failed to update subject');
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const handleDeleteClick = (subject: Subject) => {
    setSubjectToDelete(subject);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteSubject = async () => {
    if (!subjectToDelete) return;

    try {
      const token = sessionStorage.getItem('Authorization');
      if (!token) {
        throw new Error('No authorization token found');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks_app/subjects/${subjectToDelete.id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': token,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete subject');
      }
      toast.success('Subject deleted successfully');
      // Refresh the subjects list
      setLoading(true);
      const refreshed = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks_app/subjects/?track_id=${trackId}`, {
        headers: { 'Authorization': token },
      });
      if (refreshed.ok) {
        const data = await refreshed.json();
        setSubjects(data);
      }
      
      setIsDeleteModalOpen(false);
      setSubjectToDelete(null);
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Failed to delete subject');
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (row: Subject) => {
    // Check if we're on the client side
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('id_subject', row.id.toString());
      sessionStorage.setItem('subject_name', row.name);
      sessionStorage.setItem('subject_description', row.description);
      router.push('/dashboard/track-list/track/subject-list/subject-cards');
    }
  };

  if (error) {
    return <div className="text-red-500 p-6">Error: {error}</div>;
  }

  if (loading) {
    return <div className="p-6">Loading subjects...</div>;
  }

  // Remove the early return for empty subjects - we want to show heading and add button always

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-xl font-bold mb-6 flex items-center justify-between">
        <span>Subjects</span>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 text-sm bg-[#1A4D2E] text-white rounded-sm font-bold hover:bg-[#1A4D2E] transition-colors"
        >
          + Add New Subject
        </button>
      </h1>
      <div className='border-grey-800 border-2 rounded-lg p-4'>
        {subjects.length > 0 && (
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <input
              type="text"
              placeholder="Type in to Search"
              className="border text-sm focus:outline-none px-3 py-2 rounded w-full sm:w-72"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        )}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full border-grey-800 border-2 text-sm">
            <thead>
              <tr>
                <th className="pl-3">#</th>
                <th className="p-3 text-left">Thumbnail</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-left">Chapters</th>
                <th className="p-3 text-left">Created By</th>
                <th className="p-3 text-left">Last Modified</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className='border-grey-800 text-xs border-2'>
              {pagedData.map((row, i) => (
                <tr
                  key={row.id}
                  className="border-t border-grey-800  border-2 hover:bg-blue-50 cursor-pointer transition"
                  onClick={() => handleRowClick(row)}
                >
                  <td className=" font-semibold text-slate-800"> <p className='pl-8'>  {(page - 1) * pageSize + i + 1}</p></td>
                  <td className="p-3">
                    {row.thumbnail ? (
                      <img src={row.thumbnail} alt={row.name} className="w-10 h-10 object-cover rounded" />
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
                  <td className="p-3">{row.created_by}</td>  {/* NEW */}
                  <td className="p-3">{new Date(row.modified_on).toLocaleString()}</td> {/* NEW */}
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditSubject(row);
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
              {pagedData.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-gray-500">
                    {subjects.length === 0 ? (
                      <div className="flex flex-col items-center space-y-2">
                        <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <p className="text-lg font-medium text-gray-600">No subjects found</p>
                        <p className="text-sm text-gray-400">Get started by adding your first subject using the button above.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center space-y-2">
                        <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <p className="text-lg font-medium text-gray-600">No subjects match your search</p>
                        <p className="text-sm text-gray-400">Try adjusting your search terms.</p>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {subjects.length > 0 && (
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
        )}
      </div>
      {/* Add New Subject Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="relative w-full max-w-2xl mx-auto bg-white rounded-lg shadow-2xl p-0 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between px-8 py-2 bg-[#1A4D2E] rounded-t-lg">
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
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    isDragOver 
                      ? 'border-blue-400 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="space-y-4">
                    <div className="flex flex-col items-center space-y-2">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer" onClick={handleBrowseClick}>
                          Click to browse
                        </span>
                        {' '}or drag and drop
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                    
                    {formData.thumbnailPreview && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">Preview:</p>
                        <div className="relative inline-block">
                          <img
                            src={formData.thumbnailPreview}
                            alt="Thumbnail preview"
                            className="w-24 h-24 object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, thumbnail: null, thumbnailPreview: '' }))}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
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
                  className="px-4 py-2 bg-[#1A4D2E] text-white rounded-md font-medium hover:bg-[#1A4D2E] focus:outline-none disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Subject Modal */}
      {isEditModalOpen && editingSubject && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="relative w-full max-w-2xl mx-auto bg-white rounded-lg shadow-2xl p-0 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between px-8 py-2 bg-[#1A4D2E] rounded-t-lg">
              <h3 className="text-lg font-semibold text-white">Edit Subject</h3>
              <button
                onClick={() => { 
                  setIsEditModalOpen(false); 
                  setEditingSubject(null); 
                  setModalError(''); 
                  setFormData({ name: '', description: '', thumbnail: null, thumbnailPreview: '' });
                  setIsDragOver(false);
                }}
                className="text-white hover:text-gray-200 text-2xl font-bold focus:outline-none"
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleUpdateSubject} className="px-8 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-600 focus:border-blue-600"
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
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    isDragOver 
                      ? 'border-blue-400 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="space-y-4">
                    <div className="flex flex-col items-center space-y-2">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer" onClick={handleBrowseClick}>
                          Click to browse
                        </span>
                        {' '}or drag and drop
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                    
                 
                  </div>
                </div>
              </div>
                 {formData.thumbnailPreview && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">Preview:</p>
                        <div className="relative inline-block">
                          <img
                            src={formData.thumbnailPreview}
                            alt="Thumbnail preview"
                            className="w-24 h-24 object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, thumbnail: null, thumbnailPreview: '' }))}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    )}
              {modalError && (
                <div className="text-red-500 text-sm mt-2 text-center">{modalError}</div>
              )}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { 
                    setIsEditModalOpen(false); 
                    setEditingSubject(null); 
                    setModalError(''); 
                    setFormData({ name: '', description: '', thumbnail: null, thumbnailPreview: '' });
                    setIsDragOver(false);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#1A4D2E] text-white rounded-md font-medium hover:bg-blue-700 focus:outline-none disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Update Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && subjectToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="relative w-full max-w-md mx-auto bg-white rounded-lg shadow-2xl p-0">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-red-600 rounded-t-lg">
              <h3 className="text-lg font-semibold text-white">Delete Subject</h3>
              <button
                onClick={() => { 
                  setIsDeleteModalOpen(false); 
                  setSubjectToDelete(null); 
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
                  <span className="font-medium">Subject:</span> {subjectToDelete.name}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  This will permanently delete the subject and all associated data.
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { 
                    setIsDeleteModalOpen(false); 
                    setSubjectToDelete(null); 
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteSubject}
                  className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 focus:outline-none"
                >
                  Delete Subject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
