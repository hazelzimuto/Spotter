import { randomUUID } from 'node:crypto'

export type DevMember = {
  id: string
  fullName: string
  phone?: string | null
  email?: string | null
  memberNumber?: string | null
  tier: 'BASIC' | 'PREMIUM'
  pinHash?: string | null
  passwordHash?: string | null
  deviceId?: string | null
  activationCode?: string | null
  emailVerified?: boolean
  verificationCode?: string | null
  verificationCodeExpiresAt?: Date | null
  createdAt: Date
  expiryDate: Date
}

export type DevSession = {
  id: string
  memberId: string
  deviceId: string
  tokenHash: string
  revokedAt?: Date | null
  lastLoginAt: Date
}

export type DevStaff = {
  id: string
  fullName: string
  phone: string
  role: 'STAFF' | 'OWNER'
  email: string
  pinHash: string
  isActive: boolean
}

interface DevStoreGlobal {
  _spotterDevMembers?: Map<string, DevMember>
  _spotterDevSessions?: Map<string, DevSession>
  _spotterDevStaff?: Map<string, DevStaff>
}

const g = globalThis as unknown as DevStoreGlobal

if (!g._spotterDevMembers) {
  g._spotterDevMembers = new Map<string, DevMember>()
}

if (!g._spotterDevSessions) {
  g._spotterDevSessions = new Map<string, DevSession>()
}

if (!g._spotterDevStaff) {
  g._spotterDevStaff = new Map<string, DevStaff>()
}

const membersMap = g._spotterDevMembers!
const sessionsMap = g._spotterDevSessions!
const staffMap = g._spotterDevStaff!


export function saveDevMember(data: {
  fullName: string
  phone?: string | null
  email?: string | null
  memberNumber?: string | null
  tier?: 'BASIC' | 'PREMIUM'
  pinHash?: string | null
  passwordHash?: string | null
  deviceId?: string | null
  activationCode?: string | null
  emailVerified?: boolean
  verificationCode?: string | null
  verificationCodeExpiresAt?: Date | null
  expiryDate?: Date
}): DevMember {
  const id = `dev-mem-${randomUUID()}`
  const expiryDate = data.expiryDate ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  const member: DevMember = {
    id,
    fullName: data.fullName,
    phone: data.phone ?? null,
    email: data.email ? data.email.trim().toLowerCase() : null,
    memberNumber: data.memberNumber ?? null,
    tier: data.tier ?? 'BASIC',
    pinHash: data.pinHash ?? null,
    passwordHash: data.passwordHash ?? null,
    deviceId: data.deviceId ?? null,
    activationCode: data.activationCode ?? null,
    emailVerified: data.emailVerified ?? false,
    verificationCode: data.verificationCode ?? null,
    verificationCodeExpiresAt: data.verificationCodeExpiresAt ?? null,
    createdAt: new Date(),
    expiryDate,
  }

  membersMap.set(id, member)
  return member
}

export function updateDevMemberEmailVerification(id: string, verified: boolean): boolean {
  const member = membersMap.get(id)
  if (!member) return false
  member.emailVerified = verified
  if (verified) {
    member.verificationCode = null
    member.verificationCodeExpiresAt = null
  }
  membersMap.set(id, member)
  return true
}

export function setDevMemberVerificationCode(
  id: string,
  code: string,
  expiresAt: Date,
): boolean {
  const member = membersMap.get(id)
  if (!member) return false
  member.verificationCode = code
  member.verificationCodeExpiresAt = expiresAt
  membersMap.set(id, member)
  return true
}

export function findDevMemberById(id: string): DevMember | null {
  return membersMap.get(id) ?? null
}

export function findDevMemberByDeviceId(deviceId: string): DevMember | null {
  for (const m of membersMap.values()) {
    if (m.deviceId === deviceId) {
      return m
    }
  }
  return null
}

export function findDevMemberByActivationCode(code: string): DevMember | null {
  for (const m of membersMap.values()) {
    if (m.activationCode === code) {
      return m
    }
  }
  return null
}

export function findDevMemberByMemberNumber(memberNumber: string): DevMember | null {
  for (const m of membersMap.values()) {
    if (m.memberNumber === memberNumber) {
      return m
    }
  }
  return null
}

export function findDevMemberByEmail(email: string): DevMember | null {
  const normalized = email.trim().toLowerCase()
  for (const m of membersMap.values()) {
    if (m.email?.toLowerCase().trim() === normalized) {
      return m
    }
  }
  return null
}

export function updateDevMemberPin(id: string, pinHash: string, deviceId: string): boolean {
  const member = membersMap.get(id)
  if (!member) return false

  member.pinHash = pinHash
  member.deviceId = deviceId
  member.activationCode = null
  membersMap.set(id, member)
  return true
}

export function saveDevSession(data: {
  memberId: string
  deviceId: string
  tokenHash: string
}): DevSession {
  // Revoke previous sessions for this member
  for (const s of sessionsMap.values()) {
    if (s.memberId === data.memberId && !s.revokedAt) {
      s.revokedAt = new Date()
    }
  }

  const id = `dev-ses-${randomUUID()}`
  const session: DevSession = {
    id,
    memberId: data.memberId,
    deviceId: data.deviceId,
    tokenHash: data.tokenHash,
    revokedAt: null,
    lastLoginAt: new Date(),
  }

  sessionsMap.set(data.tokenHash, session)
  return session
}

export function findDevSessionByTokenHash(tokenHash: string): DevSession | null {
  const session = sessionsMap.get(tokenHash)
  if (!session || session.revokedAt) return null
  return session
}

export function revokeDevSessionsForMember(memberId: string): void {
  for (const s of sessionsMap.values()) {
    if (s.memberId === memberId && !s.revokedAt) {
      s.revokedAt = new Date()
    }
  }
}

export function revokeDevSessionByTokenHash(tokenHash: string): void {
  const session = sessionsMap.get(tokenHash)
  if (session) {
    session.revokedAt = new Date()
  }
}

export function saveDevStaff(data: {
  fullName: string
  phone: string
  role?: 'STAFF' | 'OWNER'
  email: string
  pinHash: string
  isActive?: boolean
}): DevStaff {
  const normalizedEmail = data.email.trim().toLowerCase()
  // Check existing
  for (const s of staffMap.values()) {
    if (s.email === normalizedEmail) {
      s.fullName = data.fullName
      s.phone = data.phone
      s.role = data.role ?? s.role
      s.pinHash = data.pinHash
      s.isActive = data.isActive ?? s.isActive
      return s
    }
  }

  const id = `dev-staff-${randomUUID()}`
  const staff: DevStaff = {
    id,
    fullName: data.fullName,
    phone: data.phone,
    role: data.role ?? 'STAFF',
    email: normalizedEmail,
    pinHash: data.pinHash,
    isActive: data.isActive ?? true,
  }
  staffMap.set(id, staff)
  return staff
}

export function findDevStaffByEmail(email: string): DevStaff | null {
  const normalized = email.trim().toLowerCase()
  for (const s of staffMap.values()) {
    if (s.email === normalized) return s
  }
  return null
}

export function findDevStaffById(id: string): DevStaff | null {
  return staffMap.get(id) ?? null
}

export function countDevStaff(): number {
  return staffMap.size
}

