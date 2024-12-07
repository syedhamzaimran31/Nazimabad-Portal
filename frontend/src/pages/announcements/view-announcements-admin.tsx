import { useEffect, useState } from 'react';
import { Img } from 'react-image';
import { Link } from 'react-router-dom';
import { File, MoreHorizontal, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { exportToExcel, useImagePreview } from '@/lib/helpers/index';
import { ImagePreviewDialog } from '@/components/widgets/image-preview-dialog';
import { useNavigate } from 'react-router-dom';
import { Oval } from 'react-loader-spinner'; // Import the loader
import { announcementType } from '@/lib/types';
import { AnnouncementService } from '@/services/announcement.service';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import tokenService from '@/services/token.service';

export default function ViewAnnouncementPageAdmin() {
  const userRole = tokenService.getUserRole();
  console.log(userRole);

  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit] = useState<number>(10);

  const { useFetchAllAnnouncements, useHandleDeleteAnnouncement, fetchAllAnnouncementData } =
    AnnouncementService();

  // const { data: announcement, isLoading } = useFetchAllAnnouncements();
  const {
    data: announcementData,
    isLoading,
    refetch,
  } = useFetchAllAnnouncements(currentPage, limit);

  const announcement = announcementData?.data || [];
  console.log(announcement);

  const { mutate: deleteAnnouncement } = useHandleDeleteAnnouncement();

  const { selectedImage, handleImageClick, handleCloseImagePreview } = useImagePreview();

  const totalPages = Math.ceil((announcementData?.total || 0) / limit);

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

  const handleAllAnnouncementsExport = async () => {
    const allAnnouncements = await fetchAllAnnouncementData();
    const announcements = allAnnouncements?.data || [];

    const exportAnnouncementData = announcements.map((announcement) => {
      return {
        'Announcement Id': announcement.id,
        'Announcement By': announcement.fullName,
        Email: announcement.email,
        'Announcement title': announcement.title,
        'Announcement description': announcement.content,
        'Announcement Image': announcement.announcementImage || 'N/A',
        'Created at': announcement.created_at
          ? new Date(announcement.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : 'N/A',
      };
    });
    exportToExcel(exportAnnouncementData, 'All Announcements Data', 'All Announcements Data');
  };

  const handleCurrentPageAnnouncementsExport = async () => {
    const exportAnnouncementData = announcement.map((announcement) => {
      return {
        'Announcement Id': announcement.id,
        'Announcement By': announcement.fullName,
        Email: announcement.email,
        'Announcement title': announcement.title,
        'Announcement description': announcement.content,
        'Announcement Image': announcement.announcementImage || 'N/A',
        'Created at': announcement.created_at
          ? new Date(announcement.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : 'N/A',
      };
    });
    const fileName = `Announcements Data from ${(currentPage - 1) * limit + 1}-${Math.min(
      currentPage * limit,
      announcementData?.total ?? 0,
    )}`;
    exportToExcel(exportAnnouncementData, fileName, fileName);
  };

  // Get current announcements for the page
  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleViewDetails = (announcementId: string) => {
    console.log(`Viewing details for: ${announcementId}`);
    navigate(`/announcements/details/${announcementId}`);
  };

  const handleUpdateAnnouncement = (announcementId: string) => {
    console.log(`Updating announcement: ${announcementId}`);
    navigate(`/announcements/update/${announcementId}`); // Navigate with announcement ID
  };

  const handleDeleteAnnouncement = (id: number) => {
    deleteAnnouncement(id, {
      onSuccess: () => {
        refetch(); // Re-fetch the data to update the table
      },
    });
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
                  <Link to="#">Announcement</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>All Announcement</BreadcrumbPage>
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
                {/* <Button
                  size="sm"
                  // variant="outline"
                  className="h-8 gap-1 text-white bg-yellow-500 hover:bg-yellow-600"
                >
                  <File className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Export</span>
                </Button> */}
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
                            onClick={handleCurrentPageAnnouncementsExport}
                            className="bg-green-700 hover:bg-green-800 text-white"
                          >
                            Export Current Page Data
                          </Button>
                        </DialogClose>

                        <DialogClose asChild>
                          <Button
                            type="submit"
                            style={{ paddingRight: 10 }}
                            onClick={handleAllAnnouncementsExport}
                            className="bg-blue-700 hover:bg-blue-800 text-white"
                          >
                            Export All Announcements Data
                          </Button>
                        </DialogClose>
                      </>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Link to="/announcements/add">
                  <Button
                    size="sm"
                    className="h-8 gap-1 text-white bg-green-700 hover:bg-green-800"
                    onClick={() => navigate('/announcements/add')}
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      Add Announcement
                    </span>
                  </Button>
                </Link>
              </div>
            </div>
            <TabsContent value="all">
              <Card x-chunk="dashboard-06-chunk-0">
                <CardHeader>
                  <CardTitle>Announcements</CardTitle>
                  <CardDescription>See all announcements in announcement details</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="hidden w-[100px] sm:table-cell">
                          <span className="sr-only">Image</span>
                        </TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Announcement By</TableHead>
                        <TableHead className="hidden md:table-cell">Email</TableHead>
                        <TableHead className="hidden md:table-cell">Announced Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {announcement?.map((announcement: announcementType) => (
                        <TableRow key={announcement.id}>
                          <TableCell className="hidden sm:table-cell">
                            <Img
                              alt="announcement image"
                              className="aspect-square rounded-md object-cover"
                              height="64"
                              src={announcement.announcementImage || '/placeholder.svg'}
                              onClick={() => handleImageClick(announcement.announcementImage)}
                              width="64"
                            />
                          </TableCell>
                          <TableCell className="font-medium">{announcement.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{announcement.fullName}</Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge variant="outline">{announcement.email}</Badge>
                          </TableCell>

                          <TableCell className="hidden md:table-cell">
                            {new Date(announcement.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
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
                                  onSelect={() => handleViewDetails(announcement.id.toString())}
                                >
                                  Announcement Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onSelect={() =>
                                    handleUpdateAnnouncement(announcement.id.toString())
                                  }
                                >
                                  Edit
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
                                        the announcement.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteAnnouncement(announcement.id)}
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
                    {announcement?.length > 0 ? (
                      <>
                        Showing{' '}
                        <strong>
                          {(currentPage - 1) * limit + 1}-
                          {Math.min(currentPage * limit, announcementData?.total ?? 0)}
                        </strong>{' '}
                        of <strong>{announcementData?.total}</strong> Announcements
                      </>
                    ) : (
                      'No announcements to show'
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
