import axios from '@/lib/config/axios-instance';
import { PaginatedVisitorResponse, errorType, visitorResponseType } from '@/lib/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import TokenService from '@/services/token.service';
import { sortDataByDate } from '@/lib/helpers/index';
import { useToast } from '@/hooks/use-toast';
import tokenService from '@/services/token.service';

export const VisitorService = () => {
  const { toast } = useToast();
  const userRole = tokenService.getUserRole();
  console.log(userRole);

  const useHandleAddVisitor = () => {
    const queryClient = useQueryClient();
    function handleAddVisitor(data: FormData): Promise<visitorResponseType> {
      return axios.post(`/visitors`, data).then((res) => res.data);
    }

    return useMutation({
      mutationFn: handleAddVisitor,
      onSuccess: () => {
        toast({
          variant: 'success',
          title: 'Succussfully added',
          description: 'Visitors added successfully',
        });
        queryClient.invalidateQueries({ queryKey: ['visitors'] });
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

  const useHandleUpdateVisitor = (id: string) => {
    const queryClient = useQueryClient();
    function handleUpdateVisitor(data: FormData): Promise<visitorResponseType> {
      return axios.put(`/visitors?id=${id}`, data).then((res) => res.data);
    }
    return useMutation({
      mutationFn: handleUpdateVisitor,
      onSuccess: () => {
        toast({
          variant: 'success',
          title: 'Succussfully updated',
          description: 'Visitors updated successfully',
        });
        queryClient.invalidateQueries({ queryKey: ['visitors'] });
      },
      onError: (error: errorType) => {
        //@ts-ignore
        toast({
          variant: 'destructive',
          description: error.response?.data?.message,
        });
      },
      retry: 0,
    });
  };

  const useFetchAllVisitor = (
    page?: number,
    limit?: number,
    filters?: { visitDate?: Date; checkInTime?: Date; checkOutTime?: Date },
  ) => {
    async function fetchVisitors(): Promise<PaginatedVisitorResponse> {
      let userId = tokenService.getUserId();
      console.log('User ID:', userId);

      userId = userRole === 'Residence' ? userId : '';

      const params: any = { page, limit, userId, ...filters };

      // if (page === undefined || limit === undefined) {
      //   const response = await axios.get(`/visitors`);
      //   console.log('Fetched Data:', response.data);
      //   const sortedVisitors = sortDataByDate(
      //     response.data.data,
      //     'createdAt',
      //     'desc',
      //   ) as visitorResponseType;
      //   console.log('Sorted Visitors:', sortedVisitors);
      //   return {
      //     data: sortedVisitors,
      //     total: response.data.total, // total complaints
      //     page: response.data.page, // current page
      //     limit: response.data.limit, // items per page
      //   };
      // } else {
      const response = await axios.get(
        `/visitors`,
        { params }, // Send page and limit as query params
      );
      console.log('Fetched Data with Pagination:', response.data);
      const sortedVisitors = sortDataByDate(
        response.data.data,
        'createdAt',
        'desc',
      ) as visitorResponseType;
      console.log(sortedVisitors);
      console.log('Sorted Visitors with Pagination:', sortedVisitors);
      return {
        data: sortedVisitors,
        total: response.data.total, // total complaints
        page: response.data.page, // current page
        limit: response.data.limit, // items per page
      };
      // }
    }

    return useQuery({
      queryFn: fetchVisitors,
      queryKey: ['visitors', page, limit, filters],
    });
  };

  //service function for fetching all visitors data for export
  const fetchAllVisitorsData = async (filters?: {
    visitDate?: Date;
    checkInTime?: Date;
    checkOutTime?: Date;
  }): Promise<PaginatedVisitorResponse> => {
    try {
      let userId = tokenService.getUserId();
      console.log('User ID:', userId);

      userId = userRole === 'Residence' ? userId : '';

      const params: any = { userId, ...filters };

      const response = await axios.get(`/visitors`, { params });
      console.log('Fetched Data:', response.data);
      const sortedVisitors = sortDataByDate(
        response.data.data,
        'createdAt',
        'desc',
      ) as visitorResponseType;
      console.log('Sorted Visitors:', sortedVisitors);
      return {
        data: sortedVisitors,
        total: response.data.total, // total complaints
        page: response.data.page, // current page
        limit: response.data.limit, // items per page
      };
    } catch (error) {
      console.error('Error fetching visitors data:', error);
      throw error; // Rethrow error to handle it in the caller
    }
  };

  const useFetchVisitorByUserId = (page: number, limit: number) => {
    const userId = TokenService.getUserId();
    async function fetchVisitors(): Promise<PaginatedVisitorResponse> {
      const response = await axios.get(`/visitors`, { params: { userId, page, limit } });
      const sortedVisitors = sortDataByDate(
        response.data,
        'createdAt',
        'desc',
      ) as visitorResponseType;
      console.log(sortedVisitors);
      return {
        data: sortedVisitors,
        total: response.data.total, // total complaints
        page: response.data.page, // current page
        limit: response.data.limit, // items per page
      };
    }

    return useQuery({
      queryFn: fetchVisitors,
      queryKey: ['visitors'],
    });
  };

  const useFetchVisitorById = (visitorId: string) => {
    return useQuery({
      queryKey: ['visitors', visitorId],
      queryFn: async () => {
        const response = await axios.get(`/visitors?id=${visitorId}`);
        return response.data;
      },
      enabled: !!visitorId,
    });
  };

  const useFetchVisitorsByDate = (date: string) => {
    return useQuery({
      queryKey: ['visitors', date],
      queryFn: async () => {
        const response = await axios.get(`/visitors?date=${date}`);
        return response.data;
      },
    });
  };

  const useHandleDeleteVisitor = () => {
    const queryClient = useQueryClient();
    async function deleteVisitor(id: string | number): Promise<any> {
      return axios.delete(`/visitors/${id}`).then((res) => res.data);
    }

    return useMutation({
      mutationFn: deleteVisitor,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['visitors'] });
        toast({
          variant: 'success',
          title: 'Successfully deleted',
          description: 'Visitor deleted successfully',
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
    useHandleAddVisitor,
    useHandleUpdateVisitor,
    useFetchAllVisitor,
    useFetchVisitorByUserId,
    useFetchVisitorById,
    useFetchVisitorsByDate,
    useHandleDeleteVisitor,
    fetchAllVisitorsData,
  };
};
export default VisitorService;
