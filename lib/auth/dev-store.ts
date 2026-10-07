import { randomUUID } from 'node:crypto'

export type DevMember = {
  id: string
  fullName: string
  email?: string | null
  memberNumber?: string | null
  tier: 'BASIC' | 'PREMIUM'
  pinHash?: string | null
  passwordHash?: string | null
  deviceId?: string | null
  activationCode?: string | null
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

interface DevStoreGlobal {
  _spotterDevMembers?: Map<string, DevMember>
  _spotterDevSessions?: Map<string, DevSession>
}

const g = globalThis as unknown as DevStoreGlobal

if (!g._spotterDevMembers) {
  g._spotterDevMembers = new Map<string, DevMember>()
}

if (!g._spotterDevSessions) {
  g._spotterDevSessions = new Map<string, DevSession>()
}

const membersMap = g._spotterDevMembers!
const sessionsMap = g._spotterDevSessions!

export function saveDevMember(data: {
  fullName: string
  email?: string | null
  memberNumber?: string | null
  tier?: 'BASIC' | 'PREMIUM'
  pinHash?: string | null
  passwordHash?: string | null
  deviceId?: string | null
  activationCode?: string | null
  expiryDate?: Date
}): DevMember {
  const id = `dev-mem-${randomUUID()}`
  const expiryDate = data.expiryDate ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  const member: DevMember = {
    id,
    fullName: data.fullName,
    email: data.email ?? null,
    memberNumber: data.memberNumber ?? null,
    tier: data.tier ?? 'BASIC',
    pinHash: data.pinHash ?? null,
    passwordHash: data.passwordHash ?? null,
    deviceId: data.deviceId ?? null,
    activationCode: data.activationCode ?? null,
    createdAt: new Date(),
    expiryDate,
  }

  membersMap.set(id, member)
  return member
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
