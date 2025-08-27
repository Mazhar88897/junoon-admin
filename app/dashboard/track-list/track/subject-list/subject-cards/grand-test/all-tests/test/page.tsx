'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

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
  total_marks: string;
  title: string;
  description: string;
  exam_type: string;
  subject: number;
  thumbnail: string | null;
}

export default function AdminExamReviewPage() {
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem('Authorization');
        if (!token) throw new Error('No authorization token found.');

        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const examId = sessionStorage.getItem('exam_id_grand_test');
        if (!examId) throw new Error('No exam ID found in session storage.');

        const response = await fetch(`${baseUrl}/api/exams_app/questions/by-trackexam?track_exam_id=${examId}`, {
          headers: { 'Authorization': token, 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

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

  const handleEditQuestion = (questionId: number) => console.log('Edit question', questionId);
  const handleDeleteQuestion = (questionId: number) => {
    if (confirm('Are you sure you want to delete this question?')) console.log('Delete question', questionId);
  };
  const handleEditChoice = (choiceId: number) => console.log('Edit choice', choiceId);
  const handleDeleteChoice = (choiceId: number) => {
    if (confirm('Are you sure you want to delete this choice?')) console.log('Delete choice', choiceId);
  };

  if (loading) return <p className="text-center mt-10">Loading exam...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;
  if (!examData) return <p className="text-center mt-10">No exam data available.</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Exam Header */}
        {/* <Card className="shadow-lg rounded-2xl overflow-hidden">
          {examData.thumbnail && (
            <img
              src={examData.thumbnail}
              alt="Exam thumbnail"
              className="w-full h-48 object-cover"
            />
          )}
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold text-gray-800">{examData.title}</h1>
            <p className="text-gray-600 mt-1">{examData.description}</p>
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mt-2">
              <span>Questions: {examData.questions.length}</span>
              <span>Total Marks: {examData.total_marks}</span>
              <span>Type: {examData.exam_type}</span>
              <span>Subject: {examData.subject}</span>
            </div>
          </CardContent>
        </Card> */}

        <div className="w-full rounded-2xl shadow-md overflow-hidden bg-white border">
      <div className="flex flex-col md:flex-row">
        {/* Left Image */}
        {examData.thumbnail && (
          <div className="w-full md:w-60 h-48 md:h-auto">
            <img
              src={examData.thumbnail}
              alt={examData.title}
              className="object-cover w-full h-full"
            />
          </div>
        )}

        {/* Right Content */}
        <div className="p-6 flex flex-col justify-start flex-1">
          <h5 className="text-2xl font-bold text-gray-900">{examData.title}</h5>

          {/* Description */}
          {examData.description && (
            <div
              className={`text-base text-gray-600 mt-3 leading-relaxed transition-all duration-300 ${
                expanded ? "line-clamp-none" : "line-clamp-1"
              }`}
              dangerouslySetInnerHTML={{ __html: examData.description }}
            />
          )}

          {/* Toggle Button */}
          {examData.description && (
            <button
              className="text-sm text-blue-600 mt-2 hover:underline self-start"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "See less" : "See more"}
            </button>
          )}

          {/* Basic Info */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-4">
            <span>Questions: {examData.questions.length}</span>
            <span>Total Marks: {examData.total_marks}</span>
            <span>Type: {examData.exam_type}</span>
            <span>Subject: {examData.subject}</span>
          </div>
        </div>
      </div>
    </div>


        {/* All Questions Expanded */}
        <div className="space-y-4">
          {examData.questions.map((question, index) => (
            <Card key={question.id} className="shadow-md rounded-2xl">
              <CardContent>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{index + 1}. {question.text}</h3>
                    <p className="text-sm text-gray-500 mt-1">Marks: {question.marks}</p>
                    {question.graphics && (
                      <img src={question.graphics} alt="Question graphic" className="max-w-md mt-2 rounded border" />
                    )}
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <Button size="sm" variant="outline" onClick={() => handleEditQuestion(question.id)}>
                      <Edit size={14} /> Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteQuestion(question.id)}>
                      <Trash2 size={14} /> Delete
                    </Button>
                  </div>
                </div>

                {/* Choices */}
                <div className="mt-4 space-y-2">
                  {question.choices.length > 0 ? (
                    question.choices.map((choice, idx) => (
                      <div key={choice.id} className="flex justify-between items-center p-2 border rounded bg-gray-50">
                        <div className="flex items-center gap-2">
                          {choice.graphics && <img src={choice.graphics} className="w-8 h-8 rounded" />}
                          <span>{choice.text}</span>
                          {choice.is_correct && <Badge variant="default" className="ml-2">Correct</Badge>}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditChoice(choice.id)}>
                            <Edit size={12} />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteChoice(choice.id)}>
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No choices available for this question.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
