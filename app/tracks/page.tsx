'use client';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import React, { useEffect, useState } from 'react';

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

  if (error && !isModalOpen) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tracks</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Create New Track
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {tracks.map((track) => (
            <div key={track.id} onClick={()=>{
              sessionStorage.setItem('id_track', track.id.toString());
              sessionStorage.setItem('track_name', track.name);
            
            }}
            className="border rounded-xl p-4 shadow hover:shadow-lg transition cursor-pointer"
            >
              {track.thumbnail ? (
                <img
                  src={track.thumbnail}
                  alt={track.name}
                  className="w-full h-40 object-cover rounded mb-4"
                />
              ) : (
                <div className="w-full h-40 bg-gray-100 flex items-center justify-center rounded mb-4 text-gray-400">
                  No Image
                </div>
              )}
              <h2 className="text-xl font-semibold">{track.name}</h2>
              <p className="text-sm text-gray-600 mb-2">{track.description}</p>
              <p className="text-sm">Price: {track.price}</p>
              <p className="text-sm">Created By: {track.created_by}</p>
              <Link href="/tracks/subjects" >Open this track</Link>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
          <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Create New Track</h3>
              <div className="mt-2 px-7 py-3">
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name*</label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      value={newTrackData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      name="description"
                      id="description"
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      value={newTrackData.description}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
                    <input
                      type="text"
                      name="price"
                      id="price"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      value={newTrackData.price}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700">Thumbnail</label>
                    <input
                      type="file"
                      name="thumbnail"
                      id="thumbnail"
                      accept="image/*"
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      onChange={handleFileChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="created_by" className="block text-sm font-medium text-gray-700">Created By</label>
                    <input
                      type="text"
                      name="created_by"
                      id="created_by"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      value={newTrackData.created_by}
                      onChange={handleInputChange}
                    />
                  </div>
                  {error && isModalOpen && (
                    <div className="text-red-500 text-sm mt-2">{error}</div>
                  )}
                  <div className="items-center px-4 py-3">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => {
                        setIsModalOpen(false);
                        setError('');
                      }}
                      type="button"
                      className="ml-4 px-4 py-2 bg-gray-300 text-gray-700 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
