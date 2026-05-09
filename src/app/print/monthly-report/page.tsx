import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PrintMonthlyReport } from './print-monthly-report'

interface SearchParams {
  year?: string
  month?: string
}

export default async function PrintMonthlyReportPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams
  const now = new Date()
  const year = Number(params.year) || now.getFullYear()
  const monthRaw = Number(params.month) || now.getMonth() + 1
  const month = Math.min(12, Math.max(1, monthRaw))

  return <PrintMonthlyReport year={year} month={month} userId={user.id} />
}
