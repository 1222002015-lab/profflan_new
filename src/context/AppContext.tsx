"use client"

import type React from "react"
import { createContext, useContext, useReducer, type ReactNode } from "react"
import type { User, Report, TaskAssignment, ReportStatus } from "../types"

interface AppState {
  currentUser: User | null
  users: User[]
  reports: Report[]
  isAuthenticated: boolean
}

type AppAction =
  | { type: "LOGIN"; payload: User }
  | { type: "LOGOUT" }
  | { type: "ADD_USER"; payload: User }
  | { type: "UPDATE_USER"; payload: User }
  | { type: "DELETE_USER"; payload: string }
  | { type: "ADD_REPORT"; payload: Report }
  | { type: "UPDATE_REPORT"; payload: Report }
  | { type: "DELETE_REPORT"; payload: string }
  | { type: "REQUEST_REVISION"; payload: { reportId: string; staffName: string; revisionNotes: string } }

const calculateReportProgress = (assignments: TaskAssignment[]): number => {
  if (!assignments || assignments.length === 0) return 0

  const completedAssignments = assignments.filter((assignment) => assignment.status === "completed")
  return Math.round((completedAssignments.length / assignments.length) * 100)
}

const determineReportStatus = (assignments: TaskAssignment[]): string => {
  if (!assignments || assignments.length === 0) return "Dalam Proses"

  const completedCount = assignments.filter((assignment) => assignment.status === "completed").length
  const totalCount = assignments.length

  if (completedCount === 0) return "Dalam Proses"
  if (completedCount === totalCount) return "Selesai"
  return "Dalam Proses" // Some completed, some pending
}

const initialState: AppState = {
  currentUser: null,
  users: [
    { id: "admin1", name: "Administrator", password: "admin123", role: "Admin" },
    { id: "tu1", name: "TU Staff", password: "tu123", role: "TU" },
    { id: "coord1", name: "Suwarti, S.H", password: "coord123", role: "Koordinator" },
    { id: "coord2", name: "Achamd Evianto", password: "coord123", role: "Koordinator" },
    { id: "staff1", name: "Budi Santoso", password: "staff123", role: "Staff" },
    { id: "staff2", name: "Sari Dewi", password: "staff123", role: "Staff" },
  ],
  reports: [
    {
      id: "RPT001",
      noSurat: "001/SDM/2025",
      hal: "Perpanjangan Kontrak PPPK",
      status: "in-progress",
      layanan: "Layanan Perpanjangan Hubungan Kerja PPPK",
      dari: "Bagian Kepegawaian",
      tanggalSurat: "2025-01-15",
      tanggalAgenda: "2025-01-16",
      originalFiles: [],
      assignments: [
        {
          id: "ASG001",
          staffName: "Roza Erlinda",
          todoList: ["Jadwalkan/Agendakan", "Bahas dengan saya", "Untuk ditindaklanjuti"],
          completedTasks: ["Jadwalkan/Agendakan"],
          progress: 33,
          status: "in-progress",
          notes: "Verifikasi dokumen SK PPPK dan perjanjian kerja",
          assignedAt: "2025-01-16T09:00:00.000Z",
        },
      ],
      assignedStaff: ["Roza Erlinda"],
      assignedCoordinators: ["Suwarti, S.H"],
      currentHolder: "Suwarti, S.H",
      progress: 33,
      workflow: [
        {
          id: "w1",
          action: "Dibuat oleh TU Staff",
          user: "TU Staff",
          timestamp: "2025-01-16T08:00:00.000Z",
          status: "completed",
        },
        {
          id: "w2",
          action: "Diteruskan ke Koordinator",
          user: "TU Staff",
          timestamp: "2025-01-16T08:30:00.000Z",
          status: "completed",
        },
        {
          id: "w3",
          action: "Staff ditugaskan: Roza Erlinda",
          user: "Suwarti, S.H",
          timestamp: "2025-01-16T09:00:00.000Z",
          status: "completed",
        },
      ],
    },
  ],
  isAuthenticated: false,
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        currentUser: action.payload,
        isAuthenticated: true,
      }
    case "LOGOUT":
      return {
        ...state,
        currentUser: null,
        isAuthenticated: false,
      }
    case "ADD_USER":
      return {
        ...state,
        users: [...state.users, action.payload],
      }
    case "UPDATE_USER":
      return {
        ...state,
        users: state.users.map((user) => (user.id === action.payload.id ? action.payload : user)),
      }
    case "DELETE_USER":
      return {
        ...state,
        users: state.users.filter((user) => user.id !== action.payload),
      }
    case "ADD_REPORT":
      return {
        ...state,
        reports: [...state.reports, action.payload],
      }
    case "UPDATE_REPORT":
      const updatedReport = {
        ...action.payload,
        // Calculate cumulative progress from all staff assignments
        progress: calculateReportProgress(action.payload.assignments),
        // Determine status based on completion of all assignments
        status: determineReportStatus(action.payload.assignments) as ReportStatus,
      }

      return {
        ...state,
        reports: state.reports.map((report) => (report.id === updatedReport.id ? updatedReport : report)),
      }
    case "DELETE_REPORT":
      return {
        ...state,
        reports: state.reports.filter((report) => report.id !== action.payload),
      }
    case "REQUEST_REVISION":
      return {
        ...state,
        reports: state.reports.map((report) => {
          if (report.id === action.payload.reportId) {
            const updatedAssignments = report.assignments.map((assignment) => {
              if (assignment.staffName === action.payload.staffName) {
                return {
                  ...assignment,
                  status: "revision-requested" as const,
                  revisionNotes: action.payload.revisionNotes,
                  revisionRequestedAt: new Date().toISOString(),
                }
              }
              return assignment
            })

            return {
              ...report,
              assignments: updatedAssignments,
              workflow: [
                ...report.workflow,
                {
                  id: `w${report.workflow.length + 1}`,
                  action: `Revisi diminta untuk ${action.payload.staffName}`,
                  user: state.currentUser?.name || "Koordinator",
                  timestamp: new Date().toISOString(),
                  status: "completed",
                },
              ],
            }
          }
          return report
        }),
      }
    default:
      return state
  }
}

const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
  calculateProgress: (assignments: TaskAssignment[]) => number
  getReportStatus: (assignments: TaskAssignment[]) => string
  requestRevision?: (reportId: string, staffName: string, revisionNotes: string) => void
} | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  const requestRevision = (reportId: string, staffName: string, revisionNotes: string) => {
    dispatch({
      type: "REQUEST_REVISION",
      payload: { reportId, staffName, revisionNotes },
    })
  }

  const enhancedState = {
    ...state,
    reports: state.reports.map((report) => ({
      ...report,
      progress: calculateReportProgress(report.assignments),
      status: determineReportStatus(report.assignments) as ReportStatus,
    })),
  }

  return (
    <AppContext.Provider
      value={{
        state: enhancedState,
        dispatch,
        calculateProgress: calculateReportProgress,
        getReportStatus: determineReportStatus,
        requestRevision,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
