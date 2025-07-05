'use client';

import Link from 'next/link';
import { redirect, useRouter } from 'next/navigation';
import React, { useEffect, useState, useMemo } from 'react';

interface Track {
  id: number;
  name: string;
  description: string;
  thumbnail: string;
  price: string;
  created_on: string;
  modified_on: string;
  created_by: string;
  modified_by: string | null;
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
  const [newTrackData, setNewTrackData] = useState({
    name: '',
    description: '',
    price: '',
    thumbnail: null as File | null,
    created_by: '',
  });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const router = useRouter();

  const fetchTracks = async () => {
    try {
      const token = sessionStorage.getItem('Authorization');
      if (!token) {
        throw new Error('No authorization token found');
      }

      const response = await fetch('https://junoon-vatb.onrender.com/api/tracks_app/tracks/', {
        headers: {
          'Authorization': token,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tracks');
      }

      const data = await response.json();
      setTracks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracks();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewTrackData({ ...newTrackData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTrackData({ ...newTrackData, thumbnail: e.target.files ? e.target.files[0] : null });
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
    formData.append('price', newTrackData.price);
    if (newTrackData.thumbnail) {
      formData.append('thumbnail', newTrackData.thumbnail);
    }
    formData.append('created_by', newTrackData.created_by);

    try {
      const token = sessionStorage.getItem('Authorization');
      if (!token) {
        throw new Error('No authorization token found');
      }

      const response = await fetch('https://junoon-vatb.onrender.com/api/tracks_app/tracks/', {
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
      setNewTrackData({ name: '', description: '', price: '', thumbnail: null, created_by: '', });
      fetchTracks();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  // Remove all mock fields and only use actual data fields
  // Table columns: Thumbnail, Name, Description, Price, Created By, Created On
  const tableData = useMemo(() => tracks, [tracks]);

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
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Tracks</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-purple-800 hover:bg-purple-700 text-white font-bold TEXT-SM py-1 px-4 rounded"
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
              <th className="p-3 text-left">Price</th>
            
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
                onClick={() => {
                  sessionStorage.setItem('id_track', row.id.toString());
                  sessionStorage.setItem('has_university', row.has_university.toString());
                  router.push('/dashboard/track-list/track');
                }}
              >
                <td className="p-3 font-semibold text-slate-800">{(page - 1) * pageSize + i + 1}</td>
                <td className="p-3">
                  {row.thumbnail ? (
                    <img src={row.thumbnail} alt={row.name} className="w-8 h-8 object-cover rounded" />
                  ) : (
                    <div className="w-8 h-8 bg-gray-100 flex items-center fext-xs justify-center rounded text-gray-400">Null</div>
                  )}
                </td>
                <td className="p-3 font-bold ">
                  <div>{row.name}
                    <div className='text-xs text-slate-600'>{row.created_by}</div>
                  </div>

                </td>
                <td className="p-3 text-gray-700 max-w-xs text-slate-600 truncate" title={row.description}>{row.description}</td>
                <td className="p-3">{parseFloat(row.price).toLocaleString()} PKR</td>
               
                <td className="p-3">{new Date(row.created_on).toLocaleDateString()}</td>
                <td className="p-3">{new Date(row.modified_on).toLocaleDateString()}</td>
                <td className="p-3 text-right">
                  <button className="px-2 py-1 text-gray-400 hover:text-gray-700">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="2" fill="currentColor"/><circle cx="19" cy="12" r="2" fill="currentColor"/><circle cx="5" cy="12" r="2" fill="currentColor"/></svg>
                  </button>
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
          <div className="relative w-full max-w-md mx-auto bg-white rounded-lg shadow-2xl p-0">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-purple-500 rounded-t-lg">
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
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  id="description"
                  rows={3}
                  className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#6d7efc] focus:border-[#6d7efc]"
                  value={newTrackData.description}
                  onChange={handleInputChange}
                ></textarea>
              </div>
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <input
                  type="number"
                  name="price"
                  id="price"
                  className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#6d7efc] focus:border-[#6d7efc]"
                  value={newTrackData.price}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700 mb-1">Thumbnail</label>
                <input
                  type="file"
                  name="thumbnail"
                  id="thumbnail"
                  accept="image/*"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  onChange={handleFileChange}
                />
              </div>
              <div>
                <label htmlFor="created_by" className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
                <input
                  type="text"
                  name="created_by"
                  id="created_by"
                  className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#6d7efc] focus:border-[#6d7efc]"
                  value={newTrackData.created_by}
                  onChange={handleInputChange}
                />
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
                  className="px-4 py-2 bg-purple-800 text-white rounded-md font-medium hover:bg-[#5a6edc] focus:outline-none"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
