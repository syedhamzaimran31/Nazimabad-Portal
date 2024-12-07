import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import axios from '@/lib/config/axios-instance';
import tokenService from '@/services/token.service.ts';
import { errorType, loginResponseType } from '@/lib/types';
import { useAuthStore } from '@/store/auth-store';
import { useToast } from '@/hooks/use-toast';

const AuthService = () => {
  //Note:Replace Any from here according to the types defined acc to the backend schema.....
  //Admin Log In
  const { toast } = useToast();

  const navigate = useNavigate();
  const { setUser } = useAuthStore(); // Directly destructure setUser

  const useHandleLoginInService = () => {
    function handleLogInRequest(data: any): Promise<any> {
      return axios.post(`/user/login`, data).then((res) => res.data);
    }

    const onSuccess = (response: loginResponseType) => {
      console.log(response);
      const user = {
        id: response.userId,
        roles: [response.role],
        token: response.token,
      };
      
      tokenService.setUser(user);
      console.log('User stored:', tokenService.getUser());
      setUser(user);
      // useAuthStore.getState().setUser(user);
      console.log('User stored in Zustand:', useAuthStore.getState().user); // Check Zustand store
      tokenService.setTokenRetries(5);
      tokenService.saveLocalRefreshToken('');
      tokenService.saveLocalAccessToken(response.token);
      toast({
        variant: 'success',
        title: 'Login Successful',
        description: 'You have successfully logged in.',
      });
      navigate('/');
    };
    const onError = (error: errorType) => {
      console.log(error);
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Invalid credentials',
      });
      console.log(error);
    };

    return useMutation({
      mutationFn: handleLogInRequest,
      onError,
      onSuccess,
      retry: 0,
    });
  };
  const useHandleSignUpService = () => {
    // Sign Up
    const handleSignUpRequest = (data: any): Promise<any> => {
      return axios.post(`/user/signup`, data).then((res) => res.data);
    };
    const onSuccess = (response: any) => {
      console.log(response);
      toast({
        variant: 'success',
        title: 'Sign Up Successful',
        description: 'Your account has been created. Please log in.',
      });
      navigate('/login');
    };
    const onError = (error: errorType) => {
      if (
        error.response?.data?.message &&
        error.response.data.message.includes('Duplicate entry')
      ) {
        toast({
          variant: 'destructive',
          title: 'Sign Up Failed',
          description: 'Email already in use. Please choose a different email.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Sign Up Failed',
          description:
            error.response?.data?.message ||
            'Email already in use. Please choose a different email.',
        });
      }
      console.log(error);
    };
    return useMutation({
      mutationFn: handleSignUpRequest,
      onError,
      onSuccess,
      retry: 0,
    });
  };
  return {
    useHandleLoginInService,
    useHandleSignUpService,
  };
};

export default AuthService;
