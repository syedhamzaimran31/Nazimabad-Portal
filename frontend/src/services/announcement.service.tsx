import { sortDataByDate } from '@/lib/helpers';
import { PaginatedAnnouncementResponse, announcementType, errorType } from '@/lib/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import axios from '@/lib/config/axios-instance';

export const AnnouncementService = () => {
  const { toast } = useToast();

  const useHandleAddAnnouncement = () => {
    const queryClient = useQueryClient();
    function handleAddAnnouncement(data: FormData): Promise<announcementType> {
      return axios.post(`/announcement`, data).then((res) => res.data);
    }
    return useMutation({
      mutationFn: handleAddAnnouncement,
      onSuccess: () => {
        toast({
          variant: 'success',
          title: 'Successfully added',
          description: 'Announcement added successfully',
        });
        queryClient.invalidateQueries({ queryKey: ['announcement'] });
      },
      retry: 0,
    });
  };

  const useFetchAllAnnouncements = (page?: number, limit?: number) => {
    async function fetchAnnouncements(): Promise<PaginatedAnnouncementResponse> {
      const response = await axios.get(`/announcement`, {
        params: { page, limit }, // Send page and limit as query params
      });
      const sortedAnnouncements = sortDataByDate<announcementType>(
        response.data.data,
        'created_at',
        'desc',
      );
      console.log(sortedAnnouncements);
      return {
        data: sortedAnnouncements,
        total: response.data.total, // total complaints
        page: response.data.page, // current page
        limit: response.data.limit, // items per page
      };
    }
    return useQuery({
      queryFn: fetchAnnouncements,
      queryKey: ['announcement'],
    });
  };

  const useFetchAnnouncementById = (id: string) => {
    return useQuery({
      queryKey: ['announcement', id],
      queryFn: async () => {
        if (!id) {
          throw new Error('ID is required to fetch announcement.');
        }
        const response = await axios.get(`/announcement?id=${id}`);
        console.log(response.data);
        return response.data.data[0];
      },
      enabled: !!id,
    });
  };

  const useHandleUpdateAnnouncement = (id: string) => {
    const queryClient = useQueryClient();
    function handleUpdateAnnouncement(data: FormData): Promise<announcementType> {
      return axios.put(`/announcement/${id}`, data).then((res) => res.data);
    }
    return useMutation({
      mutationFn: handleUpdateAnnouncement,
      onSuccess: () => {
        toast({
          variant: 'success',
          title: 'Successfully updated',
          description: 'Announcement updated successfully',
        });
        queryClient.invalidateQueries({ queryKey: ['announcement'] });
      },
      retry: 0,
    });
  };

  const fetchAllAnnouncementData = async (): Promise<PaginatedAnnouncementResponse> => {
    try {
      const response = await axios.get(`/announcement`);
      console.log('Fetched Data:', response.data);
      const sortedAnnouncements = sortDataByDate<announcementType>(
        response.data.data,
        'created_at',
        'desc',
      );
      console.log('Sorted Complaints:', sortedAnnouncements);
      return {
        data: sortedAnnouncements,
        total: response.data.total, // total complaints
        page: response.data.page, // current page
        limit: response.data.limit, // items per page
      };
    } catch (error) {
      console.error('Error fetching complaints data:', error);
      throw error; // Rethrow error to handle it in the caller
    }
  };

  const useHandleDeleteAnnouncement = () => {
    const queryClient = useQueryClient();
    async function deleteComplaint(id: string | number): Promise<any> {
      return axios.delete(`/announcement/${id}`).then((res) => res.data);
    }

    return useMutation({
      mutationFn: deleteComplaint,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['announcement'] });
        toast({
          variant: 'success',
          title: 'Successfully deleted',
          description: 'Announcement deleted successfully',
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
    useHandleAddAnnouncement,
    useFetchAllAnnouncements,
    useFetchAnnouncementById,
    fetchAllAnnouncementData,
    useHandleUpdateAnnouncement,
    useHandleDeleteAnnouncement,
  };
};
