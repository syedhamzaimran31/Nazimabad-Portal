import 'react-big-calendar/lib/css/react-big-calendar.css'; // Import this line
import 'react-datepicker/dist/react-datepicker.css';
import { EventService } from '@/services/event.service';
import { useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { assignEventColor } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CustomEventProps, CustomToolbarProps } from '@/lib/types';

const CustomToolbar: React.FC<CustomToolbarProps> = ({
  label,
  onNavigate,
  onView,
  view,
  onAddEvent,
}) => {
  const views = ['month', 'week', 'day', 'agenda'];

  return (
    <div className="flex justify-between items-center mb-4">
      {/* Navigation Section */}
      <div className="flex items-center">
        <button
          onClick={() => onNavigate('PREV')}
          className="p-2 text-blue-500 hover:text-blue-600"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={() => onNavigate('TODAY')}
          className="bg-blue-500 text-white px-4 py-2 rounded mx-2"
        >
          Today
        </button>
        <button
          onClick={() => onNavigate('NEXT')}
          className="p-2 text-blue-500 hover:text-blue-600"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Calendar Label */}
      <span className="font-semibold text-lg">{label}</span>

      <div className="flex items-center gap-4">
        {/* View Buttons (Week, Month, Day, Agenda) */}
        {views.map((v) => (
          <button
            key={v}
            onClick={() => onView(v)}
            className={`${
              view === v ? 'bg-gray-200' : ''
            } px-3 py-1 rounded text-sm hover:bg-gray-300`}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}

        {/* Add Event Button */}
        <button
          onClick={onAddEvent} // Call the handleAddEvent function
          className="flex items-center bg-green-700 text-white px-4 py-2 rounded"
        >
          <Plus className="mr-2" /> Add Event
        </button>
      </div>
    </div>
  );
};

const CustomEvent: React.FC<CustomEventProps> = ({ event }) => {
  const navigate = useNavigate();

  const handleEventClick = () => {
    // Assuming event has an `id` property. Update the path based on your routing.
    navigate(`/events/details/${event.id}`);
  };
  const startTime = moment(event.startDateTime).format('hh:mm A'); // Start time in 12-hour format
  const endTime = moment(event.endDateTime).format('hh:mm A'); // End time in 12-hour format

  // const handleDayClick = () => {
  //   const startDate = moment(event.startDateTime).toDate();
  //   onNavigate('DAY', startDate); // Navigate to the specific day's events
  // };

  return (
    <div className="rbc-event-content" onClick={handleEventClick}>
      <div className="px-2 pb-2 cursor-pointer" onClick={handleEventClick}>
        <span>{event.title}</span>
        <span className="block font-semibold text-xs">
          {`${startTime} - ${endTime}`} {/* Display start and end time */}
        </span>
      </div>
    </div>
  );
};
export default function EventsPage() {
  const navigate = useNavigate();
  const { useFetchAllEvents } = EventService();
  const { data: eventsData, refetch } = useFetchAllEvents();

  useEffect(() => {
    refetch();
  }, [refetch]);

  const events =
    eventsData?.data.map((event, index) => ({
      ...event,
      startDateTime: event.startDateTime ? new Date(event.startDateTime) : new Date(),
      endDateTime: event.endDateTime ? new Date(event.endDateTime) : new Date(),
      color: assignEventColor(index),
    })) || [];

  const localizer = momentLocalizer(moment);

  const handleAddEvent = () => {
    navigate('/events/add'); // Navigate to the add event page
  };
  return (
    <div className="flex flex-col w-full gap-4 p-4 bg-gray-50 rounded-lg shadow-md">
      {/* Calendar */}
      <div className="w-full h-[600px] overflow-auto relative bg-white p-6 rounded-lg shadow">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="startDateTime"
          endAccessor="endDateTime"
          defaultView="month"
          views={['month', 'week', 'day', 'agenda']}
          components={{
            toolbar: (props) => (
              //@ts-ignore
              <CustomToolbar {...props} onAddEvent={handleAddEvent} /> // Pass handleAddEvent to the CustomToolbar
            ),
            //@ts-ignore
            event: CustomEvent, // Use custom event component for event rendering
          }}
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: event.color,
              borderRadius: '8px',
              cursor: 'pointer',
              color: 'white',
              padding: '2px 5px', // Adding padding to event titles
            },
          })}
        />
      </div>
    </div>
  );
}
// return (
//   <div className="flex flex-col w-full gap-4 p-4 bg-gray-50 rounded-lg shadow-md">
//     {/* Calendar */}
//     <div className="w-full h-[600px] overflow-auto relative bg-white p-6 rounded-lg shadow">
//       <Calendar
//         localizer={localizer}
//         events={events}
//         startAccessor="startDateTime"
//         endAccessor="endDateTime"
//         defaultView="month"
//         views={['month', 'week', 'day', 'agenda']}
//         components={{
//           toolbar: CustomToolbar, // Use the custom toolbar
//           event: CustomEvent, // Use custom event component for event rendering
//         }}
//         eventPropGetter={(event) => ({
//           style: {
//             backgroundColor: event.color,
//             borderRadius: '8px',
//             cursor: 'pointer',
//             color: 'white',
//             padding: '2px 5px', // Adding padding to event titles
//           },
//         })}
//       />
//     </div>
//   </div>
// );
