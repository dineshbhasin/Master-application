import Sidebar from '@/components/layout/Sidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
      <Sidebar />
      <div
        className="flex flex-col flex-1"
        style={{ marginLeft: '260px', minHeight: '100vh' }}
      >
        <DashboardHeader />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
