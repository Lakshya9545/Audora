'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { UploadCloud, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

// Define a type for the form data
interface PostFormData {
  title: string;
  subject: string;
  description: string;
  audioFile: File | null;
}

// Define a type for API response (example)
interface ApiResponse {
  success: boolean;
  message: string;
  postId?: string; // Optional: if API returns the ID of the created post
}

const CreatePost = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL 
  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    subject: '',
    description: '',
    audioFile: null,
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Basic validation (optional, can be more robust)
      if (file.size > 10 * 1024 * 1024) { // Max 10MB example
        setError('File size exceeds 10MB limit.');
        setFileName('');
        setFormData((prev) => ({ ...prev, audioFile: null }));
        return;
      }
      if (!['audio/mpeg', 'audio/wav', 'audio/ogg'].includes(file.type)) {
        setError('Invalid file type. Please upload MP3, WAV, or OGG.');
        setFileName('');
        setFormData((prev) => ({ ...prev, audioFile: null }));
        return;
      }
      setFormData((prev) => ({ ...prev, audioFile: file }));
      setFileName(file.name);
      setError(null); // Clear previous file errors
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!formData.title || !formData.subject || !formData.description || !formData.audioFile) {
      setError('All fields, including an audio file, are required.');
      return;
    }

    setIsSubmitting(true);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('subject', formData.subject);
    data.append('description', formData.description);
    if (formData.audioFile) {
      data.append('audioFile', formData.audioFile);
    }

    try {
      // Replace with your actual API endpoint and logic
      const response = await fetch(`${apiUrl}/api/posts/`, { // Example API endpoint
        method: 'POST',
        body: data,
        credentials: 'include', // Include cookies for authentication
        // Headers might be needed depending on your backend (e.g., for auth)
        // headers: { 'Authorization': `Bearer ${your_auth_token}` }
      });

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to create post. Please try again.');
      }

      setSuccessMessage(result.message || 'Post created successfully!');
      // Reset form
      setFormData({ title: '', subject: '', description: '', audioFile: null });
      setFileName('');
      // Optionally, redirect or perform other actions on success
      // router.push(`/post/${result.postId}`);

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-creamyTan flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="bg-brightWhite p-6 sm:p-8 lg:p-10 rounded-xl shadow-2xl w-full max-w-2xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-richPurple mb-6 sm:mb-8 text-center">
          Create New <span className="text-mutedGold">Audora</span> Post
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-darkSlate mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              id="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-4 py-3 border border-darkSlate/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-richPurple focus:border-richPurple sm:text-sm text-white"
              placeholder="Catchy title for your audio"
            />
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-darkSlate mb-1">
              Subject / Category
            </label>
            <input
              type="text"
              name="subject"
              id="subject"
              value={formData.subject}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-4 py-3 border border-darkSlate/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-richPurple focus:border-richPurple sm:text-sm text-white"
              placeholder="e.g., Storytelling, Music, Podcast Snippet"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-darkSlate mb-1">
              Description
            </label>
            <textarea
              name="description"
              id="description"
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-4 py-3 border border-darkSlate/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-richPurple focus:border-richPurple sm:text-sm text-white"
              placeholder="Tell us more about your audio..."
            />
          </div>

          <div>
            <label htmlFor="audioFile" className="block text-sm font-medium text-darkSlate mb-1">
              Upload Audio File (MP3, WAV, OGG - Max 10MB)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-darkSlate/30 border-dashed rounded-lg hover:border-mutedGold transition-colors">
              <div className="space-y-1 text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-darkSlate/70" />
                <div className="flex text-sm text-darkSlate/80">
                  <label
                    htmlFor="audioFile"
                    className="relative cursor-pointer bg-brightWhite rounded-md font-medium text-richPurple hover:text-mutedGold focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-richPurple"
                  >
                    <span>Upload a file</span>
                    <input id="audioFile" name="audioFile" type="file" className="sr-only" onChange={handleFileChange} accept="audio/mpeg,audio/wav,audio/ogg" />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                {fileName ? (
                  <p className="text-xs text-mutedGold">{fileName}</p>
                ) : (
                  <p className="text-xs text-darkSlate/60">MP3, WAV, OGG up to 10MB</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-brightWhite bg-richPurple hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-richPurple disabled:bg-purple-300 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-3" />
                  Publishing...
                </>
              ) : (
                'Publish Post'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;