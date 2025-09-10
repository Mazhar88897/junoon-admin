'use client';

import Link from 'next/link';
import { redirect, useRouter } from 'next/navigation';
import React, { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { universityService, University, CreateUniversityData, UpdateUniversityData } from '@/services/universityService';

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

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState<University | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [universityToDelete, setUniversityToDelete] = useState<University | null>(null);
  const [newUniversityData, setNewUniversityData] = useState<CreateUniversityData & { thumbnailPreview: string }>({
    track: 0,
    name: '',
    description: '',
    thumbnail: undefined,
    thumbnailPreview: '',
  });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const router = useRouter();

  // Get track ID from session storage
  const trackId = typeof window !== 'undefined' ? sessionStorage.getItem('id_track') : null;

  const fetchUniversities = async () => {
    try {
      // Check if we're on the client side
      if (typeof window === 'undefined') {
        return;
      }
      
      if (!trackId) {
        throw new Error('No track ID found');
      }

      const data = await universityService.getUniversities(parseInt(trackId));
      setUniversities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error(err instanceof Error ? err.message : 'Failed to fetch universities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch universities on the client side
    if (typeof window !== 'undefined') {
      fetchUniversities();
    }
  }, [trackId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewUniversityData({ ...newUniversityData, [name]: value });
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
      setNewUniversityData(prev => ({
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
      
      setNewUniversityData(prev => ({
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

    if (!newUniversityData.name) {
      setError('University name is mandatory.');
      return;
    }

    if (!trackId) {
      setError('No track ID found.');
      return;
    }

    try {
      const createData: CreateUniversityData = {
        track: parseInt(trackId),
        name: newUniversityData.name,
        description: newUniversityData.description,
        thumbnail: newUniversityData.thumbnail,
      };

      await universityService.createUniversity(createData);
      
      setIsModalOpen(false);
      toast.success('University created successfully');
      setNewUniversityData({ 
        track: 0, 
        name: '', 
        description: '', 
        thumbnail: undefined, 
        thumbnailPreview: '' 
      });
      fetchUniversities();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error(err instanceof Error ? err.message : 'Failed to create university');
    }
  };

  const handleEditUniversity = (university: University) => {
    setEditingUniversity(university);
    setNewUniversityData({
      track: university.track,
      name: university.name,
      description: university.description,
      thumbnail: undefined,
      thumbnailPreview: university.thumbnail || '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateUniversity = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newUniversityData.name) {
      setError('University name is mandatory.');
      return;
    }

    if (!editingUniversity) return;

    try {
      const updateData: UpdateUniversityData = {
        track: newUniversityData.track,
        name: newUniversityData.name,
        description: newUniversityData.description,
        thumbnail: newUniversityData.thumbnail,
      };

      await universityService.updateUniversity(editingUniversity.id, updateData);
      
      toast.success('University updated successfully');
      setIsEditModalOpen(false);
      setEditingUniversity(null);
      setNewUniversityData({ 
        track: 0, 
        name: '', 
        description: '', 
        thumbnail: undefined, 
        thumbnailPreview: '' 
      });
      fetchUniversities();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error(err instanceof Error ? err.message : 'Failed to update university');
    }
  };

  const handleDeleteClick = (university: University) => {
    setUniversityToDelete(university);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteUniversity = async () => {
    if (!universityToDelete) return;

    try {
      await universityService.deleteUniversity(universityToDelete.id);
      
      toast.success('University deleted successfully');
      fetchUniversities();
      setIsDeleteModalOpen(false);
      setUniversityToDelete(null);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete university');
      toast.error(err instanceof Error ? err.message : 'Failed to delete university');
    }
  };

  const handleRowClick = (row: University) => {
    // Check if we're on the client side
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('id_university', row.id.toString());
      sessionStorage.setItem('university_name', row.name);
      router.push('/dashboard/track-list/track/university/university-cards');
    }
  };

  // Table columns: Thumbnail, Name, Description, Track, Created By, Created On
  const tableData = useMemo(() => {
    // Sort universities by modified_on in descending order (latest first)
    return [...universities].sort((a, b) => {
      const dateA = new Date(a.modified_on).getTime();
      const dateB = new Date(b.modified_on).getTime();
      return dateB - dateA; // Descending order (latest first)
    });
  }, [universities]);

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

  if (loading) {
    return <div className="text-center p-6">Loading universities...</div>;
  }

  if (error && !isModalOpen) {
    return <div className="text-red-500 p-6">Error: {error}</div>;
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">Universities</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#1A4D2E] hover:bg-[#1A4D2E] text-white font-bold TEXT-SM py-1 px-4 rounded"
          >
            + Create New University
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
                  {/* <th className="p-3 text-left">Track ID</th> */}
                  <th className="p-3 text-left">Created On</th>
                  <th className="p-3 text-left">Last Modified</th>
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
                        <div className='text-xs text-slate-600'>{row.created_by}</div>
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
                    {/* <td className="p-3">{row.track}</td> */}
                    <td className="p-3">{new Date(row.created_on).toLocaleDateString()}</td>
                    <td className="p-3">{new Date(row.modified_on).toLocaleDateString()}</td>
                    <td className="p-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditUniversity(row);
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

        {/* Create University Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
            <div className="relative w-full max-w-4xl mx-auto bg-white rounded-lg shadow-2xl p-0">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 bg-[#1A4D2E] rounded-t-lg">
                <h3 className="text-lg font-semibold text-white">Create New University</h3>
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
                    value={newUniversityData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <div className="bg-white rounded border border-gray-300">
                    <ReactQuill
                      value={newUniversityData.description}
                      onChange={(val: string) => setNewUniversityData(prev => ({ ...prev, description: val }))}
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
                  {newUniversityData.thumbnailPreview && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">Preview:</p>
                      <div className="relative inline-block">
                        <img
                          src={newUniversityData.thumbnailPreview}
                          alt="Thumbnail preview"
                          className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setNewUniversityData(prev => ({
                              ...prev,
                              thumbnail: undefined,
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
        
        {/* Edit University Modal */}
        {isEditModalOpen && editingUniversity && (
          <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
            <div className="relative w-full max-w-4xl mx-auto bg-white rounded-lg shadow-2xl p-0">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 bg-[#1A4D2E] rounded-t-lg">
                <h3 className="text-lg font-semibold text-white">Edit University</h3>
                <button
                  onClick={() => { 
                    setIsEditModalOpen(false); 
                    setEditingUniversity(null); 
                    setError(''); 
                    setNewUniversityData({ 
                      track: 0, 
                      name: '', 
                      description: '', 
                      thumbnail: undefined, 
                      thumbnailPreview: '' 
                    });
                  }}
                  className="text-white hover:text-gray-200 text-2xl font-bold focus:outline-none"
                  aria-label="Close"
                >
                  &times;
                </button>
              </div>
              {/* Form */}
              <form onSubmit={handleUpdateUniversity} className="px-6 py-6 space-y-5">
                <div>
                  <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">Name<span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="name"
                    id="edit-name"
                    required
                    className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-600 focus:border-blue-600"
                    value={newUniversityData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <div className="bg-white rounded border border-gray-300">
                    <ReactQuill
                      value={newUniversityData.description}
                      onChange={(val: string) => setNewUniversityData(prev => ({ ...prev, description: val }))}
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
                  {newUniversityData.thumbnailPreview && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">Preview:</p>
                      <div className="relative inline-block">
                        <img
                          src={newUniversityData.thumbnailPreview}
                          alt="Thumbnail preview"
                          className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setNewUniversityData(prev => ({
                              ...prev,
                              thumbnail: undefined,
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
                {error && isEditModalOpen && (
                  <div className="text-red-500 text-sm mt-2 text-center">{error}</div>
                )}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { 
                      setIsEditModalOpen(false); 
                      setEditingUniversity(null); 
                      setError(''); 
                      setNewUniversityData({ 
                        track: 0, 
                        name: '', 
                        description: '', 
                        thumbnail: undefined, 
                        thumbnailPreview: '' 
                      });
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
        {isDeleteModalOpen && universityToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
            <div className="relative w-full max-w-md mx-auto bg-white rounded-lg shadow-2xl p-0">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 bg-red-600 rounded-t-lg">
                <h3 className="text-lg font-semibold text-white">Delete University</h3>
                <button
                  onClick={() => { 
                    setIsDeleteModalOpen(false); 
                    setUniversityToDelete(null); 
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
                    <span className="font-medium">University:</span> {universityToDelete.name}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    This will permanently delete the university and all associated data.
                  </p>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => { 
                      setIsDeleteModalOpen(false); 
                      setUniversityToDelete(null); 
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 focus:outline-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteUniversity}
                    className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 focus:outline-none"
                  >
                    Delete University
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
