"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

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

interface UniversityExam {
  id: number;
  title: string;
  description: string;
  thumbnail: string | null;
  exam_type: string;
  total_marks: string;
  subject: number;
  track: number;
  university: number;
}

export default function AllUniversityTestsPage() {
  const router = useRouter();
  const [universityExams, setUniversityExams] = useState<UniversityExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [universityId, setUniversityId] = useState<string | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const pageSize = 10;

  useEffect(() => {
    const id = sessionStorage.getItem('id_university');
    if (id) {
      setUniversityId(id);
    } else {
      setError('University ID not found in session storage.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchUniversityExams = async () => {
      if (!universityId) return;

      try {
        const token = sessionStorage.getItem('Authorization');
        if (!token) {
          throw new Error('No authorization token found');
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/exams_app/university_exams/?university_id=${universityId}`,
          {
            headers: {
              'Authorization': token,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch university exams');
        }

        const data = await response.json();
        setUniversityExams(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUniversityExams();
  }, [universityId]);

  const filteredData = useMemo(() => {
    const sortedExams = [...universityExams].sort((a, b) => b.id - a.id);
    if (!search) return sortedExams;
    return sortedExams.filter(row =>
      row.title.toLowerCase().includes(search.toLowerCase()) ||
      row.description.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, universityExams]);

  const pageCount = Math.ceil(filteredData.length / pageSize);
  const pagedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  const handleRowClick = (exam: UniversityExam) => {
    sessionStorage.setItem("exam_id_university", exam.id.toString());
    router.push(`/dashboard/track-list/track/university/university-cards/all-tests/test`);
  };

  const handleCreateExam = () => {
    router.push('/dashboard/track-list/track/university/university-cards/all-tests/create-exam');
  };

  const onFileChosen = (files: FileList) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const allowed = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'application/csv'
    ];
    const nameAllowed = file.name.endsWith('.xlsx') || file.name.endsWith('.csv');
    if (!allowed.includes(file.type) && !nameAllowed) {
      setUploadError('Only .xlsx or .csv files are allowed');
      setSelectedFile(null);
      return;
    }
    setUploadError('');
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileChosen(e.dataTransfer.files);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file');
      return;
    }
    if (!universityId) {
      setUploadError('University ID not found');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError('');
      const token = sessionStorage.getItem('Authorization');
      const trackId = sessionStorage.getItem('id_track');
      const subjectId = sessionStorage.getItem('id_subject');
      
      if (!token) throw new Error('No authorization token found');
      if (!trackId) throw new Error('Track ID not found');
      if (!subjectId) throw new Error('Subject ID not found');

      const form = new FormData();
      form.append('file', selectedFile);
      form.append('subject', subjectId);
      form.append('track', trackId);
      form.append('university', universityId);
      form.append('exam_type', 'university');

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/exams_app/university-exams/upload-excel/`, {
        method: 'POST',
        headers: {
          'Authorization': token,
        },
        body: form,
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || 'Failed to upload');
      }

      // Refresh list after successful upload
      setIsUploadOpen(false);
      setSelectedFile(null);
      setIsUploading(false);
      setSearch('');
      setPage(1);
      // re-fetch
      setLoading(true);
      setError('');
      const tokenRefresh = sessionStorage.getItem('Authorization');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/exams_app/university_exams/?university_id=${universityId}`,
        { headers: { 'Authorization': tokenRefresh ?? '' } }
      );
      const data = await response.json();
      setUniversityExams(data);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading university exams...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">University Exams</h1>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = '/Grand_Exam_Template.xlsx';
                link.download = 'University_Exam_Template.xlsx';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
              title="Download Excel Template"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Template
            </button>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Upload Excel/CSV
            </button>
            <button
              onClick={handleCreateExam}
              className="bg-[#1A4D2E] hover:bg-[#1A4D2E] text-white font-bold TEXT-SM py-1 px-4 rounded"
            >
              Create University Exam
            </button>
          </div>
        </div>
        
        {/* Track, Subject and University Info */}
        <div className="max-w-sm p-4 rounded-2xl shadow-md bg-white border border-gray-200 mb-6">
          <p className="text-sm font-medium">
            <span className="font-medium text-gray-700">Track:</span>{" "}
            {sessionStorage.getItem("track_name")}
          </p>
          <p className="text-sm mt-2 font-medium">
            <span className="font-medium text-gray-700">Subject:</span>{" "}
            {sessionStorage.getItem("subject_name")}
          </p>
          <p className="text-sm mt-2 font-medium">
            <span className="font-medium text-gray-700">University:</span>{" "}
            {sessionStorage.getItem("university_name")}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <div className="flex items-center justify-between">
                <div>
                  <strong className="font-bold">Error: </strong>
                  <span className="block sm:inline">{error}</span>
                </div>
                <button
                  onClick={() => {
                    setError('');
                    setLoading(true);
                    const id = sessionStorage.getItem('id_university');
                    if (id) {
                      setUniversityId(id);
                    }
                  }}
                  className="ml-4 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}
      
      <div className='border-grey-800 border-2 rounded-lg p-4'>
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <input
            type="text"
            placeholder="Type in to Search"
            className="border text-sm focus:outline-none px-3 py-2 rounded w-full sm:w-72"
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
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-left">Total Marks</th>
                <th className="p-3 text-left">Exam Type</th>
              </tr>
            </thead>
            <tbody className='border-grey-800 text-xs border-2'>
              {pagedData.map((row, i) => (
                <tr
                  key={row.id}
                  className="border-t border-grey-800 border-2 hover:bg-blue-50 cursor-pointer transition"
                  onClick={() => handleRowClick(row)}
                >
                  <td className="p-3 font-semibold text-slate-800">
                    {(page - 1) * pageSize + i + 1}
                  </td>
                  <td className="p-3">
                    {row.thumbnail ? (
                      <img 
                        src={row.thumbnail} 
                        alt={row.title} 
                        className="w-10 h-10 object-cover rounded" 
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-100 flex items-center justify-center rounded text-gray-400">Null</div>
                    )}
                  </td>
                  <td className="p-3 font-bold">
                    <div>{row.title}
                      <div className='text-xs text-slate-600'>University Exam</div>
                    </div>
                  </td>
                  <td className="p-3 text-gray-700 max-w-xs text-slate-600 truncate" title={row.description}>
                    <div className="line-clamp-2" dangerouslySetInnerHTML={{ __html: row.description }} />
                  </td>
                  <td className="p-3 text-slate-600">
                    {row.total_marks}
                  </td>
                  <td className="p-3 text-slate-600">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {row.exam_type}
                    </span>
                  </td>
                </tr>
              ))}
              {pagedData.length === 0 && (
                <tr><td colSpan={6} className="text-center p-6 text-gray-400">No data found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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
      </div>
      
      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => { if (!isUploading) { setIsUploadOpen(false); setSelectedFile(null); setUploadError(''); } }}>
          <div className="bg-white m-2 p-6 rounded shadow-lg w-full max-w-lg relative" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={() => { if (!isUploading) { setIsUploadOpen(false); setSelectedFile(null); setUploadError(''); } }}>&times;</button>
            <h3 className="text-lg font-semibold mb-4">Upload University Exam via Excel/CSV</h3>
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => document.getElementById('university-upload-input')?.click()}
            >
              <input id="university-upload-input" type="file" accept=".xlsx,.csv" className="hidden" onChange={(e) => { if (e.target.files) onFileChosen(e.target.files); }} />
              <p className="text-sm text-gray-600">Drag and drop your .xlsx or .csv file here, or click to browse.</p>
              {selectedFile && (
                <p className="mt-3 text-gray-800 font-medium">Selected: {selectedFile?.name}</p>
              )}
            </div>
            {uploadError && <div className="text-red-600 text-sm mt-3">{uploadError}</div>}
            <div className="mt-6 flex justify-end gap-2">
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md" onClick={() => { if (!isUploading) { setIsUploadOpen(false); setSelectedFile(null); setUploadError(''); } }}>Cancel</button>
              <button disabled={isUploading} className={`px-4 py-2 ${isUploading ? 'bg-blue-300' : 'bg-blue-600'} text-white rounded-md`} onClick={handleUpload}>
                {isUploading ? 'Creating…' : 'Create exam'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}