import { sortDataByDate } from '@/lib/helpers';
import { PaginatedUserResponse, userResponseType } from '@/lib/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import tokenService from './token.service';
import axios from '@/lib/config/axios-instance';

export const UserService = () => {
  const id = tokenService.getUserId();

  const useFetchAllUsers = (filters?: { username: string }) => {
    async function fetchUsers(): Promise<PaginatedUserResponse> {
      const params: any = { ...filters };

      const response = await axios.get(`/user`, { params });
      const sortedUsers = sortDataByDate<userResponseType>(
        response.data.data,
        'created_at',
        'desc',
      );
      console.log(sortedUsers);
      return {
        data: sortedUsers,
        total: response.data.total, // total complaints
        page: response.data.page, // current page
        limit: response.data.limit, // items per page
      };
    }
    return useQuery({
      queryFn: fetchUsers,
      queryKey: ['user'],
    });
  };

  const useFetchUserById = () => {
    // const id = tokenService.getUserId();
    console.log(id);
    return useQuery({
      queryKey: ['user', id],
      queryFn: async () => {
        if (!id) {
          throw new Error('ID is required to fetch user.');
        }
        const response = await axios.get(`/user?id=${id}`);
        console.log(response.data);
        return response.data;
      },
      enabled: !!id,
    });
  };

  const useHandleUpdateUser = () => {
    const queryClient = useQueryClient();
    function handleUpdateUser(data: FormData): Promise<userResponseType> {
      return axios.patch(`/user?id=${id}`, data).then((res) => res.data);
    }
    return useMutation({
      mutationFn: handleUpdateUser,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user'] });
        toast.success('User Updated Successfully');
      },
      retry: 0,
    });
  };

  return {
    useHandleUpdateUser,
    useFetchAllUsers,
    useFetchUserById,
  };
};
