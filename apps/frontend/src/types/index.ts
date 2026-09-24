// ─── AUTH ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  schoolId: string | null
}

export type UserRole =
  | 'DIRECTOR'
  | 'ACCOUNTANT'
  | 'SECRETARY'
  | 'TEACHER'
  | 'PARENT'
  | 'STUDENT'

export interface LoginResponse {
  user: User
  accessToken: string
  refreshToken: string
}

// ─── ÉCOLE ────────────────────────────────────────────────────────────────────

export interface School {
  id: string
  name: string
  slug: string
  email: string
  phone: string | null
  address: string | null
  city: string | null
  country: string
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  level: 'PRIMARY' | 'MIDDLE' | 'HIGH' | 'MIXED'
  maxStudents: number
  logoUrl: string | null
  createdAt: string
}

// ─── ANNÉES SCOLAIRES ─────────────────────────────────────────────────────────

export interface SchoolYear {
  id: string
  name: string
  startDate: string
  endDate: string
  isCurrent: boolean
  createdAt: string
  _count?: { classrooms: number }
}

export interface Classroom {
  id: string
  name: string
  capacity: number
  schoolYearId: string
  _count?: { enrollments: number }
}

// ─── ÉLÈVES ───────────────────────────────────────────────────────────────────

export interface Student {
  id: string
  firstName: string
  lastName: string
  registrationNr: string
  gender: 'MALE' | 'FEMALE'
  dateOfBirth: string
  phone: string | null
  address: string | null
  photoUrl: string | null
  createdAt: string
  updatedAt?: string
  enrollments?: {
    classroom: { 
      id?: string
      name: string
      schoolYear?: { name: string; isCurrent: boolean }
    }
  }[]
  parents?: {
    relationship: string
    isEmergency?: boolean
    parent: {
      id?: string
      occupation?: string | null
      user: {
        firstName: string
        lastName: string
        phone: string | null
        email?: string
      }
    }
  }[]
}
// ─── PARENTS ──────────────────────────────────────────────────────────────────

export interface Parent {
  id: string
  occupation: string | null
  user: {
    firstName: string
    lastName: string
    email: string
    phone: string | null
  }
  children: {
    relationship: string
    student: {
      id: string
      firstName: string
      lastName: string
      registrationNr: string
    }
  }[]
}

// ─── PAIEMENTS ────────────────────────────────────────────────────────────────

export interface FeeConfig {
  id: string
  name: string
  type: FeeType
  amount: number
  dueDay: number | null
  description: string | null
  schoolYearId: string
}

export type FeeType =
  | 'REGISTRATION'
  | 'MONTHLY'
  | 'EXAM'
  | 'TRANSPORT'
  | 'CANTEEN'
  | 'OTHER'

export interface Invoice {
  id: string
  invoiceNumber: string
  amount: number
  paidAmount: number
  remainingAmount: number
  status: InvoiceStatus
  dueDate: string
  notes: string | null
  createdAt: string
  feeConfig: { name: string; type: FeeType }
  payments?: Payment[]
}

export type InvoiceStatus =
  | 'PENDING'
  | 'PARTIAL'
  | 'PAID'
  | 'OVERDUE'
  | 'CANCELLED'

export interface Payment {
  id: string
  paymentNumber: string
  amount: number
  method: PaymentMethod
  reference: string | null
  paidAt: string
}

export type PaymentMethod =
  | 'CASH'
  | 'BANK_TRANSFER'
  | 'CHECK'
  | 'ONLINE'

export interface FinancialSummary {
  totalInvoiced: number
  totalPaid: number
  totalRemaining: number
  pendingInvoices: number
  overdueInvoices: number
}