import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AnnouncementService } from '@/services/announcement.service';
import tokenService from '@/services/token.service';
import { UserService } from '@/services/user.service';
import { Img } from 'react-image';
import { useNavigate, useParams } from 'react-router-dom';
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
import { ChevronLeft } from 'lucide-react';
export default function AnnouncementDetailPage() {
  const userRole = tokenService.getUserRole();
  console.log(userRole);

  const userIsAdmin = userRole === 'Admin' ? true : false;

  const { id } = useParams();
  const navigate = useNavigate();

  const { useFetchAnnouncementById, useHandleDeleteAnnouncement } = AnnouncementService();
  const { useFetchUserById } = UserService();

  const { data: announcementData } = useFetchAnnouncementById(id?.toString() || '');
  console.log(announcementData);

  const { mutate: deleteAnnouncement } = useHandleDeleteAnnouncement();

  const { data: userData } = useFetchUserById();
  console.log(userData);

  const handleUpdateAnnouncement = (announcementId: string) => {
    console.log(`Updating announcement: ${announcementId}`);
    navigate(`/announcements/update/${announcementId}`); // Navigate with announcement ID
  };

  const handleDeleteAnnouncement = (id: number) => {
    deleteAnnouncement(id, {
      onSuccess: () => {
        navigate('/announcements/admin'); //Navigate back to announcement page
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <button
        onClick={() => navigate(-1)} // Navigate back to the previous page
        className="text-green-700 hover:underline"
      >
        <div className="flex">
          <ChevronLeft size={24} className="fill-current text-gray-400" />
          Back
        </div>
      </button>
      <h1 className="text-4xl font-bold text-center mb-10 text-gray-800">Announcement Details</h1>

      <div className="flex justify-center items-center bg-gray-100">
        <Card className="w-full max-w-6xl bg-white shadow-2xl rounded-lg overflow-hidden">
          <div className="relative">
            <Img
              alt="Announcement Image"
              className="w-full h-96 object-cover"
              src={announcementData?.announcementImage || 'https://picsum.photos/100/100'} // Add your image source here
            />
          </div>
          <CardHeader className="p-6 flex items-center space-x-4">
            <Img
              alt="Profile Image"
              className="w-20 h-20 rounded-full object-cover ring-2 ring-gray-300 hover:ring-blue-500 transition duration-300"
              src={userData?.profileImage || 'https://picsum.photos/100/100'} // Add your image source here
            />
            <div>
              <CardTitle className="text-3xl font-semibold text-gray-900">
                {announcementData?.title}
              </CardTitle>
              <p className="text-gray-500 text-lg text-center">{userData?.fullName}</p>
            </div>
          </CardHeader>
          <CardContent className="px-10 pb-6 py-3 text-justify ">
            <p className="text-gray-700 text-lg leading-relaxed">{announcementData?.content}</p>
          </CardContent>
          <CardFooter className="flex justify-between space-x-4 px-6 py-4 bg-gray-50 border-t">
            <div className="text-sm text-muted-foreground font-bold	">
              Date{' '}
              <time dateTime="2023-11-23">
                {new Date(announcementData?.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </div>
            <div>
              {userIsAdmin && (
                <>
                  <Button
                    size="sm"
                    className="h-8 px-5 mr-3  text-white bg-blue-700 hover:bg-blue-800"
                    onClick={() => handleUpdateAnnouncement(announcementData.id.toString())}
                  >
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Edit</span>
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        className="h-8 gap-1 text-white bg-green-700 hover:bg-green-800"
                      >
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Delete</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-90 ">
                      <DialogHeader>
                        <DialogTitle>Are you sure?</DialogTitle>
                        <DialogDescription>
                          {' '}
                          This action cannot be undone. This will permanently delete the
                          announcement.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <>
                          <DialogClose asChild>
                            <Button
                              type="submit"
                              onClick={() => handleDeleteAnnouncement(announcementData.id)}
                              className="bg-green-700 hover:bg-green-800 text-white"
                            >
                              Delete
                            </Button>
                          </DialogClose>
                        </>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
