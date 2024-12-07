import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { ImagePreviewDialog } from '@/components/widgets/image-preview-dialog';
import { exportToExcel, useImagePreview } from '@/lib/helpers';
import { ComplaintService } from '@/services/complaint.service';
import tokenService from '@/services/token.service';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ChevronLeft,
  CircleCheckBig,
  ClockArrowDown,
  ClockArrowUp,
  MoreVertical,
} from 'lucide-react';
import { Oval } from 'react-loader-spinner';
import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';

export default function ComplaintDetailsPage() {
  const userRole = tokenService.getUserRole();
  console.log(userRole);

  const userIsAdmin = userRole === 'Admin' ? true : false;

  const { id } = useParams();
  const navigate = useNavigate();

  const { useFetchComplaintsById, useHandleDeleteComplaint } = ComplaintService();
  const { data: complaintData, isLoading } = useFetchComplaintsById(id || '');
  const complaintsObject = complaintData?.data[0];

  const { mutate: deleteComplaint } = useHandleDeleteComplaint();

  console.log(complaintData);
  console.log(complaintsObject);
  const {
    fullName,
    email,
    complaint,
    description,
    complaintType,
    complaintImage,
    response,
    complaintStatus,
    created_at,
    updated_at,
  } = complaintsObject || {};
  const { selectedImage, handleImageClick, handleCloseImagePreview } = useImagePreview();
  const [showExportModal, setShowExportModal] = useState(false); // State for showing export modal

  console.log(selectedImage);

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

  const complaintStatusIcon =
    complaintStatus === 'Pending' ? (
      <ClockArrowDown />
    ) : complaintStatus === 'Progress' ? (
      <ClockArrowUp />
    ) : (
      <CircleCheckBig />
    );

  const handleComplaintsExportById = async () => {
    const exportComplaintData = () => {
      return [
        {
          'Complaint Id': complaintsObject.id || 'N/A',
          'Full name': fullName || 'N/A',
          Email: email || 'N/A',
          'Complaint title': complaint || 'N/A',
          'Complaint description': description || 'N/A',
          'Complaint type': complaintType || 'N/A',
          'Complaint status': complaintStatus || 'N/A',
          'Admin response': response || 'N/A',
          'Complaint Image': complaintImage || 'N/A',
          'Created at': created_at
            ? new Date(created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            : 'N/A',
        },
      ];
    };

    const fileName = `Complaint-${complaintsObject.id}`;
    exportToExcel(exportComplaintData(), fileName, fileName);
  };

  const handleDeleteComplaint = (id: number) => {
    deleteComplaint(id, {
      onSuccess: () => {
        navigate(`/complaints`); // Navigate back to complaints page
      },
    });
  };

  const handleUpdateComplaint = (complaintId: string) => {
    if (userIsAdmin) {
      console.log(`Updating complaint: ${complaintId}`);
      navigate(`/complaints/update/admin/${complaintId}`); // Navigate with complaint ID
    } else {
      console.log(`Updating complaint: ${complaintId}`);
      navigate(`/complaints/update/${complaintId}`); // Navigate with complaint ID
    }
  };
  return (
    <>
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
        <Card className="overflow-hidden  m-10 " x-chunk="dashboard-05-chunk-4 ">
          <CardHeader className="flex flex-row items-start bg-muted/50">
            <div className="grid gap-0.5">
              <CardTitle className="group flex items-center gap-2 text-lg">
                {complaint}
                {/* <Button
                  size="icon"
                  variant="outline"
                  className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Copy className="h-3 w-3" />
                  <span className="sr-only">Copy Order ID</span>
                </Button> */}
              </CardTitle>
              <CardDescription>
                Date:{' '}
                {new Date(created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </CardDescription>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <Button size="sm" variant="outline" className="h-8 gap-1 cursor-default">
                {complaintStatusIcon}
                <span className="lg:sr-only xl:not-sr-only xl:whitespace-nowrap">
                  {complaintStatus}
                </span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="outline" className="h-8 w-8">
                    <MoreVertical className="h-3.5 w-3.5" />
                    <span className="sr-only">More</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onSelect={() => handleUpdateComplaint(complaintsObject.id.toString())}
                  >
                    {userIsAdmin ? 'Update Status' : 'Edit'}
                  </DropdownMenuItem>
                  <AlertDialog open={showExportModal} onOpenChange={setShowExportModal}>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault();
                          setShowExportModal(true); // Open the modal without affecting the dropdown
                        }}
                      >
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Export</span>
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Export</AlertDialogTitle>
                        <AlertDialogDescription></AlertDialogDescription>
                      </AlertDialogHeader>
                      {/* style={{ width: '480px' }} */}
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setShowExportModal(false)}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            handleComplaintsExportById();
                            setShowExportModal(false); // Close the modal after export
                          }}
                          className="bg-green-700 hover:bg-green-800 text-white"
                        >
                          Export
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <DropdownMenuSeparator />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        Trash
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the complaint.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteComplaint(complaintsObject.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="p-6 text-sm">
            <div className="grid gap-3">
              <div className="font-semibold">User Details</div>
              <ul className="grid gap-3">
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">User Name</span>
                  <span>{fullName}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">User Email</span>
                  <span>{email}</span>
                </li>
              </ul>
              <Separator className="my-2" />
              <ul className="grid gap-3">
                {/* <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>$299.00</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>$5.00</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>$25.00</span>
                </li>
                <li className="flex items-center justify-between font-semibold">
                  <span className="text-muted-foreground">Total</span>
                  <span>$329.00</span>
                </li> */}
              </ul>
            </div>
            {/* <Separator className="my-4" /> */}
            {/* <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-3">
                <div className="font-semibold">Shipping Information</div>
                <address className="grid gap-0.5 not-italic text-muted-foreground">
                  <span>Liam Johnson</span>
                  <span>1234 Main St.</span>
                  <span>Anytown, CA 12345</span>
                </address>
              </div>
              <div className="grid auto-rows-max gap-3">
                <div className="font-semibold">Billing Information</div>
                <div className="text-muted-foreground">Same as shipping address</div>
              </div>
            </div>
            <Separator className="my-4" /> */}
            <div className="grid gap-3">
              <div className="font-semibold">Complaint Information</div>
              <dl className="grid gap-3">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Title</dt>
                  <dd>{complaint}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Complaint type</dt>
                  <dd>{complaintType}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Complaint status</dt>
                  <Badge
                    variant="outline"
                    style={{
                      fontSize: '0.875rem',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '0.5rem',
                      fontWeight: '600',
                      color: 'white',
                      backgroundColor:
                        complaintStatus === 'Pending'
                          ? '#4ade80'
                          : complaint.complaintStatus === 'Resolved'
                          ? '#166534'
                          : '#16a34a', // color for 'progress'
                    }}
                  >
                    {complaintStatus}
                  </Badge>
                </div>
              </dl>
            </div>

            <Separator className="my-4" />
            <div className="grid gap-3">
              <div className="font-semibold">Complaint Description</div>
              <dl className="grid gap-3">
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-1 text-muted-foreground">{description}</dt>
                </div>
              </dl>
            </div>
            <Separator className="my-4" />
            <div className="grid gap-3">
              <div className="font-semibold">Complaint Image</div>
              <dl className="grid gap-3">
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-1 text-muted-foreground">
                    {complaintImage && (
                      <img
                        src={complaintImage || ''}
                        onClick={() => handleImageClick(complaintImage as string)}
                        alt="CNIC Preview"
                        className="mt-2 h-56 w-full object-cover rounded-md"
                      />
                    )}
                  </dt>
                </div>
              </dl>
            </div>
            <Separator className="my-4" />
            <div className="grid gap-3">
              <div className="font-semibold">Admin Response</div>
              <dl className="grid gap-3">
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-1 text-muted-foreground">
                    {response || 'N/A'}
                  </dt>
                </div>
              </dl>
            </div>
          </CardContent>

          <CardFooter className="flex flex-row items-center border-t bg-muted/50 px-6 py-3">
            <div className="text-xs text-muted-foreground">
              Updated{' '}
              <time dateTime="2023-11-23">
                {new Date(updated_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </div>
            {/* <Pagination className="ml-auto mr-0 w-auto">
              <PaginationContent>
                <PaginationItem>
                  <Button size="icon" variant="outline" className="h-6 w-6">
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span className="sr-only">Previous Order</span>
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <Button size="icon" variant="outline" className="h-6 w-6">
                    <ChevronRight className="h-3.5 w-3.5" />
                    <span className="sr-only">Next Order</span>
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination> */}
          </CardFooter>
        </Card>
        {selectedImage && (
          <ImagePreviewDialog imageUrl={selectedImage} onClose={handleCloseImagePreview} />
        )}
      </div>
    </>
  );
}
