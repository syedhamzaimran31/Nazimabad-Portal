import React from 'react';
import { Activity, CircleUser, CreditCard, MoreHorizontal, TrendingUp, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Label, Pie, PieChart } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Img } from 'react-image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Visitor, complaintType } from '@/lib/types';
import { ImagePreviewDialog } from '@/components/widgets/image-preview-dialog';
import { useNavigate } from 'react-router-dom';
import { Oval } from 'react-loader-spinner'; // Import the loader
import { Button } from '@/components/ui/button';
import { useImagePreview } from '@/lib/helpers';
import VisitorService from '@/services/visitor.service';
import { ComplaintService } from '@/services/complaint.service';
import { BarChartData } from '@/components/widgets/bar-chart';
import { UserService } from '@/services/user.service';
import tokenService from '@/services/token.service';

export const description = 'A donut chart with text';

const chartDataVisitors = [
  { month: 'july', visitors: 275, fill: 'var(--color-july)' },
  { month: 'august', visitors: 200, fill: 'var(--color-august)' },
  { month: 'september', visitors: 287, fill: 'var(--color-september)' },
  { month: 'october', visitors: 173, fill: 'var(--color-october)' },
  { month: 'november', visitors: 190, fill: 'var(--color-november)' },
  { month: 'december', visitors: 290, fill: 'var(--color-december)' },
];

const chartDataComplaints = [
  { month: 'july', complaints: 27, fill: 'var(--color-july)' },
  { month: 'august', complaints: 20, fill: 'var(--color-august)' },
  { month: 'september', complaints: 57, fill: 'var(--color-september)' },
  { month: 'october', complaints: 33, fill: 'var(--color-october)' },
  { month: 'november', complaints: 40, fill: 'var(--color-november)' },
  { month: 'december', complaints: 30, fill: 'var(--color-december)' },
];

const chartConfig = {
  visitors: {
    label: 'Visitors',
  },
  july: {
    label: 'July',
    color: 'hsl(var(--chart-1))',
  },
  august: {
    label: 'August',
    color: 'hsl(var(--chart-2))',
  },
  september: {
    label: 'September',
    color: 'hsl(var(--chart-3))',
  },
  october: {
    label: 'October',
    color: 'hsl(var(--chart-4))',
  },
  november: {
    label: 'November',
    color: 'hsl(var(--chart-5))',
  },
  december: {
    label: 'December',
    color: 'hsl(var(--chart-6))',
  },
} satisfies ChartConfig;

