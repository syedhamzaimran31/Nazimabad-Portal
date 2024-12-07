import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import TokenService from '@/services/token.service';

import axios from './axios-instance';
import { PUBLIC_API_ENDPOINTS } from '../constants';
import { useToast } from '@/hooks/use-toast'; // Import the toast hook

// intercepting requests
// Step-2: Create request, response & error handlers
const requestHandler = (request: InternalAxiosRequestConfig) => {
  // Token will be dynamic, so we can use any app-specific way to always
  // fetch the new token before making the call
  const token = TokenService.getLocalAccessToken();
  const refreshToken = TokenService.getLocalRefreshToken();
  if (token && request.url !== `/auth/tokens`) {
    request.headers['Authorization'] = `Bearer ${token}`;
  } else {
    request.headers['Authorization'] = `Bearer ${refreshToken}`;
  }
  return request;
};

const responseHandler = (response: AxiosResponse) => {
  response.headers['Authorization'] = `Bearer ${TokenService.getLocalAccessToken()}`;
  return response;
};

const errorHandler = async (err: any) => {
  const originalConfig = err.config;
  const retries = TokenService.getTokenRetries();
  const { toast } = useToast(); // Get the toast function

  if (
    !PUBLIC_API_ENDPOINTS.includes(
      originalConfig.url.split('?')[0] ? originalConfig.url.split('?')[0] : originalConfig.url,
    ) &&
    err.response
  ) {
    if (retries > 0 && retries) {
      if (err.response.status === 401) {
        if (originalConfig.url === `/auth/tokens`) {
          TokenService.setTokenRetries(retries - 1);
        }
        originalConfig._retry = true;
        try {
          const rs = await axios.get(`/auth/tokens`);

          const { access_token, refresh_token } = rs.data.data.tokens;
          TokenService.saveLocalRefreshToken(refresh_token);
          TokenService.saveLocalAccessToken(access_token);
          TokenService.setTokenRetries(5);
          return axios(originalConfig);
        } catch (error) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to refresh token. Please log in again.',
          });
          return Promise.reject(error);
        }
      } else if (err.response.status === 403) {
        toast({
          variant: 'destructive',
          title: 'Access Denied',
          description: 'You do not have permission to access this resource.',
        });

        window.location.href = '/login';
      }
    } else {
      //   toast.info("Your session has expired.");
      TokenService.clearStorage();
      //Call for new refresh token

      toast({
        variant: 'destructive',
        title: 'Session Expired',
        description: 'Your session has expired. Please log in again.',
      });
      window.location.href = '/login';
    }
  }
  return Promise.reject(err);
};

const setup = () => {
  axios.interceptors.request.use(
    (request: InternalAxiosRequestConfig) => requestHandler(request),
    (error: any) => Promise.reject(error),
  );

  axios.interceptors.response.use(
    (response: AxiosResponse) => responseHandler(response),
    (error: any) => errorHandler(error),
  );
};

export default setup;
