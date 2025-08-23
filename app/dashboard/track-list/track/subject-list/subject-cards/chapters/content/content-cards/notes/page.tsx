'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

import { ExternalLink, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [editDragActive, setEditDragActive] = useState(false);
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

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    chapter: '',
    name: '',
    description: '',
    source: null as File | null,
    sourcePreview: '',
    thumbnail: null as File | null,
    thumbnailPreview: '',
    modified_by: sessionStorage.getItem('user_email') || '',
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

  // Search filter and sorting (search by name, description, sort by modified_on in ascending order)
  const filteredData = useMemo(() => {
    let filtered = notes;
    
    // Apply search filter
    if (search) {
      filtered = notes.filter(row =>
        row.name.toLowerCase().includes(search.toLowerCase()) ||
        row.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Sort by modified_on in descending order (newest to oldest)
    filtered = [...filtered].sort((a, b) => {
      const dateA = a.modified_on ? new Date(a.modified_on) : new Date(a.created_on);
      const dateB = b.modified_on ? new Date(b.modified_on) : new Date(b.created_on);
      return dateB.getTime() - dateA.getTime();
    });
    
    return filtered;
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

  const handleEditClick = (note: Note) => {
    setSelectedNote(note);
    setEditFormData({
      chapter: note.chapter.toString(),
      name: note.name,
      description: note.description,
      source: null,
      sourcePreview: note.source || '',
      thumbnail: null,
      thumbnailPreview: note.thumbnail || '',
      modified_by: 'Ateeq Ur Rehman',
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (note: Note) => {
    setSelectedNote(note);
    setShowDeleteModal(true);
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

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
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

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    const file = files?.[0] || null;
    if (file) {
      setEditFormData(prev => ({
        ...prev,
        [name]: file,
        [`${name}Preview`]: name === 'thumbnail' ? URL.createObjectURL(file) : '',
      }));
    }
  };

  const handleDrag = (e: React.DragEvent, setDragActive: (active: boolean) => void) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent, name: string, setFormData: React.Dispatch<React.SetStateAction<typeof formData>>, setDragActive: (active: boolean) => void) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const isValidFile = name === 'source' ? file.type === 'application/pdf' : file.type.startsWith('image/');
      
      if (isValidFile) {
        setFormData(prev => ({
          ...prev,
          [name]: file,
          [`${name}Preview`]: name === 'thumbnail' ? URL.createObjectURL(file) : '',
        }));
      }
    }
  };

  const handleEditDrop = (e: React.DragEvent, name: string, setFormData: React.Dispatch<React.SetStateAction<typeof editFormData>>, setDragActive: (active: boolean) => void) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const isValidFile = name === 'source' ? file.type === 'application/pdf' : file.type.startsWith('image/');
      
      if (isValidFile) {
        setFormData(prev => ({
          ...prev,
          [name]: file,
          [`${name}Preview`]: name === 'thumbnail' ? URL.createObjectURL(file) : '',
        }));
      }
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
      formDataToSend.append('chapter', sessionStorage.getItem('chapter_id') || '');
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      if (formData.source) formDataToSend.append('source', formData.source);
      if (formData.thumbnail) formDataToSend.append('thumbnail', formData.thumbnail);
      formDataToSend.append('created_by', sessionStorage.getItem('user_email') || '');

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
      toast.success('Note created successfully');
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
      await refreshNotes();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = sessionStorage.getItem('Authorization');
      if (!token || !selectedNote) {
        throw new Error('No authorization token found or note not selected');
      }

      const formDataToSend = new FormData();
      formDataToSend.append('chapter', sessionStorage.getItem('chapter_id') || '');
      formDataToSend.append('name', editFormData.name);
      formDataToSend.append('description', editFormData.description);
      
      // Handle source file - if new file selected, use it; otherwise preserve existing source
      if (editFormData.source) {
        formDataToSend.append('source', editFormData.source);
      } else if (editFormData.sourcePreview) {
        // If no new file selected but we have existing source, send the existing source URL
        formDataToSend.append('source', editFormData.sourcePreview);
      }
      
      if (editFormData.thumbnail) formDataToSend.append('thumbnail', editFormData.thumbnail);
      formDataToSend.append('created_by', sessionStorage.getItem('user_email') || '');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contents_app/notes/${selectedNote.id}`, {
        method: 'PUT',

        headers: {
          'Authorization': token,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.source) {
          toast.error(`Failed to update note: ${errorData.source[0]}`);
        } else {
          toast.error('Failed to update note');
        }
        return;
      }
      toast.success('Note updated successfully');

      // Close modal and refresh notes
      setShowEditModal(false);
      setSelectedNote(null);
      await refreshNotes();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedNote) return;
    
    setIsDeleting(true);
    try {
      const token = sessionStorage.getItem('Authorization');
      if (!token) {
        throw new Error('No authorization token found');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contents_app/notes/${selectedNote.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete note');
      }
      toast.success('Note deleted successfully');
      // Close modal and refresh notes
      setShowDeleteModal(false);
      setSelectedNote(null);
      await refreshNotes();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  const refreshNotes = async () => {
    if (!subjectId) return;

    try {
      const token = sessionStorage.getItem('Authorization');
      if (!token) return;

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
      console.error('Error refreshing notes:', err);
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

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedNote(null);
    setEditFormData({
      chapter: '',
      name: '',
      description: '',
      source: null,
      sourcePreview: '',
      thumbnail: null,
      thumbnailPreview: '',
      modified_by: 'Ateeq Ur Rehman',
    });
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedNote(null);
  };

  if (error) {
    return <div className="text-red-500 p-6">Error: {error}</div>;
  }

  if (loading) {
    return <div className="p-6">Loading notes...</div>;
  }

  // Remove the early return for empty notes - we want to show heading and add button always

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Notes</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#1A4D2E]  px-4 py-2 text-sm font-bold text-white rounded-sm">
           
          + Add New Note
        </button>
      </div>
      
      <div className='border-grey-800 border-2 rounded-lg p-4'>
        {notes.length > 0 && (
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
        )}
        
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
                <tr key={row.id} className="hover:bg-gray-100">
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
                  <td className="p-3 text-left text-gray-600">{row.chapter}</td>
                  <td className="p-3 text-left text-gray-600">{formatDate(row.created_on)}</td>
                  <td className="p-3 text-left">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleNoteClick(row)}
                        className="text-blue-500 hover:text-blue-700 text-sm"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditClick(row)}
                        className="text-green-500 hover:text-green-700 text-sm"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(row)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {pagedData.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-gray-500">
                    {notes.length === 0 ? (
                      <div className="flex flex-col items-center space-y-2">
                        <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <p className="text-lg font-medium text-gray-600">No notes found</p>
                        <p className="text-sm text-gray-400">Get started by adding your first note using the button above.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center space-y-2">
                        <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <p className="text-lg font-medium text-gray-600">No notes match your search</p>
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
        {notes.length > 0 && pageCount > 1 && (
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
            <div className="flex items-center justify-between px-8 py-2 bg-[#1A4D2E] rounded-t-lg">
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
              {/* <div>
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
              </div> */}
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
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Source (PDF)</label>
                  <div
                    className={`mt-1 border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                      dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={(e) => handleDrag(e, setDragActive)}
                    onDragLeave={(e) => handleDrag(e, setDragActive)}
                    onDragOver={(e) => handleDrag(e, setDragActive)}
                    onDrop={(e) => handleDrop(e, 'source', setFormData, setDragActive)}
                  >
                    <input
                      type="file"
                      name="source"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      id="source-input"
                    />
                    <label htmlFor="source-input" className="cursor-pointer">
                      <div className="text-gray-600">
                        {formData.source ? (
                          <div className="text-sm">
                            <p className="font-medium">{formData.source.name}</p>
                            <p className="text-xs text-gray-500">Click or drag to replace</p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm">Drag and drop PDF here, or click to browse</p>
                            <p className="text-xs text-gray-500">PDF files only</p>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Thumbnail</label>
                  <div
                    className={`mt-1 border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                      dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={(e) => handleDrag(e, setDragActive)}
                    onDragLeave={(e) => handleDrag(e, setDragActive)}
                    onDragOver={(e) => handleDrag(e, setDragActive)}
                    onDrop={(e) => handleDrop(e, 'thumbnail', setFormData, setDragActive)}
                  >
                    <input
                      type="file"
                      name="thumbnail"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="thumbnail-input"
                    />
                    <label htmlFor="thumbnail-input" className="cursor-pointer">
                      <div className="text-gray-600">
                        {formData.thumbnail ? (
                          <div className="text-sm">
                            <p className="font-medium">{formData.thumbnail.name}</p>
                            <p className="text-xs text-gray-500">Click or drag to replace</p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm">Drag and drop image here, or click to browse</p>
                            <p className="text-xs text-gray-500">Image files only</p>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
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
              {/* <div>
                <label className="block text-sm font-medium text-gray-700">Created By</label>
                <input
                  type="text"
                  name="created_by"
                  value={formData.created_by}
                  onChange={handleInputChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm px-2 py-1 focus:ring-[#6d7efc] focus:border-[#6d7efc]"
                />
              </div> */}
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
                  className="px-4 py-2 bg-[#1A4D2E] text-white rounded-md font-medium S focus:outline-none disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Note Modal */}
      {showEditModal && selectedNote && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="relative w-full max-w-2xl mx-auto bg-white rounded-lg shadow-2xl p-0  overflow-y-auto">
            <div className="flex items-center justify-between px-8 py-2 bg-[#1A4D2E] rounded-t-lg">
              <h3 className="text-lg font-semibold text-white">Edit Note</h3>
              <button
                onClick={closeEditModal}
                className="text-white hover:text-gray-200 text-2xl font-bold focus:outline-none"
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="px-8 py-4 space-y-4">
              {/* <div>
                <label className="block text-sm font-medium text-gray-700">Chapter<span className="text-red-500">*</span></label>
                <select
                  name="chapter"
                  value={editFormData.chapter}
                  onChange={handleEditInputChange}
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
              </div> */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Name<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#6d7efc] focus:border-[#6d7efc]"
                  placeholder="Enter note name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description<span className="text-red-500">*</span></label>
                <div className="bg-white rounded border border-gray-300">
                  <ReactQuill
                    value={editFormData.description}
                    onChange={(val: string) => setEditFormData(prev => ({ ...prev, description: val }))}
                    theme="snow"
                    className="min-h-[120px]"
                  />
                </div>
              </div>
              <div className='flex gap-2'>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Source (PDF)</label>
                  <div
                    className={`mt-1 border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                      editDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={(e) => handleDrag(e, setEditDragActive)}
                    onDragLeave={(e) => handleDrag(e, setEditDragActive)}
                    onDragOver={(e) => handleDrag(e, setEditDragActive)}
                    onDrop={(e) => handleEditDrop(e, 'source', setEditFormData, setEditDragActive)}
                  >
                    <input
                      type="file"
                      name="source"
                      accept="application/pdf"
                      onChange={handleEditFileChange}
                      className="hidden"
                      id="edit-source-input"
                    />
                    <label htmlFor="edit-source-input" className="cursor-pointer">
                      <div className="text-gray-600">
                        {editFormData.source ? (
                          <div className="text-sm">
                            <p className="font-medium">{editFormData.source.name}</p>
                            <p className="text-xs text-gray-500">Click or drag to replace</p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm">Drag and drop PDF here, or click to browse</p>
                            <p className="text-xs text-gray-500">PDF files only</p>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                  {editFormData.sourcePreview && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-gray-600">Current:</span>
                      <button
                        type="button"
                        onClick={() => window.open(editFormData.sourcePreview, '_blank')}
                        className="text-blue-500 hover:text-blue-700 flex items-center gap-1 text-xs"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View PDF
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Thumbnail</label>
                  <div
                    className={`mt-1 border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                      editDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={(e) => handleDrag(e, setEditDragActive)}
                    onDragLeave={(e) => handleDrag(e, setEditDragActive)}
                    onDragOver={(e) => handleDrag(e, setEditDragActive)}
                    onDrop={(e) => handleEditDrop(e, 'thumbnail', setEditFormData, setEditDragActive)}
                  >
                    <input
                      type="file"
                      name="thumbnail"
                      accept="image/*"
                      onChange={handleEditFileChange}
                      className="hidden"
                      id="edit-thumbnail-input"
                    />
                    <label htmlFor="edit-thumbnail-input" className="cursor-pointer">
                      <div className="text-gray-600">
                        {editFormData.thumbnail ? (
                          <div className="text-sm">
                            <p className="font-medium">{editFormData.thumbnail.name}</p>
                            <p className="text-xs text-gray-500">Click or drag to replace</p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm">Drag and drop image here, or click to browse</p>
                            <p className="text-xs text-gray-500">Image files only</p>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                  {editFormData.thumbnailPreview && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-2">Current:</p>
                      <img
                        src={editFormData.thumbnailPreview}
                        alt="Thumbnail preview"
                        className="w-24 h-24 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>
              </div>
              {/* <div>
                <label className="block text-sm font-medium text-gray-700">Modified By</label>
                <input
                  type="text"
                  name="modified_by"
                  value={editFormData.modified_by}
                  onChange={handleEditInputChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm px-2 py-1 focus:ring-[#6d7efc] focus:border-[#6d7efc]"
                />
              </div> */}
              {error && showEditModal && (
                <div className="text-red-500 text-sm mt-2 text-center">{error}</div>
              )}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#1A4D2E] text-white rounded-md font-medium S focus:outline-none disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Update Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedNote && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="relative w-full max-w-md mx-auto bg-white rounded-lg shadow-2xl p-0">
            <div className="flex items-center justify-between px-6 py-3 bg-red-600 rounded-t-lg">
              <h3 className="text-lg font-semibold text-white">Delete Note</h3>
              <button
                onClick={closeDeleteModal}
                className="text-white hover:text-gray-200 text-2xl font-bold focus:outline-none"
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete the note <strong>{selectedNote.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 focus:outline-none disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
