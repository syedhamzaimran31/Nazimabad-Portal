import { Img } from 'react-image';
import { Link } from 'react-router-dom';
import { File, MoreHorizontal, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbLink,
//   BreadcrumbList,
//   BreadcrumbPage,
//   BreadcrumbSeparator,
// } from '@/components/ui/breadcrumb';

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
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { exportToExcel, useImagePreview } from '@/lib/helpers/index';
import { ImagePreviewDialog } from '@/components/widgets/image-preview-dialog';
import { useNavigate } from 'react-router-dom';
import { Oval } from 'react-loader-spinner'; // Import the loader
import { ComplaintService } from '@/services/complaint.service';
import { complaintType } from '@/lib/types';
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

import tokenService from '@/services/token.service';

// type FilterKey = 'visitDate' | 'checkinTime' | 'checkinTimeEnd' | 'checkoutTime';

export default function ComplaintPage() {
  const userRole = tokenService.getUserRole();
  console.log(userRole);

  const userIsAdmin = userRole === 'Admin' ? true : false;

  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit] = useState<number>(10);

  const { useFetchAllComplaints, useHandleDeleteComplaint, fetchAllComplaintsData } =
    ComplaintService();

  const { data: complaintData, isLoading, refetch } = useFetchAllComplaints(currentPage, limit);
  const complaint = complaintData?.data || [];
  console.log(complaint);

  const handleAllComplaintsExport = async () => {
    const allComplaints = await fetchAllComplaintsData();
    const complaints = allComplaints?.data || [];

    const exportComplaintData = complaints.map((complaint) => {
      return {
        'Complaint Id': complaint.id,
        'Full name': complaint.fullName,
        Email: complaint.email,
        'Complaint title': complaint.complaint,
        'Complaint description': complaint.description,
        'Complaint type': complaint.complaintType || 'N/A',
        'Complaint status': complaint.complaintStatus || 'N/A',
        'Admin response': complaint.response || 'N/A',
        'Complaint Image': complaint.complaintImage || 'N/A',
        'Created at': complaint.created_at
          ? new Date(complaint.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : 'N/A',
      };
    });
    exportToExcel(exportComplaintData, 'All Complaints Data', 'All Complaints Data');
  };

  const handleCurrentPageComplaintsExport = async () => {
    const exportComplaintData = complaint.map((complaint) => {
      return {
        'Complaint Id': complaint.id,
        'Full name': complaint.fullName,
        Email: complaint.email,
        'Complaint title': complaint.complaint,
        'Complaint description': complaint.description,
        'Complaint type': complaint.complaintType || 'N/A',
        'Complaint status': complaint.complaintStatus || 'N/A',
        'Admin response': complaint.response || 'N/A',
        'Complaint Image': complaint.complaintImage || 'N/A',
        'Created at': complaint.created_at
          ? new Date(complaint.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : 'N/A',
      };
    });
    const fileName = `Complaints Data from ${(currentPage - 1) * limit + 1}-${Math.min(
      currentPage * limit,
      complaintData?.total ?? 0,
    )}`;
    exportToExcel(exportComplaintData, fileName, fileName);
  };

  const { mutate: deleteComplaint } = useHandleDeleteComplaint();
  const totalPages = Math.ceil((complaintData?.total || 0) / limit);

  const { selectedImage, handleImageClick, handleCloseImagePreview } = useImagePreview();

  useEffect(() => {
    refetch();
  }, [currentPage, refetch]);

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

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleDeleteComplaint = (id: number) => {
    deleteComplaint(id, {
      onSuccess: () => {
        refetch(); // Re-fetch the data to update the table
      },
    });
  };

  const handleViewDetails = (complaintId: string) => {
    console.log(`Viewing details for: ${complaintId}`);
    navigate(`/complaints/${complaintId}`);
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
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-0">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          {/* <Breadcrumb className="hidden md:flex">
            <BreadcrumbList>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="#">Cmplaints</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>All Complaints</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb> */}
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Tabs defaultValue="all">
            <div className="flex items-center">
              {/* <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="draft">Draft</TabsTrigger>
                <TabsTrigger value="archived" className="hidden sm:flex">
                  Archived
                </TabsTrigger>
              </TabsList> */}
              <div className="ml-auto flex items-center gap-2">
                {/* <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                      <ListFilter className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Filter</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem checked>Active</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>Draft</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>Archived</DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu> */}
                {/* Export Modal */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      // variant="outline"
                      className="h-8 gap-1 text-white bg-yellow-500 hover:bg-yellow-600"
                    >
                      <File className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Export</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-90 ">
                    <DialogHeader>
                      <DialogTitle>Confirm Export</DialogTitle>
                      <DialogDescription>Select which data to export:</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <>
                        <DialogClose asChild>
                          <Button
                            type="submit"
                            onClick={handleCurrentPageComplaintsExport}
                            className="bg-green-700 hover:bg-green-800 text-white"
                          >
                            Export Current Page Data
                          </Button>
                        </DialogClose>
                        <DialogClose asChild>
                          <Button
                            type="submit"
                            style={{ paddingRight: 10 }}
                            onClick={handleAllComplaintsExport}
                            className="bg-blue-700 hover:bg-blue-800 text-white"
                          >
                            Export All Complaints Data
                          </Button>
                        </DialogClose>
                      </>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                {!userIsAdmin && (
                  <Link to="/complaints/add">
                    <Button
                      size="sm"
                      className="h-8 gap-1 text-white bg-green-700 hover:bg-green-800"
                      onClick={() => navigate('/complaints/add')}
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Add Complaint
                      </span>
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            <TabsContent value="all">
              <Card x-chunk="dashboard-06-chunk-0">
                <CardHeader>
                  <CardTitle>Complaints</CardTitle>
                  <CardDescription>See all complaints in complaint details</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
                        {userIsAdmin && <TableHead>Name</TableHead>}
                        {userIsAdmin && <TableHead>Email</TableHead>}
                        <TableHead className="hidden md:table-cell">Title</TableHead>
                        {/* <TableHead className="hidden md:table-cell">
                          Description
                        </TableHead> */}
                        <TableHead className="hidden md:table-cell">Status</TableHead>
                        <TableHead className="hidden md:table-cell">Report Time</TableHead>
                        <TableHead className="hidden md:table-cell">Complaint Type</TableHead>
                        <TableHead>
                          <span className="sr-only">Actions</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {complaint?.map((complaint: complaintType) => (
                        <TableRow key={complaint.id}>
                          <TableCell className="hidden sm:table-cell">
                            <Img
                              alt="Complaint image"
                              className="aspect-square rounded-md object-cover"
                              height="64"
                              src={complaint.complaintImage || '/placeholder.svg'}
                              onClick={() => handleImageClick(complaint.complaintImage)}
                              width="64"
                            />
                          </TableCell>
                          {userIsAdmin && (
                            <TableCell className="font-medium">{complaint.fullName}</TableCell>
                          )}
                          {userIsAdmin && (
                            <TableCell>
                              <Badge variant="outline">{complaint.email}</Badge>
                            </TableCell>
                          )}
                          <TableCell className="hidden md:table-cell">
                            {complaint.complaint}
                          </TableCell>
                          {/* <TableCell className="hidden md:table-cell">
                            {complaint.description}
                          </TableCell> */}
                          <TableCell>
                            <Badge
                              variant="outline"
                              style={{
                                fontSize: '0.875rem',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '0.5rem',
                                fontWeight: '600',
                                color: 'white',
                                backgroundColor:
                                  complaint.complaintStatus === 'Pending'
                                    ? '#4ade80'
                                    : complaint.complaintStatus === 'Resolved'
                                    ? '#166534'
                                    : '#16a34a', // color for 'progress'
                              }}
                            >
                              {complaint.complaintStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {new Date(complaint.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {complaint.complaintType}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Toggle menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onSelect={() => handleViewDetails(complaint.id.toString())}
                                >
                                  Complaint Details
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onSelect={() => handleUpdateComplaint(complaint.id.toString())}
                                >
                                  {userIsAdmin ? 'Update Status' : 'Edit'}
                                </DropdownMenuItem>

                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                      Delete
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete
                                        the complaint.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteComplaint(complaint.id)}
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem className="cursor-pointer">
                        <PaginationPrevious
                          className={`${
                            currentPage === 1 && 'pointer-events-none bg-gray-300 text-gray-600'
                          }`}
                          onClick={() => {
                            setCurrentPage((prev) => prev - 1);
                          }}
                        />
                      </PaginationItem>

                      {[...Array(totalPages)].map((_, index) => {
                        const isActive = currentPage === index + 1 ? true : false;
                        return (
                          <PaginationItem key={index} className="cursor-pointer">
                            <PaginationLink
                              isActive={isActive}
                              onClick={() => handlePageChange(index + 1)}
                            >
                              {index + 1}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      <PaginationItem className="cursor-pointer">
                        <PaginationNext
                          className={`${
                            currentPage === totalPages &&
                            'pointer-events-none bg-gray-300 text-gray-600'
                          }`}
                          onClick={() => {
                            handlePageChange(currentPage + 1);
                          }}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>

                  <div className="text-xs text-muted-foreground">
                    {complaint.length > 0 ? (
                      <>
                        Showing{' '}
                        <strong>
                          {(currentPage - 1) * limit + 1}-
                          {Math.min(currentPage * limit, complaintData?.total ?? 0)}
                        </strong>{' '}
                        of <strong>{complaintData?.total}</strong> Complaints
                      </>
                    ) : (
                      'No complaints to show'
                    )}
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {selectedImage && (
        <ImagePreviewDialog imageUrl={selectedImage} onClose={handleCloseImagePreview} />
      )}
    </div>
  );
}
