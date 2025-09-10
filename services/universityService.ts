const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface University {
  id: number;
  is_deleted: boolean;
  deleted_by: string | null;
  deleted_on: string | null;
  created_by: string;
  created_on: string;
  modified_by: string | null;
  modified_on: string;
  name: string;
  description: string;
  thumbnail: string;
  track: number;
}

export interface CreateUniversityData {
  track: number;
  name: string;
  description: string;
  thumbnail?: File;
}

export interface UpdateUniversityData {
  track: number;
  name: string;
  description: string;
  thumbnail?: File;
}

class UniversityService {
  private getAuthHeaders() {
    if (typeof window === 'undefined') {
      return {};
    }
    
    const token = sessionStorage.getItem('Authorization');
    return {
      'Authorization': token || '',
    };
  }

  // GET - Fetch all universities
  async getUniversities(trackId?: number): Promise<University[]> {
    try {
      const url = trackId 
        ? `${BASE_URL}/api/tracks_app/universities?track_id=${trackId}`
        : `${BASE_URL}/api/tracks_app/universities`;
      
      const response = await fetch(url, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch universities');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching universities:', error);
      throw error;
    }
  }

  // GET - Fetch single university
  async getUniversity(id: number): Promise<University> {
    try {
      const response = await fetch(`${BASE_URL}/api/tracks_app/universities/${id}/`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch university');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching university:', error);
      throw error;
    }
  }

  // POST - Create university
  async createUniversity(data: CreateUniversityData): Promise<University> {
    try {
      const formData = new FormData();
      formData.append('track', data.track.toString());
      formData.append('name', data.name);
      formData.append('description', data.description);
      if (data.thumbnail) {
        formData.append('thumbnail', data.thumbnail);
      }

      const response = await fetch(`${BASE_URL}/api/tracks_app/universities/`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create university');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating university:', error);
      throw error;
    }
  }

  // PUT - Update university
  async updateUniversity(id: number, data: UpdateUniversityData): Promise<University> {
    try {
      const formData = new FormData();
      formData.append('track', data.track.toString());
      formData.append('name', data.name);
      formData.append('description', data.description);
      if (data.thumbnail) {
        formData.append('thumbnail', data.thumbnail);
      }

      const response = await fetch(`${BASE_URL}/api/tracks_app/universities/${id}/`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update university');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating university:', error);
      throw error;
    }
  }

  // DELETE - Delete university
  async deleteUniversity(id: number): Promise<void> {
    try {
      const response = await fetch(`${BASE_URL}/api/tracks_app/universities/${id}/`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete university');
      }
    } catch (error) {
      console.error('Error deleting university:', error);
      throw error;
    }
  }
}

export const universityService = new UniversityService();
