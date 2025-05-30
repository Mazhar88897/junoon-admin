
'use client';

import { redirect, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

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
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [trackId, setTrackId] = useState<string | null>(null);

  useEffect(() => {
    const id = sessionStorage.getItem('id_track');
    if (id) {
      setTrackId(id);
    } else {
      setError('Track ID not found in session storage.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchSubjects = async () => {
      if (!trackId) return; // Don't fetch if trackId is not available

      try {
        const token = sessionStorage.getItem('Authorization');
        if (!token) {
          throw new Error('No authorization token found');
        }

        const response = await fetch(`https://junoon-vatb.onrender.com/api/tracks_app/subjects/?track_id=${trackId}`, {
          headers: {
            'Authorization': token,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch subjects');
        }

        const data = await response.json();
        setSubjects(data);
       
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [trackId]); // Refetch when trackId changes

  if (error) {
    return <div className="text-red-500 p-6">Error: {error}</div>;
  }

  if (loading) {
    return <div className="p-6">Loading subjects...</div>;
  }

  if (subjects.length === 0) {
      return <div className="p-6">No subjects found for this track.</div>;
  }
  const router = useRouter();
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 onClick={()=>{ console.log(subjects)}} className="text-3xl font-bold mb-6">Subjects</h1>
      <div className="space-y-8">
        {subjects.map((subject) => (

          <div onClick={()=>{
            sessionStorage.setItem('id_subject', subject.id.toString());
            sessionStorage.setItem('subject_name', subject.name);
            sessionStorage.setItem('subject_description', subject.description);
            router.push('/tracks/subjects/create'); // Client-side navigation

          
          }} key={subject.id} className="border rounded-xl p-4 shadow">
            {subject.thumbnail && (
              <img
                src={subject.thumbnail}
                alt={subject.name}
                className="w-32 h-auto object-cover rounded mb-4"
              />
            )}
            <h2 className="text-2xl font-semibold mb-2">{subject.name}</h2>
            <p className="text-gray-700 mb-4">{subject.description}</p>

            {subject.chapters.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-3">Chapters</h3>
                <div className="space-y-3">
                  {subject.chapters.map((chapter) => (
                    <div key={chapter.id} className="border rounded p-3 bg-gray-50">
                      <h4 className="text-lg font-medium">{chapter.name}</h4>
                      {chapter.description && <p className="text-gray-600 text-sm">{chapter.description}</p>}
                      {/* Display other chapter details if needed */}
                    </div>
                  ))}
                </div>
              </div>
            )}
             {!subject.chapters.length && (
                 <p className="text-gray-600 text-sm">No chapters available for this subject.</p>
             )}
          </div>
        ))}
      </div>
    </div>
  );
}
