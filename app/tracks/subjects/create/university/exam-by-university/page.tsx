"use client"
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';

interface Choice {
  text: string;
  is_correct: boolean;
  graphics: null;
}

interface Question {
  text: string;
  graphics: null;
  marks: string;
  choices: Choice[];
}

interface Section {
  name: string;
  description: string;
  questions: Question[];
}

interface FormData {
  title: string;
  description: string;
  exam_type: string;
  thumbnail: File | null;
  subject: string;
  track: string;
  university: string;
  sections: Section[];
}

const Page = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    exam_type: "subject",
    thumbnail: null,
    subject: "",
    track: "",
    university: "",
    sections: []
  });

  const [currentSection, setCurrentSection] = useState<Section>({
    name: "",
    description: "",
    questions: []
  });

  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    text: "",
    graphics: null,
    marks: "",
    choices: []
  });

  const [currentChoice, setCurrentChoice] = useState<Choice>({
    text: "",
    is_correct: false,
    graphics: null
  });

  useEffect(() => {
    const subjectId = sessionStorage.getItem("id_subject");
    const trackId = sessionStorage.getItem("id_track");
    const universityId = sessionStorage.getItem("university_id");

    setFormData(prev => ({
      ...prev,
      subject: subjectId || "",
      track: trackId || "",
      university: universityId || ""
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
      setCurrentSection(prev => ({
        ...prev,
        questions: [...prev.questions, { ...currentQuestion }]
      }));
      setCurrentQuestion({
        text: "",
        graphics: null,
        marks: "",
        choices: []
      });
    }
  };

  const removeQuestion = (index: number) => {
    setCurrentSection(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const addSection = () => {
    if (currentSection.name.trim() && currentSection.questions.length > 0) {
      setFormData(prev => ({
        ...prev,
        sections: [...prev.sections, { ...currentSection }]
      }));
      setCurrentSection({
        name: "",
        description: "",
        questions: []
      });
    }
  };

  const removeSection = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
    }));
  };

  const clearForm = () => {
    setFormData({
      title: "",
      description: "",
      exam_type: "subject",
      thumbnail: null,
      subject: sessionStorage.getItem("id_subject") || "",
      track: sessionStorage.getItem("id_track") || "",
      university: sessionStorage.getItem("university_id") || "",
      sections: []
    });
    setCurrentSection({
      name: "",
      description: "",
      questions: []
    });
    setCurrentQuestion({
      text: "",
      graphics: null,
      marks: "",
      choices: []
    });
    setCurrentChoice({
      text: "",
      is_correct: false,
      graphics: null
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = sessionStorage.getItem('Authorization');
    
    // Create the data object first
    const submitData = {
      title: formData.title,
      description: formData.description,
      exam_type: 'university',
      thumbnail: formData.thumbnail || null,
      subject: parseInt(formData.subject),
      track: parseInt(formData.track),
      university: parseInt(formData.university),
      sections: formData.sections.map(section => ({
        name: section.name,
        description: section.description,
        questions: section.questions.map(question => ({
          text: question.text,
          graphics: null,
          marks: parseFloat(question.marks).toFixed(2), // Ensure marks are in "2.00" format
          choices: question.choices.map(choice => ({
            text: choice.text,
            is_correct: choice.is_correct,
            graphics: null
          }))
        }))
      }))
    };

    try {
      const response = await fetch('https://junoon-vatb.onrender.com/api/exams_app/university-exams/create/', {
        method: 'POST',
        headers: {
          'Authorization': token || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        alert('Exam created successfully!');
        clearForm();
      } else {
        const errorData = await response.json();
        alert(`Failed to create exam: ${JSON.stringify(errorData)}`);
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
          <h2 className="text-xl font-semibold mb-4">University Exam Information</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="mt-1 block w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="mt-1 block w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Thumbnail</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-1 block w-full p-2 border rounded"
            />
          </div>
        </div>

        <div className="border p-4 rounded">
          <h3 className="text-lg font-semibold mb-4">Add Section</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Section Name</label>
              <input
                type="text"
                value={currentSection.name}
                onChange={(e) => setCurrentSection(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Section Description</label>
              <textarea
                value={currentSection.description}
                onChange={(e) => setCurrentSection(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1 block w-full p-2 border rounded"
              />
            </div>

            <div className="border p-4 rounded">
              <h4 className="text-lg font-semibold mb-4">Add Question</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Question Text</label>
                  <input
                    type="text"
                    value={currentQuestion.text}
                    onChange={(e) => setCurrentQuestion(prev => ({ ...prev, text: e.target.value }))}
                    className="mt-1 block w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Marks</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={currentQuestion.marks}
                    onChange={(e) => setCurrentQuestion(prev => ({ ...prev, marks: e.target.value }))}
                    className="mt-1 block w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Add Choice</label>
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
                  <h5 className="font-semibold mb-2">Current Choices:</h5>
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

            <div className="mt-4">
              <h4 className="font-semibold mb-2">Current Questions:</h4>
              <ul className="space-y-4">
                {currentSection.questions.map((question, index) => (
                  <li key={index} className="border p-4 rounded">
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
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={addSection}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Add Section
            </button>
          </div>
        </div>

        <div className="border p-4 rounded">
          <h3 className="text-lg font-semibold mb-4">Added Sections</h3>
          <div className="space-y-4">
            {formData.sections.map((section, index) => (
              <div key={index} className="border p-4 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{section.name}</h4>
                    <p className="text-sm text-gray-600">{section.description}</p>
                    <ul className="mt-2">
                      {section.questions.map((question, qIndex) => (
                        <li key={qIndex} className="mt-2">
                          <p className="font-medium">{question.text}</p>
                          <p className="text-sm text-gray-600">Marks: {question.marks}</p>
                          <ul className="ml-4">
                            {question.choices.map((choice, cIndex) => (
                              <li key={cIndex} className="text-sm">
                                {choice.text} {choice.is_correct && "(Correct)"}
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSection(index)}
                    className="px-2 py-1 bg-red-500 text-white rounded"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-500 text-white rounded"
        >
          Create University Exam
        </button>
      </form>
    </div>
  );
};

export default Page; 