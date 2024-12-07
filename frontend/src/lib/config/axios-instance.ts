import axios from 'axios';
import TokenService from '@/services/token.service';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast'; // Import the toast hook

// Axios instance setup with base URL from Vite environment variables
const instance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

// Request interceptor to add JWT token to headers
instance.interceptors.request.use(
  (config) => {
    const token = TokenService.getLocalAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor to handle errors globally
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const navigate = useNavigate();
    const { toast } = useToast(); // Get the toast function

    if (error.response) {
      const status = error.response.status;
      // Token expired or unauthorized
      if (status === 401) {
        TokenService.clearStorage(); // Clear token and user data
        navigate('/login'); // Redirect to login page
        toast({
          variant: 'destructive',
          title: 'Unauthorized',
          description: 'Your session has expired. Please log in again.',
        });
      } else if (status === 403) {
        // Forbidden access due to role issues
        toast({
          variant: 'destructive',
          title: 'Access Denied',
          description: 'You do not have permission to access this resource.',
        });
      } else {
        // Handle other errors
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.response.data.message || 'An error occurred.',
        });
      }
    } else {
      // Network or other errors
      toast({
        variant: 'destructive',
        title: 'Network Error',
        description: 'An error occurred while connecting to the server.',
      });
    }
    return Promise.reject(error);
  },
);
export default instance;
