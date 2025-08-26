"use client"

import { useState, useEffect } from "react"
import { useApp } from "../../context/AppContext"
import { User, Plus, Edit, Trash2, Users, FileText, UserCheck, Shield, Settings } from "lucide-react"
import { UserForm } from "../forms/UserForm"
import { createClient } from "../../../lib/supabase/client"

export function AdminDashboard() {
  const { state, dispatch } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [loading, setLoading] = useState(false)
  const [supabaseUsers, setSupabaseUsers] = useState([])

  const supabase = createClient()

  useEffect(() => {
    loadUsersFromDatabase()
  }, [])

  const loadUsersFromDatabase = async () => {
    try {
      setLoading(true)
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading users:", error)
        return
      }

      setSupabaseUsers(profiles || [])
    } catch (error) {
      console.error("Error loading users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = () => {
    setEditingUser(null)
    setShowForm(true)
  }

  const handleEditUser = (user) => {
    setEditingUser(user)
    setShowForm(true)
  }

  const handleDeleteUser = async (userId) => {
    if (confirm("Apakah Anda yakin ingin menghapus pengguna ini?")) {
      try {
        setLoading(true)
        const { error } = await supabase.from("profiles").delete().eq("id", userId)

        if (error) {
          console.error("Error deleting user:", error)
          alert("Gagal menghapus pengguna: " + error.message)
          return
        }

        dispatch({ type: "DELETE_USER", payload: userId })
        await loadUsersFromDatabase()
        alert("Pengguna berhasil dihapus")
      } catch (error) {
        console.error("Error deleting user:", error)
        alert("Gagal menghapus pengguna")
      } finally {
        setLoading(false)
      }
    }
  }

  const handleFormSubmit = async (userData) => {
    try {
      setLoading(true)

      if (editingUser) {
        const { error } = await supabase
          .from("profiles")
          .update({
            name: userData.name,
            role: userData.role,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingUser.id)

        if (error) {
          console.error("Error updating user:", error)
          alert("Gagal mengupdate pengguna: " + error.message)
          return
        }

        dispatch({ type: "UPDATE_USER", payload: { ...userData, id: editingUser.id } })
        alert("Pengguna berhasil diupdate")
      } else {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: `${userData.id}@example.com`,
          password: userData.password,
          options: {
            data: {
              name: userData.name,
              role: userData.role,
            },
          },
        })

        if (authError) {
          console.error("Error creating user:", authError)
          alert("Gagal membuat pengguna: " + authError.message)
          return
        }

        dispatch({ type: "ADD_USER", payload: { ...userData, id: authData.user?.id || Date.now().toString() } })
        alert("Pengguna berhasil ditambahkan")
      }

      await loadUsersFromDatabase()
      setShowForm(false)
      setEditingUser(null)
    } catch (error) {
      console.error("Error saving user:", error)
      alert("Gagal menyimpan pengguna")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" })
  }

  const allUsers = [...state.users, ...supabaseUsers.filter((su) => !state.users.find((u) => u.id === su.id))]

  const stats = {
    totalUsers: allUsers.length,
    adminUsers: allUsers.filter((u) => u.role === "Admin").length,
    tuUsers: allUsers.filter((u) => u.role === "TU").length,
    coordinatorUsers: allUsers.filter((u) => u.role === "Koordinator").length,
    staffUsers: allUsers.filter((u) => u.role === "Staff").length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Administrator</h2>
          <p className="text-gray-600">Kelola akun pengguna sistem tracking pesan dan workflow</p>
          {loading && <p className="text-blue-600 text-sm mt-2">Loading...</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pengguna</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Admin</p>
                <p className="text-2xl font-bold text-gray-900">{stats.adminUsers}</p>
              </div>
              <Shield className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tata Usaha</p>
                <p className="text-2xl font-bold text-gray-900">{stats.tuUsers}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Koordinator</p>
                <p className="text-2xl font-bold text-gray-900">{stats.coordinatorUsers}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Staff</p>
                <p className="text-2xl font-bold text-gray-900">{stats.staffUsers}</p>
              </div>
              <Settings className="w-8 h-8 text-gray-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Manajemen Pengguna</h3>
              <button
                onClick={handleAddUser}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Tambah Pengguna
              </button>
            </div>
          </div>

          <div className="p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Daftar Pengguna ({allUsers.length})</h4>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">NAMA</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">ID PENGGUNA</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">ROLE</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                          <span className="font-medium text-gray-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-900">{user.id}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === "Admin"
                              ? "bg-purple-100 text-purple-800"
                              : user.role === "TU"
                                ? "bg-blue-100 text-blue-800"
                                : user.role === "Koordinator"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            disabled={loading}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Edit Pengguna"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={loading}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Hapus Pengguna"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {allUsers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-500">
                        Belum ada pengguna yang terdaftar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showProfileMenu && <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />}

      {showForm && (
        <UserForm
          user={editingUser}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false)
            setEditingUser(null)
          }}
          loading={loading}
        />
      )}
    </div>
  )
}
