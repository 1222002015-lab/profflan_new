"use client"

import { useState } from "react"
import { useApp } from "../../context/AppContext"
import { SERVICES } from "../../types"
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  MoreHorizontal,
  Clock,
  AlertTriangle,
  CheckCircle,
  Edit,
  Trash2,
  Send,
  Package,
} from "lucide-react"
import { ReportForm } from "../forms/ReportForm"
import { ForwardForm } from "../forms/ForwardForm"

export function TUDashboard() {
  const { state, dispatch } = useApp()
  const [showReportForm, setShowReportForm] = useState(false)
  const [showForwardForm, setShowForwardForm] = useState(false)
  const [editingReport, setEditingReport] = useState(null)
  const [forwardingReport, setForwardingReport] = useState(null)
  const [activeTab, setActiveTab] = useState("daftar")
  const [searchQuery, setSearchQuery] = useState("")
  const [serviceFilter, setServiceFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [openActionMenu, setOpenActionMenu] = useState(null)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const [trackingQuery, setTrackingQuery] = useState("")
  const [trackingResult, setTrackingResult] = useState(null)
  const [isTracking, setIsTracking] = useState(false)

  const handleLetterTracking = async () => {
    if (!trackingQuery.trim()) return

    setIsTracking(true)
    setTrackingResult(null)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Search algorithm - check in reports and generate tracking info
    const foundReport = state.reports.find(
      (report) =>
        report.noSurat?.toLowerCase().includes(trackingQuery.toLowerCase()) ||
        report.id?.toLowerCase().includes(trackingQuery.toLowerCase()) ||
        report.hal?.toLowerCase().includes(trackingQuery.toLowerCase()),
    )

    if (foundReport) {
      // Generate detailed tracking information
      const trackingInfo = {
        found: true,
        letterNumber: foundReport.noSurat || foundReport.id,
        subject: foundReport.hal,
        status: foundReport.status,
        progress: foundReport.progress || 0,
        currentLocation: getCurrentLocation(foundReport),
        timeline: generateTimeline(foundReport),
        estimatedCompletion: getEstimatedCompletion(foundReport),
      }
      setTrackingResult(trackingInfo)
    } else {
      // Generate mock tracking for demonstration
      const mockTracking = generateMockTracking(trackingQuery)
      setTrackingResult(mockTracking)
    }

    setIsTracking(false)
  }

  const getCurrentLocation = (report) => {
    if (report.status === "Selesai") return "Arsip - Dokumen Selesai"
    if (report.status === "Dalam Proses") return `${report.currentHolder || "Koordinator"} - Sedang Diproses`
    if (report.status === "Menunggu Verifikasi") return "Tata Usaha - Menunggu Verifikasi"
    if (report.status === "Dikembalikan") return "Tata Usaha - Perlu Perbaikan"
    return "Tata Usaha - Baru Diterima"
  }

  const generateTimeline = (report) => {
    const timeline = []
    if (report.workflow) {
      report.workflow.forEach((step, index) => {
        timeline.push({
          step: index + 1,
          action: step.action,
          user: step.user,
          date: new Date(step.timestamp).toLocaleDateString("id-ID"),
          time: new Date(step.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          status: step.status,
        })
      })
    }
    return timeline
  }

  const getEstimatedCompletion = (report) => {
    const progress = report.progress || 0
    if (progress >= 100) return "Selesai"

    const daysRemaining = Math.ceil((100 - progress) / 10) // Estimate 10% progress per day
    const completionDate = new Date()
    completionDate.setDate(completionDate.getDate() + daysRemaining)

    return completionDate.toLocaleDateString("id-ID")
  }

  const generateMockTracking = (query) => {
    return {
      found: true,
      letterNumber: query,
      subject: "Surat Permohonan Layanan Kepegawaian",
      status: "Dalam Proses",
      progress: 65,
      currentLocation: "Koordinator Kepegawaian - Sedang Diproses",
      timeline: [
        {
          step: 1,
          action: "Surat diterima oleh Tata Usaha",
          user: "Admin TU",
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString("id-ID"),
          time: "09:15",
          status: "completed",
        },
        {
          step: 2,
          action: "Verifikasi dokumen lengkap",
          user: "Petugas Verifikasi",
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString("id-ID"),
          time: "14:30",
          status: "completed",
        },
        {
          step: 3,
          action: "Diteruskan ke Koordinator",
          user: "Admin TU",
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toLocaleDateString("id-ID"),
          time: "10:45",
          status: "completed",
        },
        {
          step: 4,
          action: "Sedang diproses oleh Koordinator",
          user: "Koordinator Kepegawaian",
          date: new Date().toLocaleDateString("id-ID"),
          time: "08:20",
          status: "in-progress",
        },
      ],
      estimatedCompletion: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString("id-ID"),
    }
  }

  const userReports = state.reports.filter((report) => report.createdBy === state.currentUser?.id)

  const filteredReports = userReports.filter((report) => {
    const matchesService = !serviceFilter || report.layanan === serviceFilter
    const matchesStatus = !statusFilter || report.status === statusFilter
    const matchesSearch =
      !searchQuery ||
      report.hal?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.noSurat?.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesService && matchesStatus && matchesSearch
  })

  const totalLaporan = userReports.length
  const menungguVerifikasi = userReports.filter((r) => r.status === "Menunggu Verifikasi").length
  const dalamProses = userReports.filter((r) => r.status === "Dalam Proses").length
  const selesai = userReports.filter((r) => r.status === "Selesai").length
  const dikembalikan = userReports.filter((r) => r.status === "Dikembalikan").length

  const availableServices = [...new Set(userReports.map((report) => report.layanan).filter(Boolean))]

  const allAvailableServices = [
    "Layanan Perpanjangan Hubungan Kerja PPPK",
    "Layanan Kenaikan Pangkat",
    "Layanan Pensiun",
    "Layanan Mutasi",
    "Layanan Cuti",
    "Layanan Tunjangan",
    "Layanan Administrasi Kepegawaian",
    "Layanan Pelatihan dan Pengembangan",
    "Layanan Kesehatan",
    "Layanan Lainnya",
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case "Selesai":
        return "bg-green-100 text-green-800"
      case "Dalam Proses":
        return "bg-blue-100 text-blue-800"
      case "Menunggu Verifikasi":
        return "bg-yellow-100 text-yellow-800"
      case "Dikembalikan":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Tinggi":
        return "bg-red-500 text-white"
      case "Sedang":
        return "bg-blue-500 text-white"
      case "Rendah":
        return "bg-gray-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getProgressColor = (progress) => {
    if (progress >= 80) return "bg-green-500"
    if (progress >= 50) return "bg-blue-500"
    if (progress >= 20) return "bg-yellow-500"
    return "bg-gray-300"
  }

  const handleAddReport = () => {
    setEditingReport(null)
    setShowReportForm(true)
  }

  const handleEditReport = (report) => {
    setEditingReport(report)
    setShowReportForm(true)
    setOpenActionMenu(null)
  }

  const handleDeleteReport = (reportId) => {
    if (confirm("Apakah Anda yakin ingin menghapus laporan ini?")) {
      dispatch({ type: "DELETE_REPORT", payload: reportId })
    }
    setOpenActionMenu(null)
  }

  const handleForwardReport = (report) => {
    setForwardingReport(report)
    setShowForwardForm(true)
    setOpenActionMenu(null)
  }

  const handleReportSubmit = (reportData) => {
    const newReport = {
      ...reportData,
      id: editingReport?.id || `RPT${Date.now()}`,
      createdBy: state.currentUser?.id || "",
      attachments: reportData.originalFiles || [],
      assignments: editingReport?.assignments || [],
      assignedStaff: editingReport?.assignedStaff || [],
      assignedCoordinators: editingReport?.assignedCoordinators || [],
      currentHolder: editingReport?.currentHolder || "",
      progress: editingReport?.progress || 0,
      priority: reportData.priority || "Sedang", // Added priority field
      workflow: editingReport?.workflow || [
        {
          id: `w${Date.now()}`,
          action: `Dibuat oleh ${state.currentUser?.name}`,
          user: state.currentUser?.name || "",
          timestamp: new Date().toISOString(),
          status: "completed",
        },
      ],
    }

    if (editingReport) {
      dispatch({ type: "UPDATE_REPORT", payload: newReport })
    } else {
      dispatch({ type: "ADD_REPORT", payload: newReport })
    }
    setShowReportForm(false)
    setEditingReport(null)
  }

  const handleForwardSubmit = (forwardData) => {
    const updatedReport = {
      ...forwardingReport,
      assignedCoordinators: forwardData.coordinators,
      currentHolder: forwardData.coordinators[0],
      status: "Dalam Proses",
      workflow: [
        ...forwardingReport.workflow,
        {
          id: `w${Date.now()}`,
          action: "Diteruskan ke Koordinator",
          user: state.currentUser?.name || "",
          timestamp: new Date().toISOString(),
          status: "completed",
        },
        {
          id: `w${Date.now() + 1}`,
          action: "Dalam Verifikasi Dokumen",
          user: forwardData.coordinators[0],
          timestamp: new Date().toISOString(),
          status: "in-progress",
        },
      ],
    }

    dispatch({ type: "UPDATE_REPORT", payload: updatedReport })
    setShowForwardForm(false)
    setForwardingReport(null)
  }

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" })
  }

  const resetFilters = () => {
    setServiceFilter("")
    setStatusFilter("")
    setSearchQuery("")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Tata Usaha</h2>
          <p className="text-gray-600">Kelola pengajuan dan laporan kepegawaian</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Laporan</p>
                <p className="text-2xl font-bold text-gray-900">{totalLaporan}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Menunggu Verifikasi</p>
                <p className="text-2xl font-bold text-gray-900">{menungguVerifikasi}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Dalam Proses</p>
                <p className="text-2xl font-bold text-gray-900">{dalamProses}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Selesai</p>
                <p className="text-2xl font-bold text-gray-900">{selesai}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Dikembalikan</p>
                <p className="text-2xl font-bold text-gray-900">{dikembalikan}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab("daftar")}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === "daftar"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Daftar Laporan
              </button>
              <button
                onClick={() => setActiveTab("buat")}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === "buat"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Buat Laporan Baru
              </button>
              <button
                onClick={() => setActiveTab("lacak")}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === "lacak"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Lacak Surat
              </button>
            </div>
          </div>

          {activeTab === "daftar" && (
            <>
              <div className="p-6 border-b border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Cari berdasarkan judul atau nomor surat..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={serviceFilter}
                    onChange={(e) => setServiceFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Semua Layanan</option>
                    {SERVICES.map((service) => (
                      <option key={service} value={service}>
                        {service}
                      </option>
                    ))}
                  </select>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Semua Status</option>
                    <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                    <option value="Dalam Proses">Dalam Proses</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Dikembalikan">Dikembalikan</option>
                  </select>
                  <button
                    onClick={resetFilters}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Filter className="w-4 h-4" />
                    Reset Filter
                  </button>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Daftar Laporan ({filteredReports.length})</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Judul Laporan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Layanan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Diajukan Oleh
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tanggal
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Prioritas
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Progress
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredReports.map((report) => (
                        <tr key={report.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {report.hal || report.noSurat}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">{report.layanan}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{state.currentUser?.name || "TU"}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {new Date(report.createdAt || Date.now()).toLocaleDateString("id-ID")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(report.status)}`}
                            >
                              {report.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded ${getPriorityColor(report.priority || "Sedang")}`}
                            >
                              {report.priority || "Sedang"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${getProgressColor(report.progress || 0)}`}
                                  style={{ width: `${report.progress || 0}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-600">{report.progress || 0}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2 relative">
                              <button
                                className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100"
                                title="Lihat Detail"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <div className="relative">
                                <button
                                  onClick={() => setOpenActionMenu(openActionMenu === report.id ? null : report.id)}
                                  className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100"
                                  title="Menu Lainnya"
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </button>
                                {openActionMenu === report.id && (
                                  <div className="absolute right-0 top-8 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                                    <div className="py-1">
                                      <button
                                        onClick={() => handleEditReport(report)}
                                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                      >
                                        <Edit className="w-4 h-4" />
                                        Edit Laporan
                                      </button>
                                      <button
                                        onClick={() => handleDeleteReport(report.id)}
                                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                        Hapus
                                      </button>
                                      <button
                                        onClick={() => handleForwardReport(report)}
                                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
                                      >
                                        <Send className="w-4 h-4" />
                                        Teruskan ke Koordinator
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredReports.length === 0 && (
                        <tr>
                          <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                            {userReports.length === 0
                              ? 'Belum ada laporan. Klik tab "Buat Laporan Baru" untuk membuat laporan baru.'
                              : "Tidak ada laporan yang sesuai dengan filter yang dipilih."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === "buat" && (
            <div className="p-6">
              <button
                onClick={handleAddReport}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Buat Laporan Baru
              </button>
            </div>
          )}

          {activeTab === "lacak" && (
            <div className="p-6">
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <Package className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Lacak Surat</h3>
                  <p className="text-gray-600">Masukkan nomor surat atau ID laporan untuk melacak status</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Masukkan nomor surat atau ID laporan..."
                        value={trackingQuery}
                        onChange={(e) => setTrackingQuery(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleLetterTracking()}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      onClick={handleLetterTracking}
                      disabled={isTracking || !trackingQuery.trim()}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Search className="w-4 h-4" />
                      {isTracking ? "Melacak..." : "Lacak"}
                    </button>
                  </div>
                </div>

                {isTracking && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Sedang melacak surat...</p>
                  </div>
                )}

                {trackingResult && !isTracking && (
                  <div className="bg-white border rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <h4 className="text-lg font-semibold text-gray-900">Surat Ditemukan</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Nomor Surat</p>
                        <p className="font-medium text-gray-900">{trackingResult.letterNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Perihal</p>
                        <p className="font-medium text-gray-900">{trackingResult.subject}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Status</p>
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(trackingResult.status)}`}
                        >
                          {trackingResult.status}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Estimasi Selesai</p>
                        <p className="font-medium text-gray-900">{trackingResult.estimatedCompletion}</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <p className="text-sm text-gray-600 mb-2">Progress</p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${getProgressColor(trackingResult.progress)}`}
                            style={{ width: `${trackingResult.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{trackingResult.progress}%</span>
                      </div>
                    </div>

                    <div className="mb-6">
                      <p className="text-sm text-gray-600 mb-4">Lokasi Saat Ini</p>
                      <p className="font-medium text-gray-900">{trackingResult.currentLocation}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-4">Riwayat Perjalanan Surat</p>
                      <div className="space-y-4">
                        {trackingResult.timeline.map((item, index) => (
                          <div key={index} className="flex items-start gap-4">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                                item.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : item.status === "in-progress"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {item.step}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{item.action}</p>
                              <p className="text-sm text-gray-600">{item.user}</p>
                              <p className="text-xs text-gray-500">
                                {item.date} • {item.time}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showProfileMenu && <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />}
      {openActionMenu && <div className="fixed inset-0 z-0" onClick={() => setOpenActionMenu(null)} />}

      {showReportForm && (
        <ReportForm
          report={editingReport}
          onSubmit={handleReportSubmit}
          onCancel={() => {
            setShowReportForm(false)
            setEditingReport(null)
          }}
        />
      )}

      {showForwardForm && (
        <ForwardForm
          report={forwardingReport}
          onSubmit={handleForwardSubmit}
          onCancel={() => {
            setShowForwardForm(false)
            setForwardingReport(null)
          }}
        />
      )}
    </div>
  )
}
