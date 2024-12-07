// // The Modals are also available for use as option
// import { useForm, useFieldArray, Controller } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useVisitorStore } from "@/store/visitor-store";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { PlusIcon, TrashIcon } from "lucide-react";
// import { Calendar } from "@/components/ui/calendar";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Form,
//   FormField,
//   FormItem,
//   FormMessage,
//   FormControl,
// } from "@/components/ui/form";
// import VisitorService from "@/services/visitor.service";
// import { visitorFormSchema } from "@/lib/schemas";
// import { AddVisitorProps } from "@/lib/types";

// export default function AddVisitor({ isOpen, onClose }: AddVisitorProps) {
//   const { visitorForm, setVisitorForm, resetVisitorForm } = useVisitorStore();
//   const { useHandleAddVisitor } = VisitorService();
//   const form = useForm<z.infer<typeof visitorFormSchema>>({
//     resolver: zodResolver(visitorFormSchema),
//     defaultValues: visitorForm,
//   });

//   const { control, handleSubmit } = form;
//   const { fields, append, remove } = useFieldArray({
//     control,
//     name: "persons",
//   });
//   const { mutate: handleVisitor } = useHandleAddVisitor();

//   function onSubmit(values: z.infer<typeof visitorFormSchema>) {
//     const formData = new FormData();
//     formData.append("vehicleType", values.vehicleType);
//     formData.append("numberPlate", values.numberPlate);
//     formData.append("numberOfPersons", values.numberOfPersons);
//     formData.append("visitDate", values.visitDate.toISOString());

//     // Append each person in the persons array
//     values.persons.forEach((person, index) => {
//       formData.append(`persons[${index}].name`, person.name);
//       formData.append(`persons[${index}].cnic`, person.cnic);
//       if (person.cnicImage) {
//         formData.append(`persons[${index}].cnicImage`, person.cnicImage);
//       }
//     });

//     // Pass FormData to the mutation function
//     handleVisitor(formData, {
//       onSuccess: () => {
//         resetVisitorForm();
//         onClose();
//       },
//       onError: (error) => {
//         console.error("Error:", error);
//       },
//     });
//     setVisitorForm(values);
//   }

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="max-h-[90vh] max-w-[50vw] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>Add Visitors Profile</DialogTitle>
//           <DialogDescription>
//             Make changes to the visitor's profile here. Click save when you're
//             done.
//           </DialogDescription>
//         </DialogHeader>
//         <Form {...form}>
//           <form onSubmit={handleSubmit(onSubmit)}>
//             <div className="grid gap-4 py-4">
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <Label htmlFor="vehicleType" className="text-right">
//                   Vehicle Type
//                 </Label>
//                 <FormField
//                   control={form.control}
//                   name="vehicleType"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormControl>
//                         <Select onValueChange={field.onChange}>
//                           <SelectTrigger className="col-span-3">
//                             <SelectValue placeholder="Select vehicle type" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             <SelectItem value="car">Car</SelectItem>
//                             <SelectItem value="bike">Bike</SelectItem>
//                           </SelectContent>
//                         </Select>
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <Label htmlFor="numberPlate" className="text-right">
//                   Vehicle Number
//                 </Label>
//                 <FormField
//                   control={form.control}
//                   name="numberPlate"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormControl>
//                         <Input
//                           id="numberPlate"
//                           placeholder="Enter vehicle number"
//                           {...field}
//                           className="col-span-3"
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <Label htmlFor="numberOfPersons" className="text-right">
//                   Number of Persons
//                 </Label>
//                 <FormField
//                   control={form.control}
//                   name="numberOfPersons"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormControl>
//                         <Input
//                           id="numberOfPersons"
//                           type="number"
//                           placeholder="Enter number of persons"
//                           {...field}
//                           className="col-span-3"
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <Label htmlFor="visitDate" className="text-right">
//                   Visit Day
//                 </Label>
//                 <FormField
//                   control={form.control}
//                   name="visitDate"
//                   render={() => (
//                     <FormItem>
//                       <FormControl>
//                         <Controller
//                           control={control}
//                           name="visitDate"
//                           render={({ field }) => (
//                             <Calendar
//                               mode="single"
//                               selected={field.value}
//                               onSelect={field.onChange}
//                               className="w-full"
//                             />
//                           )}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>
//               <div>
//                 <Label className="text-lg font-semibold">Persons</Label>
//                 {fields.map((field, index) => (
//                   <div
//                     key={field.id}
//                     className="grid grid-cols-4 gap-4 items-center"
//                   >
//                     <FormField
//                       control={form.control}
//                       name={`persons.${index}.name`}
//                       render={({ field }) => (
//                         <FormItem className="col-span-3 mt-2">
//                           <FormControl>
//                             <Input placeholder="Person Name" {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                     <FormField
//                       control={form.control}
//                       name={`persons.${index}.cnic`}
//                       render={({ field }) => (
//                         <FormItem className="col-span-3 mt-2">
//                           <FormControl>
//                             <Input placeholder="CNIC" {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                     <FormField
//                       control={form.control}
//                       name={`persons.${index}.cnicImage`}
//                       render={({ field }) => (
//                         <FormItem className="col-span-3 mt-2">
//                           <FormControl>
//                             <Input
//                               type="file"
//                               onChange={(e) => {
//                                 if (e.target.files?.[0]) {
//                                   field.onChange(e.target.files[0]);
//                                 }
//                               }}
//                             />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                     <Button
//                       variant="destructive"
//                       size="icon"
//                       onClick={() => remove(index)}
//                       className="mt-2"
//                     >
//                       <TrashIcon className="h-4 w-4" />
//                     </Button>
//                   </div>
//                 ))}
//                 <Button
//                   variant="outline"
//                   type="button"
//                   onClick={() => append({ name: "", cnic: "", cnicImage: "" })}
//                   className="mt-4 w-full"
//                 >
//                   <PlusIcon className="mr-2 h-4 w-4" />
//                   Add Person
//                 </Button>
//               </div>
//             </div>
//             <DialogFooter>
//               <Button type="submit">Save</Button>
//             </DialogFooter>
//           </form>
//         </Form>
//       </DialogContent>
//     </Dialog>
//   );
// }
