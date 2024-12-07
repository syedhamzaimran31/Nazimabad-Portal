import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useVisitorStore } from '@/store/visitor-store';
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
import VisitorService from '@/services/visitor.service';
import { visitorFormSchema } from '@/lib/schemas';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import InputMask from '@mona-health/react-input-mask';
import { useEffect, useState } from 'react';
import { ImagePreviewDialog } from '@/components/widgets/image-preview-dialog';
import { handleImageChange, useImagePreview } from '@/lib/helpers';
import { Eraser } from 'lucide-react';
import { DateTimePicker } from '@/components/ui/date-time-picker';

export default function AddVisitorPage() {
  const [imagePreviews, setImagePreviews] = useState<Record<number, string | null>>({});

  const { selectedImage, handleImageClick, handleCloseImagePreview } = useImagePreview();

  const { id } = useParams();
  console.log(id);
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/visitors'); // Change the path to your "View Visitors" page route
  };

  const { visitorForm, setVisitorForm, resetVisitorForm, editMode, setEditMode } =
    useVisitorStore();

  const { useHandleAddVisitor, useFetchVisitorById, useHandleUpdateVisitor } = VisitorService();

  const form = useForm<z.infer<typeof visitorFormSchema>>({
    resolver: zodResolver(visitorFormSchema),
    defaultValues: visitorForm,
  });

  const { control, handleSubmit } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'persons',
  });

  const { mutate: handleVisitor } = useHandleAddVisitor();

  const { data: visitorData } = useFetchVisitorById(id || '');
  const visitor = visitorData?.data[0] || [];

  console.log(visitorData);
  console.log(visitor);

  const { mutate: handleUpdateVisitor } = useHandleUpdateVisitor(id || '');
  const numberOfPersons = form.watch('numberOfPersons');
  console.log(`Fetch Visitor by id ${visitor}`);

  useEffect(() => {
    const minPersons = Math.max(numberOfPersons, 1); // Ensure minimum value of 1
    if (minPersons > fields.length) {
      for (let i = fields.length; i < minPersons; i++) {
        console.log(`IF condition ${i}, min perosn${minPersons}, fields: ${fields.length}`);
        append({ name: '', cnic: '', cnicImage: '' });
      }
    } else if (minPersons < fields.length) {
      for (let i = fields.length; i > minPersons; i--) {
        console.log(`else if condition ${i}, min perosn${minPersons}, fields: ${fields.length}`);
        remove(i - 1);
        setImagePreviews((prev) => {
          const updatedPreviews = { ...prev };
          delete updatedPreviews[i - 1]; // Remove image preview for the removed index
          return updatedPreviews;
        });
      }
    }

    console.log(`In useEffect ${numberOfPersons}`);
    form.setValue('numberOfPersons', minPersons);
  }, [numberOfPersons, fields, append, remove]);

  useEffect(() => {
    if (id && visitor) {
      setEditMode(true);
      const { vehicleType, numberPlate, numberOfPersons, persons, visitDate } = visitor;
      // Setting the values for the form
      form.setValue('vehicleType', vehicleType);
      form.setValue('numberPlate', numberPlate);

      const validNumberOfPersons = Math.max(Number(numberOfPersons), persons?.length);

      form.setValue('numberOfPersons', validNumberOfPersons);
      if (visitDate && !isNaN(new Date(visitDate).getTime())) {
        form.setValue('visitDate', new Date(visitDate));
      } else {
        form.setValue('visitDate', null); // Or a default date if necessary
      }
      type Person = z.infer<typeof visitorFormSchema>['persons'][number];

      // Clear the current fields first to avoid conflicts
      form.unregister('persons');

      // Setting the values for persons
      persons?.map((person: Person, index: number) => {
        form.setValue(`persons.${index}.name`, person.name);
        form.setValue(`persons.${index}.cnic`, person.cnic);
        form.setValue(`persons.${index}.cnicImage`, person.cnicImage); // This could be a URL string or a File object

        if (typeof person?.cnicImage === 'string') {
          const imageUrl = person?.cnicImage;
          // const imageName = imageUrl.split('/').pop(); // Extract the file name
          // const cleanFileName = imageName?.substring(imageName.indexOf('_') + 1);
          form.setValue(`persons.${index}.cnicImage`, imageUrl || '');

          setImagePreviews((prev: any) => ({
            ...prev,
            [index]: imageUrl,
          }));
        }
      });
    } else {
      setEditMode(false);
      form.reset({
        numberOfPersons: 1, // Explicitly reset numberOfPersons to 1
      });
      resetVisitorForm();
    }
  }, [id, visitorData, form, resetVisitorForm, setEditMode]);

  function onSubmit(values: z.infer<typeof visitorFormSchema>) {
    const formData = new FormData();
    formData.append('vehicleType', values.vehicleType || ''); // Ensure default value if empty
    console.log(values.numberPlate);

    formData.append('numberPlate', values.numberPlate.toString() || ''); // Ensure default value if empty
    formData.append('numberOfPersons', values.numberOfPersons.toString());

    if (values.visitDate) {
      const formattedDate = moment(values.visitDate).format('DD/MM/YYYY');
      formData.append('visitDate', formattedDate); // Append formatted date
    }

    values.persons.map((person, index) => {
      formData.append(`persons[${index}][name]`, person.name || '');
      formData.append(`persons[${index}][cnic]`, person.cnic || '');

      if (person.cnicImage instanceof File) {
        formData.append(`persons[${index}][cnicImage]`, person.cnicImage);
      } else if (typeof person.cnicImage === 'string') {
        // If cnicImage is a string, append it directly
        formData.append(`persons[${index}][cnicImage]`, person.cnicImage);
      }
    });
    if (editMode) {
      handleUpdateVisitor(formData, {
        onSuccess: () => {
          resetVisitorForm();
          setEditMode(false);
          navigate('/visitors');
        },
        onError: (error) => {
          console.error('Error:', error);
        },
      });
    } else {
      handleVisitor(formData, {
        onSuccess: () => {
          resetVisitorForm();
          navigate('/visitors');
        },
        onError: (error) => {
          console.error('Error:', error);
        },
      });
    }
    setVisitorForm(values);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* {isVisitorUpdateLoading ? (
        <div className="flex justify-center items-center h-screen">
          <Oval
            height={80}
            width={80}
            color="#4fa94d"
            visible={true}
            ariaLabel="oval-loading"
            secondaryColor="#4fa94d"
            strokeWidth={2}
            strokeWidthSecondary={2}
          />
        </div>
      ) : ( */}
      <>
        <h1 className="text-3xl font-bold mb-6">
          {editMode ? 'Edit Visitor Profile' : ' Add Visitor Profile'}
        </h1>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="vehicleType">Vehicle Type</Label>
                <FormField
                  control={form.control}
                  name="vehicleType"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select vehicle type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Car">Car</SelectItem>
                            <SelectItem value="Bike">Bike</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="numberPlate">Vehicle Number</Label>
                <FormField
                  control={form.control}
                  name="numberPlate"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <InputMask
                          mask="aaa-999"
                          value={field.value || ''}
                          onChange={field.onChange}
                          maskChar={null}
                        >
                          <Input id="numberPlate" placeholder="Enter vehicle number" />
                        </InputMask>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="numberOfPersons">Number of Persons</Label>
                <FormField
                  control={form.control}
                  name="numberOfPersons"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Select
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value ? String(field.value) : ''}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select number of persons" />
                          </SelectTrigger>
                          <SelectContent>
                            {/* Generate numbers from 1 to 100 */}
                            {[...Array(100).keys()].map((num) => (
                              <SelectItem key={num + 1} value={String(num + 1)}>
                                {num + 1}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="visitDate">Visit Date</Label>
                <FormField
                  control={form.control}
                  name="visitDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <DateTimePicker
                          granularity="day"
                          value={field.value || undefined} // Pass null when date is invalid
                          onChange={field.onChange} // Handle change
                          displayFormat={{ hour24: 'PPPP' }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className="mt-6">
              <Label className="text-lg font-semibold">Persons</Label>
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex flex-col gap-4 mb-6 border p-4 rounded-md shadow-sm"
                >
                  <div className="flex flex-col md:flex-row gap-4">
                    <FormField
                      control={form.control}
                      name={`persons.${index}.name`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="Person Name" type="text" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`persons.${index}.cnic`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <InputMask
                              mask="99999-9999999-9"
                              value={field.value || ''}
                              onChange={field.onChange}
                            >
                              <Input placeholder="CNIC" />
                            </InputMask>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`persons.${index}.cnicImage`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <>
                              <Input
                                id={`file-input-${index}`} // Add unique id for each file input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0] || null;
                                  if (file) {
                                    field.onChange(file);
                                    handleImageChange(index, file, setImagePreviews);
                                  } else {
                                    field.onChange(null);
                                    setImagePreviews((prev) => ({
                                      ...prev,
                                      [index]: null,
                                    }));
                                  }
                                }}
                              />
                            </>
                          </FormControl>
                          <FormMessage />
                          {/* {typeof field.value === 'string' && (
                            <div className="te">{field.value?.toString()}</div>
                          )} */}
                          {imagePreviews[index] && (
                            <div className="relative mt-2 h-24 w-56">
                              <img
                                src={imagePreviews[index] || ''}
                                onClick={() => handleImageClick(imagePreviews[index] as string)}
                                alt="CNIC Preview"
                                className="mt-2 h-24 w-56 object-cover rounded-md"
                              />

                              {/* Edit button overlay */}
                              <button
                                type="button"
                                onClick={() =>
                                  document.getElementById(`file-input-${index}`)?.click()
                                } // Trigger file input
                                className="absolute inset-0 flex items-center justify-center rounded-md bg-black bg-opacity-50 text-white text-sm font-semibold hover:bg-opacity-70"
                              >
                                Edit
                              </button>
                            </div>
                          )}
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => {
                      debugger;
                      //   // Clear the form fields for this person instead of removing the index
                      form.setValue(`persons.${index}.name`, ''); // Reset name field
                      form.setValue(`persons.${index}.cnic`, ''); // Reset CNIC field
                      form.setValue(`persons.${index}.cnicImage`, ''); // Reset CNIC Image field

                      // Clear the actual file input (if needed, select it by id or ref)
                      const fileInput = document.getElementById(
                        `file-input-${index}`,
                      ) as HTMLInputElement;
                      if (fileInput) {
                        fileInput.value = ''; // Clear the file input field
                      }
                      // Reset the image preview for the current index
                      setImagePreviews((prevPreviews) => {
                        const updatedPreviews = { ...prevPreviews };
                        updatedPreviews[index] = null; // Clear image preview
                        return updatedPreviews;
                      });
                      // remove(index);
                    }}
                    className="self-end w-32"
                  >
                    <div className="flex items-center space-x-2">
                      <Eraser className="h-4 w-4" />
                      <span>Erase fields</span>
                    </div>
                  </Button>
                </div>
              ))}
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
        <ImagePreviewDialog
          imageUrl={selectedImage || ''} // Ensure imageUrl is a string
          onClose={handleCloseImagePreview}
        />{' '}
      </>
      {/* )} */}
    </div>
  );
}
