'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  DollarSign,
  Tag,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Img } from 'react-image';
import { motion, AnimatePresence } from 'framer-motion';
import { EventService } from '@/services/event.service';
import { useNavigate, useParams } from 'react-router-dom';

import { Oval } from 'react-loader-spinner'; // Import the loader

import { useImagePreview } from '@/lib/helpers/index';
import { ImagePreviewDialog } from '@/components/widgets/image-preview-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
} from '@/components/ui/dialog';

// Note: You would typically fetch this data from your API
// const eventData = {
//   userId: 38,
//   title: 'New Event 111111',
//   description:
//     'Description of Event. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisi vel consectetur interdum, nisl nunc egestas nunc, vitae tincidunt nisl nunc euismod nunc. Sed euismod, nisi vel consectetur interdum, nisl nunc egestas nunc, vitae tincidunt nisl nunc euismod nunc.',
//   eventImages: [
//     'https://picsum.photos/800/400?random=1',
//     'https://picsum.photos/800/400?random=2',
//     'https://picsum.photos/800/400?random=3',
//   ],
//   location: 'Expo Center',
//   startDateTime: '2024-09-23T10:00:00.000Z',
//   endDateTime: '2024-09-23T12:00:00.000Z',
//   isFree: false,
//   isCanceled: false,
//   latitude: null,
//   longitude: null,
//   organizerName: 'John Doe',
//   organizerContact: '+1 (123) 456-7890',
//   id: 8,
//   eventType: 'Conference',
//   created_at: '2024-10-08T18:11:52.000Z',
//   updated_at: '2024-10-08T18:11:52.492Z',
// };

export default function EventDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { useFetchEventsById, useHandleDeleteEvent } = EventService();

  const { data: eventData, isLoading } = useFetchEventsById(id ? id.toString() : '');
  console.log(eventData);

  console.log(eventData);

  const { selectedImage, handleImageClick, handleCloseImagePreview } = useImagePreview();

  const { mutate: deleteEvent } = useHandleDeleteEvent();

  const handleUpdateEvent = (eventId: string) => {
    console.log(`Updating event: ${eventId}`);
    navigate(`/events/update/${eventId}`); // Navigate with announcement ID
  };

  const handleDeleteEvent = (id: number) => {
    deleteEvent(id, {
      onSuccess: () => {
        navigate('/events'); //Navigate back to announcement page
      },
    });
  };

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === eventData?.eventImages.length - 1 ? 0 : prevIndex + 1,
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? eventData?.eventImages.length - 1 : prevIndex - 1,
    );
  };
  if (isLoading) {
    return (
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
    );
  }

  return (
    <div>
      <button
        onClick={() => navigate(-1)} // Navigate back to the previous page
        className="text-green-700 hover:underline"
      >
        <div className="flex">
          <ChevronLeft size={24} className="fill-current text-gray-400" />
          Back
        </div>
      </button>
      <Card className="w-full max-w-6xl m-5 mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{eventData?.title}</CardTitle>
          <div className="flex items-center space-x-2 mt-2">
            <Badge variant={eventData?.isCanceled ? 'destructive' : 'default'}>
              {eventData?.isCanceled ? 'Canceled' : 'Active'}
            </Badge>
            <Badge variant={eventData?.isFree ? 'secondary' : 'outline'}>
              {eventData?.isFree ? 'Free' : 'Paid'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative w-full h-80 overflow-hidden rounded-xl">
            {eventData?.eventImages && eventData?.eventImages.length > 0 ? (
              <>
                <AnimatePresence initial={false}>
                  <motion.div
                    key={currentImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0"
                  >
                    <Img
                      src={eventData?.eventImages[currentImageIndex]}
                      alt={`Event image ${currentImageIndex + 1}`}
                      className="object-cover w-full h-full rounded-xl"
                    />
                  </motion.div>
                </AnimatePresence>
                {eventData?.eventImages && eventData?.eventImages.length > 1 ? (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full"
                      onClick={nextImage}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  ''
                )}
              </>
            ) : (
              <p>No images available for this event.</p>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <motion.div
                className="flex items-center space-x-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Calendar className="w-5 h-5 text-primary" />
                <span className="text-lg">
                  {formatDate(eventData?.startDateTime) || 'Date not specified'}
                </span>
              </motion.div>
              <motion.div
                className="flex items-center space-x-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-lg">
                  {eventData?.startDateTime && eventData?.endDateTime
                    ? `${formatTime(eventData?.startDateTime)} - ${formatTime(
                        eventData?.endDateTime,
                      )}`
                    : 'Time not specified'}
                </span>
              </motion.div>
              <motion.div
                className="flex items-center space-x-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <MapPin className="w-5 h-5 text-primary" />
                <span className="text-lg">{eventData?.location || 'Location not specified'}</span>
              </motion.div>
            </div>
            <div className="space-y-4">
              <motion.div
                className="flex items-center space-x-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <User className="w-5 h-5 text-primary" />
                <span className="text-lg">
                  {eventData?.organizerName || 'Organizer not specified'}
                </span>
              </motion.div>
              <motion.div
                className="flex items-center space-x-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Phone className="w-5 h-5 text-primary" />
                <span className="text-lg">
                  {eventData?.organizerContact || 'Contact not provided'}
                </span>
              </motion.div>
              <motion.div
                className="flex items-center space-x-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <DollarSign className="w-5 h-5 text-primary" />
                <span className="text-lg">{eventData?.isFree ? 'Free Event' : 'Paid Event'}</span>
              </motion.div>
              <motion.div
                className="flex items-center space-x-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Tag className="w-5 h-5 text-primary" />
                <span className="text-lg">
                  {eventData?.eventType || 'Event type not specified'}
                </span>
              </motion.div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <h3 className="text-xl font-semibold mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed">
              {eventData?.description || 'No description available for the event'}
            </p>
          </motion.div>

          {eventData?.eventImages && eventData?.eventImages.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <h3 className="text-xl font-semibold mb-2">Additional Images</h3>
              <div className="grid grid-cols-2 gap-4">
                {eventData?.eventImages.slice(1).map((image: string, index: number) => (
                  <div key={index} className="relative w-full h-40 overflow-hidden rounded-xl">
                    <Img
                      src={image}
                      alt={`Event image ${currentImageIndex + 1}`}
                      onClick={() => handleImageClick(image)}
                      className="object-cover w-full h-full rounded-xl cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end space-x-4 mt-6">
          <Button variant="outline" onClick={() => handleUpdateEvent(eventData.id)}>
            Edit Event
          </Button>
          {/* <Button variant="destructive">Delete Event</Button> */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive">Delete Event</Button>
            </DialogTrigger>
            <DialogContent className="w-90 ">
              <DialogHeader>
                <DialogTitle>Are you sure?</DialogTitle>
                <DialogDescription>
                  {' '}
                  This action cannot be undone. This will permanently delete the event.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <>
                  <DialogClose asChild>
                    <Button variant="destructive" onClick={() => handleDeleteEvent(eventData?.id)}>
                      Delete Event
                    </Button>
                  </DialogClose>
                </>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
      {selectedImage && (
        <ImagePreviewDialog imageUrl={selectedImage} onClose={handleCloseImagePreview} />
      )}
    </div>
  );
}
