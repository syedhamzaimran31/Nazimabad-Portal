import { sortDataByDate } from '@/lib/helpers';
import {
  PaginatedComplaintResponse,
  complaintType,
  errorType,
  udateComplaintAdmin,
} from '@/lib/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import tokenService from './token.service';
import axios from '@/lib/config/axios-instance';

export const ComplaintService = () => {
  const { toast } = useToast();
  const userRole = tokenService.getUserRole();
  console.log(userRole);

  const useHandleAddComplaint = () => {
    const queryClient = useQueryClient();
    function handleAddComplaint(data: FormData): Promise<complaintType> {
      return axios.post(`/complaint`, data).then((res) => res.data);
    }
    return useMutation({
      mutationFn: handleAddComplaint,
      onSuccess: () => {
        toast({
          variant: 'success',
          title: 'Succussfully added',
          description: 'Complaint added successfully',
        });
        queryClient.invalidateQueries({ queryKey: ['complaint'] });
      },
      onError: (error: errorType) => {
        toast({
          variant: 'destructive',
          description: error.response?.data?.message,
        });
      },
      retry: 0,
    });
  };

  const useHandleUpdateComplaint = (id: string) => {
    const queryClient = useQueryClient();
    function handleUpdateComplaint(data: FormData): Promise<complaintType> {
      return axios.put(`/complaint/resident/${id}`, data).then((res) => res.data);
    }
    return useMutation({
      mutationFn: handleUpdateComplaint,
      onSuccess: () => {
        toast({
          variant: 'success',
          title: 'Succussfully updated',
          description: 'Complaint updated successfully',
        });
        queryClient.invalidateQueries({ queryKey: ['complaint'] });
      },
      onError: (error: errorType) => {
        toast({
          variant: 'destructive',
          description: error.response?.data?.message,
        });
      },
      retry: 0,
    });
  };

  const useHandleUpdateComplaintAdmin = (id: number) => {
    const queryClient = useQueryClient();
    function handleUpdateComplaintAdmin(data: udateComplaintAdmin): Promise<udateComplaintAdmin> {
      return axios.patch(`/complaint/admin/${id}`, data).then((res) => res.data);
    }
    return useMutation({
      mutationFn: handleUpdateComplaintAdmin,
      onSuccess: () => {
        toast({
          variant: 'success',
          title: 'Succussfully updated',
          description: 'Complaint updated successfully',
        });
        queryClient.invalidateQueries({ queryKey: ['complaint'] });
      },
      onError: (error: errorType) => {
        toast({
          variant: 'destructive',
          description: error.response?.data?.message,
        });
      },
      retry: 0,
    });
  };
  
  const useFetchAllComplaints = (page?: number, limit?: number) => {
    async function fetchComplaints(): Promise<PaginatedComplaintResponse> {
      let userId = tokenService.getUserId();
      console.log(`USER ROLE ${userRole}`);
      userId = userRole === 'Residence' ? userId : '';
      // if (page === undefined || limit === undefined) {
      //   // Fetch all complaints without pagination
      //   const response = await axios.get(`/complaint`);
      //   console.log('Fetched Data:', response.data);
      //   const sortedComplaints = sortDataByDate<complaintType>(
      //     response.data.data,
      //     'created_at',
      //     'desc',
      //   );
      //   console.log('Sorted Complaints:', sortedComplaints);
      //   return {
      //     data: sortedComplaints,
      //     total: response.data.total, // total complaints
      //     page: response.data.page, // current page
      //     limit: response.data.limit, // items per page
      //   };
      // }
      // else {
      console.log(`User ID BEFOR CALL ${userId}`);
      const response = await axios.get(`/complaint`, {
        params: { page, limit, userId }, // Send page and limit as query params
      });
      console.log('Fetched Data with Pagination:', response.data);

      const sortedComplaints = sortDataByDate<complaintType>(
        response.data.data,
        'created_at',
        'desc',
      );
      console.log('Sorted Complaints with Pagination:', sortedComplaints);
      return {
        data: sortedComplaints,
        total: response.data.total, // total complaints
        page: response.data.page, // current page
        limit: response.data.limit, // items per page
      };
      // }
    }
    return useQuery({
      queryFn: fetchComplaints,
      queryKey: ['complaint', page], // Use page as part of the query key to refetch when page changes
    });
  };

  //service function for fetching all visitors data for export
  const fetchAllComplaintsData = async (): Promise<PaginatedComplaintResponse> => {
    try {
      const response = await axios.get(`/complaint`);
      console.log('Fetched Data:', response.data);
      const sortedComplaints = sortDataByDate<complaintType>(
        response.data.data,
        'created_at',
        'desc',
      );
      console.log('Sorted Complaints:', sortedComplaints);
      return {
        data: sortedComplaints,
        total: response.data.total, // total complaints
        page: response.data.page, // current page
        limit: response.data.limit, // items per page
      };
    } catch (error) {
      console.error('Error fetching complaints data:', error);
      throw error; // Rethrow error to handle it in the caller
    }
  };

  const useFetchComplaintsById = (id: string) => {
    return useQuery({
      queryKey: ['complaint', id],
      queryFn: async () => {
        const response = await axios.get(`/complaint?id=${id}`);
        return response.data;
      },
    });
  };

  const useFetchComplaintByUserId = (page: number, limit: number) => {
    const userId = tokenService.getUserId();
    console.log(userId);
    return useQuery({
      queryKey: ['complaint', userId, page],
      queryFn: async () => {
        const response = await axios.get(`/complaint`, {
          params: { userId, page, limit }, // Send userId, page, and limit as query params
        });
        console.log(response.data.data);
        const complaintsArray = response.data.data;
        const sortedComplaints = sortDataByDate<complaintType>(
          complaintsArray,
          'created_at',
          'desc',
        );

        console.log(sortedComplaints);
        return sortedComplaints;
      },
    });
  };

  const useHandleDeleteComplaint = () => {
    const queryClient = useQueryClient();
    async function deleteComplaint(id: string | number): Promise<any> {
      return axios.delete(`/complaint/${id}`).then((res) => res.data);
    }

    return useMutation({
      mutationFn: deleteComplaint,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['complaint'] });
        toast({
          variant: 'success',
          title: 'Successfully deleted',
          description: 'Complaint deleted successfully',
        });
      },
      onError: (error: errorType) => {
        toast({
          variant: 'destructive',
          description: error.response?.data?.message,
        });
      },
      retry: 0,
    }); 
  };

  return {
    useHandleAddComplaint,
    useHandleUpdateComplaint,
    useHandleUpdateComplaintAdmin,
    useFetchAllComplaints,
    useFetchComplaintsById,
    useFetchComplaintByUserId,
    useHandleDeleteComplaint,
    fetchAllComplaintsData,
  };
};
