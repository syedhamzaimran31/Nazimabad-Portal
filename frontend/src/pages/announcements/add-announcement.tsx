import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormField, FormItem, FormMessage, FormControl } from '@/components/ui/form';
import { announcementFormSchema } from '@/lib/schemas';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AnnouncementService } from '@/services/announcement.service';
import { useAnnouncementStore } from '@/store/announcement-store';
import { handleImageChange, useImagePreview } from '@/lib/helpers';
import { Textarea } from '@/components/ui/textarea';
import { ImagePreviewDialog } from '@/components/widgets/image-preview-dialog';

export default function AddAnnouncementPage() {
  const [imagePreviews, setImagePreviews] = useState<Record<number, string | null>>({});
  const { selectedImage, handleImageClick, handleCloseImagePreview } = useImagePreview();

  const { id } = useParams();
  const { announcementForm, setAnnouncementForm, resetAnnouncementForm, editMode, setEditMode } =
    useAnnouncementStore();

  const navigate = useNavigate();
  const { useHandleAddAnnouncement, useHandleUpdateAnnouncement, useFetchAnnouncementById } =
    AnnouncementService();

  const form = useForm<z.infer<typeof announcementFormSchema>>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: announcementForm,
  });
  const { handleSubmit } = form;

  const { mutate: handleAddAnnouncement } = useHandleAddAnnouncement();
  const { data: announcementData } = useFetchAnnouncementById(id || '');

  const { mutate: handleUpdateAnnouncement } = useHandleUpdateAnnouncement(id || '');
  console.log(announcementData);
  useEffect(() => {
    if (id && announcementData) {
      setEditMode(true);
      const { title, content, announcementImage } = announcementData;
      form.setValue('title', title);
      form.setValue('content', content);
      form.setValue('announcementImage', announcementImage);

      if (announcementImage && typeof announcementImage === 'string') {
        form.setValue('announcementImage', announcementImage || '');
        setImagePreviews((prev) => ({
          ...prev,
          [0]: announcementImage,
        }));
      }
    } else {
      setEditMode(false);
      resetAnnouncementForm();
    }
  }, [announcementData]);

  function onSubmit(values: z.infer<typeof announcementFormSchema>) {
    const formData = new FormData();
    formData.append('title', values.title || ''); // Ensure default value if empty
    console.log(values.title);
    formData.append('content', values.content || ''); // Ensure default value if empty
    if (values.announcementImage instanceof File) {
      // Only append the file if a new one is selected
      formData.append('announcementImage', values.announcementImage);
    } else if (typeof values.announcementImage === 'string') {
      // Append the existing image URL if no new file is selected
      formData.append('announcementImage', form.getValues('announcementImage') || '');
    }

    if (editMode) {
      handleUpdateAnnouncement(formData, {
        onSuccess: () => {
          resetAnnouncementForm();
          setEditMode(false);
          navigate('/announcements/admin');
        },
        onError: (error) => {
          console.error('Error:', error);
        },
      });
    } else {
      handleAddAnnouncement(formData, {
        onSuccess: () => {
          resetAnnouncementForm();
          navigate('/announcements/admin');
        },
        onError: (error) => {
          console.error('Error:', error);
        },
      });
    }
    setAnnouncementForm(values);
  }

  const handleBack = () => {
    navigate('/announcements/admin'); // Change the path to your "View Visitors" page route
  };

  return (
    <div className="flex justify-center min-h-screen p-6 ">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">
          {editMode ? 'Edit Announcement' : 'Add Announcement'}
        </h1>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-y-0 gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="announcement">Announcement Title</Label>
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input id="title" placeholder="Enter Announcement Title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="description">Announcement Description</Label>
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          id="content"
                          placeholder="Enter Announcement Description"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="announcementImage">Announcement Image</Label>
                <FormField
                  control={form.control}
                  name="announcementImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          id="announcementImage"
                          placeholder="Attach Announcement Image"
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
                          alt="Announcement Preview"
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
      <ImagePreviewDialog
        imageUrl={selectedImage || ''} // Ensure imageUrl is a string
        onClose={handleCloseImagePreview}
      />{' '}
    </div>
  );
}
