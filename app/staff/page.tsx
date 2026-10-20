import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getStaffSession } from '@/lib/auth/staff-session'
import { hasPermission, PERMISSIONS } from '@/lib/auth/rbac'
import { db, hasDatabaseUrl } from '@/lib/db'
import {
  ReceptionistDashboard,
  RecentMemberItem,
} from '@/components/staff/receptionist-dashboard'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Front Desk Dashboard | Spotter Staff',
  description: 'Receptionist member registration and front desk operations.',
}

export default async function StaffDashboardPage() {
  // 1. Enforce strict staff session gate and RBAC permission
  const staff = await getStaffSession()
  if (!staff || !hasPermission(staff.role, PERMISSIONS.STAFF_GENERATE_MEMBER)) {
    redirect('/staff/login')
  }

  // 2. Fetch recent members
  let recentMembers: RecentMemberItem[] = []

  if (hasDatabaseUrl) {
    try {
      const dbMembers = await db.member.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          fullName: true,
          memberNumber: true,
          tier: true,
          deviceId: true,
          createdAt: true,
        },
      })

      recentMembers = dbMembers.map((m) => ({
        id: m.id,
        fullName: m.fullName,
        memberNumber: m.memberNumber,
        tier: m.tier as 'BASIC' | 'PREMIUM',
        hasDevice: Boolean(m.deviceId),
        createdAt: m.createdAt.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      }))
    } catch (err) {
      console.warn('Unable to load recent members from database:', err)
    }
  }

  return <ReceptionistDashboard staff={staff} recentMembers={recentMembers} />
}
