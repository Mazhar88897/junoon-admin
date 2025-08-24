'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Trash2, CheckCircle, XCircle, FileText } from 'lucide-react';

interface Choice {
  id: number;
  text: string;
  is_correct: boolean;
  graphics: string | null;
}

interface Question {
  id: number;
  text: string;
  graphics: string | null;
  marks: string;
  choices: Choice[];
}

interface ExamData {
  id: number;
  questions: Question[];
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

export default function AdminChapterExamReviewPage() {
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  // Fetch exam data
  useEffect(() => {
    const fetchExamData = async () => {
      try {
        setLoading(true);
        
        // Get authorization token
        const token = sessionStorage.getItem('Authorization');
        if (!token) {
          throw new Error('No authorization token found. Please login again.');
        }

        // Replace with your actual base URL
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const examId = sessionStorage.getItem("exam_id_chapter_test");
        
        if (!examId) {
          throw new Error('No exam ID found in session storage.');
        }

        const response = await fetch(`${baseUrl}/api/exams_app/questions/by-trackexam?track_exam_id=${examId}`, {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Authentication failed. Please login again.');
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setExamData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch exam data');
        console.error('Error fetching exam data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExamData();
  }, []);

  const handleEditExam = () => {
    alert('Edit functionality to be implemented');
  };

  const handleDeleteExam = () => {
    if (confirm('Are you sure you want to delete this exam? This action cannot be undone.')) {
      alert('Delete functionality to be implemented');
    }
  };

  const toggleQuestionExpansion = (questionId: number) => {
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading exam data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p className="text-lg font-semibold">Error Loading Exam</p>
              <p className="text-sm mt-2">{error}</p>
              <div className="mt-4 space-y-2">
                {error.includes('authorization') || error.includes('Authentication') ? (
                  <Button 
                    onClick={() => window.location.href = '/auth'} 
                    className="w-full"
                    variant="default"
                  >
                    Go to Login
                  </Button>
                ) : (
                  <Button 
                    onClick={() => window.location.reload()} 
                    className="w-full"
                    variant="outline"
                  >
                    Retry
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!examData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">No exam data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Simple Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{examData.title}</h1>
              <p className="text-gray-600">{examData.description}</p>
            </div>
            {/* <div className="flex items-center gap-3">
              <Button
                onClick={handleEditExam}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button
                onClick={handleDeleteExam}
                variant="destructive"
                size="sm"
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div> */}
          </div>
          
          {/* Basic Info */}
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <span>Questions: {examData.questions.length}</span>
            <span>Total Marks: {examData.total_marks}</span>
            <span>Type: {examData.exam_type}</span>
            <span>Subject: {examData.subject}</span>
          </div>
        </div>

        {/* Questions Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Questions ({examData.questions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="w-16 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      #
                    </th>
                    <th className="w-20 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      Marks
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      Question
                    </th>
                    <th className="w-32 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      Graphics
                    </th>
                    <th className="w-32 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      Choices
                    </th>
                    <th className="w-24 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {examData.questions.map((question, index) => (
                    <>
                      <tr key={question.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 border-b border-gray-200">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200">
                          {question.marks}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200">
                          <div className="max-w-md">
                            <p className="text-sm text-gray-900 line-clamp-2">
                              {question.text}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200">
                          {question.graphics ? (
                            <Badge variant="default" className="text-xs">Yes</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">No</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200">
                          <Badge variant="outline" className="text-xs">
                            {question.choices.length} choices
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200">
                          <Button
                            onClick={() => toggleQuestionExpansion(question.id)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                      
                      {/* Expanded Question Details */}
                      {expandedQuestion === question.id && (
                        <tr>
                          <td colSpan={6} className="bg-gray-50 p-4 border-b border-gray-200">
                            <div className="space-y-4">
                              {/* Full Question Text */}
                              <div>
                                <h4 className="font-semibold text-gray-800 mb-2">Full Question:</h4>
                                <p className="text-gray-700 bg-white p-3 rounded border">
                                  {question.text}
                                </p>
                              </div>

                              {/* Question Graphics */}
                              {question.graphics && (
                                <div>
                                  <h4 className="font-semibold text-gray-800 mb-2">Question Graphics:</h4>
                                  <img 
                                    src={question.graphics} 
                                    alt="Question graphic" 
                                    className="max-w-md h-auto rounded border"
                                  />
                                </div>
                              )}

                              {/* Choices Table */}
                              <div>
                                <h4 className="font-semibold text-gray-800 mb-2">Choices:</h4>
                                <div className="bg-white rounded border overflow-hidden">
                                  <table className="w-full">
                                    <thead className="bg-gray-50">
                                      <tr>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Choice
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Text
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Status
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Graphics
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                      {question.choices.map((choice, choiceIndex) => (
                                        <tr key={choice.id} className="hover:bg-gray-50">
                                          <td className="px-3 py-2 text-sm text-gray-500">
                                            {choiceIndex + 1}
                                          </td>
                                          <td className="px-3 py-2 text-sm text-gray-900">
                                            {choice.text}
                                          </td>
                                          <td className="px-3 py-2">
                                            {choice.is_correct ? (
                                              <Badge variant="default" className="text-xs">
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Correct
                                              </Badge>
                                            ) : (
                                              <Badge variant="secondary" className="text-xs">
                                                <XCircle className="h-3 w-3 mr-1" />
                                                Incorrect
                                              </Badge>
                                            )}
                                          </td>
                                          <td className="px-3 py-2">
                                            {choice.graphics ? (
                                              <div className="flex items-center gap-2">
                                                <Badge variant="default" className="text-xs">Yes</Badge>
                                                <img 
                                                  src={choice.graphics} 
                                                  alt="Choice graphic" 
                                                  className="w-8 h-8 object-cover rounded border"
                                                />
                                              </div>
                                            ) : (
                                              <Badge variant="secondary" className="text-xs">No</Badge>
                                            )}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
