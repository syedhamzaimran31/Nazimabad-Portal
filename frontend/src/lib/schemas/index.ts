import { z } from 'zod';

const cnicValidation = z.string().refine(
  (value) => {
    const strippedValue = value.replace(/\D/g, ''); // Remove non-digit characters
    return strippedValue.length === 13;
  },
  {
    message: 'CNIC must be exactly 13 digits',
  },
);

const vehicleNumberValidation = z.string().refine(
  (value) => {
    // Remove dashes and spaces
    console.log(typeof value);
    // Remove spaces but keep hyphens
    const strippedValue = value.trim().replace(/\s+/g, '');
    // Check if the stripped value matches exactly 6 digits
    return /^[A-Za-z]{3}-\d{3}$/.test(strippedValue);
  },
  {
    message: 'Vehicle number must be exactly 6 digits',
  },
);

const isTodayOrFuture = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set today's time to midnight for comparison

  const visitDate = new Date(date);
  visitDate.setHours(0, 0, 0, 0); // Set `date` time to midnight

  return visitDate >= today; // Returns true if `date` is today or in the future
};

export const loginFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export const signupFormSchema = z
  .object({
    fullName: z.string().min(1, 'Full Name is required'),
    email: z.string().email(),
    password: z.string().min(1, 'Password is required'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    cnic: z
      .string()
      .min(15, 'CNIC must be exactly 13 digits')
      .max(15, 'CNIC must be exactly 13 digits'),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'Passwords must match',
        path: ['confirmPassword'], // Error will appear under 'confirmPassword' field
      });
    }
  });

export const userFormSchema = z.object({
  profileImage: z
    .union([
      z.instanceof(File).optional(), // Optional file type for event image
      z.string().optional(), // Optional URL type for event image
    ])
    .optional(), // Make event image optional
  fullName: z
    .string()
    .min(1, 'User name is required')
    .max(50, 'User name cannot exceed 50 characters')
    .regex(/^[A-Za-z\s]+$/, 'User name can only contain letters and spaces'),
  email: z
    .string()
    .email('Please enter a valid email address') // Validates email format
    .min(1, 'User email is required')
    .max(100, 'Email cannot exceed 100 characters'), // Ensures a maximum length for email
  cnic: cnicValidation,
  cnicImage: z
    .union([
      z.instanceof(File).optional(), // Optional file type for event image
      z.string().optional(), // Optional URL type for event image
    ])
    .optional(), // Make event image optional
  houseNo: z.string().max(30, 'House number must not exceed 30 characters'),
  phoneNumber: z
    .string()
    .regex(
      /^\+?\d{1,3}\s?\d{10}$/,
      'Contact number must be in the format +92 1231232111 or similar',
    )
    .min(13, 'Contact number must be at least 13 characters long')
    .optional(),
  block: z.string(),
});

export const visitorFormSchema = z
  .object({
    vehicleType: z.string().min(1, 'Vehicle type is required'),
    numberPlate: vehicleNumberValidation,
    numberOfPersons: z
      .number()
      .min(1, 'At least one person is required')
      .max(30, 'At most thirty persons')
      .default(1),
    visitDate: z.date().nullable(),
    persons: z.array(
      z.object({
        name: z
          .string()
          .min(1, 'Name is required')
          .max(20, 'Name cannot exceed 20 characters')
          .regex(/^[A-Za-z\s]+$/, 'Name can only contain letters and spaces'),
        cnic: cnicValidation,
        cnicImage: z
          .union([
            z.instanceof(File).optional(),
            z.string().url('CNIC image is required').optional(),
          ])
          .optional(),
      }),
    ),
  })
  .superRefine((data, ctx) => {
    data.persons.forEach((person, index) => {
      if (person.cnic && !person.cnicImage) {
        ctx.addIssue({
          code: 'custom',
          message: 'CNIC image is required',
          path: ['persons', index, 'cnicImage'],
        });
      }
    });
  });

export const complaintFormScema = z.object({
  complaint: z
    .string()
    .min(1, 'Complaint Title is required')
    .max(40, 'Title cannot exceed 40 characters')
    .regex(/^[A-Za-z\s]+$/, 'Title can only contain letters and spaces'),
  description: z
    .string()
    .min(20, 'Description is required, at least of 20 characters')
    .max(5000, 'Description cannot exceed 5000 characters'),
  complaintType: z.string().min(1, 'Complaint Type is required'),
  complaintImage: z
    .union([z.instanceof(File).optional(), z.string().url('CNIC image is required').optional()])
    .optional(),
});

export const complaintAdminFormSchema = z.object({
  response: z
    .string()
    .min(20, 'Response is required, at least of 20 characters')
    .max(5000, 'Response cane not exceed 5000 characters'),
  complaintStatus: z.string().min(1, 'Complaint Status is required'),
});

