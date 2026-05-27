import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { QuickAddLauncher } from '@/components/layout/quick-add-launcher'
import { CommandPalette } from '@/components/layout/command-palette'
import { BottomTabBar } from '@/components/layout/bottom-tab-bar'
import { InstallPrompt } from '@/components/layout/install-prompt'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      <Sidebar user={user} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header user={user} />
        <main
          className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8"
          style={{ backgroundColor: 'var(--bg)' }}
        >
          <div className="mx-auto max-w-[1400px]">{children}</div>
        </main>
      </div>
      {/* QuickAddLauncher — renders FAB on desktop, listens to klunting:quick-add
          event on mobile (fired from BottomTabBar center button). */}
      <div className="hidden md:block">
        <QuickAddLauncher variant="desktop" />
      </div>
      <div className="md:hidden">
        <QuickAddLauncher variant="mobile" />
      </div>
      <CommandPalette />
      <BottomTabBar />
      <InstallPrompt />
    </div>
  )
}
