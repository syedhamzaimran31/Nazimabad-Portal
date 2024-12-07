import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { formatCnic, useImagePreview } from '@/lib/helpers/index';
import { ImagePreviewDialog } from '@/components/widgets/image-preview-dialog';
import VisitorService from '@/services/visitor.service';
import { Oval } from 'react-loader-spinner';
import { ArrowLeft, Car, RectangleHorizontal, Users, Calendar, Clock } from 'lucide-react';
import { CreditCard } from 'lucide-react';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VisitorDetailsPage() {
  const { visitorId } = useParams<{ visitorId: string }>();
  const navigate = useNavigate(); // Hook for navigation
  const { useFetchVisitorById } = VisitorService();

  const { data: visitorData, isLoading } = useFetchVisitorById(visitorId || '');
  const visitor = visitorData?.data[0];

  console.log(visitorData);
  console.log(visitor);

  const { selectedImage, handleImageClick, handleCloseImagePreview } = useImagePreview();

  console.log(visitor);
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
  // if (error) return <div>Error loading visitor details.</div>;
  if (!visitor || !visitor.persons) {
    return <div>No visitor data available.</div>;
  }

  return (
    <>
      <div className="px-4 w-full h-screen">
        <div className="flex items-center space-x-4 pt-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center w-11 h-11 transition duration-300"
          >
            <ArrowLeft size={35} className="text-gray-600 hover:text-black" />
          </button>

          <h1 className="text-3xl font-bold">Visitor Details</h1>
        </div>

        {/* Visitor Details */}
        <div className="mt-6">
          <div className="bg-white shadow-md rounded-lg p-4 w-full max-w-4xl mb-6 border border-gray-300 text-xl font-semibold">
            <div className="flex items-center space-x-2">
              <Car size={40} className="text-gray-600 bg-gray-100 p-2 rounded-full" />
              <span className="font-semibold">Vehicle Type:</span>
              <span>{visitor?.vehicleType}</span>
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <RectangleHorizontal
                size={40}
                className="text-gray-600 bg-gray-100 p-2 rounded-full"
              />
              <span className="font-semibold">Number Plate:</span>
              <span>{visitor?.numberPlate}</span>
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <Users size={40} className="text-gray-600 bg-gray-100 p-2 rounded-full" />
              <span className="font-semibold">Number of Persons:</span>
              <span>{visitor?.numberOfPersons}</span>
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <Calendar size={40} className="text-gray-600 bg-gray-100 p-2 rounded-full" />
              <span className="font-semibold">Visit Date:</span>
              <span>{visitor?.visitDate}</span>
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <Clock size={40} className="text-gray-600 bg-gray-100 p-2 rounded-full" />
              <span className="font-semibold">Visit Day:</span>
              <span>{visitor?.visitDay}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            {visitor?.persons.map((person: any, index: number) => (
              <Card
                key={index}
                className="shadow-lg w-full h-[180px] max-w-[320px] rounded-lg border border-gray-300 bg-white p-4"
              >
                <CardContent className="flex-row p-0">
                  <div className="border-b-[1px]">
                    <div className="flex flex-row mb-2 gap-2">
                      <User size={40} className="w-min text-gray-600 bg-gray-100 rounded-sm p-2" />
                      <p className="text-xl font-semibold">{person.name}</p>
                    </div>

                    <div className="flex flex-row mb-2 gap-2">
                      <CreditCard
                        size={40}
                        className="w-min text-gray-600 bg-gray-100 rounded-sm p-2"
                      />
                      <span className="font-semibold text-xl mb-2">{formatCnic(person.cnic)}</span>
                    </div>
                  </div>

                  <div className="flex justify-end mt-2">
                    <span
                      onClick={() => handleImageClick(person.cnicImage)}
                      className="cursor-pointer font-semibold text-base text-black underline hover:text-gray-700 transition"
                    >
                      <Button className="bg-[#e1fde1] text-[#166534] hover:text-white">
                        View CNIC
                      </Button>
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedImage && (
            <ImagePreviewDialog imageUrl={selectedImage} onClose={handleCloseImagePreview} />
          )}
        </div>
      </div>
    </>
  );
}
