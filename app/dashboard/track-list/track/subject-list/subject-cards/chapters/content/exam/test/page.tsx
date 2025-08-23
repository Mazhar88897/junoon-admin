"use client"
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

// Toast component
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-0 ${
      type === 'success' 
        ? 'bg-green-500 text-white' 
        : 'bg-red-500 text-white'
    }`}>
      <div className="flex items-center space-x-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {type === 'success' ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          )}
        </svg>
        <span className="font-medium">{message}</span>
        <button onClick={onClose} className="ml-2 hover:opacity-80">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

interface Choice {
  text: string;
  is_correct: boolean;
  graphics: null;
}

interface Question {
  text: string;
  marks: string;
  graphics: null;
  choices: Choice[];
}

interface FormData {
  title: string;
  description: string;
  exam_type: string;
  thumbnail: File | null;
  subject: string;
  track: string;
  total_marks: string;
  questions: Question[];
}

const Page = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    exam_type: "grand",
    thumbnail: null,
    subject: "",
    track: "",
    total_marks: "0",
    questions: []
  });

  const [sessionData, setSessionData] = useState({
    subjectId: "",
    subjectName: "",
    subjectDescription: "",
    trackId: ""
  });

  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    text: "",
    marks: "1",
    graphics: null,
    choices: []
  });

  const [currentChoice, setCurrentChoice] = useState<Choice>({
    text: "",
    is_correct: false,
    graphics: null
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const subjectId = sessionStorage.getItem("id_subject");
    const subjectName = sessionStorage.getItem("subject_name");
    const subjectDescription = sessionStorage.getItem("subject_description");
    const trackId = sessionStorage.getItem("id_track");

    setSessionData({
      subjectId: subjectId || "",
      subjectName: subjectName || "",
      subjectDescription: subjectDescription || "",
      trackId: trackId || ""
    });

    setFormData(prev => ({
      ...prev,
      subject: subjectId || "",
      track: trackId || ""
    }));
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        thumbnail: e.target.files![0]
      }));
    }
  };

  const addChoice = () => {
    if (currentChoice.text.trim()) {
      setCurrentQuestion(prev => ({
        ...prev,
        choices: [...prev.choices, { ...currentChoice }]
      }));
      setCurrentChoice({
        text: "",
        is_correct: false,
        graphics: null
      });
    }
  };

  const removeChoice = (index: number) => {
    setCurrentQuestion(prev => ({
      ...prev,
      choices: prev.choices.filter((_, i) => i !== index)
    }));
  };

  const addQuestion = () => {
    // Check if question text is provided
    if (!currentQuestion.text.trim()) {
      setToast({ message: "Please enter question text", type: 'error' });
      return;
    }

    // Check if there are at least 2 choices
    if (currentQuestion.choices.length < 2) {
      setToast({ message: "Please add at least 2 options for the question", type: 'error' });
      return;
    }

    // Check if at least one choice is marked as correct
    const hasCorrectChoice = currentQuestion.choices.some(choice => choice.is_correct);
    if (!hasCorrectChoice) {
      setToast({ message: "Please mark at least one option as correct", type: 'error' });
      return;
    }

    // Check if marks are provided
    if (!currentQuestion.marks || parseFloat(currentQuestion.marks) <= 0) {
      setToast({ message: "Please enter valid marks for the question", type: 'error' });
      return;
    }

    // All validations passed, add the question
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, { ...currentQuestion }],
      total_marks: Math.ceil(parseFloat(prev.total_marks) + parseFloat(currentQuestion.marks)).toString()
    }));
    setCurrentQuestion({
      text: "",
      marks: "",
      graphics: null,
      choices: []
    });
    setToast({ message: "Question added successfully!", type: 'success' });
  };

  const removeQuestion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
      total_marks: Math.ceil(parseFloat(prev.total_marks) - parseFloat(prev.questions[index].marks)).toString()
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const is_practice_exam = sessionStorage.getItem("is_practice_exam_chapter_test");
    const submitData = {
      title: formData.title,
      description: formData.description,
      exam_type: "chapter",
      thumbnail: null,
      subject: sessionStorage.getItem("id_subject"),
      track: sessionStorage.getItem("id_track"),
      total_marks: 1,
      is_practice_exam: is_practice_exam,
      questions: formData.questions.map((q, index) => ({
        id: 37 + index,
        text: q.text,
        marks: 1,
        graphics: null,
        choices: q.choices.map((c, cIndex) => ({
          id: 81 + (index * 4) + cIndex,
          text: c.text,
          is_correct: c.is_correct,
          graphics: null
        }))
      }))
    };

    try {
        const token = sessionStorage.getItem('Authorization');
           if (!token) {
              throw new Error('No authorization token found');
              }
    
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/exams_app/track-exams/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(submitData),
      });
      
      if (response.ok) {
        setToast({ message: "Exam created successfully!", type: 'success' });
        router.push(`/dashboard/track-list/track/subject-list/subject-cards/chapters/content/exam/all-tests`);
        setFormData({
          title: "",
          description: "",
          exam_type: "grand",
          thumbnail: null,
          subject: formData.subject,
          track: formData.track,
          total_marks: "0",
          questions: []
        });
      } else {
        const errorData = await response.json();
        setToast({ message: `Failed to create exam: ${errorData.message || 'Unknown error'}`, type: 'error' });
      }
    } catch (error) {
      console.error('Error:', error);
      setToast({ message: 'Error creating exam', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <div className="max-w-5xl mx-auto px-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">{sessionStorage.getItem("is_practice_exam_chapter_test")==="true" ? "Practice" : "" } Chapter Exam Creation</h1>
            <p className="text-gray-600 text-lg">Create comprehensive exams for your students</p>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Subject</h3>
                  <p className="text-gray-900 text-lg font-bold">{sessionData.subjectName}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Chapter</h3>
                  <p className="text-gray-900 text-lg font-bold">{sessionStorage.getItem("chapter_name")}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Description</h3>
                  <p className="text-gray-800 text-sm leading-relaxed line-clamp-2" dangerouslySetInnerHTML={{ __html: sessionStorage.getItem("chapter_description") || "" }}></p>
                </div>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <svg className="w-7 h-7 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter exam title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Thumbnail</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                rows={4}
                placeholder="Enter exam description"
                required
              />
            </div>
          </div>

          {/* Add Question Section */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <svg className="w-7 h-7 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Add New Question
            </h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Question Text *</label>
                  <input
                    type="text"
                    value={currentQuestion.text}
                    onChange={(e) => setCurrentQuestion(prev => ({ ...prev, text: e.target.value }))}
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your question"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Marks *</label>
                  <input
                    type="number"
                    step="1.0"
                    value={currentQuestion.marks}
                    onChange={(e) => setCurrentQuestion(prev => ({ ...prev, marks: e.target.value }))}
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <label className="block text-sm font-semibold text-gray-700 mb-4">Add Choice *</label>
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <input
                    type="text"
                    value={currentChoice.text}
                    onChange={(e) => setCurrentChoice(prev => ({ ...prev, text: e.target.value }))}
                    className="flex-1 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter choice text"
                  />
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentChoice.is_correct}
                        onChange={(e) => setCurrentChoice(prev => ({ ...prev, is_correct: e.target.checked }))}
                        className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Correct</span>
                    </label>
                    <button
                      type="button"
                      onClick={addChoice}
                      className="p-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m6 0H6" />
                      </svg>
                      {/* <span>Add</span> */}
                    </button>
                  </div>
                </div>
                
                {/* Helper Text */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700">
                    <strong>Requirements:</strong> Add at least 2 options and mark at least 1 as correct to add the question.
                  </p>
                </div>
              </div>

              {/* Current Choices Display */}
              {currentQuestion.choices.length > 0 && (
                <div className="bg-blue-50 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Current Choices ({currentQuestion.choices.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentQuestion.choices.map((choice, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-200">
                        <div className="flex items-center space-x-3">
                          <span className="text-gray-800 font-medium">{choice.text}</span>
                          {choice.is_correct && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Correct
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeChoice(index)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200"
                          title="Remove choice"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {/* Validation Status */}
                  <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-2 text-sm">
                      <div className={`w-3 h-3 rounded-full ${currentQuestion.choices.length >= 2 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className={currentQuestion.choices.length >= 2 ? 'text-green-700' : 'text-red-700'}>
                        {currentQuestion.choices.length >= 2 ? '✓' : '✗'} At least 2 options required ({currentQuestion.choices.length}/2)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm mt-2">
                      <div className={`w-3 h-3 rounded-full ${currentQuestion.choices.some(c => c.is_correct) ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className={currentQuestion.choices.some(c => c.is_correct) ? 'text-green-700' : 'text-red-700'}>
                        {currentQuestion.choices.some(c => c.is_correct) ? '✓' : '✗'} At least 1 correct option required
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={addQuestion}
                  className="px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 flex items-center space-x-3 shadow-lg hover:shadow-xl font-semibold"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add Question</span>
                </button>
              </div>
            </div>
          </div>

          {/* Added Questions Section */}
          {formData.questions.length > 0 && (
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <svg className="w-7 h-7 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Added Questions ({formData.questions.length})
              </h3>
              
              <div className="space-y-4">
                {formData.questions.map((question, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-800 text-sm font-bold rounded-full">
                            {index + 1}
                          </span>
                          <p className="font-semibold text-gray-800 text-lg">{question.text}</p>
                        </div>
                        <div className="flex items-center space-x-4 mb-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {Math.ceil(parseFloat(question.marks))} marks
                          </span>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {question.choices.length} choices
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {question.choices.map((choice, cIndex) => (
                            <div key={cIndex} className="flex items-center space-x-2 text-sm">
                              <span className={`w-3 h-3 rounded-full ${choice.is_correct ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                              <span className={`${choice.is_correct ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                                {choice.text}
                              </span>
                              {choice.is_correct && (
                                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeQuestion(index)}
                        className="p-3 text-red-600 hover:bg-red-100 rounded-xl transition-all duration-200 ml-4"
                        title="Remove question"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Total Marks Display */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white text-center shadow-lg">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-2xl font-bold">Total Marks</h3>
            </div>
            <p className="text-4xl font-bold">{Math.ceil(parseFloat(formData.total_marks) || 0)}</p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="px-12 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-2xl hover:from-green-700 hover:to-blue-700 transition-all duration-300 flex items-center space-x-3 shadow-lg hover:shadow-xl font-bold text-lg transform hover:scale-105"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Create Exam</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Page;