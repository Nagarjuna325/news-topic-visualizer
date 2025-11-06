import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://backend:8000').replace(/\/$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds timeout
});

/**
 * Analyze an article URL and get word cloud data
 * @param {string} url - The article URL to analyze
 * @returns {Promise} API response with word cloud data
 */
export const analyzeArticle = async (url) => {
  try {
    const response = await api.post('/analyze', { url });
    return response.data;
  } catch (error) {
    if (error.response) {
      // Server responded with error
      throw new Error(error.response.data.detail || 'Failed to analyze article');
    } else if (error.request) {
      // Request made but no response
      throw new Error('No response from server. Please check if the backend is running.');
    } else {
      // Something else happened
      throw new Error('An unexpected error occurred');
    }
  }
};

/**
 * Check API health
 * @returns {Promise} API health status
 */
export const checkHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw new Error('Backend server is not reachable');
  }
};

export default api;