import { AuthenticatedStaff, getStaffSession } from './staff-session'
import { AuthenticatedMember, getSession } from './session'

/**
 * SPOTTER ROLE-BASED ACCESS CONTROL (RBAC) SERVICE
 *
 * Implements strict, application-level Role-Based Access Control enforcing
 * least-privilege separation across Member, Staff, and Owner actors.
 *
 * Perimeter Rules:
 * - Members: Serve members directly. Access own profile, attendance, balance, AI Q&A.
 * - Staff (Desk): Record suppliers. Generate members, daily codes, manual attendance.
 *   Explicitly barred from member private chat logs, medical advice, and setting PINs.
 * - Owner: Record supplier with administrative approval authority. Card approval,
 *   vector rollback, tier configuration, fee toggles, and wrong answer reviews.
 */

export const PERMISSIONS = {
  // Member Operations
  MEMBER_READ_PROFILE: 'member:read_profile',
  MEMBER_READ_ATTENDANCE: 'member:read_attendance',
  MEMBER_READ_BALANCE: 'member:read_balance',
  MEMBER_CHECK_IN: 'member:check_in',
  MEMBER_ASK_AI: 'member:ask_ai',
  MEMBER_PAY_RENEWAL: 'member:pay_renewal',

  // Staff Operations (Front Desk)
  STAFF_GENERATE_MEMBER: 'staff:generate_member',
  STAFF_SET_DAILY_CODE: 'staff:set_daily_code',
  STAFF_MANUAL_CHECK_IN: 'staff:manual_check_in',
  STAFF_RECORD_MANUAL_PAYMENT: 'staff:record_manual_payment',
  STAFF_LOOKUP_MEMBER: 'staff:lookup_member',
  STAFF_FORCE_UNLINK_DEVICE: 'staff:force_unlink_device',
  STAFF_DRAFT_CARD: 'staff:draft_card',

  // Owner Operations (Governance & Records)
  OWNER_APPROVE_CARD: 'owner:approve_card',
  OWNER_ARCHIVE_CARD: 'owner:archive_card',
  OWNER_SET_MEMBER_TIER: 'owner:set_member_tier',
  OWNER_SET_OPENING_BALANCE: 'owner:set_opening_balance',
  OWNER_TOGGLE_FEE_ABSORPTION: 'owner:toggle_fee_absorption',
  OWNER_REVIEW_WRONG_ANSWERS: 'owner:review_wrong_answers',
  OWNER_VERIFY_PAYMENT_REF: 'owner:verify_payment_ref',
  OWNER_MANAGE_STAFF: 'owner:manage_staff',
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

export type Role = 'MEMBER' | 'STAFF' | 'OWNER'

/**
 * Authoritative mapping of roles to permitted actions.
 */
const ROLE_PERMISSIONS: Record<Role, ReadonlySet<Permission>> = {
  MEMBER: new Set([
    PERMISSIONS.MEMBER_READ_PROFILE,
    PERMISSIONS.MEMBER_READ_ATTENDANCE,
    PERMISSIONS.MEMBER_READ_BALANCE,
    PERMISSIONS.MEMBER_CHECK_IN,
    PERMISSIONS.MEMBER_ASK_AI,
    PERMISSIONS.MEMBER_PAY_RENEWAL,
  ]),

  STAFF: new Set([
    PERMISSIONS.STAFF_GENERATE_MEMBER,
    PERMISSIONS.STAFF_SET_DAILY_CODE,
    PERMISSIONS.STAFF_MANUAL_CHECK_IN,
    PERMISSIONS.STAFF_RECORD_MANUAL_PAYMENT,
    PERMISSIONS.STAFF_LOOKUP_MEMBER,
    PERMISSIONS.STAFF_FORCE_UNLINK_DEVICE,
    PERMISSIONS.STAFF_DRAFT_CARD,
  ]),

  OWNER: new Set([
    // Owners inherit all front desk operational permissions
    PERMISSIONS.STAFF_GENERATE_MEMBER,
    PERMISSIONS.STAFF_SET_DAILY_CODE,
    PERMISSIONS.STAFF_MANUAL_CHECK_IN,
    PERMISSIONS.STAFF_RECORD_MANUAL_PAYMENT,
    PERMISSIONS.STAFF_LOOKUP_MEMBER,
    PERMISSIONS.STAFF_FORCE_UNLINK_DEVICE,
    PERMISSIONS.STAFF_DRAFT_CARD,
    // Plus administrative permissions
    PERMISSIONS.OWNER_APPROVE_CARD,
    PERMISSIONS.OWNER_ARCHIVE_CARD,
    PERMISSIONS.OWNER_SET_MEMBER_TIER,
    PERMISSIONS.OWNER_SET_OPENING_BALANCE,
    PERMISSIONS.OWNER_TOGGLE_FEE_ABSORPTION,
    PERMISSIONS.OWNER_REVIEW_WRONG_ANSWERS,
    PERMISSIONS.OWNER_VERIFY_PAYMENT_REF,
    PERMISSIONS.OWNER_MANAGE_STAFF,
  ]),
}

export class AuthorizationError extends Error {
  public readonly code: string
  public readonly role?: Role
  public readonly requiredPermission?: Permission

  constructor(message: string, options?: { role?: Role; requiredPermission?: Permission }) {
    super(message)
    this.name = 'AuthorizationError'
    this.code = 'FORBIDDEN'
    this.role = options?.role
    this.requiredPermission = options?.requiredPermission
  }
}

/**
 * Checks if a given role possesses a specific permission.
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  const allowed = ROLE_PERMISSIONS[role]
  return allowed ? allowed.has(permission) : false
}

/**
 * Asserts that a role possesses a specific permission, throwing an AuthorizationError if not.
 */
export function assertPermission(role: Role, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new AuthorizationError(
      `Access denied. Role "${role}" lacks required permission "${permission}".`,
      { role, requiredPermission: permission },
    )
  }
}

/**
 * Resolves the authenticated staff member and asserts that they possess the required permission.
 * Throws an AuthorizationError if unauthenticated or unauthorized.
 */
export async function getAuthorizedStaff(
  requiredPermission?: Permission,
): Promise<AuthenticatedStaff> {
  const staff = await getStaffSession()
  if (!staff) {
    throw new AuthorizationError('Authentication required. No active staff session found.')
  }

  if (requiredPermission) {
    assertPermission(staff.role, requiredPermission)
  }

  return staff
}

/**
 * Resolves the authenticated member and asserts that they possess the required permission.
 * Throws an AuthorizationError if unauthenticated or unauthorized.
 */
export async function getAuthorizedMember(
  requiredPermission?: Permission,
): Promise<AuthenticatedMember> {
  const member = await getSession()
  if (!member) {
    throw new AuthorizationError('Authentication required. No active member session found.')
  }

  if (requiredPermission) {
    assertPermission('MEMBER', requiredPermission)
  }

  return member
}

/**
 * Helper to safely check staff permissions without throwing exceptions.
 */
export async function checkStaffPermission(
  permission: Permission,
): Promise<{ allowed: boolean; staff: AuthenticatedStaff | null; error?: string }> {
  try {
    const staff = await getAuthorizedStaff(permission)
    return { allowed: true, staff }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unauthorized'
    return { allowed: false, staff: null, error: msg }
  }
}
