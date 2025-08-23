"use client"
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

interface GrandExam {
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

export default function AllGrandTestsPage() {
  const router = useRouter();
  const [grandExams, setGrandExams] = useState<GrandExam[]>([]);
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
    const practiceFlag = sessionStorage.getItem('is_practice_exam_grand_test');
    
    if (id) {
      setSubjectId(id);
      setIsPracticeExam(practiceFlag === 'true');
    } else {
      setError('Subject ID not found in session storage.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchGrandExams = async () => {
      if (!subjectId) return;

      try {
        const token = sessionStorage.getItem('Authorization');
        if (!token) {
          throw new Error('No authorization token found');
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/exams_app/track_exams/grand-exam-by-subject/?subject_id=${subjectId}&is_practice_exam=${isPracticeExam}`,
          {
            headers: {
              'Authorization': token,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch grand exams');
        }

        const data = await response.json();
        setGrandExams(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchGrandExams();
  }, [subjectId, isPracticeExam]);

  // Search filter and sorting (search by title, description, sort by modified_on in descending order)
  const filteredData = useMemo(() => {
    // First sort exams by modified date (newest first)
    const sortedExams = [...grandExams].sort((a, b) => {
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
  }, [search, grandExams]);

  // Pagination
  const pageCount = Math.ceil(filteredData.length / pageSize);
  const pagedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  const handleRowClick = (exam: GrandExam) => {
    // Navigate to exam details or take exam
    router.push(`/dashboard/track-list/track/subject-list/subject-cards/grand-test/test/${exam.id}`);
  };

  const handleCreateExam = () => {
    // Navigate to create exam page
    router.push('/dashboard/track-list/track/subject-list/subject-cards/grand-test/test');
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
            <p className="mt-4 text-gray-600">Loading grand exams...</p>
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
            {isPracticeExam ? 'Practice Grand Tests' : 'Grand Tests'}
          </h1>
          <p className="text-gray-600">
            {isPracticeExam 
              ? 'Practice exams to test your knowledge and prepare for the real test'
              : 'Official grand tests for this subject'
            }
          </p>
        </div>

        {/* Search and Create Button */}
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
          <button
            onClick={handleCreateExam}
            className="px-6 py-2 bg-[#1A4D2E] text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Create {isPracticeExam ? 'Practice' : ''} Grand Test
          </button>
        </div>

        {/* Results Count and Table */}
        {filteredData.length > 0 ? (
          <>
            {/* Results Count */}
            <div className="mb-4 text-sm text-gray-600">
              {filteredData.length} exam{filteredData.length !== 1 ? 's' : ''} found
            </div>

        {/* Grand Exams Table */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full border-grey-800 border-2 text-sm">
            <thead>
              <tr>
                <th className="p-3">#</th>
                <th className="p-3 text-left">Thumbnail</th>
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-left">Total Marks</th>
                <th className="p-3 text-left">Practice</th>
                                 <th className="p-3 text-left">Created By</th>
                 <th className="p-3 text-left">Created On</th>
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
                      <div className="w-10 h-10 bg-gray-100 flex items-center justify-center rounded text-gray-400">
                        N
                      </div>
                    )}
                  </td>
                  <td className="p-3 font-bold text-slate-800">
                    {row.title}
                  </td>
                  <td className="p-3 text-gray-700 max-w-xs text-slate-600 truncate" 
                       title={row.description}>
                    <div
                      className="line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: row.description }}
                    />
                  </td>
                  <td className="p-3 text-slate-600">
                    {row.total_marks}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      row.is_practice_exam 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {row.is_practice_exam ? 'Practice' : 'Official'}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600">
                    {row.created_by}
                  </td>
                                     <td className="p-3 text-slate-600">
                     {formatDate(row.created_on)}
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pageCount > 1 && (
          <div className="flex justify-center mt-6">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    pageNum === page
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              
              <button
                onClick={() => setPage(Math.min(pageCount, page + 1))}
                disabled={page === pageCount}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        )}

          </>
        ) : (
          /* Empty State - Show when no exams and not loading */
          !loading && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No exams found</h3>
              <p className="text-gray-500 mb-4">
                {search ? 'Try adjusting your search terms.' : 'Get started by creating your first exam.'}
              </p>
              {!search && (
                <button
                  onClick={handleCreateExam}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Create {isPracticeExam ? 'Practice' : ''} Grand Test
                </button>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}
