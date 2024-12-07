import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import {
  FormLabel,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  Form,
} from '@/components/ui/form';
import { Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { guestFormSchema } from '@/lib/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DateTimePicker } from '../ui/date-time-picker';
import InputMask from '@mona-health/react-input-mask';

const GuestRegistrationForm = () => {
  // const form = useForm<FormData>();
  const [formData, setFormData] = useState<z.infer<typeof guestFormSchema> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof guestFormSchema>>({
    resolver: zodResolver(guestFormSchema),
    // defaultValues: announcementForm,
  });

  const onSubmit = (data: z.infer<typeof guestFormSchema>) => {
    setFormData(data);
    setIsDialogOpen(true);
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${hour % 12 || 12}:${minutes} ${ampm}`;
  };
  const handlePrint = () => {
    if (formData) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
            <html>
              <head>
                <title>Guest Registration Details</title>
                <style>
                  @page { margin: 0; }
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
                  .container { max-width: 800px; margin: 0 auto; }
                  .header { background-color: #f0f0f0; padding: 20px; margin-bottom: 20px; }
                  .header h1 { margin: 0; color: #2c3e50; }
                  .section { margin-bottom: 20px; }
                  .section h2 { color: #2c3e50; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
                  .photo { float: right; max-width: 150px; margin-left: 20px; }
                  .photo img { max-width: 100%; height: auto; border: 1px solid #ddd; }
                  .info-grid { display: grid; grid-template-columns: auto 1fr; gap: 10px; }
                  .info-grid strong { font-weight: bold; }
                  .purpose { background-color: #f9f9f9; padding: 15px; border-radius: 5px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>Guest Registration Details</h1>
                    <p>${new Date().toLocaleString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}</p>
                  </div>
                  <div class="section">
                    <h2>Personal Information</h2>
                    ${
                      photoPreview
                        ? `<div class="photo"><img src="${photoPreview}" alt="Guest Photo"></div>`
                        : ''
                    }
                    <div class="info-grid">
                      <strong>Full Name:</strong> <span>${formData.firstName} ${
          formData.lastName
        }</span>
                      <strong>Contact Number:</strong> <span>${formData.contactNumber}</span>
                      <strong>Email Address:</strong> <span>${formData.email}</span>
                      <strong>CNIC Number:</strong> <span>${formData.cnic || 'N/A'}</span>
                    </div>
                  </div>
                  <div class="section">
                    <h2>Visit Information</h2>
                    <div class="info-grid">
                      <strong>Date of Visit:</strong> <span>${new Date(
                        formData.dateOfVisit,
                      ).toLocaleString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}</span>
                      <strong>Time of Visit:</strong> <span>${
                        formData.timeOfVisit ? formatTime(formData.timeOfVisit) : ''
                      }</span>
                      <strong>Host Name:</strong> <span>${formData.hostName}</span>
                      <strong>Department:</strong> <span>${formData.department || 'N/A'}</span>
                    </div>
                  </div>
                  <div class="section">
                    <h2>Purpose of Visit</h2>
                    <div class="purpose">${formData.purposeOfVisit}</div>
                  </div>
                </div>
              </body>
            </html>
          `);
        printWindow.document.close();
        printWindow.onload = function () {
          printWindow.print();
          printWindow.onafterprint = function () {
            printWindow.close();
          };
        };
      }
    }
  };

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  type GuestFormFieldNames =
    | 'firstName'
    | 'lastName'
    | 'email'
    | 'cnic'
    | 'contactNumber'
    | 'guestImage'
    | 'dateOfVisit'
    | 'timeOfVisit'
    | 'purposeOfVisit'
    | 'hostName'
    | 'department';

  const requiredFields: GuestFormFieldNames[] = [
    'firstName',
    'lastName',
    'contactNumber',
    'email',
    'cnic',
    'dateOfVisit',
    'timeOfVisit',
    'hostName',
    'purposeOfVisit',
  ];

  const isFormValid = () => {
    const { errors, isDirty } = form.formState;
    const allFieldsFilled = requiredFields.every((field) => form.getValues(field));
    return isDirty && allFieldsFilled && Object.keys(errors).length === 0;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-gray-100 p-4"
    >
      <Card className="w-full max-w-4xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-primary">
            Guest Registration Form
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <h2 className="text-xl font-semibold mb-4 text-primary">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="firstName"
                    rules={{ required: 'First name is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="First Name" {...field} className="w-full" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    rules={{ required: 'Last name is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Last Name" {...field} className="w-full" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactNumber"
                    rules={{ required: 'Contact number is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Number</FormLabel>
                        <FormControl>
                          <InputMask
                            mask="+92 9999999999"
                            value={field.value?.startsWith('+92') ? field.value : '+92 '}
                            onChange={field.onChange}
                            maskChar={null}
                          >
                            <Input placeholder="Contact Number" className="w-full" />
                          </InputMask>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    rules={{
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Email Address" {...field} className="w-full" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cnic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CNIC</FormLabel>
                        <FormControl>
                          <InputMask
                            mask="99999-9999999-9"
                            value={field.value || ''}
                            onChange={field.onChange}
                          >
                            <Input placeholder="cnic" className="w-full" />
                          </InputMask>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="guestImage"
                    render={({ field: { onChange, value, ...rest } }) => (
                      <FormItem>
                        <FormLabel>Photo Upload (Optional)</FormLabel>
                        <FormControl>
                          <div className="flex items-center space-x-4">
                            <div className="relative w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                              {photoPreview ? (
                                <img
                                  src={photoPreview}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="flex items-center justify-center w-full h-full">
                                  <Upload className="w-8 h-8 text-gray-400" />
                                </div>
                              )}
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    onChange(file);
                                    setPhotoPreview(URL.createObjectURL(file));
                                  }
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                {...rest}
                              />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-500">
                                Click or drag and drop to upload a photo
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                Supported formats: JPG, PNG, GIF
                              </p>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <h2 className="text-xl font-semibold mb-4 text-primary">Visit Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="dateOfVisit"
                    // rules={{ required: 'Date of visit is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Visit</FormLabel>
                        <FormControl>
                          <DateTimePicker
                            granularity="day"
                            value={field.value || undefined} // Pass null when date is invalid
                            onChange={field.onChange} // Handle change
                            displayFormat={{ hour24: 'PPPP' }}
                          />
                          {/* <Input type="date" {...field} className="w-full" /> */}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="timeOfVisit"
                    rules={{ required: 'Time of visit is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time of Visit (Check-in)</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} className="w-full" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="hostName"
                    rules={{ required: 'Host name is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Host Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Host Name" {...field} className="w-full" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department or Office (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Department or Office" {...field} className="w-full" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="purposeOfVisit"
                    rules={{ required: 'Purpose of visit is required' }}
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Purpose of Visit</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Purpose of Visit" {...field} className="w-full" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="flex items-center justify-end space-x-4"
              >
                <Button
                  type="submit"
                  className="w-32 px-4"
                  disabled={!isFormValid() || Object.keys(form.formState.errors).length > 0}
                  // disabled={Object.keys(form.formState.errors).length > 0} // Disable if there are errors or if formData is not set
                >
                  Preview
                </Button>
                <Button
                  onClick={handlePrint}
                  className="w-32 px-4"
                  disabled={!isFormValid() || Object.keys(form.formState.errors).length > 0}
                  // disabled={Object.keys(form.formState.errors).length > 0} // Disable if there are errors
                >
                  Print
                </Button>
              </motion.div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
          {formData && (
            <div className="flex flex-col">
              <div className="bg-primary p-6 text-primary-foreground">
                <h2 className="text-2xl font-bold">Guest Registration Details</h2>
                <p className="text-sm opacity-90">Review and confirm the information below</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 space-y-2">
                    <h3 className="text-lg font-semibold text-primary">Personal Information</h3>
                    <p>
                      <strong>Full Name:</strong> {formData.firstName} {formData.lastName}
                    </p>
                    <p>
                      <strong>Contact Number:</strong> {formData.contactNumber}
                    </p>
                    <p>
                      <strong>Email Address:</strong> {formData.email}
                    </p>
                    <p>
                      <strong>CNIC Number:</strong> {formData.cnic || 'N/A'}
                    </p>
                  </div>
                  {photoPreview && (
                    <div className="flex-shrink-0">
                      <img
                        src={photoPreview}
                        alt="Guest Photo"
                        className="w-32 h-32 object-cover rounded-md border-2 border-primary shadow-md"
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-primary">Visit Information</h3>
                  <p>
                    <strong>Date of Visit:</strong>{' '}
                    {new Date(formData.dateOfVisit).toLocaleString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p>
                    <strong>Time of Visit:</strong>{' '}
                    {formData.timeOfVisit ? formatTime(formData.timeOfVisit) : ''}
                  </p>
                  <p>
                    <strong>Host Name:</strong> {formData.hostName}
                  </p>
                  <p>
                    <strong>Department:</strong> {formData.department || 'N/A'}
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-primary">Purpose of Visit</h3>
                  <p className="text-gray-700 bg-gray-100 p-3 rounded-md break-words break-all">
                    {formData.purposeOfVisit}
                  </p>
                </div>
                <div className="flex justify-end pt-4 border-t">
                  <Button onClick={handlePrint} className="w-32">
                    Print
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default GuestRegistrationForm;
