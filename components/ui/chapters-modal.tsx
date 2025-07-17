'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface Chapter {
  id: number;
  name: string;
  description: string | null;
  thumbnail: string | null;
  subject: number;
}

interface ChaptersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (chapter: Omit<Chapter, 'id'>) => Promise<void>;
  subjectId: string;
  isSubmitting?: boolean;
}

export default function ChaptersModal({
  isOpen,
  onClose,
  onSubmit,
  subjectId,
  isSubmitting = false
}: ChaptersModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: null as string | null,
    thumbnail: null as File | null,
    thumbnailPreview: null as string | null,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFormData(prev => ({
        ...prev,
        thumbnail: file,
        thumbnailPreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await onSubmit({
        name: formData.name,
        description: formData.description,
        thumbnail: formData.thumbnail,
        subject: parseInt(subjectId)
      });
      
      // Reset form on successful submission
      setFormData({ name: '', description: null, thumbnail: null, thumbnailPreview: null });
    } catch (error) {
      // Error handling is done by the parent component
      console.error('Error submitting chapter:', error);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', description: null, thumbnail: null, thumbnailPreview: null });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="relative w-full max-w-md mx-auto bg-white rounded-lg shadow-2 p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-purple-800 rounded-t-lg">
          <h3 className="text-lg font-semibold text-white">Create New Chapter</h3>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6 fill="none" stroke="currentColor" viewBox="0 0 24 24">             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">    <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">           Chapter Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
                placeholder="Enter chapter name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">       Description
              </label>
              <div className="bg-white rounded border border-gray-300">
                <ReactQuill
                  value={formData.description || ''}
                  onChange={(val: string) => setFormData(prev => ({ ...prev, description: val }))}
                  theme="snow"
                  className="min-h-[120px]"
                  placeholder="Enter chapter description..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">                Thumbnail
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
      {formData.thumbnailPreview && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <img
                    src={formData.thumbnailPreview}
                    alt="Thumbnail preview"
                    className="w-32 h-32 object-cover rounded-md border border-gray-300"
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">           <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-purple-800 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors">
                {isSubmitting ? 'Creating...' : 'Create Chapter'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 