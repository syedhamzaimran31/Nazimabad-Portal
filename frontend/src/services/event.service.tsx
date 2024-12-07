import { sortDataByDate } from '@/lib/helpers';
import {
  PaginatedEventResponse,
  EventResponseType,
  errorType,
  CreateEventRequestType,
} from '@/lib/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import tokenService from './token.service';
import axios from '@/lib/config/axios-instance';

export const EventService = () => {
  const { toast } = useToast();
  const userRole = tokenService.getUserRole();
  console.log(userRole);

  const useHandleAddEvent = () => {
    const queryClient = useQueryClient();
    function handleAddEvent(data: FormData): Promise<CreateEventRequestType> {
      return axios.post(`/events`, data).then((res) => res.data);
    }
    return useMutation({
      mutationFn: handleAddEvent,
      onSuccess: () => {
        toast({
          variant: 'success',
          title: 'Succussfully added',
          description: 'Event added successfully',
        });
        queryClient.invalidateQueries({ queryKey: ['events'] });
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

  const useHandleUpdateEvent = (id: string) => {
    const queryClient = useQueryClient();
    function handleUpdateEvent(data: FormData): Promise<CreateEventRequestType> {
      return axios.patch(`/events/${id}`, data).then((res) => res.data);
    }
    return useMutation({
      mutationFn: handleUpdateEvent,
      onSuccess: () => {
        toast({
          variant: 'success',
          title: 'Successfully updated',
          description: 'Event updated successfully',
        });
        queryClient.invalidateQueries({ queryKey: ['events'] });
      },
      retry: 0,
    });
  };

  const useFetchAllEvents = () => {
    async function fetchEvents(): Promise<PaginatedEventResponse> {
      let userId = tokenService.getUserId();
      console.log(`USER ROLE ${userRole}`);
      userId = userRole === 'Residence' ? userId : '';
      console.log(`User ID BEFOR CALL ${userId}`);
      const response = await axios.get(`/events`, {
        params: { userId }, // Send page and limit as query params
      });
      console.log('Fetched Data with :', response.data);

      const sortedEvents = sortDataByDate<EventResponseType>(
        response.data.data,
        'created_at',
        'desc',
      );
      console.log('Sorted Events:', sortedEvents);
      return {
        data: sortedEvents,
        total: response.data.total, // total events
        page: response.data.page, // current page
        lastPage: response.data.lastPage, // last page
        limit: response.data.limit, // items per page
      };
    }
    return useQuery({
      queryFn: fetchEvents,
      queryKey: ['events'], // Use page as part of the query key to refetch when page changes
    });
  };

  const useFetchEventsById = (id: string) => {
    return useQuery({
      queryKey: ['events', id],
      queryFn: async () => {
        const response = await axios.get(`/events/${id}`);
        console.log(response.data);
        console.log(response.data.data);
        return response.data.data;
      },
    });
  };

  const useHandleDeleteEvent = () => {
    const queryClient = useQueryClient();
    async function deleteEvent(id: string | number): Promise<any> {
      return axios.delete(`/events/${id}`).then((res) => res.data);
    }

    return useMutation({
      mutationFn: deleteEvent,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['events'] });
        toast({
          variant: 'success',
          title: 'Successfully deleted',
          description: 'Event deleted successfully',
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
    useHandleAddEvent,
    useHandleUpdateEvent,
    useFetchAllEvents,
    useFetchEventsById,
    useHandleDeleteEvent,
  };
};
