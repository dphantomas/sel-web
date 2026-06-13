'use client'

import { useState } from 'react'

export default function AdminPanel({ initialUsers, courses: initialCourses }) {
  const [activeTab, setActiveTab] = useState('users') // 'users' | 'courses'
  
  const [users, setUsers] = useState(initialUsers)
  const [courses, setCourses] = useState(initialCourses)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [updatingId, setUpdatingId] = useState(null) // para loaders de accesos
  
  // Estados para modales de edición/creación
  const [editingUser, setEditingUser] = useState(null)
  const [isCreatingUser, setIsCreatingUser] = useState(false)
  const [newUserData, setNewUserData] = useState({ firstName: '', lastName: '', email: '', phone: '', role: 'Participante' })
  
  const [editingCourse, setEditingCourse] = useState(null)
  const [isCreatingCourse, setIsCreatingCourse] = useState(false)
  const [newCourseData, setNewCourseData] = useState({ title: '', slug: '', description: '', type: 'Inicio', published: false })
  const [isSaving, setIsSaving] = useState(false)

  // =================== LOGICA DE ACCESOS ===================
  const handleToggleAccess = async (userId, courseId, isCurrentlyUnlocked) => {
    const shouldEnable = !isCurrentlyUnlocked
    setUpdatingId(`${userId}-${courseId}`)

    try {
      const response = await fetch('/api/admin/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, courseId, enabled: shouldEnable })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'No se pudo actualizar el acceso.')
      }

      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === userId) {
            let newUnlocked = [...u.unlockedCourses]
            if (shouldEnable) newUnlocked.push({ courseId })
            else newUnlocked = newUnlocked.filter((uc) => uc.courseId !== courseId)
            return { ...u, unlockedCourses: newUnlocked }
          }
          return u
        })
      )
    } catch (error) {
      console.error(error)
      alert(error.message || 'Error al modificar los accesos.')
    } finally {
      setUpdatingId(null)
    }
  }

  // =================== LOGICA EDICION USUARIO ===================
  const handleUserSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: editingUser.firstName,
          lastName: editingUser.lastName,
          phone: editingUser.phone,
          role: editingUser.role
        })
      })

      if (!res.ok) throw new Error('Error al actualizar usuario')
      const data = await res.json()
      
      setUsers(users.map(u => u.id === editingUser.id ? data.user : u))
      setEditingUser(null)
    } catch (error) {
      console.error(error)
      alert('Hubo un error al guardar los datos del usuario.')
    } finally {
      setIsSaving(false)
    }
  }

  // =================== LOGICA CREACION USUARIO ===================
  const handleCreateUserSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const res = await fetch(`/api/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserData)
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Error al crear usuario')
      }
      
      const data = await res.json()
      setUsers([...users, data.user])
      setIsCreatingUser(false)
      setNewUserData({ firstName: '', lastName: '', email: '', phone: '', role: 'Participante' })
      alert(`Usuario creado con éxito. Su contraseña inicial es: ${newUserData.email.split('@')[0].padEnd(6, '123')}`)
    } catch (error) {
      console.error(error)
      alert(error.message || 'Hubo un error al crear el usuario.')
    } finally {
      setIsSaving(false)
    }
  }

  // =================== LOGICA ELIMINACION USUARIO ===================
  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`⚠️ ATENCIÓN ⚠️\n\n¿Estás seguro de que deseas ELIMINAR permanentemente a ${userName}?\n\nEsta acción borrará todo su progreso en cursos y no se puede deshacer.`)) {
      return
    }
    
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Error al eliminar usuario')
      }

      setUsers(users.filter(u => u.id !== userId))
    } catch (error) {
      console.error(error)
      alert(error.message || 'Hubo un error al eliminar el usuario.')
    }
  }

  // =================== LOGICA EDICION CURSO ===================
  const handleCourseSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const res = await fetch(`/api/admin/courses/${editingCourse.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingCourse.title,
          slug: editingCourse.slug,
          description: editingCourse.description,
          published: editingCourse.published
        })
      })

      if (!res.ok) throw new Error('Error al actualizar curso')
      const data = await res.json()
      
      setCourses(courses.map(c => c.id === editingCourse.id ? data.course : c))
      setEditingCourse(null)
    } catch (error) {
      console.error(error)
      alert('Hubo un error al guardar los datos del curso.')
    } finally {
      setIsSaving(false)
    }
  }


  // =================== LOGICA CREACION CURSO ===================
  const handleCreateCourseSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const res = await fetch(`/api/admin/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCourseData)
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Error al crear curso')
      }
      
      const data = await res.json()
      setCourses([...courses, data.course])
      setIsCreatingCourse(false)
      setNewCourseData({ title: '', slug: '', description: '', type: 'Inicio', published: false })
    } catch (error) {
      console.error(error)
      alert(error.message || 'Hubo un error al crear el curso.')
    } finally {
      setIsSaving(false)
    }
  }


  // =================== RENDERIZADO ===================
  const filteredUsers = users.filter((user) => {
    const term = searchTerm.toLowerCase()
    return (
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      (user.phone || '').toLowerCase().includes(term)
    )
  })

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      
      {/* Pestañas */}
      <div className="flex border-b border-gray-200 bg-gray-50/50">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-4 font-bold text-sm transition ${
            activeTab === 'users' ? 'border-b-2 border-[#9187BA] text-[#33275f]' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Participantes
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className={`px-6 py-4 font-bold text-sm transition ${
            activeTab === 'courses' ? 'border-b-2 border-[#9187BA] text-[#33275f]' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Cursos y Talleres
        </button>
      </div>

      {/* VISTA PARTICIPANTES */}
      {activeTab === 'users' && (
        <>
          <div className="p-6 border-b border-gray-100 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Buscar por nombre, email o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#9187BA] text-gray-800"
              />
              <div className="absolute left-3 top-3 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>
            <button
              onClick={() => setIsCreatingUser(true)}
              className="bg-[#33275f] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#4c3c86] transition shadow-sm whitespace-nowrap"
            >
              + Crear Nuevo Participante
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                  <th className="py-4 px-6">Acciones</th>
                  <th className="py-4 px-6">Participante</th>
                  <th className="py-4 px-6">Rol</th>
                  {courses.map((course) => (
                    <th key={course.id} className="py-4 px-6 text-center whitespace-nowrap">
                      {course.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={courses.length + 3} className="py-8 text-center text-gray-500">
                      No se encontraron usuarios.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition">
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => setEditingUser(user)}
                            className="text-[#9187BA] hover:text-[#33275f] font-bold text-xs underline text-left"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id, `${user.firstName} ${user.lastName}`)}
                            className="text-red-400 hover:text-red-600 font-bold text-xs underline text-left"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-[#33275f]">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">{user.email}</div>
                        {user.phone ? (
                          <div className="text-xs text-[#9187BA] mt-0.5">Wa: {user.phone}</div>
                        ) : (
                          <div className="text-xs text-gray-400 mt-0.5 italic">Sin teléfono</div>
                        )}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                          user.role === 'Admin' ? 'bg-red-50 text-red-600' : user.role === 'Transmisor' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      {courses.map((course) => {
                        const isUnlocked = user.unlockedCourses.some((uc) => uc.courseId === course.id)
                        const isLoading = updatingId === `${user.id}-${course.id}`
                        return (
                          <td key={course.id} className="py-4 px-6 text-center">
                            <label className="inline-flex items-center justify-center cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition relative">
                              <input
                                type="checkbox"
                                checked={isUnlocked}
                                disabled={isLoading}
                                onChange={() => handleToggleAccess(user.id, course.id, isUnlocked)}
                                className="w-5 h-5 rounded text-[#33275f] focus:ring-[#9187BA] border-gray-300 transition"
                              />
                              {isLoading && (
                                <span className="absolute inset-0 flex items-center justify-center bg-white/70">
                                  <span className="w-4 h-4 border-2 border-[#33275f] border-t-transparent rounded-full animate-spin"></span>
                                </span>
                              )}
                            </label>
                          </td>
                        )
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* VISTA CURSOS */}
      {activeTab === 'courses' && (
        <div className="p-6">
          <div className="mb-6 flex justify-end">
            <button
              onClick={() => setIsCreatingCourse(true)}
              className="bg-[#33275f] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#4c3c86] transition shadow-sm"
            >
              + Crear Nuevo Taller
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses.map(course => (
              <div key={course.id} className="border rounded-2xl p-5 shadow-sm bg-white hover:border-[#9187BA] transition relative">
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${course.published ? 'bg-green-500' : 'bg-gray-300'}`} title={course.published ? 'Publicado' : 'Oculto'}></span>
                </div>
                <h3 className="font-bold text-[#33275f] text-lg mb-1 pr-6">{course.title}</h3>
                <p className="text-xs text-gray-400 mb-3 font-mono">{course.slug}</p>
                <p className="text-sm text-gray-600 line-clamp-3 mb-4">{course.description || 'Sin descripción'}</p>
                <button
                  onClick={() => setEditingCourse(course)}
                  className="bg-[#33275f] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#4c3c86] transition w-full"
                >
                  Editar Información
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL CREAR USUARIO */}
      {isCreatingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-[#33275f] mb-4">Crear Nuevo Participante</h2>
            <form onSubmit={handleCreateUserSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                  <input type="email" required value={newUserData.email} onChange={(e) => setNewUserData({...newUserData, email: e.target.value})} className="w-full px-4 py-2 rounded-xl border focus:border-[#9187BA] focus:ring-1 focus:ring-[#9187BA] outline-none" placeholder="ejemplo@email.com" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre</label>
                    <input type="text" required value={newUserData.firstName} onChange={(e) => setNewUserData({...newUserData, firstName: e.target.value})} className="w-full px-4 py-2 rounded-xl border focus:border-[#9187BA] focus:ring-1 focus:ring-[#9187BA] outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Apellido</label>
                    <input type="text" required value={newUserData.lastName} onChange={(e) => setNewUserData({...newUserData, lastName: e.target.value})} className="w-full px-4 py-2 rounded-xl border focus:border-[#9187BA] focus:ring-1 focus:ring-[#9187BA] outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Teléfono</label>
                  <input type="text" value={newUserData.phone} onChange={(e) => setNewUserData({...newUserData, phone: e.target.value})} className="w-full px-4 py-2 rounded-xl border focus:border-[#9187BA] focus:ring-1 focus:ring-[#9187BA] outline-none" placeholder="+549112345678" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Rol</label>
                  <select value={newUserData.role} onChange={(e) => setNewUserData({...newUserData, role: e.target.value})} className="w-full px-4 py-2 rounded-xl border focus:border-[#9187BA] focus:ring-1 focus:ring-[#9187BA] outline-none bg-white">
                    <option value="Participante">Participante</option>
                    <option value="Transmisor">Transmisor</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setIsCreatingUser(false)} className="px-4 py-2 rounded-xl text-gray-500 font-bold hover:bg-gray-100 transition">Cancelar</button>
                <button type="submit" disabled={isSaving} className="px-6 py-2 rounded-xl bg-[#B681AE] text-white font-bold hover:bg-[#9187BA] transition disabled:opacity-50">
                  {isSaving ? 'Creando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR USUARIO */}
      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-[#33275f] mb-4">Editar Participante</h2>
            <form onSubmit={handleUserSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email (Solo lectura)</label>
                  <input type="text" value={editingUser.email} disabled className="w-full px-4 py-2 bg-gray-100 rounded-xl border text-gray-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre</label>
                    <input type="text" required value={editingUser.firstName} onChange={(e) => setEditingUser({...editingUser, firstName: e.target.value})} className="w-full px-4 py-2 rounded-xl border focus:border-[#9187BA] focus:ring-1 focus:ring-[#9187BA] outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Apellido</label>
                    <input type="text" required value={editingUser.lastName} onChange={(e) => setEditingUser({...editingUser, lastName: e.target.value})} className="w-full px-4 py-2 rounded-xl border focus:border-[#9187BA] focus:ring-1 focus:ring-[#9187BA] outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Teléfono</label>
                  <input type="text" value={editingUser.phone || ''} onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})} className="w-full px-4 py-2 rounded-xl border focus:border-[#9187BA] focus:ring-1 focus:ring-[#9187BA] outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Rol</label>
                  <select value={editingUser.role} onChange={(e) => setEditingUser({...editingUser, role: e.target.value})} className="w-full px-4 py-2 rounded-xl border focus:border-[#9187BA] focus:ring-1 focus:ring-[#9187BA] outline-none bg-white">
                    <option value="Participante">Participante</option>
                    <option value="Transmisor">Transmisor</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 rounded-xl text-gray-500 font-bold hover:bg-gray-100 transition">Cancelar</button>
                <button type="submit" disabled={isSaving} className="px-6 py-2 rounded-xl bg-[#B681AE] text-white font-bold hover:bg-[#9187BA] transition disabled:opacity-50">
                  {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR CURSO */}
      {editingCourse && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-[#33275f] mb-4">Editar Curso</h2>
            <form onSubmit={handleCourseSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Título</label>
                  <input type="text" required value={editingCourse.title} onChange={(e) => setEditingCourse({...editingCourse, title: e.target.value})} className="w-full px-4 py-2 rounded-xl border focus:border-[#9187BA] focus:ring-1 focus:ring-[#9187BA] outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Slug (URL amigable)</label>
                  <input type="text" required value={editingCourse.slug} onChange={(e) => setEditingCourse({...editingCourse, slug: e.target.value})} className="w-full px-4 py-2 rounded-xl border focus:border-[#9187BA] focus:ring-1 focus:ring-[#9187BA] outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descripción</label>
                  <textarea rows="4" value={editingCourse.description || ''} onChange={(e) => setEditingCourse({...editingCourse, description: e.target.value})} className="w-full px-4 py-2 rounded-xl border focus:border-[#9187BA] focus:ring-1 focus:ring-[#9187BA] outline-none resize-none"></textarea>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input type="checkbox" id="published" checked={editingCourse.published} onChange={(e) => setEditingCourse({...editingCourse, published: e.target.checked})} className="w-5 h-5 rounded text-[#33275f] focus:ring-[#9187BA] border-gray-300 transition" />
                  <label htmlFor="published" className="text-sm font-bold text-gray-700 cursor-pointer">Visible (Publicado)</label>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setEditingCourse(null)} className="px-4 py-2 rounded-xl text-gray-500 font-bold hover:bg-gray-100 transition">Cancelar</button>
                <button type="submit" disabled={isSaving} className="px-6 py-2 rounded-xl bg-[#B681AE] text-white font-bold hover:bg-[#9187BA] transition disabled:opacity-50">
                  {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CREAR CURSO */}
      {isCreatingCourse && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-[#33275f] mb-4">Crear Nuevo Curso/Taller</h2>
            <form onSubmit={handleCreateCourseSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Título</label>
                  <input type="text" required value={newCourseData.title} onChange={(e) => setNewCourseData({...newCourseData, title: e.target.value})} className="w-full px-4 py-2 rounded-xl border focus:border-[#9187BA] focus:ring-1 focus:ring-[#9187BA] outline-none" placeholder="Ej: Sanación de la Duda" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Slug (URL amigable)</label>
                  <input type="text" required value={newCourseData.slug} onChange={(e) => setNewCourseData({...newCourseData, slug: e.target.value})} className="w-full px-4 py-2 rounded-xl border focus:border-[#9187BA] focus:ring-1 focus:ring-[#9187BA] outline-none" placeholder="Ej: sanacion-de-la-duda" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo de Curso</label>
                  <select value={newCourseData.type} onChange={(e) => setNewCourseData({...newCourseData, type: e.target.value})} className="w-full px-4 py-2 rounded-xl border focus:border-[#9187BA] focus:ring-1 focus:ring-[#9187BA] outline-none bg-white">
                    <option value="Inicio">Inicio</option>
                    <option value="Rocas">Rocas</option>
                    <option value="SieteTemplos">SieteTemplos</option>
                    <option value="RetiroIniciaicion">RetiroIniciaicion</option>
                    <option value="RetiroNH">RetiroNH</option>
                    <option value="RetiroNuevoAmanecer">RetiroNuevoAmanecer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descripción</label>
                  <textarea rows="3" value={newCourseData.description} onChange={(e) => setNewCourseData({...newCourseData, description: e.target.value})} className="w-full px-4 py-2 rounded-xl border focus:border-[#9187BA] focus:ring-1 focus:ring-[#9187BA] outline-none resize-none" placeholder="Breve descripción del curso..."></textarea>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input type="checkbox" id="publishedNew" checked={newCourseData.published} onChange={(e) => setNewCourseData({...newCourseData, published: e.target.checked})} className="w-5 h-5 rounded text-[#33275f] focus:ring-[#9187BA] border-gray-300 transition" />
                  <label htmlFor="publishedNew" className="text-sm font-bold text-gray-700 cursor-pointer">Hacer visible (Publicado) ahora</label>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setIsCreatingCourse(false)} className="px-4 py-2 rounded-xl text-gray-500 font-bold hover:bg-gray-100 transition">Cancelar</button>
                <button type="submit" disabled={isSaving} className="px-6 py-2 rounded-xl bg-[#B681AE] text-white font-bold hover:bg-[#9187BA] transition disabled:opacity-50">
                  {isSaving ? 'Creando...' : 'Crear Curso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
