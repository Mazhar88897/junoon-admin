'use client';

import Link from 'next/link';
import { redirect, useRouter } from 'next/navigation';

import React, { useEffect, useState } from 'react';

interface University {
  id: number;
  name: string;
  description: string;
  thumbnail: string;
  track: number;
  created_on: string;
  modified_on: string;
  created_by: string;
  modified_by: string | null;
}

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUniversityData, setNewUniversityData] = useState({
    name: '',
    description: '',
    track: '',
  });
  const router = useRouter();

  const fetchUniversities = async () => {
    try {
      const token = sessionStorage.getItem('Authorization');
      if (!token) {
        throw new Error('No authorization token found');
      }

      const response = await fetch('https://junoon-vatb.onrender.com/api/tracks_app/universities/', {
        headers: {
          'Authorization': token,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch universities');
      }

      const data = await response.json();
      setUniversities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversities();
    // Get track ID from session storage
    const trackId = sessionStorage.getItem('id_track');
    if (trackId) {
      setNewUniversityData(prev => ({ ...prev, track: trackId }));
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewUniversityData({ ...newUniversityData, [name]: value });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newUniversityData.name) {
      setError('University name is mandatory.');
      return;
    }

    try {
      const token = sessionStorage.getItem('Authorization');
      if (!token) {
        throw new Error('No authorization token found');
      }

      const response = await fetch('https://junoon-vatb.onrender.com/api/tracks_app/universities/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify({
          track: newUniversityData.track,
          name: newUniversityData.name,
          description: newUniversityData.description
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create university');
      }

      setIsModalOpen(false);
      setNewUniversityData({ name: '', description: '', track: sessionStorage.getItem('id_track') || '' });
      fetchUniversities();

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
        <h1 onClick={()=>{console.log(universities)}} className="text-3xl font-bold">Universities</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Add New University
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {universities.map((university) => (
            <div onClick={()=>{
                sessionStorage.setItem('university_id', university.id.toString());
              
                router.push('/tracks/subjects/create/university/exam-by-university'); // Client-side navigation
    
            }} key={university.id} 
              className="border rounded-xl p-4 shadow hover:shadow-lg transition cursor-pointer"
            >
              {university.thumbnail ? (
                <img
                  src={university.thumbnail}
                  alt={university.name}
                  className="w-full h-40 object-cover rounded mb-4"
                />
              ) : (
                <div className="w-full h-40 bg-gray-100 flex items-center justify-center rounded mb-4 text-gray-400">
                  No Image
                </div>
              )}
              <h2 className="text-xl font-semibold">{university.name}</h2>
              <p className="text-sm text-gray-600 mb-2">{university.created_on}</p>
              <p className="text-sm">Description: {university.description}</p>
              <p className="text-sm">Created By: {university.created_by}</p>
              <p className="text-sm">Track ID: {university.track}</p>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
          <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Add New University</h3>
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
                      value={newUniversityData.name}
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
                      value={newUniversityData.description}
                      onChange={handleInputChange}
                    ></textarea>
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
