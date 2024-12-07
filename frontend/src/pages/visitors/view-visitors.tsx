import { useEffect, useState } from 'react';
import { VisitorService } from '@/services/visitor.service';
import { Img } from 'react-image';
import { Link } from 'react-router-dom';
import { File, ListFilter, MoreHorizontal, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbLink,
//   BreadcrumbList,
//   BreadcrumbPage,
//   BreadcrumbSeparator,
// } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

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
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Tabs, TabsContent } from '@/components/ui/tabs';
import VisitorDetailsDialog from '@/components/widgets/visitor-details-modal'; // Adjust the import path
import { Visitor } from '@/lib/types/index'; // Adjust the import path
import { exportToExcel, useImagePreview } from '@/lib/helpers/index';
import { ImagePreviewDialog } from '@/components/widgets/image-preview-dialog';
import { useNavigate } from 'react-router-dom';
import { Oval } from 'react-loader-spinner'; // Import the loader
import { Label } from '@/components/ui/label';
import { DateTimePicker } from '@/components/ui/date-time-picker';

type FilterKey = 'visitDate' | 'checkinTime' | 'checkinTimeEnd' | 'checkoutTime';

export default function VisitorsPage() {
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const { selectedImage, handleImageClick, handleCloseImagePreview } = useImagePreview();

  const [visitDateFilterOpen, setVisitDateFilterOpen] = useState(false);
  const [checkInTimeFilterOpen, setCheckInTimeFilterOpen] = useState(false);
  const [checkOutTimeFilterOpen, setCheckOutTimeFilterOpen] = useState(false);

  const [filters, setFilters] = useState<{
    visitDate?: Date;
    checkinTime?: Date;
    checkinTimeEnd?: Date;
    checkoutTime?: Date;
  }>({});

  const [tempFilters, setTempFilters] = useState<{
    visitDate?: Date;
    checkinTime?: Date;
    checkinTimeEnd?: Date;
    checkoutTime?: Date;
  }>({});

  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit] = useState<number>(10);

  const { useFetchAllVisitor, useHandleDeleteVisitor, fetchAllVisitorsData } = VisitorService();

  const handleApplyFilter = () => {
    // Apply tempFilters to filters

    setVisitDateFilterOpen(false);
    setCheckInTimeFilterOpen(false);
    setCheckOutTimeFilterOpen(false);

    setFilters(tempFilters);
    // setTempFilters({});
    // setFilterOpen(false);
    refetch(); // Refetch data with new filters
    setCurrentPage(1); // Reset the page to 1 after applying filters
  };

  const handleClearFilter = (filterKey: FilterKey) => {
    setFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters };
      delete updatedFilters[filterKey];
      return updatedFilters;
    });

    setTempFilters((prevFilters) => {
      const updatedTempFilters = { ...prevFilters };
      delete updatedTempFilters[filterKey];
      return updatedTempFilters;
    });

    refetch(); // Optionally refetch data with updated filters
  };

  const handleResetFilters = () => {
    setFilters({});
    setTempFilters({});
    refetch(); // Refetch data with default filters
  };

  const handleTempFilterChange = (filterKey: string, value: Date | undefined) => {
    setTempFilters((prevFilters) => ({
      ...prevFilters,
      [filterKey]: value ? format(value, 'yyyy-MM-dd') : undefined,
    }));
  };
  const {
    data: visitorsData,
    isLoading,
    refetch,
  } = useFetchAllVisitor(currentPage, limit, filters);
  const visitors = visitorsData?.data || [];

  const handleAllVisitorsExport = async () => {
    const allVisitors = await fetchAllVisitorsData(filters);
    const visitors = allVisitors?.data || [];

    const flattenedData = visitors.map((visitor) => {
      const personsDetails = visitor.persons.map((person, index) => ({
        [`Person ${index + 1} Name`]: person.name,
        [`Person ${index + 1} CNIC`]: person.cnic,
        [`Person ${index + 1} CNIC Image`]: person.cnicImage,
      }));

      return {
        VisitorID: visitor.id,
        NumberOfPersons: visitor.numberOfPersons,
        VehicleType: visitor.vehicleType || 'N/A',
        VehicleNumber: visitor.numberPlate || 'N/A',
        VisitDate: visitor.visitDate ? new Date(visitor.visitDate).toLocaleDateString() : 'N/A',
        CheckinTime: visitor.checkinTime
          ? new Date(visitor.checkinTime).toLocaleTimeString()
          : 'N/A',
        CheckoutTime: visitor.checkoutTime
          ? new Date(visitor.checkoutTime).toLocaleTimeString()
          : 'N/A',
        CreatedAt: visitor.createdAt ? new Date(visitor.createdAt).toISOString() : 'N/A',
        IsVerified: visitor.isVerified,
        ...personsDetails.reduce((acc, personDetail) => ({ ...acc, ...personDetail }), {}),
      };
    });

    exportToExcel(flattenedData, 'All Visitors Data', 'All Visitors Data');
  };

  // Function to flatten the data for Excel export and get current page visitor data
  const heandleCurrentPageVisitorsExport = () => {
    const flattenedData = visitors.map((visitor) => {
      // Flatten persons array into string if there are multiple persons
      const personsDetails = visitor.persons.map((person, index) => ({
        [`Person ${index + 1} Name`]: person.name,
        [`Person ${index + 1} CNIC`]: person.cnic,
        [`Person ${index + 1} CNIC Image`]: person.cnicImage,
      }));

      return {
        VisitorID: visitor.id,
        NumberOfPersons: visitor.numberOfPersons,
        VehicleType: visitor.vehicleType || 'N/A',
        VehicleNumber: visitor.numberPlate || 'N/A',
        VisitDate: visitor.visitDate ? new Date(visitor.visitDate).toLocaleDateString() : 'N/A',
        CheckinTime: visitor.checkinTime
          ? new Date(visitor.checkinTime).toLocaleTimeString()
          : 'N/A',
        CheckoutTime: visitor.checkoutTime
          ? new Date(visitor.checkoutTime).toLocaleTimeString()
          : 'N/A',
        CreatedAt: visitor.createdAt ? new Date(visitor.createdAt).toISOString() : 'N/A',
        IsVerified: visitor.isVerified,
        ...personsDetails.reduce((acc, personDetail) => ({ ...acc, ...personDetail }), {}),
      };
    });

    // Exporting all visitor data to Excel
    exportToExcel(
      flattenedData,
      `Visitors Data from ${(currentPage - 1) * limit + 1}-${Math.min(
        currentPage * limit,
        visitorsData?.total ?? 0,
      )}`,
      `Visitors Data from ${(currentPage - 1) * limit + 1}-${Math.min(
        currentPage * limit,
        visitorsData?.total ?? 0,
      )}`,
    );
  };

  const { mutate: deleteVisitor } = useHandleDeleteVisitor();
  console.log('Fetched Visitors Data:', visitorsData); // Add this to check data
  console.log('Fetched Visitors :', visitors); // Add this to check data

  const totalPages = Math.ceil((visitorsData?.total || 0) / limit);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleDeleteVisitor = (id: number) => {
    deleteVisitor(id);
  };
  const handleViewDetails = (visitorId: string, visitor: Visitor) => {
    console.log(`Viewing details for: ${visitor.persons[0].name}`);
    navigate(`/visitors/${visitorId}`);
  };

  const handleUpdateVisitors = (visitorId: string) => {
    console.log(`Updating visitor: ${visitorId}`);
    navigate(`/visitors/update/${visitorId}`); // Navigate with Visitor ID
  };

  useEffect(() => {
    refetch();
  }, [currentPage, filters, refetch]);

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
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-0">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Tabs defaultValue="all">
            <div className="flex items-center">
              <div className="ml-auto flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                      <ListFilter className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Applied filters
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                      checked={!!filters.visitDate}
                      onClick={() => handleClearFilter('visitDate')}
                    >
                      Visit Date
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={!!filters.checkinTime}
                      onClick={() => handleClearFilter('checkinTime')}
                    >
                      Checked In
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={!!filters.checkoutTime}
                      onClick={() => handleClearFilter('checkoutTime')}
                    >
                      Checked Out
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem onClick={handleResetFilters}>
                      Reset Filters
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>

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
                            onClick={heandleCurrentPageVisitorsExport}
                            className="bg-green-700 hover:bg-green-800 text-white"
                          >
                            Export Current Page Data
                          </Button>
                        </DialogClose>
                        <DialogClose asChild>
                          <Button
                            type="submit"
                            style={{ paddingRight: 10 }}
                            onClick={handleAllVisitorsExport}
                            className="bg-blue-700 hover:bg-blue-800 text-white"
                          >
                            Export All Visitors Data
                          </Button>
                        </DialogClose>
                      </>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Link to="/visitors/add">
                  <Button
                    size="sm"
                    className="h-8 gap-1 text-white bg-green-700 hover:bg-green-800"
                    onClick={() => navigate('/visitors/add')}
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      Add Visitors
                    </span>
                  </Button>
                </Link>
              </div>
            </div>
            <TabsContent value="all">
              <Card x-chunk="dashboard-06-chunk-0">
                <CardHeader>
                  <CardTitle>Visitors</CardTitle>
                  <CardDescription>See all visitors in visitor details</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
                        <TableHead className="w-[100px]">Primary Person</TableHead>
                        <TableHead className="w-[90px]">Persons</TableHead>
                        <TableHead className="hidden md:table-cell w-[120px]">
                          Vehicle Type
                        </TableHead>
                        <TableHead className="hidden md:table-cell w-[135px]">
                          Vehicle Number
                        </TableHead>
                        <TableHead className="hidden md:table-cell w-[165px]">
                          <div className="flex items-center">
                            <span>Visit Date</span>
                            <Button variant="ghost" onClick={() => setVisitDateFilterOpen(true)}>
                              <ListFilter className="h-4 w-4 " />
                            </Button>
                          </div>
                        </TableHead>
                        <TableHead className="hidden md:table-cell w-[185px]">
                          <div className="flex items-center ">
                            <span>Checked In</span>
                            <Button variant="ghost" onClick={() => setCheckInTimeFilterOpen(true)}>
                              <ListFilter className="h-4 w-4  " />
                            </Button>
                          </div>
                        </TableHead>
                        <TableHead className="hidden md:table-cell  w-[195px]">
                          <div className="flex items-center ">
                            <span>Checked Out</span>
                            <Button variant="ghost" onClick={() => setCheckOutTimeFilterOpen(true)}>
                              <ListFilter className="h-4 w-4 " />
                            </Button>
                          </div>
                        </TableHead>
                        <TableHead className="hidden md:table-cell ">QR Code</TableHead>
                        <TableHead>
                          <span className="sr-only">Actions</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visitors?.map((visitor: Visitor) => (
                        <TableRow key={visitor.id}>
                          <TableCell className="hidden sm:table-cell">
                            <Img
                              alt="Visitor image"
                              className="aspect-square rounded-md object-cover"
                              height="64"
                              src={visitor.persons[0].cnicImage || '/placeholder.svg'}
                              onClick={() => handleImageClick(visitor.persons[0].cnicImage)}
                              width="64"
                            />
                          </TableCell>
                          <TableCell className="font-medium">{visitor.persons[0].name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{visitor.numberOfPersons}</Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {visitor.vehicleType}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {visitor.numberPlate}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {new Date(visitor.visitDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                            {/* {visitor.visitDate
                              ? new Date(visitor.visitDate).toLocaleDateString()
                              : 'N/A'} */}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {visitor.checkinTime
                              ? new Date(visitor.checkinTime).toLocaleString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true,
                                })
                              : 'N/A'}
                            {/* {visitor.checkinTime
                              ? new Date(visitor.checkinTime).toLocaleDateString()
                              : 'N/A'} */}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {visitor.checkoutTime
                              ? new Date(visitor.checkoutTime).toLocaleString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true,
                                })
                              : 'N/A'}
                            {/* {visitor.checkoutTime
                              ? new Date(visitor.checkoutTime).toLocaleDateString()
                              : 'N/A'} */}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {visitor.qrCodeImage && (
                              <Img
                                alt="QR Code image"
                                className="aspect-square rounded-md object-cover"
                                height="64"
                                src={visitor.qrCodeImage || '/placeholder.svg'}
                                onClick={() => handleImageClick(visitor.qrCodeImage)}
                                width="64"
                              />
                            )}
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
                                  onSelect={() => handleViewDetails(visitor.id.toString(), visitor)}
                                >
                                  Visitor Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onSelect={() => handleUpdateVisitors(visitor.id.toString())}
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
                                        the visitor.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteVisitor(visitor.id)}
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
                    {visitors.length > 0 ? (
                      <>
                        Showing{' '}
                        <strong>
                          {(currentPage - 1) * limit + 1}-
                          {Math.min(currentPage * limit, visitorsData?.total ?? 0)}
                        </strong>{' '}
                        of <strong>{visitorsData?.total}</strong> visitors
                      </>
                    ) : (
                      'No visitors to show'
                    )}
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
      {selectedVisitor && (
        <VisitorDetailsDialog visitor={selectedVisitor} onClose={() => setSelectedVisitor(null)} />
      )}
      {selectedImage && (
        <ImagePreviewDialog imageUrl={selectedImage} onClose={handleCloseImagePreview} />
      )}

      <Dialog open={visitDateFilterOpen} onOpenChange={setVisitDateFilterOpen}>
        <DialogTrigger asChild>
          {/* <Button onClick={() => setFilterOpen(true)}>Open Filter Dialog</Button> */}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] max-w-md p-6 space-y-0 ">
          <DialogHeader>
            <DialogTitle>Filter Visitors by Date & Time</DialogTitle>
          </DialogHeader>
          <Label htmlFor="">Visit date:</Label>
          <DateTimePicker
            granularity="day"
            value={tempFilters?.visitDate ? new Date(tempFilters.visitDate) : undefined}
            onChange={(date: Date | undefined) => handleTempFilterChange('visitDate', date)}
            displayFormat={{ hour24: 'PPPP' }}
          />

          <DialogFooter className="flex justify-end space-x-2">
            <Button onClick={handleApplyFilter} className="bg-blue-500 text-white">
              Apply Filters
            </Button>
            <Button
              onClick={() => setVisitDateFilterOpen(false)}
              className="bg-gray-500 text-white"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={checkInTimeFilterOpen} onOpenChange={setCheckInTimeFilterOpen}>
        <DialogTrigger asChild></DialogTrigger>
        <DialogContent className="sm:max-w-[475px]  max-w-md p-6 space-y-0">
          <DialogHeader>
            <DialogTitle>Filter Visitors by Date & Time</DialogTitle>
          </DialogHeader>
          <Label htmlFor="">Check In date:</Label>

          <DateTimePicker
            granularity="day"
            value={tempFilters?.checkinTime ? new Date(tempFilters.checkinTime) : undefined}
            onChange={(checkinTime: Date | undefined) =>
              handleTempFilterChange('checkinTime', checkinTime)
            }
            displayFormat={{ hour24: 'PPPP' }}
          />
          {/* <DatePicker
            selected={tempFilters?.checkinTime ? new Date(tempFilters.checkinTime) : undefined}
            onChange={(checkinTime: Date | undefined) =>
              handleTempFilterChange('checkinTime', checkinTime)
            }
          /> */}

          <DialogFooter className="flex justify-end space-x-2">
            <Button onClick={handleApplyFilter} className="bg-blue-500 text-white">
              Apply Filters
            </Button>
            <Button
              onClick={() => setCheckInTimeFilterOpen(false)}
              className="bg-gray-500 text-white"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={checkOutTimeFilterOpen} onOpenChange={setCheckOutTimeFilterOpen}>
        <DialogTrigger asChild>
          {/* <Button onClick={() => setFilterOpen(true)}>Open Filter Dialog</Button> */}
        </DialogTrigger>
        <DialogContent className="w-full max-w-md p-6 space-y-0">
          <DialogHeader>
            <DialogTitle>Filter Visitors by Date & Time</DialogTitle>
          </DialogHeader>
          <Label htmlFor="">Check Out date:</Label>

          <DateTimePicker
            granularity="day"
            value={tempFilters?.checkoutTime ? new Date(tempFilters.checkoutTime) : undefined}
            onChange={(checkoutTime: Date | undefined) =>
              handleTempFilterChange('checkoutTime', checkoutTime)
            }
            displayFormat={{ hour24: 'PPPP' }}
          />

          <DialogFooter className="flex justify-end space-x-2">
            <Button onClick={handleApplyFilter} className="bg-blue-500 text-white">
              Apply Filters
            </Button>
            <Button
              onClick={() => setCheckOutTimeFilterOpen(false)}
              className="bg-gray-500 text-white"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