export default function DashboardPage() {
  const userRole = tokenService.getUserRole();
  console.log(userRole);

  const userIsAdmin = userRole === 'Admin' ? true : false;

  const totalVisitors = React.useMemo(() => {
    return chartDataVisitors.reduce((acc, curr) => acc + curr.visitors, 0);
  }, []);

  const totalComplaints = React.useMemo(() => {
    return chartDataComplaints.reduce((acc, curr) => acc + curr.complaints, 0);
  }, []);

  const navigate = useNavigate();

  const { useFetchAllVisitor, useHandleDeleteVisitor } = VisitorService();
  const {
    data: visitorsData,
    isLoading: isVisitorsLoading,
    refetch: refetchVisitor,
  } = useFetchAllVisitor();
  const visitors = visitorsData?.data || [];

  const { useFetchAllComplaints, useHandleDeleteComplaint } = ComplaintService();
  // const { data: complaint } = useFetchAllComplaints();

  const { data: complaintData, isLoading: isComplaintsLoading, refetch } = useFetchAllComplaints();
  const complaint = complaintData?.data || [];

  const { mutate: deleteComplaint } = useHandleDeleteComplaint();
  const { mutate: deleteVisitor } = useHandleDeleteVisitor();

  console.log(complaintData);
  console.log(complaint);

  const { useFetchAllUsers } = UserService();
  const { data: users } = useFetchAllUsers();

  // const { useFetchVisitorsByDate } = VisitorService();

  const { selectedImage, handleImageClick, handleCloseImagePreview } = useImagePreview();

  const isLoading = isVisitorsLoading || isComplaintsLoading;

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

  const handleDeleteVisitor = (id: number) => {
    deleteVisitor(id, {
      onSuccess: () => {
        refetchVisitor(); // Re-fetch the data to update the table
      },
    });
  };

  const handleDeleteComplaint = (id: number) => {
    deleteComplaint(id, {
      onSuccess: () => {
        refetch(); // Re-fetch the data to update the table
      },
    });
  };

  const handleViewVisitorDetails = (visitorId: string, visitor: Visitor) => {
    console.log(`Viewing details for: ${visitor.persons[0].name}`);
    navigate(`/visitors/${visitorId}`);
  };

  const handleUpdateVisitors = (visitorId: string) => {
    console.log(`Updating visitor: ${visitorId}`);
    navigate(`/visitors/update/${visitorId}`); // Navigate with complaint ID
  };

  const handleViewComplaintDetails = (complaintId: string) => {
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
    <>
      <div className="p-5 bg-muted/40">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card x-chunk="dashboard-01-chunk-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Residents</CardTitle>
              <CircleUser className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{`+${users?.total}`}</div>
              <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            </CardContent>
          </Card>
          <Card x-chunk="dashboard-01-chunk-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Visitors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{`+${visitors?.length}`}</div>
              <p className="text-xs text-muted-foreground">+180.1% from last month</p>
            </CardContent>
          </Card>
          <Card x-chunk="dashboard-01-chunk-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Complaints</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{`+${complaint?.length}`}</div>
              <p className="text-xs text-muted-foreground">+19% from last month</p>
            </CardContent>
          </Card>
          <Card x-chunk="dashboard-01-chunk-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active App Users</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+573</div>
              <p className="text-xs text-muted-foreground">+50 since last week </p>
            </CardContent>
          </Card>
        </div>
        {/* Calling Bar Chart Here */}
        <div className="pt-5">
          <BarChartData visitorsData={visitors ?? []} complaintsData={complaint ?? []} />
        </div>
        <div className="flex w-full flex-wrap gap-4 py-5  ">
          <Card className="flex flex-col flex-1">
            <CardHeader className="items-center pb-0">
              <CardTitle>Visitors - Third and Fourth Qurater</CardTitle>
              <CardDescription>July - Dec 2024</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
                <PieChart>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={chartDataVisitors}
                    dataKey="visitors"
                    nameKey="month"
                    innerRadius={60}
                    strokeWidth={5}
                  >
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-foreground text-3xl font-bold"
                              >
                                {totalVisitors.toLocaleString()}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className="fill-muted-foreground"
                              >
                                Visitors
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 font-medium leading-none">
                Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
              </div>
              <div className="leading-none text-muted-foreground">
                Showing total visitors for the last 6 months
              </div>
            </CardFooter>
          </Card>
          <Card className="flex flex-col flex-1">
            <CardHeader className="items-center pb-0">
              <CardTitle>Complaints - Third and Fourth Qurater</CardTitle>
              <CardDescription>July - Dec 2024</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
                <PieChart>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={chartDataComplaints}
                    dataKey="complaints"
                    nameKey="month"
                    innerRadius={60}
                    strokeWidth={5}
                  >
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-foreground text-3xl font-bold"
                              >
                                {totalComplaints.toLocaleString()}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className="fill-muted-foreground"
                              >
                                Complaints
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 font-medium leading-none">
                Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
              </div>
              <div className="leading-none text-muted-foreground">
                Showing total complaints for the last 6 months
              </div>
            </CardFooter>
          </Card>
        </div>
        {/* <div className="flex min-h-screen w-full flex-col bg-muted/40"> */}
        <div className="flex w-full flex-wrap gap-4 ">
          <div className="flex flex-col flex-1 sm:gap-4 sm:pt-4 sm:pl-0">
            <main className="grid flex-1 items-start gap-4 p-4 sm:px-0 sm:py-0 md:gap-8">
              <Tabs defaultValue="all">
                {/* <div className="flex items-center">
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="draft">Draft</TabsTrigger>
                    <TabsTrigger value="archived" className="hidden sm:flex">
                      Archived
                    </TabsTrigger>
                  </TabsList>
                  <div className="ml-auto flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 gap-1">
                          <ListFilter className="h-3.5 w-3.5" />
                          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                            Filter
                          </span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem checked>Active</DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem>Draft</DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem>Archived</DropdownMenuCheckboxItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      size="sm"
                      // variant="outline"
                      className="h-8 gap-1 text-white bg-yellow-500 hover:bg-yellow-600"
                    >
                      <File className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Export</span>
                    </Button>
                    <Link to="/complaints/add">
                      <Button
                        size="sm"
                        className="h-8 gap-1 text-white bg-green-700 hover:bg-green-800"
                        onClick={() => navigate('/visitors/add')}
                      >
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                          Add Complaint
                        </span>
                      </Button>
                    </Link>
                  </div>
                </div> */}
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
                            <TableHead className="hidden w-[100px] sm:table-cell">
                              <span className="sr-only">Image</span>
                            </TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
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
                          {complaint?.slice(0, 10).map((complaint: complaintType) => (
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
                              <TableCell className="font-medium">{complaint.fullName}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{complaint.email}</Badge>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                {complaint.complaint}
                              </TableCell>
                              {/* <TableCell className="hidden md:table-cell">
                            {complaint.description}
                          </TableCell> */}
                              <TableCell className="hidden md:table-cell">
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
                                {complaint.created_at
                                  ? new Date(complaint.created_at).toLocaleDateString()
                                  : 'N/A'}
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
                                      onSelect={() =>
                                        handleViewComplaintDetails(complaint.id.toString())
                                      }
                                    >
                                      Complaint Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onSelect={() =>
                                        handleUpdateComplaint(complaint.id.toString())
                                      }
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
                                            This action cannot be undone. This will permanently
                                            delete the complaint.
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
                      {/* <div className="text-xs text-muted-foreground">
                        Showing <strong>1-10</strong> of <strong>{complaintData?.total}</strong>{' '}
                        complaints
                      </div> */}
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </main>
          </div>
          <div className="flex flex-col flex-1 sm:gap-4 sm:py-4 sm:pl-0">
            <main className="grid flex-1 items-start gap-4 p-4 sm:px-0 sm:py-0 md:gap-8">
              <Tabs defaultValue="all">
                {/* <div className="flex items-center">
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="draft">Draft</TabsTrigger>
                    <TabsTrigger value="archived" className="hidden sm:flex">
                      Archived
                    </TabsTrigger>
                  </TabsList>
                  <div className="ml-auto flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 gap-1">
                          <ListFilter className="h-3.5 w-3.5" />
                          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                            Filter
                          </span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem checked>Active</DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem>Draft</DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem>Archived</DropdownMenuCheckboxItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      size="sm"
                      // variant="outline"
                      className="h-8 gap-1 text-white bg-yellow-500 hover:bg-yellow-600"
                    >
                      <File className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Export</span>
                    </Button>
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
                </div> */}
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
                            <TableHead className="hidden w-[100px] sm:table-cell">
                              <span className="sr-only">Image</span>
                            </TableHead>
                            <TableHead>Primary Person</TableHead>
                            <TableHead>Number of Persons</TableHead>
                            <TableHead className="hidden md:table-cell">Vehicle Type</TableHead>
                            <TableHead className="hidden md:table-cell">Vehicle Number</TableHead>
                            <TableHead className="hidden md:table-cell">Visit Date</TableHead>
                            <TableHead className="hidden md:table-cell">Checked In</TableHead>
                            <TableHead className="hidden md:table-cell">Checked Out</TableHead>
                            <TableHead className="hidden md:table-cell ">QR Code</TableHead>
                            <TableHead>
                              <span className="sr-only">Actions</span>
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {visitors?.slice(0, 10).map((visitor: Visitor) => (
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
                              <TableCell className="font-medium">
                                {visitor.persons[0].name}
                              </TableCell>
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
                                {visitor.visitDate
                                  ? new Date(visitor.visitDate).toLocaleDateString()
                                  : 'N/A'}
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                {visitor.checkinTime
                                  ? new Date(visitor.checkinTime).toLocaleDateString()
                                  : 'N/A'}
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                {visitor.checkoutTime
                                  ? new Date(visitor.checkoutTime).toLocaleDateString()
                                  : 'N/A'}
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
                                      onSelect={() =>
                                        handleViewVisitorDetails(visitor.id.toString(), visitor)
                                      }
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
                                            This action cannot be undone. This will permanently
                                            delete the visitor.
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
                      {/* <div className="text-xs text-muted-foreground">
                        Showing <strong>1-10</strong> of <strong>{visitorsData?.total}</strong>{' '}
                        visitors
                      </div> */}
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </main>
          </div>
        </div>
        {selectedImage && (
          <ImagePreviewDialog imageUrl={selectedImage} onClose={handleCloseImagePreview} />
        )}
      </div>
    </>
  );
}
