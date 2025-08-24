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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading chapter exams...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Chapter Exams
          </h1>
          <p className="text-gray-600">
            {isPracticeExam ? 'Practice' : 'Regular'} exams for this subject
          </p>
        </div>

        {/* Search and Create */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search exams..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <button
            onClick={handleCreateExam}
            className="bg-green-900 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Create New Exam
          </button>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-600">
            Showing {filteredData.length} exam{filteredData.length !== 1 ? 's' : ''}
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
                  <th className="p-3 text-left">Type</th>
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
                        <p className="text-lg font-medium">No exams found</p>
                        <p className="text-sm">Create your first exam to get started</p>
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
                      <td className="p-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          exam.is_practice_exam
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {exam.is_practice_exam ? 'Practice' : 'Regular'}
                        </span>
                      </td>
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
    </div>
  );
}
