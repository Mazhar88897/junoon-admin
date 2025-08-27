'use client';

import Link from 'next/link';
import { redirect, useRouter } from 'next/navigation';
import React, { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { Button } from '@/components/ui/button';
import { Badge, Edit, Trash2 } from 'lucide-react';
import { Badge as UIBadge } from "@/components/ui/badge"

import { toast } from 'sonner';

// Add custom CSS for line clamping
const customStyles = `
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface Track {
  id: number;
  name: string;
  description: string;
  thumbnail: string;
  created_on: string;
  modified_on: string;
  created_by: string;
  modified_by: string;
  has_university: boolean;
}

// Helper for avatar color
function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    color += ('00' + ((hash >> (i * 8)) & 0xff).toString(16)).slice(-2);
  }
  return color;
}


export default function ExamsPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [trackToDelete, setTrackToDelete] = useState<Track | null>(null);
  const [newTrackData, setNewTrackData] = useState({
    name: '',
    description: '',
    thumbnail: null as File | null,
    thumbnailPreview: '',
    created_by: '',
    has_university: false,
  });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const router = useRouter();

  const fetchTracks = async () => {
    try {
      // Check if we're on the client side
      if (typeof window === 'undefined') {
        return;
      }

      const token = sessionStorage.getItem('Authorization');
      if (!token) {
        throw new Error('No authorization token found');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks_app/tracks/`, {
        headers: {
          'Authorization': token,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tracks');
      }

      const data = await response.json();
      console.log('Fetched tracks:', data);
      setTracks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch tracks on the client side
    if (typeof window !== 'undefined') {
      fetchTracks();
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewTrackData({ ...newTrackData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      setNewTrackData(prev => ({
        ...prev,
        thumbnail: file,
        thumbnailPreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent, inputId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      setNewTrackData(prev => ({
        ...prev,
        thumbnail: file,
        thumbnailPreview: URL.createObjectURL(file),
      }));

      // Trigger the file input change event
      const input = document.getElementById(inputId) as HTMLInputElement;
      if (input) {
        input.files = files;
      }
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newTrackData.name) {
      setError('Track name is mandatory.');
      return;
    }

    const formData = new FormData();
    formData.append('name', newTrackData.name);
    formData.append('description', newTrackData.description);
    if (newTrackData.thumbnail) {
      formData.append('thumbnail', newTrackData.thumbnail);
    }
    formData.append('created_by', sessionStorage.getItem('user_email') || '');
    formData.append("has_university", String(newTrackData.has_university));


    try {
      // Check if we're on the client side
      if (typeof window === 'undefined') {
        return;
      }

      const token = sessionStorage.getItem('Authorization');
      if (!token) {
        throw new Error('No authorization token found');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks_app/tracks/`, {
        method: 'POST',
        headers: {
          'Authorization': token,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create track');
      }

      setIsModalOpen(false);
      toast.success('Track created successfully');
      setNewTrackData({ name: '', description: '', thumbnail: null, thumbnailPreview: '', created_by: '', has_university: false });
      fetchTracks();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleEditTrack = (track: Track) => {
    setEditingTrack(track);
    setNewTrackData({
      name: track.name,
      description: track.description,
      thumbnail: null,
      thumbnailPreview: track.thumbnail || '',
      created_by: track.created_by,
      has_university: track.has_university,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newTrackData.name) {
      setError('Track name is mandatory.');
      return;
    }

    if (!editingTrack) return;

    const formData = new FormData();
    formData.append('name', newTrackData.name);
    formData.append('description', newTrackData.description);
    if (newTrackData.thumbnail) {
      formData.append('thumbnail', newTrackData.thumbnail);
    }
    formData.append("has_university", String(newTrackData.has_university));
    formData.append('modified_by', sessionStorage.getItem('user_email') || '');

    try {
      const token = sessionStorage.getItem('Authorization');
      if (!token) {
        throw new Error('No authorization token found');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks_app/tracks/${editingTrack.id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': token,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update track');
      }
      toast.success('Track updated successfully');
      setIsEditModalOpen(false);
      // toast.success('Track updated successfully');
      setEditingTrack(null);
      setNewTrackData({ name: '', description: '', thumbnail: null, thumbnailPreview: '', created_by: '', has_university: false });
      fetchTracks();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleDeleteClick = (track: Track) => {
    setTrackToDelete(track);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteTrack = async () => {
    if (!trackToDelete) return;

    try {
      const token = sessionStorage.getItem('Authorization');
      if (!token) {
        throw new Error('No authorization token found');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks_app/tracks/${trackToDelete.id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': token,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete track');
      }

      // Refresh the tracks list
      toast.success('Track deleted successfully');
      fetchTracks();
      setIsDeleteModalOpen(false);
      setTrackToDelete(null);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete track');
    }
  };

  const handleRowClick = (row: Track) => {
    // Check if we're on the client side
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('id_track', row.id.toString());
      sessionStorage.setItem('selected_track', JSON.stringify(row));
      sessionStorage.setItem('has_university', row.has_university.toString());
      router.push('/dashboard/track-list/track');
    }
  };

  // Remove all mock fields and only use actual data fields
  // Table columns: Thumbnail, Name, Description, Created By, Created On
  const tableData = useMemo(() => {
    // Sort tracks by modified_on in descending order (latest first)
    return [...tracks].sort((a, b) => {
      const dateA = new Date(a.modified_on).getTime();
      const dateB = new Date(b.modified_on).getTime();
      return dateB - dateA; // Descending order (latest first)
    });
  }, [tracks]);

  // Search filter (search by name, description, created_by)
  const filteredData = useMemo(() => {
    if (!search) return tableData;
    return tableData.filter(row =>
      row.name.toLowerCase().includes(search.toLowerCase()) ||
      row.description.toLowerCase().includes(search.toLowerCase()) ||
      (row.created_by && row.created_by.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search, tableData]);

  // Pagination
  const pageCount = Math.ceil(filteredData.length / pageSize);
  const pagedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  if (error && !isModalOpen) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">Tracks</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#1A4D2E] hover:bg-[#1A4D2E] text-white font-bold TEXT-SM py-1 px-4 rounded"
          >
            + Create New Track
          </button>
        </div>
        <div className='border-grey-800 border-2 rounded-lg p-4'>
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <input
              type="text"
              placeholder="Type in to Search"
              className="border text-sm  focus:outline-none  px-3 py-2 rounded w-full sm:w-72"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />

          </div>
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full border-grey-800 border-2 text-sm">
              <thead className="">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3 text-left">Thumbnail</th>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Description</th>
                  <th className="p-3 text-left">Has Universities</th>
                  <th className="p-3 text-left">Created By</th>
                  <th className="p-3 text-left">Last Modified</th>
                  <th className="p-3 text-left">Modified By</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody className='border-grey-800 text-xs border-2'>
                {pagedData.map((row, i) => (
                  <tr
                    key={row.id}
                    className="border-t border-grey-800 border-2 hover:bg-blue-50 cursor-pointer transition"
                    onClick={() => handleRowClick(row)}
                  >
                    <td className="p-3 font-semibold text-slate-800">{(page - 1) * pageSize + i + 1}</td>
                    <td className="p-3">
                      {row.thumbnail ? (
                        <img src={row.thumbnail} alt={row.name} className="w-10 h-10 object-cover rounded" />
                      ) : (
                        <div className="w-8 h-8 bg-gray-100 flex items-center fext-xs justify-center rounded text-gray-400">Null</div>
                      )}
                    </td>
                    <td className="p-3 font-bold ">
                      <div>{row.name}
                      </div>

                    </td>
                    <td className="p-3 text-gray-700 max-w-xs text-slate-600 truncate" title={row.description}>
                      <div
                        className="line-clamp-2"
                        dangerouslySetInnerHTML={{
                          __html: row.description
                        }}
                      />
                    </td>
                    <td className="p-3">
                      {row.has_university ? (
                        <UIBadge variant="success">Yes</UIBadge>
                      ) : (
                        <UIBadge variant="destructive">No</UIBadge>
                      )}
                    </td>

                    <td className="p-3">{row.created_by}</td>
                    <td className="p-3">{row.modified_on ? new Date(row.modified_on).toLocaleDateString() : new Date(row.created_on).toLocaleDateString()}</td>
                    <td className="p-3">{row.modified_by}</td>
                    <td className="p-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTrack(row);
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
                    </td>
                  </tr>
                ))}
                {pagedData.length === 0 && (
                  <tr><td colSpan={8} className="text-center p-6 text-gray-400">No data found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex">
              <button
                className={`px-2  text-xs border ${page === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white hover:bg-gray-50'}`}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >Prev</button>
              {[...Array(pageCount)].map((_, idx) => (
                <button
                  key={idx}
                  className={`px-2 py-1  text-xs  border ${page === idx + 1 ? 'bg-[#6d7efc] text-white' : 'bg-white hover:bg-gray-50'}`}
                  onClick={() => setPage(idx + 1)}
                >{idx + 1}</button>
              ))}
              <button
                className={`px-2 text-xs  border ${page === pageCount || pageCount === 0 ? 'bg-gray-100 text-gray-400' : 'bg-white hover:bg-purple1050'}`}
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
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
            <div className="relative w-full max-w-4xl mx-auto bg-white rounded-lg shadow-2xl p-0">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 bg-[#1A4D2E] rounded-t-lg">
                <h3 className="text-lg font-semibold text-white">Create New Track</h3>
                <button
                  onClick={() => { setIsModalOpen(false); setError(''); }}
                  className="text-white hover:text-gray-200 text-2xl font-bold focus:outline-none"
                  aria-label="Close"
                >
                  &times;
                </button>
              </div>
              {/* Form */}
              <form onSubmit={handleCreateSubmit} className="px-6 py-6 space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name<span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#6d7efc] focus:border-[#6d7efc]"
                    value={newTrackData.name}
                    onChange={handleInputChange}
                  />
                  <label
                    htmlFor="has_university"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    This Track has Universities
                  </label>
                  <input
                    type="checkbox"
                    name="has_university"
                    id="has_university"
                    className="h-4 w-4 text-[#6d7efc] border-gray-300 rounded focus:ring-[#6d7efc]"
                    checked={newTrackData.has_university}
                    onChange={(e) =>
                      setNewTrackData(prev => ({
                        ...prev,
                        has_university: e.target.checked,
                      }))
                    }
                  />

                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description<span className="text-red-500">*</span></label>
                  <div className="bg-white rounded border border-gray-300">
                    <ReactQuill
                      value={newTrackData.description}
                      onChange={(val: string) => setNewTrackData(prev => ({ ...prev, description: val }))}
                      theme="snow"
                      className="min-h-[120px]"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700 mb-1">Thumbnail</label>
                  <div className="relative">
                    <input
                      type="file"
                      name="thumbnail"
                      id="thumbnail"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <label
                      htmlFor="thumbnail"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-[#1A4D2E] transition-colors duration-200"
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, 'thumbnail')}
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    </label>
                  </div>
                  {newTrackData.thumbnailPreview && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">Preview:</p>
                      <div className="relative inline-block">
                        <img
                          src={newTrackData.thumbnailPreview}
                          alt="Thumbnail preview"
                          className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setNewTrackData(prev => ({
                              ...prev,
                              thumbnail: null,
                              thumbnailPreview: ''
                            }));
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                          title="Remove image"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                {/* <div>
                <label htmlFor="created_by" className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
                <input
                  type="text"
                  name="created_by"
                  id="created_by"
                  className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#6d7efc] focus:border-[#6d7efc]"
                  value={newTrackData.created_by}
                  onChange={handleInputChange}
                />
              </div> */}
                {error && isModalOpen && (
                  <div className="text-red-500 text-sm mt-2 text-center">{error}</div>
                )}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setIsModalOpen(false); setError(''); }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 focus:outline-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#1A4D2E] text-white rounded-md font-medium hover:bg-[#1A4D2E] focus:outline-none"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Track Modal */}
        {isEditModalOpen && editingTrack && (
          <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
            <div className="relative w-full max-w-4xl mx-auto bg-white rounded-lg shadow-2xl p-0">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 bg-[#1A4D2E] rounded-t-lg">
                <h3 className="text-lg font-semibold text-white">Edit Track</h3>
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingTrack(null);
                    setError('');
                    setNewTrackData({ name: '', description: '', thumbnail: null, thumbnailPreview: '', created_by: '', has_university: false });
                  }}
                  className="text-white hover:text-gray-200 text-2xl font-bold focus:outline-none"
                  aria-label="Close"
                >
                  &times;
                </button>
              </div>
              {/* Form */}
              <form onSubmit={handleUpdateTrack} className="px-6 py-6 space-y-5">
                <div>
                  <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">Name<span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="name"
                    id="edit-name"
                    required
                    className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-600 focus:border-blue-600"
                    value={newTrackData.name}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label htmlFor="edit-has-university" className="block text-sm font-medium text-gray-700 mb-1">This Track has Universities</label>
                  <input
                    type="checkbox"
                    name="has_university"
                    id="edit-has-university"
                    className="h-4 w-4 text-[#6d7efc] border-gray-300 rounded focus:ring-[#6d7efc]"
                    checked={newTrackData.has_university}
                    onChange={(e) =>
                      setNewTrackData(prev => ({
                        ...prev,
                        has_university: e.target.checked,
                      }))
                    }
                  />

                </div>

                <div>
                  <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <div className="bg-white rounded border border-gray-300">
                    <ReactQuill
                      value={newTrackData.description}
                      onChange={(val: string) => setNewTrackData(prev => ({ ...prev, description: val }))}
                      theme="snow"
                      className="min-h-[120px]"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="edit-thumbnail" className="block text-sm font-medium text-gray-700 mb-1">Thumbnail</label>
                  <div className="relative">
                    <input
                      type="file"
                      name="thumbnail"
                      id="edit-thumbnail"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <label
                      htmlFor="edit-thumbnail"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-[#1A4D2E] transition-colors duration-200"
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, 'edit-thumbnail')}
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    </label>
                  </div>
                  {newTrackData.thumbnailPreview && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">Preview:</p>
                      <div className="relative inline-block">
                        <img
                          src={newTrackData.thumbnailPreview}
                          alt="Thumbnail preview"
                          className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setNewTrackData(prev => ({
                              ...prev,
                              thumbnail: null,
                              thumbnailPreview: ''
                            }));
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                          title="Remove image"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                {/* <div>
                <label htmlFor="edit-created_by" className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
                <input
                  type="text"
                  name="created_by"
                  id="edit-created_by"
                  className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-600 focus:border-blue-600"
                  value={newTrackData.created_by}
                  onChange={handleInputChange}
                />
              </div> */}
                {error && isEditModalOpen && (
                  <div className="text-red-500 text-sm mt-2 text-center">{error}</div>
                )}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setEditingTrack(null);
                      setError('');
                      setNewTrackData({ name: '', description: '', thumbnail: null, thumbnailPreview: '', created_by: '', has_university: false });
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 focus:outline-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#1A4D2E] text-white rounded-md font-medium hover:bg-blue-700 focus:outline-none"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && trackToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
            <div className="relative w-full max-w-md mx-auto bg-white rounded-lg shadow-2xl p-0">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 bg-red-600 rounded-t-lg">
                <h3 className="text-lg font-semibold text-white">Delete Track</h3>
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setTrackToDelete(null);
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
                    <span className="font-medium">Track:</span> {trackToDelete.name}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    This will permanently delete the track and all associated data.
                  </p>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDeleteModalOpen(false);
                      setTrackToDelete(null);
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 focus:outline-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteTrack}
                    className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 focus:outline-none"
                  >
                    Delete Track
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
