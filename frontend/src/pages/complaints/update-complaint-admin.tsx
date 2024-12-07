import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormField, FormItem, FormMessage, FormControl } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { complaintAdminFormSchema } from '@/lib/schemas';
import { useComplaintAdminStore } from '@/store/complaint.store';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { ComplaintService } from '@/services/complaint.service';
import { useEffect } from 'react';
import { Label } from '@/components/ui/label';
export default function UpdateComlaintAdminPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { complaintAdminForm, setComplaintAdminForm, resetComplaintAdminForm } =
    useComplaintAdminStore();

  const { useHandleUpdateComplaintAdmin, useFetchComplaintsById } = ComplaintService();

  const form = useForm<z.infer<typeof complaintAdminFormSchema>>({
    resolver: zodResolver(complaintAdminFormSchema),
    defaultValues: complaintAdminForm,
  });

  const { handleSubmit } = form;

  const { data: complaintData } = useFetchComplaintsById(id || '');

  const { mutate: handleUpdateComplaintAdmin } = useHandleUpdateComplaintAdmin(Number(id));
  console.log(complaintData);

  useEffect(() => {
    if (id && complaintData?.data) {
      const { response, complaintStatus } = complaintData.data[0];
      form.setValue('response', response);
      form.setValue('complaintStatus', complaintStatus);
    } else {
      resetComplaintAdminForm();
    }
  }, [complaintData]);

  function onSubmit(values: z.infer<typeof complaintAdminFormSchema>) {
    const jsonData = {
      complaintStatus: values.complaintStatus || 'Pending',
      response: values.response || '',
    };

    // console.log('FormData:', Object.fromEntries(formData.entries()));
    handleUpdateComplaintAdmin(jsonData, {
      onSuccess: () => {
        resetComplaintAdminForm();
        navigate('/complaints');
      },
      onError: (error) => {
        console.error('Error:', error);
      },
    });
    setComplaintAdminForm(values);
  }

  const handleBack = () => {
    navigate('/complaints'); // Change the path to your "View Visitors" page route
  };

  return (
    <div className="flex justify-center min-h-screen p-6 ">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Update Complaint Status (For Admins Only)</h1>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="complaintStatus">Complaint Type</Label>
                <FormField
                  control={form.control}
                  name="complaintStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select complaint type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Progress">Progress</SelectItem>
                            <SelectItem value="Resolved">Resolved</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="response">Complaint Description</Label>
                <FormField
                  control={form.control}
                  name="response"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea id="response" placeholder="Enter Complaint Response" {...field} />
                      </FormControl>
                      <FormMessage />
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
                Save
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
