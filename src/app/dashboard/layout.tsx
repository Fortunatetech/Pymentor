import { redirect } from 'next/navigation';
import { getProfile } from '@/lib/supabase/server';
import { Sidebar } from '@/components/layout/Sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();

  if (!profile) {
    redirect('/auth/login');
  }

  return (
    <div className="flex min-h-screen bg-dark-50">
      <Sidebar profile={profile} />
      <main className="flex-1 ml-64">
        {children}
      </main>
    </div>
  );
}
