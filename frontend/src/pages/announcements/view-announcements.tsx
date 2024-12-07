import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnnouncementService } from '@/services/announcement.service';
import { useNavigate } from 'react-router-dom';
import { Oval } from 'react-loader-spinner';
import { announcementType } from '@/lib/types';

export default function ViewAnnouncementsPage() {
  const navigate = useNavigate();

  const { useFetchAllAnnouncements } = AnnouncementService();

  const { data: announcementData, isLoading } = useFetchAllAnnouncements();

  const announcement = announcementData?.data || [];
  console.log(announcement);

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

  const handleViewDetails = (announcementId: string) => {
    console.log(`Viewing details for: ${announcementId}`);
    navigate(`/announcements/details/${announcementId}`);
  };
  return (
    <>
      <div className="flex flex-wrap gap-6 p-10 justify-center">
        {announcement?.map((announcement: announcementType) => (
          <Card className="flex flex-col w-full max-w-[350px] shadow-md">
            <CardHeader>
              <img
                src={
                  announcement.announcementImage ||
                  'https://img.freepik.com/free-photo/wide-angle-shot-single-tree-growing-clouded-sky-sunset-surrounded-by-grass_181624-22807.jpg?t=st=1726921342~exp=1726924942~hmac=1099f7bce3bea8b9520069c06d7bdc5c2d07041542c88ae0c5a662453a202186&w=900'
                }
                alt={'image'}
                className="w-full h-[180px] max-w-full max-h-[180px] object-cover rounded-md"
                // className="w-76 h-45 max-w[76px] max-h-45 object-cover rounded-md"
              />
            </CardHeader>
            <CardContent className="p-4 flex flex-col flex-grow">
              <CardTitle className="text-3xl font-IBM break-words">{announcement.title}</CardTitle>
              <p className="text-md font-medium mt-2">
                Date ({' '}
                {new Date(announcement.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
                )
              </p>
              <div>
                <p className="mt-2 text-lg font-semibold text-justify max-w[200px] break-words line-clamp-3">
                  {announcement.content}
                </p>{' '}
                <Button
                  variant="link"
                  className="text-gray-500 text-sm"
                  onClick={() => handleViewDetails(announcement.id.toString())}
                >
                  More...
                </Button>
              </div>
            </CardContent>
            <CardFooter></CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
