'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { Eye, Edit, Trash2, CheckCircle, XCircle, FileText } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

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

interface Section {
  id: number;
  name: string;
  description: string;
  questions: Question[];
}

interface ExamData {
  id: number;
  title: string;
  description: string;
  thumbnail: string | null;
  exam_type: string;
  total_marks: string;
  sections: Section[];
}

export default function AdminExamReviewPage() {
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [isEditQuestionOpen, setIsEditQuestionOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [editQuestionText, setEditQuestionText] = useState('');
  const [editQuestionMarks, setEditQuestionMarks] = useState('1');
  const [editQuestionFile, setEditQuestionFile] = useState<File | null>(null);
  const [isEditChoiceOpen, setIsEditChoiceOpen] = useState(false);
  const [editingChoiceId, setEditingChoiceId] = useState<number | null>(null);
  const [editChoiceText, setEditChoiceText] = useState('');
  const [editChoiceFile, setEditChoiceFile] = useState<File | null>(null);
  const [isDeleteQuestionOpen, setIsDeleteQuestionOpen] = useState(false);
  const [questionToDeleteId, setQuestionToDeleteId] = useState<number | null>(null);
  const [isDeleteChoiceOpen, setIsDeleteChoiceOpen] = useState(false);
  const [choiceToDeleteId, setChoiceToDeleteId] = useState<number | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  // Section management states
  const [isEditSectionOpen, setIsEditSectionOpen] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [editSectionName, setEditSectionName] = useState('');
  const [editSectionDescription, setEditSectionDescription] = useState('');
  const [isDeleteSectionOpen, setIsDeleteSectionOpen] = useState(false);
  const [sectionToDeleteId, setSectionToDeleteId] = useState<number | null>(null);
  const [isDeleteExamOpen, setIsDeleteExamOpen] = useState(false);

  const currentThumbnailUrl = useMemo(() => {
    if (thumbnailFile) {
      return URL.createObjectURL(thumbnailFile);
    }
    return examData?.thumbnail ?? '';
  }, [thumbnailFile, examData?.thumbnail]);

  const refetchExamData = async () => {
    try {
      if (typeof window === 'undefined') return;
      const token = sessionStorage.getItem('Authorization');
      if (!token) throw new Error('No authorization token found. Please login again.');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const examId = sessionStorage.getItem('exam_id_university');
      if (!examId) throw new Error('No exam ID found in session storage.');
      const response = await fetch(`${baseUrl}/api/exams_app/university_exams/exam/${examId}`, {
        headers: { 'Authorization': token, 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setExamData(data);
    } catch (err) {
      console.error('Refetch failed', err);
    }
  };

  // Fetch exam data
  useEffect(() => {
    const fetchExamData = async () => {
      try {
        setLoading(true);
        
        // Check if we're on the client side
        if (typeof window === 'undefined') {
          setLoading(false);
          return;
        }
        
        // Get authorization token
        const token = sessionStorage.getItem('Authorization');
        if (!token) {
          throw new Error('No authorization token found. Please login again.');
        }

        // Replace with your actual base URL
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const examId = sessionStorage.getItem("exam_id_university");
        
        if (!examId) {
          throw new Error('No exam ID found in session storage.');
        }

        const response = await fetch(`${baseUrl}/api/exams_app/university_exams/exam/${examId}`, {
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

  const handleOpenEdit = () => {
    if (!examData) return;
    setEditTitle(examData.title || '');
    setEditDescription(examData.description || '');
    setThumbnailFile(null);
    setIsEditOpen(true);
  };

  const openEditQuestion = (q: Question) => {
    setEditingQuestionId(q.id);
    setEditQuestionText(q.text || '');
    setEditQuestionMarks(q.marks?.toString?.() || '1');
    setEditQuestionFile(null);
    setIsEditQuestionOpen(true);
  };

  const saveEditedQuestion = async () => {
    try {
      if (!editingQuestionId) return;
      if (typeof window === 'undefined') return;
      const token = sessionStorage.getItem('Authorization');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!token || !baseUrl) throw new Error('Missing auth or base URL');

      const form = new FormData();
      form.append('text', editQuestionText);
      form.append('marks', editQuestionMarks);
      if (editQuestionFile) {
        form.append('graphics', editQuestionFile);
      }

      const res = await fetch(`${baseUrl}/api/exams_app/questions/${editingQuestionId}/edit/`, {
        method: 'PUT',
        headers: { 'Authorization': token },
        body: form,
      });
      if (!res.ok) throw new Error(`Failed to update question (${res.status})`);
      const updated = await res.json();

      setExamData(prev => prev ? ({
        ...prev,
        sections: prev.sections.map(section => ({
          ...section,
          questions: section.questions.map(q => q.id === editingQuestionId ? ({
            ...q,
            text: updated.text ?? editQuestionText,
            marks: updated.marks ?? editQuestionMarks,
            graphics: updated.graphics ?? (editQuestionFile ? q.graphics : q.graphics)
          }) : q)
        }))
      }) : prev);

      setIsEditQuestionOpen(false);
      toast.success('Question updated successfully');
      await refetchExamData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update question';
      toast.error(message);
    }
  };

  const deleteQuestion = async (questionId: number) => {
    try {
      if (typeof window === 'undefined') return;
      const token = sessionStorage.getItem('Authorization');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!token || !baseUrl) throw new Error('Missing auth or base URL');
      const res = await fetch(`${baseUrl}/api/exams_app/questions/${questionId}/delete/`, {
        method: 'DELETE',
        headers: { 'Authorization': token },
      });
      if (!res.ok) throw new Error(`Failed to delete question (${res.status})`);
      setExamData(prev => prev ? ({
        ...prev,
        sections: prev.sections.map(section => ({
          ...section,
          questions: section.questions.filter(q => q.id !== questionId)
        }))
      }) : prev);
      toast.success('Question deleted');
      await refetchExamData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete question');
    }
  };

  const openEditChoice = (choice: Choice) => {
    setEditingChoiceId(choice.id);
    setEditChoiceText(choice.text || '');
    setEditChoiceFile(null);
    setIsEditChoiceOpen(true);
  };

  const saveEditedChoice = async () => {
    try {
      if (!editingChoiceId) return;
      if (typeof window === 'undefined') return;
      const token = sessionStorage.getItem('Authorization');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!token || !baseUrl) throw new Error('Missing auth or base URL');

      const form = new FormData();
      form.append('text', editChoiceText);
      if (editChoiceFile) form.append('graphics', editChoiceFile);

      const res = await fetch(`${baseUrl}/api/exams_app/choices/${editingChoiceId}/edit/`, {
        method: 'PUT',
        headers: { 'Authorization': token },
        body: form,
      });
      if (!res.ok) throw new Error(`Failed to update choice (${res.status})`);
      const updated = await res.json();

      setExamData(prev => prev ? ({
        ...prev,
        sections: prev.sections.map(section => ({
          ...section,
          questions: section.questions.map(q => ({
            ...q,
            choices: q.choices.map(c => c.id === editingChoiceId ? ({
              ...c,
              text: updated.text ?? editChoiceText,
              graphics: updated.graphics ?? (editChoiceFile ? c.graphics : c.graphics)
            }) : c)
          }))
        }))
      }) : prev);
      setIsEditChoiceOpen(false);
      toast.success('Choice updated successfully');
      await refetchExamData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update choice');
    }
  };

  const deleteChoice = async (choiceId: number) => {
    try {
      if (typeof window === 'undefined') return;
      const token = sessionStorage.getItem('Authorization');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!token || !baseUrl) throw new Error('Missing auth or base URL');
      const res = await fetch(`${baseUrl}/api/exams_app/choices/${choiceId}/delete/`, {
        method: 'DELETE',
        headers: { 'Authorization': token },
      });
      if (!res.ok) throw new Error(`Failed to delete choice (${res.status})`);
      setExamData(prev => prev ? ({
        ...prev,
        sections: prev.sections.map(section => ({
          ...section,
          questions: section.questions.map(q => ({
            ...q,
            choices: q.choices.filter(c => c.id !== choiceId)
          }))
        }))
      }) : prev);
      toast.success('Choice deleted');
      await refetchExamData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete choice');
    }
  };

  const handleDragOverThumb = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeaveThumb = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDropThumb = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      setThumbnailFile(files[0]);
    }
  };

  const openFilePicker = () => fileInputRef.current?.click();

  const handleSaveEdit = async () => {
    try {
      if (!examData) return;
      if (typeof window === 'undefined') return;
      setIsSaving(true);

      const token = sessionStorage.getItem('Authorization');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const examId = sessionStorage.getItem('exam_id_university');
      if (!token || !examId || !baseUrl) {
        throw new Error('Missing auth, exam id, or base URL');
      }

      const formData = new FormData();
      formData.append('title', editTitle);
      formData.append('description', editDescription);
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }

      const response = await fetch(`${baseUrl}/api/exams_app/track-exams/${examId}/edit/`, {
        method: 'PUT',
        headers: {
          'Authorization': token
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Failed to update exam. Status ${response.status}`);
      }

      const updated = await response.json();
      setExamData(prev => prev ? ({
        ...prev,
        title: updated.title ?? editTitle,
        description: updated.description ?? editDescription,
        thumbnail: updated.thumbnail ?? (thumbnailFile ? currentThumbnailUrl : prev.thumbnail)
      }) : prev);
      setIsEditOpen(false);
      await refetchExamData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update exam';
      alert(message);
    } finally {
      setIsSaving(false);
    }
  };

  // Section management functions
  const openEditSection = (section: Section) => {
    setEditingSectionId(section.id);
    setEditSectionName(section.name || '');
    setEditSectionDescription(section.description || '');
    setIsEditSectionOpen(true);
  };

  const saveEditedSection = async () => {
    try {
      if (!editingSectionId) return;
      if (typeof window === 'undefined') return;
      const token = sessionStorage.getItem('Authorization');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!token || !baseUrl) throw new Error('Missing auth or base URL');

      const formData = new FormData();
      formData.append('name', editSectionName);
      formData.append('description', editSectionDescription);

      const response = await fetch(`${baseUrl}/api/exams_app/university-exam-sections/${editingSectionId}/`, {
        method: 'PUT',
        headers: { 'Authorization': token },
        body: formData
      });

      if (!response.ok) throw new Error(`Failed to update section (${response.status})`);

      const updated = await response.json();
      setExamData(prev => prev ? ({
        ...prev,
        sections: prev.sections.map(s => s.id === editingSectionId ? ({
          ...s,
          name: updated.name ?? editSectionName,
          description: updated.description ?? editSectionDescription
        }) : s)
      }) : prev);

      setIsEditSectionOpen(false);
      toast.success('Section updated successfully');
      await refetchExamData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update section';
      toast.error(message);
    }
  };

  const deleteSection = async (sectionId: number) => {
    try {
      if (typeof window === 'undefined') return;
      const token = sessionStorage.getItem('Authorization');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!token || !baseUrl) throw new Error('Missing auth or base URL');

      const response = await fetch(`${baseUrl}/api/exams_app/university-exam-sections/${sectionId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': token }
      });

      if (!response.ok) throw new Error(`Failed to delete section (${response.status})`);

      setExamData(prev => prev ? ({
        ...prev,
        sections: prev.sections.filter(s => s.id !== sectionId)
      }) : prev);

      toast.success('Section deleted successfully');
      await refetchExamData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete section');
    }
  };

  const deleteExam = async () => {
    try {
      if (!examData) return;
      if (typeof window === 'undefined') return;
      const token = sessionStorage.getItem('Authorization');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!token || !baseUrl) throw new Error('Missing auth or base URL');

      const response = await fetch(`${baseUrl}/api/exams_app/university_exams/exam/${examData.id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': token }
      });

      if (!response.ok) throw new Error(`Failed to delete exam (${response.status})`);

      toast.success('Exam deleted successfully');
      // Redirect back to the exam list
      window.location.href = '/dashboard/track-list/track/university/university-cards/all-tests';
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete exam');
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
            <div className="flex items-center gap-4">
            {examData.thumbnail && (
                <img
                  src={examData.thumbnail}
                  alt="Exam thumbnail"
                  className="w-12 h-12 object-cover rounded border"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{examData.title}</h1>
                <p className="text-gray-600">{examData.description}</p>
              </div>
             
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleOpenEdit}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button
                onClick={() => setIsDeleteExamOpen(true)}
                variant="destructive"
                size="sm"
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
          
          {/* Basic Info */}
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <span>Sections: {examData.sections?.length || 0}</span>
            <span>Questions: {examData.sections?.reduce((total, section) => total + (section.questions?.length || 0), 0) || 0}</span>
            <span>Total Marks: {examData.total_marks}</span>
            <span>Type: {examData.exam_type}</span>
            <span>Subject: {typeof window !== 'undefined' ? sessionStorage.getItem("subject_name") : ''}</span>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {examData.sections && examData.sections.length > 0 ? (
            examData.sections.map((section, sectionIndex) => (
            <Card key={section.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {section.name} ({section.questions.length} questions)
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => openEditSection(section)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit Section
                    </Button>
                    <Button
                      onClick={() => { setSectionToDeleteId(section.id); setIsDeleteSectionOpen(true); }}
                      variant="destructive"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Section
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{section.description}</p>
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
                        <th className="w-36 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {section.questions.map((question, index) => (
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
                                <div className="flex items-center gap-2">
                                  <Badge variant="default" className="text-xs">Yes</Badge>
                                  <img 
                                    src={question.graphics} 
                                    alt="Question graphic" 
                                    className="w-8 h-8 object-cover rounded border"
                                  />
                                </div>
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
                              <div className="flex items-center gap-1">
                                <Button
                                  onClick={() => toggleQuestionExpansion(question.id)}
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  title="View"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => openEditQuestion(question)}
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  title="Edit"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => { setQuestionToDeleteId(question.id); setIsDeleteQuestionOpen(true); }}
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-red-600"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
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
                                  <p className="text-gray-700 ">
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
                                      className="h-16 w-16 rounded object-cover rounded "
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
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                                            <td className="px-3 py-2">
                                              <div className="flex items-center gap-1">
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Edit" onClick={() => openEditChoice(choice)}>
                                                  <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600" title="Delete" onClick={() => { setChoiceToDeleteId(choice.id); setIsDeleteChoiceOpen(true); }}>
                                                  <Trash2 className="h-4 w-4" />
                                                </Button>
                                              </div>
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
          ))
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-gray-500">
                  <p>No sections available for this exam.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)}>
          <div className="space-y-4">
            <div className="-mx-6 -mt-6 px-6 py-3 bg-green-600 text-white rounded-t">
              <h3 className="text-lg font-semibold">Edit Exam</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Enter exam title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Enter description"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="thumbnail">Thumbnail</Label>
              <div
                className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
                  isDragOver ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
                onDragOver={handleDragOverThumb}
                onDragLeave={handleDragLeaveThumb}
                onDrop={handleDropThumb}
                onClick={openFilePicker}
              >
                <input
                  ref={fileInputRef}
                  id="thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbnailFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                  className="hidden"
                />
                <p className="text-sm text-gray-600">Drag and drop image here, or click to browse.</p>
                {thumbnailFile && (
                  <p className="mt-2 text-xs text-gray-700">Selected: {thumbnailFile.name}</p>
                )}
              </div>
              {currentThumbnailUrl && (
                <img
                  src={currentThumbnailUrl}
                  alt="Thumbnail preview"
                  className="w-28 h-28 object-cover rounded border mt-2"
                />
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={isSaving}>Cancel</Button>
              <Button onClick={handleSaveEdit} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </Modal>
        <Modal isOpen={isDeleteQuestionOpen} onClose={() => setIsDeleteQuestionOpen(false)}>
          <div className="space-y-4">
            <div className="-mx-6 -mt-6 px-6 py-3 bg-red-600 text-white rounded-t">
              <h3 className="text-lg font-semibold">Delete Question</h3>
            </div>
            <p>Are you sure you want to delete this question? This action cannot be undone.</p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsDeleteQuestionOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={async () => { if (questionToDeleteId) { await deleteQuestion(questionToDeleteId); } setIsDeleteQuestionOpen(false); }}>
                Delete
              </Button>
            </div>
          </div>
        </Modal>
        <Modal isOpen={isDeleteChoiceOpen} onClose={() => setIsDeleteChoiceOpen(false)}>
          <div className="space-y-4">
            <div className="-mx-6 -mt-6 px-6 py-3 bg-red-600 text-white rounded-t">
              <h3 className="text-lg font-semibold">Delete Choice</h3>
            </div>
            <p>Are you sure you want to delete this choice?</p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsDeleteChoiceOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={async () => { if (choiceToDeleteId) { await deleteChoice(choiceToDeleteId); } setIsDeleteChoiceOpen(false); }}>
                Delete
              </Button>
            </div>
          </div>
        </Modal>
        <Modal isOpen={isEditChoiceOpen} onClose={() => setIsEditChoiceOpen(false)}>
          <div className="space-y-4">
            <div className="-mx-6 -mt-6 px-6 py-3 bg-indigo-600 text-white rounded-t">
              <h3 className="text-lg font-semibold">Edit Choice</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="c_text">Choice Text</Label>
              <Textarea id="c_text" rows={3} value={editChoiceText} onChange={(e) => setEditChoiceText(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c_graphics">Graphics (optional)</Label>
              <Input id="c_graphics" type="file" accept="image/*" onChange={(e) => setEditChoiceFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsEditChoiceOpen(false)}>Cancel</Button>
              <Button onClick={saveEditedChoice}>Save</Button>
            </div>
          </div>
        </Modal>
        <Modal isOpen={isEditQuestionOpen} onClose={() => setIsEditQuestionOpen(false)}>
          <div className="space-y-4">
            <div className="-mx-6 -mt-6 px-6 py-3 bg-blue-600 text-white rounded-t">
              <h3 className="text-lg font-semibold">Edit Question</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="q_text">Question Text</Label>
              <Textarea id="q_text" rows={4} value={editQuestionText} onChange={(e) => setEditQuestionText(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="q_marks">Marks</Label>
              <Input id="q_marks" type="number" value={editQuestionMarks} onChange={(e) => setEditQuestionMarks(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="q_graphics">Graphics (optional)</Label>
              <Input id="q_graphics" type="file" accept="image/*" onChange={(e) => setEditQuestionFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsEditQuestionOpen(false)}>Cancel</Button>
              <Button onClick={saveEditedQuestion}>Save</Button>
            </div>
          </div>
        </Modal>

        {/* Section Edit Modal */}
        <Modal isOpen={isEditSectionOpen} onClose={() => setIsEditSectionOpen(false)}>
          <div className="space-y-4">
            <div className="-mx-6 -mt-6 px-6 py-3 bg-purple-600 text-white rounded-t">
              <h3 className="text-lg font-semibold">Edit Section</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="section_name">Section Name</Label>
              <Input
                id="section_name"
                value={editSectionName}
                onChange={(e) => setEditSectionName(e.target.value)}
                placeholder="Enter section name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="section_description">Description</Label>
              <Textarea
                id="section_description"
                value={editSectionDescription}
                onChange={(e) => setEditSectionDescription(e.target.value)}
                placeholder="Enter section description"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsEditSectionOpen(false)}>Cancel</Button>
              <Button onClick={saveEditedSection}>Save</Button>
            </div>
          </div>
        </Modal>

        {/* Section Delete Modal */}
        <Modal isOpen={isDeleteSectionOpen} onClose={() => setIsDeleteSectionOpen(false)}>
          <div className="space-y-4">
            <div className="-mx-6 -mt-6 px-6 py-3 bg-red-600 text-white rounded-t">
              <h3 className="text-lg font-semibold">Delete Section</h3>
            </div>
            <p>Are you sure you want to delete this section? This action cannot be undone and will also delete all questions in this section.</p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsDeleteSectionOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={async () => { if (sectionToDeleteId) { await deleteSection(sectionToDeleteId); } setIsDeleteSectionOpen(false); }}>
                Delete
              </Button>
            </div>
          </div>
        </Modal>

        {/* Exam Delete Modal */}
        <Modal isOpen={isDeleteExamOpen} onClose={() => setIsDeleteExamOpen(false)}>
          <div className="space-y-4">
            <div className="-mx-6 -mt-6 px-6 py-3 bg-red-600 text-white rounded-t">
              <h3 className="text-lg font-semibold">Delete Exam</h3>
            </div>
            <p>Are you sure you want to delete this exam? This action cannot be undone and will delete all sections, questions, and choices.</p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsDeleteExamOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={async () => { await deleteExam(); setIsDeleteExamOpen(false); }}>
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
