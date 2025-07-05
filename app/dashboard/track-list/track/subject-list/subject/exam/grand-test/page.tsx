"use client"
import React, { useState, useEffect } from "react";

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
    marks: "",
    graphics: null,
    choices: []
  });

  const [currentChoice, setCurrentChoice] = useState<Choice>({
    text: "",
    is_correct: false,
    graphics: null
  });

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
    if (currentQuestion.text.trim() && currentQuestion.choices.length > 0) {
      setFormData(prev => ({
        ...prev,
        questions: [...prev.questions, { ...currentQuestion }],
        total_marks: (parseFloat(prev.total_marks) + parseFloat(currentQuestion.marks)).toString()
      }));
      setCurrentQuestion({
        text: "",
        marks: "",
        graphics: null,
        choices: []
      });
    }
  };

  const removeQuestion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
      total_marks: (parseFloat(prev.total_marks) - parseFloat(prev.questions[index].marks)).toString()
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      title: formData.title,
      description: formData.description,
      exam_type: "grand",
      thumbnail: null,
      subject: formData.subject,
      track: formData.track,
      total_marks: 1,
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
    
      const response = await fetch('https://junoon-vatb.onrender.com/api/exams_app/track-exams/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token// Uncomment if token is needed
        },
        body: JSON.stringify(submitData),
      });
      
      if (response.ok) {
        alert('Exam created successfully!');
        // Optionally redirect or clear form
      } else {
        const errorData = await response.json();
        alert(`Failed to create exam: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error creating exam');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <h2 className="text-xl font-semibold mb-4">Exam Information</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Subject</label>
            <p className="mt-1 text-gray-900">{sessionData.subjectName}</p>
            <p className="text-sm text-gray-500">ID: {sessionData.subjectId}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Subject Description</label>
            <p className="mt-1 text-gray-900">{sessionData.subjectDescription}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Track ID</label>
            <p className="mt-1 text-gray-900">{sessionData.trackId}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Exam Type</label>
            <p className="mt-1 text-gray-900">Grand Exam</p>
          </div>
        </div>

        <div>
          <label className="block mb-2">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-2">Thumbnail</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="border p-4 rounded">
          <h3 className="text-lg font-semibold mb-4">Add Question</h3>
          <div className="space-y-4">
            <div>
              <label className="block mb-2">Question Text</label>
              <input
                type="text"
                value={currentQuestion.text}
                onChange={(e) => setCurrentQuestion(prev => ({ ...prev, text: e.target.value }))}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block mb-2">Marks</label>
              <input
                type="number"
                step="0.01"
                value={currentQuestion.marks}
                onChange={(e) => setCurrentQuestion(prev => ({ ...prev, marks: e.target.value }))}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block mb-2">Add Choice</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentChoice.text}
                  onChange={(e) => setCurrentChoice(prev => ({ ...prev, text: e.target.value }))}
                  className="flex-1 p-2 border rounded"
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={currentChoice.is_correct}
                    onChange={(e) => setCurrentChoice(prev => ({ ...prev, is_correct: e.target.checked }))}
                  />
                  Correct
                </label>
                <button
                  type="button"
                  onClick={addChoice}
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Add Choice
                </button>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="font-semibold mb-2">Current Choices:</h4>
              <ul className="space-y-2">
                {currentQuestion.choices.map((choice, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span>{choice.text}</span>
                    {choice.is_correct && <span className="text-green-500">(Correct)</span>}
                    <button
                      type="button"
                      onClick={() => removeChoice(index)}
                      className="px-2 py-1 bg-red-500 text-white rounded"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={addQuestion}
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              Add Question
            </button>
          </div>
        </div>

        <div className="border p-4 rounded">
          <h3 className="text-lg font-semibold mb-4">Added Questions</h3>
          <div className="space-y-4">
            {formData.questions.map((question, index) => (
              <div key={index} className="border p-4 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{question.text}</p>
                    <p className="text-sm text-gray-600">Marks: {question.marks}</p>
                    <ul className="mt-2">
                      {question.choices.map((choice, cIndex) => (
                        <li key={cIndex} className="text-sm">
                          {choice.text} {choice.is_correct && "(Correct)"}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeQuestion(index)}
                    className="px-2 py-1 bg-red-500 text-white rounded"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xl font-semibold">
          Total Marks: {formData.total_marks}
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-500 text-white rounded"
        >
          Create Exam
        </button>
      </form>
    </div>
  );
};

export default Page;


// 'use client';

// import React from 'react';

// const PostExamButton = () => {
//   const handleClick = async () => {
//     const payload = {
//       id: 18,
//       title: "10th Maths Grand Exam PP new 22 may",
//       description: "Mock grand exam",
//       exam_type: "grand",
//       thumbnail: null,
//       subject: 5,
//       track: 2,
//       chapter: null,
//       topic: null,
//       total_marks: "2.00",
//       questions: [
//         {
//           id: 39,
//           text: "What is the opposite of long?",
//           graphics: null,
//           marks: "1.00",
//           choices: [
//             { id: 89, text: "live", is_correct: false, graphics: null },
//             { id: 90, text: "bla", is_correct: false, graphics: null },
//             { id: 91, text: "apple", is_correct: false, graphics: null },
//             { id: 92, text: "short", is_correct: true, graphics: null }
//           ]
//         },
//         {
//           id: 40,
//           text: "What is apple?",
//           graphics: null,
//           marks: "1.00",
//           choices: [
//             { id: 93, text: "live", is_correct: false, graphics: null },
//             { id: 94, text: "bla", is_correct: false, graphics: null },
//             { id: 95, text: "vegetable", is_correct: false, graphics: null },
//             { id: 96, text: "fruit", is_correct: true, graphics: null }
//           ]
//         }
//       ]
//     };

//     try {
//         const token = sessionStorage.getItem('Authorization');
//         if (!token) {
//           throw new Error('No authorization token found');
//         }

//       const response = await fetch('https://junoon-vatb.onrender.com/api/exams_app/track-exams/create/', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': token// Uncomment if token is needed
//         },
//         body: JSON.stringify(payload)
//       });

//       const result = await response.json();
//       console.log('Success:', result);

//       if (!response.ok) {
//         throw new Error(JSON.stringify(result));
//       }

//       alert('Exam created successfully!');
//     } catch (error) {
//       console.error('Error:', error);
//       alert('Failed to create exam');
//     }
//   };

//   return (
//     <button onClick={handleClick} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
//       Create Exam
//     </button>
//   );
// };

// export default PostExamButton;
