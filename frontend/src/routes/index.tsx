import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from './protected-routes';
import DashboardPage from '@/pages/dashboard';
import LoginPage from '@/pages/auth/login-page';
import SignupPage from '@/pages/auth/signup-page';
import Layout from '@/components/layouts/base-layout';
import VisitorsPage from '@/pages/visitors/view-visitors';
import AddVisitorPage from '@/pages/visitors/add-visitors';
import VisitorDetailsPage from '@/pages/visitors/view-visitors-details';
import ComplaintPage from '@/pages/complaints/view-complaints';
import AddComplaintPage from '@/pages/complaints/add-complaint';
import ViewAnnouncementPageAdmin from '@/pages/announcements/view-announcements-admin';
import AddAnnouncementPage from '@/pages/announcements/add-announcement';
import AnnouncementDetailPage from '@/pages/announcements/view-announcement-details';
import UpdateComlaintAdminPage from '@/pages/complaints/update-complaint-admin';
import ComplaintDetailsPage from '@/pages/complaints/view-complaint-details';
import ViewAnnouncementsPage from '@/pages/announcements/view-announcements';
import EventsPage from '@/pages/events/view-events';
import AddEventPage from '@/pages/events/add-event';
import GuestRegistrationForm from '@/components/widgets/guestform';
import EventDetailsPage from '@/pages/events/view-event-details';
import ChatPage from '@/pages/chats';
import UserProfile from '@/pages/users';
// import ComplaintDetailsPage from "@/pages/complaints/view-complaint-details";

const router = createBrowserRouter(
  [
    {
      path: '/login',
      element: <LoginPage />,
      index: true,
    },
    {
      path: '/signup',
      element: <SignupPage />,
      index: true,
    },
    {
      path: '/chats',
      element: <ChatPage />, // New route for updating announcement
    },
    {
      element: <ProtectedRoute requiredRoles={['Admin', 'Residence']} />,
      children: [
        {
          element: <Layout />, // Apply Layout with Sider here
          children: [
            {
              path: '/',
              element: <DashboardPage />,
            },
            {
              path: '/profile/:id',
              element: <UserProfile />, // New route for updating announcement
            },
            {
              path: '/guest/add',
              element: <GuestRegistrationForm />,
            },
            {
              path: '/visitors',
              element: <VisitorsPage />,
            },
            {
              path: '/visitors/add',
              element: <AddVisitorPage />,
            },
            {
              path: '/visitors/:visitorId', // New route for visitor details
              element: <VisitorDetailsPage />,
            },
            {
              path: '/visitors/update/:id', // New route for visitor details
              element: <AddVisitorPage />,
            },
            {
              path: '/complaints',
              element: <ComplaintPage />,
            },
            {
              path: '/complaints/:id',
              element: <ComplaintDetailsPage />,
            },
            {
              path: '/announcements/details/:id',
              element: <AnnouncementDetailPage />, // New route for updating announcement
            },
            {
              path: '/events',
              element: <EventsPage />, // New route for updating announcement
            },
            {
              path: '/events/add',
              element: <AddEventPage />, // New route for updating announcement
            },
            {
              path: '/events/update/:id',
              element: <AddEventPage />, // New route for updating announcement
            },
            {
              path: '/events/details/:id',
              element: <EventDetailsPage />, // New route for updating announcement
            },
          ],
        },
      ],
    },
    {
      element: <ProtectedRoute requiredRoles={['Admin']} />, // Admin-only routes
      children: [
        {
          element: <Layout />,
          children: [
            {
              path: '/complaints/update/admin/:id',
              element: <UpdateComlaintAdminPage />, // Only accessible to Admin
            },
            {
              path: '/announcements/admin',
              element: <ViewAnnouncementPageAdmin />,
            },
            {
              path: '/announcements/add',
              element: <AddAnnouncementPage />,
            },
            {
              path: '/announcements/update/:id',
              element: <AddAnnouncementPage />, // New route for updating announcement
            },
          ],
        },
      ],
    },
    {
      element: <ProtectedRoute requiredRoles={['Residence']} />, // Admin-only routes
      children: [
        {
          element: <Layout />,
          children: [
            {
              path: '/complaints/add',
              element: <AddComplaintPage />,
            },
            {
              path: '/complaints/update/:id',
              element: <AddComplaintPage />, // New route for updating complaint
            },
            {
              path: '/announcements',
              element: <ViewAnnouncementsPage />,
            },
          ],
        },
      ],
    },
    {
      path: '*',
      element: <p>404 Error - Nothing here...</p>,
    },
  ],
  { basename: '/community' },
);

export default router;
