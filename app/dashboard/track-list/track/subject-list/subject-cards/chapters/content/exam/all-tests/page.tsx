"use client"
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

interface ChapterExam {
  id: number;
  is_deleted: boolean;
  deleted_by: string | null;
  deleted_on: string | null;
  created_by: string;
  created_on: string;
  modified_by: string | null;
  modified_on: string;
  title: string;
  description: string;
  exam_type: string;
  thumbnail: string | null;
  total_marks: string;
  is_practice_exam: boolean;
  subject: number;
  track: number;
  chapter: number | null;
  topic: number | null;
}

export default function AllChapterTestsPage() {
  const router = useRouter();
  const [chapterExams, setChapterExams] = useState<ChapterExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [isPracticeExam, setIsPracticeExam] = useState<boolean>(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const pageSize = 10;

  useEffect(() => {
    // Get subject ID and practice exam flag from session storage
    const id = sessionStorage.getItem('id_subject');
    const practiceFlag = sessionStorage.getItem('is_practice_exam_chapter_test');
    
    if (id) {
      setSubjectId(id);
      setIsPracticeExam(practiceFlag === 'true');
    } else {
      setError('Subject ID not found in session storage.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchChapterExams = async () => {
      if (!subjectId) return;

      try {
        const token = sessionStorage.getItem('Authorization');
        if (!token) {
          throw new Error('No authorization token found');
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/exams_app/track_exams/chap-exam-by-subject/?subject_id=${subjectId}&is_practice_exam=${isPracticeExam}`,
          {
            headers: {
              'Authorization': token,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch chapter exams');
        }

        const data = await response.json();
        setChapterExams(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchChapterExams();
  }, [subjectId, isPracticeExam]);

  // Search filter and sorting (search by title, description, sort by modified_on in descending order)
  const filteredData = useMemo(() => {
    // First sort exams by modified date (newest first)
    const sortedExams = [...chapterExams].sort((a, b) => {
      const dateA = new Date(a.modified_on);
      const dateB = new Date(b.modified_on);
      return dateB.getTime() - dateA.getTime(); // Descending order (newest first)
    });

    // Then apply search filter
    if (!search) return sortedExams;
    return sortedExams.filter(row =>
      row.title.toLowerCase().includes(search.toLowerCase()) ||
      row.description.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, chapterExams]);

  // Pagination
  const pageCount = Math.ceil(filteredData.length / pageSize);
  const pagedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  const handleRowClick = (exam: ChapterExam) => {
    // Navigate to exam details or take exam
    router.push(`/dashboard/track-list/track/subject-list/subject-cards/chapters/content/exam/all-tests/test`);
  };

  const handleCreateExam = () => {
    // Navigate to create exam page
    router.push('/dashboard/track-list/track/subject-list/subject-cards/chapters/content/exam/test');
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
    if (!subjectId) {
      setUploadError('Subject ID not found');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError('');
      const token = sessionStorage.getItem('Authorization');
      const trackId = sessionStorage.getItem('id_track');
      const chapterId = sessionStorage.getItem('chapter_id');
      if (!token) throw new Error('No authorization token found');
      if (!trackId) throw new Error('Track ID not found');
      if (!chapterId) throw new Error('Chapter ID not found');

      const form = new FormData();
      form.append('file', selectedFile);
      form.append('subject', subjectId);
      form.append('track', trackId);
      form.append('chapter', chapterId);
      form.append('is_practice_exam', sessionStorage.getItem('is_practice_exam_chapter_test') || 'false');
      form.append('exam_type', 'chapter');

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/exams_app/track-exams/upload-excel/`, {
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
        `${process.env.NEXT_PUBLIC_API_URL}/api/exams_app/track_exams/chap-exam-by-subject/?subject_id=${subjectId}&is_practice_exam=${isPracticeExam}`,
        { headers: { 'Authorization': tokenRefresh || '' } }
      );
      const data = await response.json();
      setChapterExams(data);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading chapter exams...</p>
      </div>
    );
  }

  // Don't return early on error - show the UI with error message

  return (
    <>
    <div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Chapter Exams
          </h1>
          <p className="text-gray-600">
            {isPracticeExam ? 'Practice' : 'Regular'} exams for this subject
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
                    // Re-trigger the fetch
                    const id = sessionStorage.getItem('id_subject');
                    const practiceFlag = sessionStorage.getItem('is_practice_exam_chapter_test');
                    if (id) {
                      setSubjectId(id);
                      setIsPracticeExam(practiceFlag === 'true');
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

        {/* Search and Create/Upload Buttons */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search exams..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = '/Grand_Exam_Template.xlsx';
                link.download = 'Grand_Exam_Template.xlsx';
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
             
            </button>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Upload Excel/CSV
            </button>
            <button
              onClick={handleCreateExam}
              className="px-6 py-2 bg-[#1A4D2E] text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Create New Exam
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-600">
            {error ? 'Unable to load exams' : `Showing ${filteredData.length} exam${filteredData.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Exams Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3 text-left">Title</th>
                  <th className="p-3 text-left">Description</th>
                  <th className="p-3 text-left">Total Marks</th>
                  {/* <th className="p-3 text-left">T   ype</th> */}
                  <th className="p-3 text-left">Last Modified</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pagedData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg
                          className="h-12 w-12 text-gray-400 mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <p className="text-lg font-medium">
                          {error ? 'Failed to load exams' : 'No exams found'}
                        </p>
                        <p className="text-sm">
                          {error ? 'Please try again or create a new exam' : 'Create your first exam to get started'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pagedData.map((exam, index) => (
                    <tr
                      key={exam.id}
                      onClick={() => {sessionStorage.setItem("exam_id_chapter_test", exam.id.toString());handleRowClick(exam);}}
                      className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                    >
                      <td className="p-3">
                        <div className="text-sm text-gray-900">
                          {((page - 1) * pageSize) + index + 1}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm font-medium text-gray-900">
                          {exam.title}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {exam.description}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm text-gray-900">
                          {exam.total_marks}
                        </div>
                      </td>
                          {/* <td className="p-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          exam.is_practice_exam
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {exam.is_practice_exam ? 'Practice' : 'Regular'}
                        </span>
                      </td> */}
                      <td className="p-3 text-sm text-gray-500">
                        {formatDate(exam.modified_on)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {pageCount > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, filteredData.length)} of {filteredData.length} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md">
                Page {page} of {pageCount}
              </span>
              <button
                onClick={() => setPage(Math.min(pageCount, page + 1))}
                disabled={page === pageCount}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
    </div>
    {isUploadOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => { if (!isUploading) { setIsUploadOpen(false); setSelectedFile(null); setUploadError(''); } }}>
        <div className="bg-white m-2 p-6 rounded shadow-lg w-full max-w-lg relative" onClick={(e) => e.stopPropagation()}>
          <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={() => { if (!isUploading) { setIsUploadOpen(false); setSelectedFile(null); setUploadError(''); } }}>&times;</button>
          <h3 className="text-lg font-semibold mb-4">Upload Chapter Test via Excel/CSV</h3>
          <div
            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => document.getElementById('chapter-upload-input')?.click()}
          >
            <input id="chapter-upload-input" type="file" accept=".xlsx,.csv" className="hidden" onChange={(e) => { if (e.target.files) onFileChosen(e.target.files); }} />
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
    </>
  );
}
