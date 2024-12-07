import { Link, useNavigate } from 'react-router-dom';
import {
  CircleUser,
  Home,
  LineChart,
  Menu,
  Package,
  Package2,
  ShoppingCart,
  Users,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
// import tokenService from '@/services/token.service.ts';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import tokenService from '@/services/token.service';
import { UserService } from '@/services/user.service';

export default function Header() {
  const { useFetchUserById } = UserService();
  const { data: userData } = useFetchUserById();
  const user = userData?.data[0] || [];

  const navigate = useNavigate();
  return (
    <>
      {' '}
      <header className="flex items-center justify-end h-14 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col">
            <nav className="grid gap-2 text-lg font-medium">
              <Link to="#" className="flex items-center gap-2 text-lg font-semibold">
                <Package2 className="h-6 w-6" />
                <span className="sr-only">Nazimabad</span>
              </Link>
              <Link
                to="#"
                className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
              >
                <Home className="h-5 w-5" />
                Dashboard
              </Link>
              <Link
                to="#"
                className="mx-[-0.65rem] flex items-center gap-4 rounded-xl bg-muted px-3 py-2 text-foreground hover:text-foreground"
              >
                <ShoppingCart className="h-5 w-5" />
                Orders
                <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                  6
                </Badge>
              </Link>
              <Link
                to="#"
                className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
              >
                <Package className="h-5 w-5" />
                Products
              </Link>
              <Link
                to="#"
                className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
              >
                <Users className="h-5 w-5" />
                Customers
              </Link>
              <Link
                to="#"
                className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
              >
                <LineChart className="h-5 w-5" />
                Analytics
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
        {/* <div className="w-full flex-1">
          <form>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search ..."
                className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
              />
            </div>
          </form>
        </div> */}
        <div className="flex items-center gap-4">
          {/* <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="hidden md:inline italic font-bold underline">
                    {user.fullName}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{user.email}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider> */}

          {/* <div className="m-5">
          <p>abc@example.com</p>
        </div> */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full ">
                {user.profileImage ? (
                  <img src={user.profileImage} alt="Profile" className="rounded-full" />
                ) : (
                  // Show the CircleUser icon if no profile image is available
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-200">
                    {user.email ? user.email[0].toUpperCase() : <CircleUser className="h-5 w-5" />}
                  </div>
                )}

                {/* <img
                  src={user.profileImage || <CircleUser className="h-5 w-5" />}
                  alt=""
                  className="rounded-full"
                /> */}

                {/* <CircleUser className="h-5 w-5" /> */}
                {/* <span className="sr-only">Toggle user menu</span> */}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem> */}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => {
                  navigate('/profile/:id');
                }}
              >
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  tokenService.clearStorage();
                  navigate('/login');
                }}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </>
  );
}