export const announcementFormSchema = z.object({
  title: z
    .string()
    .min(10, 'Announcement Title is required, at least 10 characters')
    .max(30, 'Announcement Title can not exceed 30 characters'),
  content: z
    .string()
    .min(50, 'Announcement Content is required, at least 50 characters')
    .max(5000, 'Announcement Content can not exceed 5000 characters'),
  announcementImage: z
    .union([
      z.instanceof(File).optional(),
      z.string().url('Announcement image is required').optional(),
    ])
    .optional(),
});
//
export const eventFormSchema = z.object({
  title: z
    .string()
    .min(5, 'Event title is required, at least 5 characters') // Minimum title length
    .max(70, 'Event title can not exceed 70 characters'), // Maximum title length
  description: z
    .string()
    .min(20, 'Event description is required, at least 20 characters') // Minimum description length
    .max(5000, 'Event description can not exceed 5000 characters'), // Maximum description length
  eventImages: z.union([
    z.instanceof(File), // Optional file type for event image
    z.string().url('Event image is required'), // Optional URL type for event image
  ]), // Make event image optional
  eventType: z.string().min(1, 'Event type is required'),
  location: z
    .string()
    .min(1, 'Event location is required')
    .max(500, 'Evnet location can not exceed 500 characters'), // Location is required
  locationLink: z
    .string()
    .max(1000, 'Event location link can not exceed 1000 characters')
    .optional() // Optional field
    .refine((val) => !val || val.match(/^https?:\/\/[^\s$.?#].[^\s]*$/), {
      message: 'Please enter a valid URL', // Validates only if the URL is provided
    }),
  startDateTime: z.date().refine((date) => date >= new Date(), {
    message: 'Start date and time must be in the future', // Ensure start time is in the future
  }),
  endDateTime: z.date().refine((date) => date >= new Date(), {
    message: 'End date and time must be in the future', // Ensure start time is in the future
  }),

  // Make it nullable if necessary
  isFree: z.boolean().optional(), // isFree must be a boolean
  isCanceled: z.boolean().optional(), // isCanceled must be a boolean
  organizerName: z
    .string()
    .min(1, 'Organizer name is required')
    .max(30, 'Organizer name cannot exceed 30 characters') // Organizer name is optional
    .regex(/^[A-Za-z\s]+$/, 'Organizer name can only contain letters and spaces'), // Organizer name is optional
  organizerContact: z
    .string()
    .regex(
      /^\+?\d{1,3}\s?\d{10}$/,
      'Organizer contact must be a valid phone number in the format +92 1231232111 or similar',
    ) // Allows for +country code and a valid 10-digit number
    .min(13, 'Organizer contact must be at least 13 characters long'), // Ensures a minimum length of 13 characters
});

export const guestFormSchema = z.object({
  firstName: z
    .string()
    .min(1, 'Guest name is required')
    .max(50, 'Guest name cannot exceed 50 characters')
    .regex(/^[A-Za-z\s]+$/, 'Guest name can only contain letters and spaces'),
  lastName: z
    .string()
    .min(1, 'Guest name is required')
    .max(50, 'Guest name cannot exceed 50 characters')
    .regex(/^[A-Za-z\s]+$/, 'Guest name can only contain letters and spaces'),
  email: z
    .string()
    .email('Please enter a valid email address') // Validates email format
    .min(1, 'Guest email is required')
    .max(100, 'Email cannot exceed 100 characters'), // Ensures a maximum length for email
  cnic: cnicValidation,
  contactNumber: z
    .string()
    .regex(
      /^\+?\d{1,3}\s?\d{10}$/,
      'Contact number must be in the format +92 1231232111 or similar',
    )
    .min(13, 'Contact number must be at least 13 characters long'),
  guestImage: z
    .union([
      z.instanceof(File).optional(), // Optional file type for event image
      z.string().optional(), // Optional URL type for event image
    ])
    .optional(), // Make event image optional

  dateOfVisit: z.date().refine((date) => isTodayOrFuture(date), {
    message: 'Visit date must be today or in the future',
  }),
  timeOfVisit: z.string().min(1, 'Time of visit is required'),
  purposeOfVisit: z
    .string()
    .min(1, 'Purpose of visit is required')
    .max(5000, 'Purpose of visit cannot exceed 5000 characters'),
  hostName: z
    .string()
    .min(1, 'Host name is required')
    .max(50, 'Host name cannot exceed 50 characters')
    .regex(/^[A-Za-z\s]+$/, 'Host name can only contain letters and spaces'),
  department: z.string().max(50, 'Department name cannot exceed 50 characters').optional(),
});
