import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getStaffSession } from '@/lib/auth/staff-session'
import { StaffLoginForm } from '@/components/staff/staff-login-form'

export const metadata: Metadata = {
  title: 'Staff Login | Spotter Front Desk',
  description: 'Authorized gym receptionist and front desk portal.',
}

export default async function StaffLoginPage() {
  const staff = await getStaffSession()
  if (staff) {
    redirect('/staff')
  }

  return <StaffLoginForm />
}
