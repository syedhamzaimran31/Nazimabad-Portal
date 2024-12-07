import { Link, useLocation } from 'react-router-dom';
import {
  BadgeAlert,
  // CalendarDays,
  Users,
  Megaphone,
  Home,
  CalendarDays,
  MessageCircleMore,
} from 'lucide-react';
import tokenService from '@/services/token.service';
import connectHoodLogo from '@/assets/connectHoodLogo.png'; // Adjust the path based on your structure

export default function Sider() {
  const userRole = tokenService.getUserRole();
  console.log(userRole);

  const userIsAdmin = userRole === 'Admin' ? true : false;

  const location = useLocation(); // Get the current location

  return (
    <div className="hidden border-r bg-black text-white md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-18 items-center border-b border-white px-4 lg:h-[70px] lg:px-4">
          <Link to="/" className="flex items-center  font-semibold text-white">
            <img src={connectHoodLogo} height="100" width="100" alt="" className="" />
            {/* <span className='mt-0 ml-3'>CONNECTHOOD</span> */}
          </Link>
          {/* <Button
            variant="outline"
            size="icon"
            className="ml-auto h-8 w-8 border-white text-black"
          >
            <Bell className="h-4 w-4" />
            <span className="sr-only">Toggle notifications</span>
          </Button> */}
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            <Link
              to="/"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-gray-300 ${
                location.pathname === '/' ? 'bg-green-800 text-white' : ''
              }`}
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              to="/events"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-gray-300 ${
                location.pathname === '/events' ? 'bg-green-800 text-white' : ''
              }`}
            >
              <CalendarDays className="h-4 w-4" />
              Events
              {/* <Badge
                className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full
                  text-white bg-green-800 hover:bg-green-800"
              >
                6
              </Badge> */}
            </Link>

            <Link
              to="/visitors"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-gray-300 ${
                location.pathname === '/visitors' ? 'bg-green-800 text-white' : ''
              }`}
            >
              <Users className="h-4 w-4" />
              Visitors
            </Link>

            <Link
              to="/chats"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-gray-300 ${
                location.pathname === '/chats' ? 'bg-green-800 text-white' : ''
              }`}
            >
              <MessageCircleMore />
              Chats
            </Link>

            <Link
              to="/guest/add"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-gray-300 ${
                location.pathname === '/guests' ? 'bg-green-800 text-white' : ''
              }`}
            >
              <Users className="h-4 w-4" />
              Guest
            </Link>
            <Link
              to="/complaints"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-gray-300 ${
                location.pathname === '/complaints' ? 'bg-green-800 text-white' : ''
              }`}
            >
              <BadgeAlert className="h-4 w-4" />
              Complaints
            </Link>
            <Link
              to={userIsAdmin ? '/announcements/admin' : '/announcements'}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-gray-300 ${
                location.pathname === '/announcements/admin' ||
                location.pathname === '/announcements'
                  ? 'bg-green-800 text-white'
                  : ''
              }`}
            >
              <Megaphone className="h-4 w-4" />
              Announcements
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
}
