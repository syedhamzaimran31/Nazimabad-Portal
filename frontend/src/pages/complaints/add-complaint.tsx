import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useComplaintStore } from '@/store/complaint.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Form, FormField, FormItem, FormMessage, FormControl } from '@/components/ui/form';
import { handleImageChange, useImagePreview } from '@/lib/helpers';
import { complaintFormScema } from '@/lib/schemas';
import { useNavigate } from 'react-router-dom';
import { ComplaintService } from '@/services/complaint.service';
import { useEffect, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';

export default function AddComplaintPage() {
  const [imagePreviews, setImagePreviews] = useState<Record<number, string | null>>({});
  const { handleImageClick } = useImagePreview();

  const { id } = useParams();
  const navigate = useNavigate();

  const { complaintForm, setComplaintForm, resetComplaintForm, editMode, setEditMode } =
    useComplaintStore();

  const { useHandleAddComplaint, useHandleUpdateComplaint, useFetchComplaintsById } =
    ComplaintService();

  const form = useForm<z.infer<typeof complaintFormScema>>({
    resolver: zodResolver(complaintFormScema),
    defaultValues: complaintForm,
  });

  const { handleSubmit } = form;

  const { mutate: handleAddComplaint } = useHandleAddComplaint();
  const { data: complaintData } = useFetchComplaintsById(id || '');

  const { mutate: handleUpdateComplaint } = useHandleUpdateComplaint(id || '');
  console.log(complaintData);
  
  useEffect(() => {
    if (id && complaintData?.data) {
      setEditMode(true);
      const { complaint, description, complaintType, complaintImage } = complaintData.data[0];
      form.setValue('complaint', complaint);
      form.setValue('description', description);
      form.setValue('complaintType', complaintType);
      form.setValue('complaintImage', complaintImage);
      if (complaintImage && typeof complaintImage === 'string') {
        form.setValue('complaintImage', complaintImage || '');
        setImagePreviews((prev) => ({
          ...prev,
          [0]: complaintImage,
        }));
      }
    } else {
      setEditMode(false);
      resetComplaintForm();
    }
  }, [complaintData]);

  function onSubmit(values: z.infer<typeof complaintFormScema>) {
    const formData = new FormData();
    formData.append('complaint', values.complaint || ''); // Ensure default value if empty
    console.log(values.complaint);
    formData.append('description', values.description || ''); // Ensure default value if empty
    formData.append('complaintType', values.complaintType);
    if (values.complaintImage instanceof File) {
      // Only append the file if a new one is selected
      formData.append('complaintImage', values.complaintImage);
    } else if (typeof values.complaintImage === 'string') {
      // Append the existing image URL if no new file is selected
      formData.append('complaintImage', values.complaintImage);
    }

    if (editMode) {
      handleUpdateComplaint(formData, {
        onSuccess: () => {
          resetComplaintForm();
          setEditMode(false);
          navigate('/complaints');
        },
        onError: (error) => {
          console.error('Error:', error);
        },
      });
    } else {
      handleAddComplaint(formData, {
        onSuccess: () => {
          resetComplaintForm();
          navigate('/complaints');
        },
        onError: (error) => {
          console.error('Error:', error);
        },
      });
    }
    setComplaintForm(values);
  }

  const handleBack = () => {
    navigate('/complaints'); // Change the path to your "View Visitors" page route
  };
  return (
    <div className="flex justify-center min-h-screen p-6 ">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">{editMode ? 'Edit Complaint' : 'Add Complaint'}</h1>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="complaint">Complaint Title</Label>
                <FormField
                  control={form.control}
                  name="complaint"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input id="complaint" placeholder="Enter Complaint Title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="complaintType">Complaint Type</Label>
                <FormField
                  control={form.control}
                  name="complaintType"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select complaint type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Water Supply">Water Supply</SelectItem>
                            <SelectItem value="Road Maintenance">Road Maintenance</SelectItem>
                            <SelectItem value="Electricity Outage">Electricity Outage</SelectItem>
                            <SelectItem value="Security Concern">Security Concern</SelectItem>
                            <SelectItem value="Garbage Collection">Garbage Collection</SelectItem>
                            <SelectItem value="Noise Complaint">Noise Complaint</SelectItem>
                            <SelectItem value="Parking">Parking</SelectItem>
                            <SelectItem value="Drainage Problem">Drainage Problem</SelectItem>
                            <SelectItem value="Street Lighting">Street Lighting</SelectItem>
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
                <Label htmlFor="description">Complaint Description</Label>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          id="description"
                          placeholder="Enter Complaint Description"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="complaintImage">Complaint Image</Label>
                <FormField
                  control={form.control}
                  name="complaintImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          id="complaintImage"
                          placeholder="Attach Complaint Image"
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
