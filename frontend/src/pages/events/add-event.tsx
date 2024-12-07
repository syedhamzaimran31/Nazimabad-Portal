import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputMask from '@mona-health/react-input-mask';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Form, FormField, FormItem, FormMessage, FormControl } from '@/components/ui/form';
import { handleImageChange, useImagePreview } from '@/lib/helpers';
import { eventFormSchema } from '@/lib/schemas';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { useEventStore } from '@/store/event-store';
import { EventService } from '@/services/event.service';
import { DateTimePicker } from '@/components/ui/date-time-picker';

export default function AddEventPage() {
  const [imagePreviews, setImagePreviews] = useState<Record<number, string | null>>({});
  const { handleImageClick } = useImagePreview();

  const { id } = useParams();
  const navigate = useNavigate();

  const { eventForm, setEventForm, resetEventForm, editMode, setEditMode } = useEventStore();

  const { useHandleAddEvent, useFetchEventsById, useHandleUpdateEvent } = EventService();

  const form = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: eventForm,
  });

  const { handleSubmit } = form;

  const { mutate: handleAddEvent } = useHandleAddEvent();
  const { data: eventData } = useFetchEventsById(id || '');
  console.log(eventData);

  const { mutate: handleUpdateEvent } = useHandleUpdateEvent(id || '');
  console.log(handleUpdateEvent);

  useEffect(() => {
    if (id && eventData) {
      setEditMode(true);
      const {
        title,
        description,
        eventImages,
        eventType,
        location,
        locationLink,
        startDateTime,
        endDateTime,
        isFree,
        isCanceled,
        organizerName,
        organizerContact,
      } = eventData;
      form.setValue('title', title);
      form.setValue('description', description);
      form.setValue('eventType', eventType);
      form.setValue('eventImages', eventImages);
      form.setValue('location', location);
      form.setValue('locationLink', locationLink);
      form.setValue('startDateTime', new Date(startDateTime));
      form.setValue('endDateTime', new Date(endDateTime));
      form.setValue('isFree', isFree);
      form.setValue('isCanceled', isCanceled);
      form.setValue('organizerName', organizerName);
      form.setValue('organizerContact', organizerContact);

      if (eventImages && Array.isArray(eventImages)) {
        form.setValue('eventImages', eventImages[0] || '');
        setImagePreviews((prev) => ({
          ...prev,
          [0]: eventImages[0],
        }));
      }
    } else {
      setEditMode(false);
      form.reset();
    }
  }, [eventData]);

  function onSubmit(values: z.infer<typeof eventFormSchema>) {
    const formData = new FormData();
    formData.append('title', values.title || ''); // Ensure default value if empty
    console.log(values.title);
    formData.append('description', values.description || ''); // Ensure default value if empty
    formData.append('eventType', values.eventType);
    formData.append('location', values.location);
    formData.append('locationLink', values.locationLink || '');
    formData.append('startDateTime', values.startDateTime.toISOString() || '');
    formData.append('endDateTime', values.endDateTime?.toISOString() || '');
    // Handle isFree when it might be undefined
    formData.append('isFree', values.isFree !== undefined ? values.isFree.toString() : 'false');
    // Handle isCanceled in a similar way
    formData.append(
      'isCanceled',
      values.isCanceled !== undefined ? values.isCanceled.toString() : 'false',
    );
    formData.append('organizerName', values.organizerName || '');
    formData.append('organizerContact', values.organizerContact || '');

    if (values.eventImages instanceof File) {
      // Only append the file if a new one is selected
      formData.append('eventImages', values.eventImages);
    } else if (Array.isArray(values.eventImages)) {
      // Append the existing image URL if no new file is selected
      formData.append('eventImages', values.eventImages);
    }

    if (editMode) {
      handleUpdateEvent(formData, {
        onSuccess: () => {
          resetEventForm();
          setEditMode(false);
          navigate('/events');
        },
        onError: (error) => {
          console.error('Error:', error);
        },
      });
    } else {
      handleAddEvent(formData, {
        onSuccess: () => {
          resetEventForm();
          navigate('/events');
        },
        onError: (error) => {
          console.error('Error:', error);
        },
      });
    }
    setEventForm(values);
  }

  const handleBack = () => {
    navigate('/events'); // Change the path to your "View Visitors" page route
  };
  return (
    <div className="flex justify-center min-h-screen p-6 ">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">{editMode ? 'Edit Event' : 'Add Event'}</h1>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="title">Event Title</Label>
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input id="title" placeholder="Enter Event Title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="eventType">Event Type</Label>
                <FormField
                  control={form.control}
                  name="eventType"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select event type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Conference">Conference</SelectItem>
                            <SelectItem value="WorkShop">WorkShop</SelectItem>
                            <SelectItem value="Meeting">Meeting</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="startEventDate">Start Date and Time</Label>
                <FormField
                  control={form.control}
                  name="startDateTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <DateTimePicker
                          hourCycle={12}
                          value={field.value} // Pass the Date object directly
                          onChange={field.onChange} // Handle change
                        />
                        {/* <Popover>
                          <PopoverTrigger asChild>
                            <Input
                              type="text"
                              value={field.value ? field.value.toISOString() : ''}
                              placeholder="Select visit date"
                              readOnly
                              onClick={() => document.getElementById('calendar')?.focus()}
                            />
                          </PopoverTrigger>
                          <PopoverContent className="p-0">
                            <Calendar
                              id="calendar"
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => {
                                field.onChange(date);
                              }}
                              className="w-full"
                            />
                          </PopoverContent>
                        </Popover> */}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="endDateTime">End Date and Time</Label>
                <FormField
                  control={form.control}
                  name="endDateTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <DateTimePicker
                          hourCycle={12}
                          value={field.value} // Pass the Date object directly
                          onChange={field.onChange} // Handle change
                        />
                        {/* <Popover>
                          <PopoverTrigger asChild>
                            <Input
                              type="text"
                              value={field.value ? field.value.toISOString() : ''}
                              placeholder="Select visit date"
                              readOnly
                              onClick={() => document.getElementById('calendar')?.focus()}
                            />
                          </PopoverTrigger>
                          <PopoverContent className="p-0">
                            <Calendar
                              id="calendar"
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => {
                                field.onChange(date);
                              }}
                              className="w-full"
                            />
                          </PopoverContent>
                        </Popover> */}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="location">Event Location</Label>
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input id="location" placeholder="Enter Event Location" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="locationLink">Location Link (Optional)</Label>
                <FormField
                  control={form.control}
                  name="locationLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          id="locationLink"
                          placeholder="https://www.google.com/maps/examplLocated"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="location">Organizer Name</Label>
                <FormField
                  control={form.control}
                  name="organizerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input id="organizerName" placeholder="name here" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="organizerContact">Organizer Contact</Label>
                <FormField
                  control={form.control}
                  name="organizerContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <InputMask
                          mask="+92 9999999999"
                          value={field.value?.startsWith('+92') ? field.value : '+92 '}
                          onChange={field.onChange}
                          maskChar={null}
                        >
                          <Input id="organizerContact" placeholder="+92 3303111484" />
                        </InputMask>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="description">Event Description</Label>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          id="description"
                          placeholder="Enter Event Description"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="eventImages">Event Image </Label>
                <FormField
                  control={form.control}
                  name="eventImages"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          id="eventImages"
                          placeholder="Attach Event Image"
                          accept="image/*"
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            if (file) {
                              field.onChange(file);
                              handleImageChange(0, file, setImagePreviews); // Use the helper function
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                      {imagePreviews[0] && (
                        <img
                          src={imagePreviews[0] || ''}
                          onClick={() => handleImageClick(imagePreviews[0] as string)}
                          alt="CNIC Preview"
                          className="mt-2 h-56 w-full object-cover rounded-md"
                        />
                      )}
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                className="bg-gray-200 text-gray-700 mr-5"
              >
                Cancel
              </Button>

              <Button type="submit" className="bg-green-800">
                {editMode ? 'Update' : 'Save'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
