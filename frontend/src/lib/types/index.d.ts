import React, { ReactElement } from 'react';
import {
  UseControllerProps,
  UseFormHandleSubmit,
  UseFormRegister,
  UseFormReset,
  UseFormWatch,
} from 'react-hook-form';

export * from '@/_utils/types/auth';

type WithRequiredProperty<Type, Key extends keyof Type> = Type & {
  [Property in Key]-?: Type[Property];
};

export type errorType = {
  response: {
    data: {
      message: string | string[];
    };
  };
};

export type paginationType = {
  total: number;
  lastPage: number;
  page: number;
};

export type PaginatedResponse<T> = {
  message: string;
  data: T;
} & paginationType;

export type ApiResponse<T> = {
  message: string;
  data: T;
};

// export type errorType = {
//   response: {
//     message: string | string[];
//   };
// };
export type userType = {
  id: string;
  roles: string[];
  token: string;
};

export type loginResponseType = {
  userId: string;
  role: string;
  token: string;
};

export type signupRequestType = {
  fullName: string;
  email: string;
  password: string;
  cnic: string;
};

export type userResponseType = {
  id: number;
  profileImage: string;
  fullName: string;
  cnic: string;
  cnicImage: string;
  email: string;
  password: string;
  houseNo: string;
  role: string;
  recoveryEmail: string;
  created_at: Date;
  lastSeen: Date;
  status: string;
};

export type User = {
  id: number;
  profileImage: string;
  fullName: string;
  email: string;
  cnic: string;
  cnicImage: string;
  houseNo: string;
  Z: string;
};

export type visitorResponseType = {
  id: number;
  vehicleType: string;
  numberPlate: string;
  numberOfPersons: number;
  persons: {
    name: string;
    cnic: string;
    cnicImage: string;
  }[];
  visitDate: Date;
  visitDay: string;
  qrCode: string;
  checkinTime: null | Date;
  checkoutTime: null | Date;
  qrCodeImage: string;
  isVerified: boolean;
  createdAt: Date;
  userId: number;
}[];

export type Person = {
  name: string;
  cnic: string;
  cnicImage: string;
};

export type Visitor = {
  id: number;
  vehicleType: string;
  numberPlate: string;
  numberOfPersons: number;
  persons: Person[];
  visitDate: Date;
  visitDay: string;
  qrCode: string;
  qrCodeImage: string;
  userId: number;
  checkinTime?: Date | null;
  checkoutTime?: Date | null;
};

export type complaintType = {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  complaint: string;
  complaintType: string;
  description: string;
  complaintStatus: string;
  response: string;
  complaintImage: string;
  created_at: Date;
};

export type udateComplaintAdmin = {
  complaintStatus: string;
  response: string;
};

export type announcementType = {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  title: string;
  content: string;
  announcementImage: string;
  created_at: Date;
};

export type VisitorDetailsDialogProps = {
  visitor: Visitor;
  onClose: () => void;
};

export interface ImagePreviewDialogProps {
  imageUrl: string;
  onClose: () => void;
}

export interface AddVisitorProps {
  isOpen: boolean;
  onClose: () => void;
}
export interface VisitorStore {
  visitorForm: VisitorFormState;
  setVisitorForm: (values: Partial<VisitorFormState>) => void;
  resetVisitorForm: () => void;
}

export interface BarChartDataProps {
  visitorsData?: PaginatedVisitorResponse['data'] | []; // Assuming it's an array, or change it if it's an object
  complaintsData?: PaginatedComplaintResponse['data'] | [];
}

export type chartData = {
  date: string;
  visitors?: number;
  complaints?: number;
};

export type PaginatedAnnouncementResponse = {
  data: announcementType[]; // Array of complaints
  total: number; // Total number of complaints
  page: number; // Current page number
  limit: number; // Number of items per page
};
export type PaginatedUserResponse = {
  data: userResponseType[]; // Array of complaints
  total: number; // Total number of complaints
  page: number; // Current page number
  limit: number; // Number of items per page
};

export type PaginatedComplaintResponse = {
  data: complaintType[]; // Array of complaints
  total: number; // Total number of complaints
  page: number; // Current page number
  limit: number; // Number of items per page
};

export type PaginatedVisitorResponse = {
  data: visitorResponseType; // Array of visitors
  total: number; // Total number of complaints
  page: number; // Current page number
  limit: number; // Number of items per page
};

// EventResponseType for fetching event data from the database
export type EventResponseType = {
  id: number;
  title: string;
  description: string | null;
  eventImages: string[]; // array of image URLs
  eventType: string;
  location: string;
  locationLink: string;
  startDateTime: Date | null;
  endDateTime: Date | null;
  isFree: boolean;
  isCanceled: boolean;
  organizerName?: string;
  organizerContact?: string;
  created_at: Date | null;
  updated_at: Date | null;
};

// CreateEventRequestType for adding or creating an event
export type CreateEventRequestType = {
  title: string;
  description?: string;
  eventImages?: string[]; // array of image URLs
  eventType: string;
  location: string;
  locationLink: string;
  startDateTime?: string; // ISO 8601 formatted string
  endDateTime?: string; // ISO 8601 formatted string
  isFree?: boolean;
  isCanceled?: boolean;
  organizerName?: string;
  organizerContact?: string;
};

// Paginated response type for events
export type PaginatedEventResponse = {
  data: EventResponseType[];
  total: number;
  page: number;
  lastPage: number;
  limit: number;
};

export type Appointment = {
  id: number;
  status: string;
  location: string;
  resource: string;
  address: string;
};

export type Blockout = { id: number; name: string };

export type EventItem = {
  start?: Date;
  end?: Date;
  data?: { appointment?: Appointment; blockout?: Blockout };
  isDraggable?: boolean;
  resourceId?: number;
};

export interface CustomToolbarProps {
  label: string;
  onNavigate: (action: string) => void;
  onView: (view: string) => void;
  view: string;
  onAddEvent: () => void;
}

export interface CustomEventProps {
  event: {
    id: number;
    title: string;
    color: string;
    description: string | null;
    eventImages: string[]; // array of image URLs
    eventType: string;
    location: string;
    locationLink: string;
    startDateTime: Date | null;
    endDateTime: Date | null;
    isFree: boolean;
    isCanceled: boolean;
    organizerName?: string;
    organizerContact?: string;
    created_at: Date | null;
    updated_at: Date | null;
  };
  onNavigate: (action: string, date?: Date) => void;
}

export interface ChatResponse {
  id: string;
  message: string;
  sentAt: string;
  status: 'delivered' | 'read' | 'sent';
  sender: userResponseType;
  recipient: userResponseType;
}

export interface ChatMessage {
  recipientId: number;
  message: string;
}

export interface ChatEvents {
  sendMessage: (data: ChatMessage) => void;
  messageSent: (message: ChatResponse) => void;
  receiveMessage: (message: ChatResponse) => void;
  error: (error: Error) => void;
}

export interface GuestFormData {
  firstName: string;
  lastName: string;
  contactNumber: string;
  cnic?: string;
  email: string;
  photo?: File | null;
  dateOfVisit: string;
  timeOfVisit: string;
  purposeOfVisit: string;
  hostName: string;
  department?: string;
}

// Define types for CustomEvent
// export interface CustomEventProps {
//   event: EventResponseType;
//   onNavigate: (action: string, date?: Date) => void; // Add onNavigate prop
// }
