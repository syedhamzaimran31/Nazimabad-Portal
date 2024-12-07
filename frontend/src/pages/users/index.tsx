import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { PencilIcon, CheckIcon, CameraIcon, UploadIcon } from 'lucide-react';
import { UserService } from '@/services/user.service';
import { useForm } from 'react-hook-form';
import { userFormSchema } from '@/lib/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

export default function UserProfile() {
  const { useHandleUpdateUser, useFetchUserById } = UserService();
  const [isEditing, setIsEditing] = useState(false);
  // const { id } = useParams();

  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    // defaultValues: visitorForm,
  });

  const { handleSubmit, setValue } = form;

  const { mutate: updateUser } = useHandleUpdateUser();
  const { data: userData } = useFetchUserById();
  const user = userData?.data[0] || [];

  console.log(`Users: ${user} Users data:${userData}`);
  //   const [userData, setUserData] = useState({
  //     fullName: 'John Doe',
  //     cnic: '12345-6789012-3',
  //     email: 'john.doe@example.com',
  //     phoneNumber: '+92 300 1234567',
  //     houseNo: '123',
  //     block: 'A',
  //   });

  useEffect(() => {
    if (user) {
      const { profileImage, fullName, email, cnic, cnicImage, houseNo, phoneNumber } = user;
      setValue('profileImage', profileImage);
      setValue('cnicImage', cnicImage);
      setValue('fullName', fullName);
      setValue('email', email);
      setValue('cnic', cnic);
      setValue('houseNo', houseNo);
      setValue('phoneNumber', phoneNumber);
    }
  }, [user, setValue]);
  // useEffect(() => {
  //   if (isEditing) {
  //     //   setEditMode(true);
  //     const { profileImage, fullName, email, cnic, cnicImage, houseNo, phoneNumber } = user;
  //     // Setting the values for the form
  //     if (typeof profileImage === 'string') {
  //       form.setValue('profileImage', profileImage);
  //     }
  //     if (typeof cnicImage === 'string') {
  //       form.setValue('cnicImage', cnicImage);
  //     }
  //     form.setValue('fullName', fullName);
  //     form.setValue('email', email);
  //     form.setValue('cnic', cnic);
  //     form.setValue('houseNo', houseNo);
  //     form.setValue('phoneNumber', phoneNumber);
  //   } else {
  //     //   setEditMode(false);
  //     form.reset();
  //   }
  // }, [form, setIsEditing]);

  const onSubmit = (data: z.infer<typeof userFormSchema>) => {
    const formData = new FormData();

    if (data.profileImage instanceof File || typeof data.profileImage === 'string') {
      formData.append('profileImage', data.profileImage);
    }
    // else if (typeof data.profileImage === 'string') {
    //   formData.append('profileImage', data.profileImage);
    // }
    if (data.cnicImage instanceof File || typeof data.cnicImage === 'string') {
      formData.append('cnicImage', data.cnicImage);
    }
    formData.append('fullName', data.fullName as string);
    formData.append('email', data.email as string);
    formData.append('cnic', data.cnic as string);
    formData.append('houseNo', data.houseNo as string);
    formData.append('phoneNumber', data.phoneNumber as string);

    if (isEditing) {
      updateUser(formData, {
        onSuccess: () => {
          form.reset();
          setIsEditing(false);
          // navigate('/visitors');
        },
        onError: (error) => {
          console.error('Error:', error);
        },
      });
    }
  };

  // const handleFileChange = (
  //   event: React.ChangeEvent<HTMLInputElement>,
  //   field: 'profileImage' | 'cnicImage',
  // ) => {
  //   const file = event.target.files?.[0];
  //   if (file) {
  //     setValue(field, file); // use file directly
  //   }
  //   // if (file) {
  //   //   const reader = new FileReader();
  //   //   reader.onloadend = () => {
  //   //     setValue(field, reader.result as string);
  //   //   };
  //   //   reader.readAsDataURL(file);
  //   // }
  // };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-green-30 p-8">
      <Card className="w-full max-w-4xl mx-auto overflow-hidden shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-500 to-green-700 text-white p-6">
          <CardTitle className="text-3xl font-bold text-center">User Profile</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col md:flex-row gap-8">
                <Card className="w-full md:w-1/3 bg-white shadow-md overflow-hidden">
                  <CardContent className="p-4 flex flex-col items-center space-y-4">
                    <div className="relative">
                      <Avatar className="w-40 h-40 border-4 border-white shadow-lg">
                        <AvatarImage src="/placeholder.svg?height=160&width=160" alt="User" />
                        <AvatarFallback>{user.fullName?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      {isEditing && (
                        <Button
                          size="icon"
                          className="absolute bottom-0 right-0 rounded-full bg-green-500 hover:bg-green-600"
                        >
                          <CameraIcon className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-800">{user.fullName}</h2>
                    <p className="text-gray-500">{user.email}</p>
                  </CardContent>
                </Card>

                <div className="w-full md:w-2/3 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                        Full Name
                      </Label>
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                id="fullName"
                                value={field.value || ''}
                                onChange={field.onChange}
                                readOnly={!isEditing}
                                className="border-gray-300 focus:ring-green-500 focus:border-green-500"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cnic" className="text-sm font-medium text-gray-700">
                        CNIC
                      </Label>
                      <FormField
                        control={form.control}
                        name="cnic"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                id="cnic"
                                value={field.value}
                                onChange={field.onChange}
                                readOnly={!isEditing}
                                className="border-gray-300 focus:ring-green-500 focus:border-green-500"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email
                      </Label>
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                id="email"
                                value={field.value}
                                onChange={field.onChange}
                                readOnly={!isEditing}
                                className="border-gray-300 focus:ring-green-500 focus:border-green-500"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
                        Phone Number
                      </Label>
                      <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                id="phoneNumber"
                                value={field.value}
                                onChange={field.onChange}
                                readOnly={!isEditing}
                                className="border-gray-300 focus:ring-green-500 focus:border-green-500"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="houseNo" className="text-sm font-medium text-gray-700">
                        House Number
                      </Label>
                      <FormField
                        control={form.control}
                        name="houseNo"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                id="houseNo"
                                value={field.value}
                                onChange={field.onChange}
                                readOnly={!isEditing}
                                className="border-gray-300 focus:ring-green-500 focus:border-green-500"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="block" className="text-sm font-medium text-gray-700">
                        Block
                      </Label>
                      <FormField
                        control={form.control}
                        name="block"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                id="block"
                                value={field.value}
                                onChange={field.onChange}
                                readOnly={!isEditing}
                                className="border-gray-300 focus:ring-green-500 focus:border-green-500"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="space-y-4">
                    <Label htmlFor="cnicImage" className="text-sm font-medium text-gray-700">
                      CNIC Image
                    </Label>
                    <FormField
                      control={form.control}
                      name="cnicImage"
                      render={({}) => (
                        <FormItem>
                          <FormControl>
                            {isEditing ? (
                              <div className="flex items-center justify-center w-full">
                                <label
                                  htmlFor="cnicImage"
                                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                                >
                                  <UploadIcon className="w-8 h-8 mb-4 text-gray-500" />
                                  <p className="mb-2 text-sm text-gray-500">
                                    <span className="font-semibold">Click to upload</span> or drag
                                    and drop
                                  </p>
                                  <Input
                                    id="cnicImage"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                  />
                                </label>
                              </div>
                            ) : (
                              <Card className="overflow-hidden">
                                <CardContent className="p-0">
                                  <img
                                    src="/placeholder.svg?height=200&width=320"
                                    alt="CNIC"
                                    className="w-full h-auto"
                                  />
                                </CardContent>
                              </Card>
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* </div> */}
                  </div>
                  {/* <Separator className="my-6" /> */}
                  {/* </div> */}
                  {/* <div className="space-y-4">
                    <Label htmlFor="cnicImage" className="text-sm font-medium text-gray-700">
                      CNIC Image
                    </Label>
                    {isEditing ? (
                      <div className="flex items-center justify-center w-full">
                        <label
                          htmlFor="cnicImage"
                          className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadIcon className="w-8 h-8 mb-4 text-gray-500" />
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Click to upload</span> or drag and
                              drop
                            </p>
                            <p className="text-xs text-gray-500">
                              SVG, PNG, JPG or GIF (MAX. 800x400px)
                            </p>
                          </div>
                          <Input id="cnicImage" type="file" accept="image/*" className="hidden" />
                        </label>
                      </div>
                    ) : (
                      <Card className="overflow-hidden">
                        <CardContent className="p-0">
                          <img
                            src="/placeholder.svg?height=200&width=320"
                            alt="CNIC"
                            className="w-full h-auto"
                          />
                        </CardContent>
                      </Card>
                    )}
                  </div> */}
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <Button
                  onClick={toggleEdit}
                  className="px-6 py-2 text-white bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 rounded-full shadow-md transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                  {isEditing ? (
                    <>
                      <CheckIcon className="w-5 h-5 mr-2" />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <PencilIcon className="w-5 h-5 mr-2" />
                      Edit Profile
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
