import { Outlet } from 'react-router-dom';
import Sider from '@/components/widgets/base-sider';
import Header from '@/components/widgets/base-header';
import { Toaster } from '../ui/toaster';

export default function Layout() {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sider />
      <div className="flex flex-col w-full">
        <Header />
        <div className="flex flex-col">
          <Outlet />
          <Toaster />
        </div>  
      </div>
    </div>
  );
}
