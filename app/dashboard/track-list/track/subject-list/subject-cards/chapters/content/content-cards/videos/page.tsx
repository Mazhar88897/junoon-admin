'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { Edit, Trash2, Upload, X, Play, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import { toast } from 'sonner';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface Video {
  id: number;
  is_deleted: boolean;
  deleted_by: string | null;
  deleted_on: string | null;
  created_by: string;
  created_on: string;
  modified_by: string | null;
  modified_on: string | null;
  name: string;
  description: string;
  thumbnail: string | null;
  video: string;
  chapter: number;
  topic: number | null;
}

interface Chapter {
  id: number;
  name: string;
}

// Drag and Drop Component
const DragDropZone = ({ 
  onFileDrop, 
  accept, 
  preview, 
  onRemove, 
  label, 
  required = false,
  icon: Icon,
  fileType = 'file'
}: {
  onFileDrop: (file: File) => void;
  accept: string;
  preview: string | null;
  onRemove: () => void;
  label: string;
  required?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  fileType?: 'image' | 'video' | 'file';
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev + 1);
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev - 1);
    if (dragCounter === 1) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setDragCounter(0);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      
      // Validate file type
      if (file.type.startsWith(accept.split('/')[0]) || file.type.includes(accept.split('/')[1])) {
        // Validate file size (100MB for videos, 10MB for images)
        const maxSize = fileType === 'video' ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
        if (file.size > maxSize) {
          const maxSizeMB = maxSize / (1024 * 1024);
          toast.error(`File too large. Maximum size is ${maxSizeMB}MB.`);
          return;
        }
        
        setIsUploading(true);
        try {
          onFileDrop(file);
          toast.success(`${fileType.charAt(0).toUpperCase() + fileType.slice(1)} uploaded successfully!`);
        } finally {
          setIsUploading(false);
        }
      } else {
        toast.error(`Invalid file type. Please select a ${fileType} file.`);
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (100MB for videos, 10MB for images)
      const maxSize = fileType === 'video' ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > maxSize) {
        const maxSizeMB = maxSize / (1024 * 1024);
        toast.error(`File too large. Maximum size is ${maxSizeMB}MB.`);
        return;
      }
      
      setIsUploading(true);
      try {
        onFileDrop(file);
        toast.success(`${fileType.charAt(0).toUpperCase() + fileType.slice(1)} uploaded successfully!`);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}{required && <span className="text-red-500">*</span>}
      </label>
      
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
          isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : isUploading
              ? 'border-yellow-500 bg-yellow-50'
              : preview 
                ? 'border-green-300 bg-green-50' 
                : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="relative">
            {fileType === 'image' && (
              <img 
                src={preview} 
                alt="Preview" 
                className="w-full h-32 object-cover rounded-lg mx-auto"
              />
            )}
            {fileType === 'video' && (
              <div className="relative w-full h-32 bg-gray-900 rounded-lg mx-auto flex items-center justify-center">
                <video 
                  src={preview} 
                  className="w-full h-full object-cover rounded-lg"
                  muted
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg flex items-center justify-center">
                  <Play className="h-8 w-8 text-white" />
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={onRemove}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            {isUploading ? (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
            ) : (
              <Icon className={`mx-auto h-12 w-12 text-gray-400 ${isDragOver ? 'text-blue-500' : ''}`} />
            )}
            <div className="mt-2">
              <p className={`text-sm ${isDragOver ? 'text-blue-600' : isUploading ? 'text-yellow-600' : 'text-gray-600'}`}>
                {isUploading ? 'Uploading...' : isDragOver ? 'Drop your file here' : `Drag and drop your ${fileType} here, or click to browse`}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {isUploading ? 'Please wait...' : `Supports: ${accept}`}
              </p>
            </div>
            <input
              type="file"
              accept={accept}
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default function RecordedLecturesPage() {
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [search, setSearch] = useState('');  
  const [page, setPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [videoToDelete, setVideoToDelete] = useState<Video | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const pageSize = 10;
  const submitRef = useRef(false);

  // Form state
  const [formData, setFormData] = useState({
    chapter: '',
    name: '',
    description: '',
    video: null as File | null,
    videoPreview: '',
    thumbnail: null as File | null,
    thumbnailPreview: '',
    created_by: 'Ateeq Ur Rehman',
  });

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    chapter: '',
    name: '',
    description: '',
    video: null as File | null,
    videoPreview: '',
    thumbnail: null as File | null,
    thumbnailPreview: '',
    created_by: '',
  });

  useEffect(() => {
    const id = sessionStorage.getItem('id_subject');   if (id) {
      setSubjectId(id);
    } else {
      setError('Subject ID not found in session storage.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchVideos = async () => {
      if (!subjectId) return;

      try {
        const token = sessionStorage.getItem('Authorization');
        if (!token) {
          throw new Error('No authorization token found');
        }

        // Get all videos for all chapters in this subject
        const chaptersResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks_app/chapters/?subject_id=${sessionStorage.getItem('id_subject')}`, {
          headers: {
            'Authorization': token,
          },
        });

        if (chaptersResponse.ok) {
          const chaptersData = await chaptersResponse.json();
          console.log('Chapters found:', chaptersData.length);
          const allVideos: Video[] = [];
          
          // Fetch videos for each chapter using the actual chapter ID
          for (const chapter of chaptersData) {
            console.log(`Fetching videos for chapter: ${chapter.id} - ${chapter.name}`);
            const videosResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contents_app/videos?chapter_id=${chapter.id}`, {
              headers: {
                'Authorization': token,
              },
            });

            if (videosResponse.ok) {
              const videosData = await videosResponse.json();
              console.log(`Found ${videosData.length} videos for chapter ${chapter.id}`);
              allVideos.push(...videosData);
            }
          }
          
          // Remove duplicate videos based on ID using a more efficient approach
          const seenIds = new Set();
          const uniqueVideos = allVideos.filter(video => {
            if (seenIds.has(video.id)) {
              return false;
            }
            seenIds.add(video.id);
            return true;
          });
          
          console.log('Total videos fetched:', allVideos.length);
          console.log('Unique videos after deduplication:', uniqueVideos.length);
          
          setVideos(uniqueVideos);
        }
       
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [subjectId]);

  // Fetch chapters for the form
  useEffect(() => {
    const fetchChapters = async () => {
      if (!subjectId) return;

      try {
        const token = sessionStorage.getItem('Authorization');
        if (!token) return;

        const chaptersResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks_app/chapters/?subject_id=${subjectId}`, {
          headers: {
            'Authorization': token,
          },
        });

        if (chaptersResponse.ok) {
          const chaptersData = await chaptersResponse.json();
          setChapters(chaptersData);
        }

      } catch (err) {
        console.error('Error fetching chapters:', err);
      }
    };

    fetchChapters();
  }, [subjectId]);

  // Cleanup function to reset submission state
  useEffect(() => {
    return () => {
      submitRef.current = false;
      setIsSubmitting(false);
    };
  }, []);

  // Search filter and sorting (search by name, description, sort by modified_on in descending order)
  const filteredData = useMemo(() => {
    let filtered = videos;
    
    // Apply search filter
    if (search) {
      filtered = videos.filter(row =>
        row.name.toLowerCase().includes(search.toLowerCase()) ||
        row.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Sort by modified_on in descending order (newest to oldest)
    filtered = [...filtered].sort((a, b) => {
      // Use modified_on if available, otherwise fall back to created_on
      const dateA = a.modified_on ? new Date(a.modified_on) : new Date(a.created_on);
      const dateB = b.modified_on ? new Date(b.modified_on) : new Date(b.created_on);
      
      // Ensure we have valid dates
      if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
        return 0; // Keep original order if dates are invalid
      }
      
      // Always sort by latest first (descending order)
      return dateB.getTime() - dateA.getTime(); // Newest first
    });
    
    return filtered;
  }, [search, videos]);

  // Pagination
  const pageCount = Math.ceil(filteredData.length / pageSize);
  const pagedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  const handleVideoClick = (video: Video) => {
    // Store video details in session storage for the next page
    sessionStorage.setItem('video_id', video.id.toString());
    sessionStorage.setItem('video_name', video.name);
    sessionStorage.setItem('video_description', video.description);
    sessionStorage.setItem('video_url', video.video);
    sessionStorage.setItem('video_thumbnail',video.thumbnail || '');
    
    // Open video in new tab
    if (video.video) {
      window.open(video.video, '_blank');
    }
  };

  const handleEditVideo = (video: Video) => {
    setSelectedVideo(video);
    setEditFormData({
      chapter: video.chapter.toString(),
      name: video.name,
      description: video.description,
      video: null,
      videoPreview: '',
      thumbnail: null,
      thumbnailPreview: video.thumbnail || '',
      created_by: video.created_by,
    });
    setShowEditModal(true);
  };

  const handleDeleteVideo = (video: Video) => {
    setVideoToDelete(video);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!videoToDelete) return;

    setIsDeleting(true);
    try {
      const token = sessionStorage.getItem('Authorization');
      if (!token) {
        throw new Error('No authorization token found');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contents_app/videos/${videoToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token,
        },
      });

      if (!response.ok) {
        toast.error('Failed to delete video');
        return;
      }
      toast.success('Video deleted successfully');

      // Remove video from state
      setVideos(prev => prev.filter(v => v.id !== videoToDelete.id));
      
      // Close modal
      setShowDeleteModal(false);
      setVideoToDelete(null);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setVideoToDelete(null);
  };

  const handlePlayVideo = (video: Video) => {
    setSelectedVideo(video);
    setShowPlayerModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {    year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    const file = files?.[0] || null;
    if (file) {
      setFormData(prev => ({
        ...prev,
        [name]: file,
        [`${name}Preview`]: name === 'thumbnail' ? URL.createObjectURL(file) : name === 'video' ? URL.createObjectURL(file) : '',
      }));
    }
  };

  // Drag and drop handlers for form
  const handleVideoDrop = (file: File) => {
    setFormData(prev => ({
      ...prev,
      video: file,
      videoPreview: URL.createObjectURL(file),
    }));
  };

  const handleThumbnailDrop = (file: File) => {
    setFormData(prev => ({
      ...prev,
      thumbnail: file,
      thumbnailPreview: URL.createObjectURL(file),
    }));
  };

  const handleVideoRemove = () => {
    setFormData(prev => ({
      ...prev,
      video: null,
      videoPreview: '',
    }));
  };

  const handleThumbnailRemove = () => {
    setFormData(prev => ({
      ...prev,
      thumbnail: null,
      thumbnailPreview: '',
    }));
  };

  // Drag and drop handlers for edit form
  const handleEditVideoDrop = (file: File) => {
    setEditFormData(prev => ({
      ...prev,
      video: file,
      videoPreview: URL.createObjectURL(file),
    }));
  };

  const handleEditThumbnailDrop = (file: File) => {
    setEditFormData(prev => ({
      ...prev,
      thumbnail: file,
      thumbnailPreview: URL.createObjectURL(file),
    }));
  };

  const handleEditVideoRemove = () => {
    setEditFormData(prev => ({
      ...prev,
      video: null,
      videoPreview: '',
    }));
  };

  const handleEditThumbnailRemove = () => {
    setEditFormData(prev => ({
      ...prev,
      thumbnail: null,
      thumbnailPreview: '',
    }));
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple submissions using both state and ref
    if (isSubmitting || submitRef.current) {
      return;
    }
    
    // Set both state and ref to prevent multiple submissions
    setIsSubmitting(true);
    submitRef.current = true;

    try {
      const token = sessionStorage.getItem('Authorization');
      if (!token) {
        throw new Error('No authorization token found');
      }

      const formDataToSend = new FormData();
      formDataToSend.append('chapter', sessionStorage.getItem('chapter_id') || '');
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      if (formData.video) formDataToSend.append('video', formData.video);
      if (formData.thumbnail) formDataToSend.append('thumbnail', formData.thumbnail);
      formDataToSend.append('created_by', sessionStorage.getItem('user_email') || '');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contents_app/videos/`, {
        method: 'POST',
        headers: {
          'Authorization': token,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        toast.error('Failed to create video - source file is required');
        return;
      }
      toast.success('Video created successfully');
      // Reset form and close modal
      setFormData({
        chapter: '',
        name: '',
        description: '',
        video: null,
        videoPreview: '',
        thumbnail: null,
        thumbnailPreview: '',
        created_by: 'Ateeq Ur Rehman',
      });
      setShowModal(false);

      // Refresh videos list
      window.location.reload();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      // Reset both state and ref
      setIsSubmitting(false);
      submitRef.current = false;
    }
  }, [isSubmitting, formData.name, formData.description, formData.video, formData.thumbnail]);

  const closeModal = () => {
    setShowModal(false);
    setFormData({
      chapter: '',
      name: '',
      description: '',
      video: null,
      videoPreview: '',
      thumbnail: null,
      thumbnailPreview: '',
      created_by: 'Ateeq Ur Rehman',
    });
    // Reset submission ref when modal is closed
    submitRef.current = false;
    setIsSubmitting(false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting || submitRef.current) {
      return;
    }
    
    setIsSubmitting(true);
    submitRef.current = true;

    try {
      const token = sessionStorage.getItem('Authorization');
      if (!token) {
        throw new Error('No authorization token found');
      }

      const formDataToSend = new FormData();
      formDataToSend.append('chapter', editFormData.chapter);
      formDataToSend.append('name', editFormData.name);
      formDataToSend.append('description', editFormData.description);
      if (editFormData.video) formDataToSend.append('video', editFormData.video);
      if (editFormData.thumbnail) formDataToSend.append('thumbnail', editFormData.thumbnail);
      formDataToSend.append('created_by', editFormData.created_by);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contents_app/videos/${selectedVideo?.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': token,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
       toast.error('Failed to update video - source file is required');
       return;
      }

      // Update video in state
      const updatedVideo = await response.json();
      setVideos(prev => prev.map(v => v.id === selectedVideo?.id ? updatedVideo : v));

      // Close modal and reset
      setShowEditModal(false);
      setSelectedVideo(null);
      setEditFormData({
        chapter: '',
        name: '',
        description: '',
        video: null,
        videoPreview: '',
        thumbnail: null,
        thumbnailPreview: '',
        created_by: '',
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
      submitRef.current = false;
    }
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedVideo(null);
    setEditFormData({
      chapter: '',
      name: '',
      description: '',
      video: null,
      videoPreview: '',
      thumbnail: null,
      thumbnailPreview: '',
      created_by: '',
    });
    submitRef.current = false;
    setIsSubmitting(false);
  };

  const closePlayerModal = () => {
    setShowPlayerModal(false);
    setSelectedVideo(null);
  };

  if (error) {
    return <div className="text-red-500 p-6">Error: {error}</div>;
  }

  if (loading) {
    return <div className="p-6"> loading videos...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Recorded Lectures</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#1A4D2E]  px-4 py-2 text-sm font-bold text-white rounded-lg">
              
          + Add New Video
        </button>
      </div>
      
      <div className='rounded-lg p-4'>
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex flex-col sm:flex-row gap-2 flex-1">
            <input
              type="text"
              placeholder="Search videos..."
              className="border text-sm focus:outline-none px-3 py-2 rounded w-full sm:w-72"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="text-sm text-gray-600">
            {filteredData.length} video{filteredData.length !== 1 ? 's' : ''} found
            {/* <span className="ml-2 text-blue-600">• Latest on top</span> */}
          </div>
        </div>
        
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full  rounded-lg p-4">
            <thead>
              <tr>
                <th className="p-3">#</th>
                <th className="p-3 text-left">Thumbnail</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-left">Chapter</th>
                <th className="p-3 text-left">Created</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
            {pagedData.map((row, index) => (
                <tr key={row.id} onClick={() => handleVideoClick(row)} className="hover:bg-gray-100 cursor-pointer">
                  <td className="p-3">{page * pageSize - pageSize + index + 1}</td>
                  <td className="p-3">
                  {row.thumbnail ? (
                      <img src={row.thumbnail} alt="Thumbnail" className="w-10 h-10 object-cover rounded-full" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-500 text-sm">
                        V
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-left text-gray-800 font-medium">{row.name}</td>
                  <td
                    className="p-3 text-gray-700 max-w-xs text-slate-600 truncate"
                    title={row.description.replace(/<[^>]+>/g, '')}
                  >
                    <div
                      className="line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: row.description }}
                    />
                  </td>
                  <td className="p-3 text-left text-gray-600">{chapters.find(c => c.id === row.chapter)?.name}</td>
                  <td className="p-3 text-left text-gray-600">{formatDate(row.created_on)}</td>
                  <td className="p-3 text-left">
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayVideo(row);
                        }}
                        className="text-green-500 hover:text-green-700 text-sm px-2 py-1"
                        title="Play Video"
                      >
                        ▶ 
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditVideo(row);
                        }}
                        className="text-blue-500  text-sm px-2 py-1 rounded "
                        title="Edit Video"
                      >
                        <Edit className="h-4 w-4" />
                        
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteVideo(row);
                        }}
                        disabled={isDeleting}
                        className="text-red-500 hover:text-red-700 text-sm px-2 py-1 0 0 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete Video"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {pagedData.length === 0 && (
                <tr><td colSpan={7} className="text-center p-6 text-gray-400">No videos found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {pageCount > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="flex">           <button
                className={`px-2 text-xs border ${page === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white hover:bg-gray-50'}`}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Prev
              </button>
              {[...Array(pageCount)].map((_, idx) => (
                <button
                  key={idx}
                  className={`px-2 py-1 text-xs border ${page === idx + 1 ? 'bg-[#6d7efc] text-white' : 'bg-white hover:bg-gray-50'}`}
                  onClick={() => setPage(idx + 1)}
                >
                  {idx + 1}                </button>
              ))}
              <button
                className={`px-2 text-xs border ${page === pageCount || pageCount === 0 ? 'bg-gray-100 text-gray-400' : 'bg-white hover:bg-[#1A4D2E]100'}`}
                onClick={() => setPage(p => Math.min(pageCount, p + 1))}
                disabled={page === pageCount || pageCount === 0}
              >
                Next
              </button>
            </div>
            <div className="text-xs text-gray-50">
             {pagedData.length > 0 && (
                <span>
                  {(page -1) * pageSize + 1}-{(page -1) * pageSize + pagedData.length} of {filteredData.length}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add New Video Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="relative w-full max-w-2xl mx-auto bg-white rounded-lg shadow-2xl p-0 max-h-[70vh] overflow-y-auto">        {/* Header */}
            <div className="flex items-center justify-between px-8 py-2 bg-[#1A4D2E] rounded-t-lg">
              <h3 className="text-lg font-semibold text-white">Create New Video</h3>
              <button
                onClick={closeModal}
                className="text-white hover:text-gray-200 text-2xl font-bold focus:outline-none"
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            {/* Form */}
            <form onSubmit={handleSubmit} className="px-8 py-4 space-y-4">
              {/* <div>
                <label htmlFor="chapter" className="block text-sm font-medium text-gray-700 ">Chapter<span className="text-red-500">*</span></label>
                <select
                  name="chapter"
                  id="chapter"
                  value={formData.chapter}
                  onChange={handleInputChange}
                  required
                  className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#6d7efc] focus:border-[#6d7efc]"
                >
                  <option value="">Select Chapter</option>
                  {chapters.map(chapter => (
                    <option key={chapter.id} value={chapter.id}>
                      {chapter.name}
                    </option>
                  ))}
                </select>
              </div> */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#6d7efc] focus:border-[#6d7efc]"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter video name"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <div className="bg-white rounded border border-gray-300">
                  <ReactQuill
                    value={formData.description}
                    onChange={(val: string) => setFormData(prev => ({ ...prev, description: val }))}
                    theme="snow"
                    className="min-h-[120px]"
                  />
                </div>
              </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <DragDropZone
                onFileDrop={handleVideoDrop}
                accept="video/*"
                preview={formData.videoPreview}
                onRemove={handleVideoRemove}
                label="Video"
                required={true}
                icon={VideoIcon}
                fileType="video"
              />
              <DragDropZone
                onFileDrop={handleThumbnailDrop}
                accept="image/*"
                preview={formData.thumbnailPreview}
                onRemove={handleThumbnailRemove}
                label="Thumbnail"
                required={false}
                icon={ImageIcon}
                fileType="image"
              />
            </div>
            
            {/* File Info Display */}
            {/* {(formData.video || formData.thumbnail) && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-medium text-gray-700">Selected Files:</h4>
                {formData.video && (
                  <div className="flex items-center justify-between bg-white p-3 rounded border">
                    <div className="flex items-center space-x-3">
                      <VideoIcon className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{formData.video.name}</p>
                        <p className="text-xs text-gray-500">
                          {(formData.video.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleVideoRemove}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                {formData.thumbnail && (
                  <div className="flex items-center justify-between bg-white p-3 rounded border">
                    <div className="flex items-center space-x-3">
                      <ImageIcon className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{formData.thumbnail.name}</p>
                        <p className="text-xs text-gray-500">
                          {(formData.thumbnail.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleThumbnailRemove}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )} */}
              {/* <div>
                <label htmlFor="created_by" className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
                <input
                  type="text"
                  name="created_by"
                  id="created_by"
                  className="block w-full border border-gray-300 rounded-md shadow-sm px-2 py-1 focus:ring-[#6d7efc] focus:border-[#6d7efc]"
                  value={formData.created_by}
                  onChange={handleInputChange}
                />
              </div> */}
              {error && showModal && (
                <div className="text-red-500 text-sm mt-2 text-center">{error}</div>
              )}
              <div className="flex justify-end gap-3 ">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#1A4D2E] text-white rounded-md font-medium hover:bg-[#1A4D2E] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Video Modal */}
      {showEditModal && selectedVideo && (
        <div className="fixed inset-0  flex items-center justify-center z-50">
          <div className="relative w-full max-w-2xl mx-auto bg-white rounded-lg shadow-2xl p-0 max-h-[70vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-2 bg-[#1A4D2E] rounded-t-lg">
              <h3 className="text-lg font-semibold text-white">Edit Video: {selectedVideo.name}</h3>
              <button
                onClick={closeEditModal}
                className="text-white hover:text-gray-200 text-2xl font-bold focus:outline-none"
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            {/* Form */}
            <form onSubmit={handleEditSubmit} className="px-8 py-4 space-y-4">
              <div>
                <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">Name<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="name"
                  id="edit-name"
                  required
                  className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter video name"
                />
              </div>
              <div>
                <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <div className="bg-white rounded border border-gray-300">
                  <ReactQuill
                    value={editFormData.description}
                    onChange={(val: string) => setEditFormData(prev => ({ ...prev, description: val }))}
                    theme="snow"
                    className="min-h-[120px]"
                  />
                </div>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <DragDropZone
                  onFileDrop={handleEditVideoDrop}
                  accept="video/*"
                  preview={editFormData.videoPreview}
                  onRemove={handleEditVideoRemove}
                  label="Video"
                  required={false}
                  icon={VideoIcon}
                  fileType="video"
                />
                <DragDropZone
                  onFileDrop={handleEditThumbnailDrop}
                  accept="image/*"
                  preview={editFormData.thumbnailPreview}
                  onRemove={handleEditThumbnailRemove}
                  label="Thumbnail"
                  required={false}
                  icon={ImageIcon}
                  fileType="image"
                />
              </div>
              
              {/* File Info Display for Edit */}
              {(editFormData.video || editFormData.thumbnail) && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">New Files Selected:</h4>
                  {editFormData.video && (
                    <div className="flex items-center justify-between bg-white p-3 rounded border">
                      <div className="flex items-center space-x-3">
                        <VideoIcon className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{editFormData.video.name}</p>
                          <p className="text-xs text-gray-500">
                            {(editFormData.video.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleEditVideoRemove}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  {editFormData.thumbnail && (
                    <div className="flex items-center justify-between bg-white p-3 rounded border">
                      <div className="flex items-center space-x-3">
                        <ImageIcon className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{editFormData.thumbnail.name}</p>
                          <p className="text-xs text-gray-500">
                            {(editFormData.thumbnail.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleEditThumbnailRemove}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {/* Current File Info */}
              {/* <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-medium text-blue-700">Current Files:</h4>
                <div className="flex items-center space-x-3 bg-white p-3 rounded border">
                  <VideoIcon className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedVideo?.video.split('/').pop() || 'Current video'}
                    </p>
                    <p className="text-xs text-gray-500">Existing video file</p>
                  </div>
                </div>
                {selectedVideo?.thumbnail && (
                  <div className="flex items-center space-x-3 bg-white p-3 rounded border">
                    <ImageIcon className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Current thumbnail</p>
                      <p className="text-xs text-gray-500">Existing thumbnail</p>
                    </div>
                  </div>
                )}
              </div> */}
              {error && showEditModal && (
                <div className="text-red-500 text-sm mt-2 text-center">{error}</div>
              )}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#1A4D2E] text-white rounded-md font-medium hover:bg-[#1A4D2E] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Updating...' : 'Update Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {showPlayerModal && selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="relative w-full max-w-6xl mx-auto bg-black rounded-lg">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 bg-gray-900 rounded-t-lg">
              <h3 className="text-lg font-semibold text-white">{selectedVideo.name}</h3>
              <button
                onClick={closePlayerModal}
                className="text-white hover:text-gray-300 text-2xl font-bold focus:outline-none"
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            {/* Video Player */}
            <div className="relative">
              <video
                controls
                className="w-full h-auto max-h-[70vh]"
                poster={selectedVideo.thumbnail || undefined}
              >
                <source src={selectedVideo.video} type="video/mp4" />
                <source src={selectedVideo.video} type="video/webm" />
                <source src={selectedVideo.video} type="video/ogg" />
                Your browser does not support the video tag.
              </video>
              {/* Fullscreen Button */}
              <button
                onClick={() => {
                  const video = document.querySelector('video');
                  if (video) {
                    if (document.fullscreenElement) {
                      document.exitFullscreen();
                    } else {
                      video.requestFullscreen();
                    }
                  }
                }}
                className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded hover:bg-opacity-70 transition-all"
                title="Toggle Fullscreen"
              >
                ⛶ Fullscreen
              </button>
            </div>
            {/* Video Info */}
            <div className="px-6 py-4 bg-gray-900 rounded-b-lg">
              <h4 className="text-white font-medium mb-2">{selectedVideo.name}</h4>
              <p className="text-gray-300 text-sm" dangerouslySetInnerHTML={{ __html: selectedVideo.description }} />
            </div>
          </div>
                 </div>
       )}

       {/* Delete Confirmation Modal */}
       {showDeleteModal && videoToDelete && (
         <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
           <div className="relative w-full max-w-md mx-auto bg-white rounded-lg shadow-2xl">
             {/* Header */}
             <div className="flex items-center justify-between px-6 py-3 bg-red-600 rounded-t-lg">
               <h3 className="text-lg font-semibold text-white">Delete Video</h3>
               <button
                 onClick={closeDeleteModal}
                 className="text-white hover:text-gray-200 text-2xl font-bold focus:outline-none"
                 aria-label="Close"
               >
                 &times;
               </button>
             </div>
             {/* Content */}
             <div className="px-6 py-4">
               <div className="flex items-center mb-4">
                 <div className="flex-shrink-0 mr-3">
                   <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                     <Trash2 className="h-6 w-6 text-red-600" />
                   </div>
                 </div>
                 <div>
                   <h4 className="text-lg font-medium text-gray-900">Are you sure?</h4>
                   <p className="text-sm text-gray-500">
                     This action cannot be undone.
                   </p>
                 </div>
               </div>
               <div className="bg-gray-50 rounded-lg p-4 mb-4">
                 <p className="text-sm text-gray-700">
                   <span className="font-medium">Video:</span> {videoToDelete.name}
                 </p>
                 <p className="text-sm text-gray-600 mt-1">
                   <span className="font-medium">Description:</span> {videoToDelete.description.replace(/<[^>]+>/g, '')}
                 </p>
               </div>
               <div className="flex justify-end gap-3">
                 <button
                   type="button"
                   onClick={closeDeleteModal}
                   className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 focus:outline-none"
                 >
                   Cancel
                 </button>
                 <button
                   type="button"
                   onClick={confirmDelete}
                   disabled={isDeleting}
                   className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   {isDeleting ? 'Deleting...' : 'Delete Video'}
                 </button>
               </div>
             </div>
           </div>
         </div>
       )}
     </div>
   );
 }  