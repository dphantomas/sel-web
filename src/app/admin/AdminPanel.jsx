'use client'

import { useState, useRef } from 'react'
import { UploadCloud, User as UserIcon, X, Check, Search, Eye, EyeOff, FileText, CheckCircle, Edit2, Shield, Layout, Trash2, Calendar, Link2, DollarSign, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import ImageCropperModal from '@/components/ImageCropperModal'

export default function AdminPanel({ initialUsers, courses: initialCourses }) {
  const [activeTab, setActiveTab] = useState('users') // 'users' | 'courses'
  
  const [users, setUsers] = useState(initialUsers)
  const [courses, setCourses] = useState(initialCourses)
  
  // Image Cropping States
  const [cropModalImage, setCropModalImage] = useState(null)
  const [croppedImageBlob, setCroppedImageBlob] = useState(null)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [updatingId, setUpdatingId] = useState(null) // para loaders de accesos
  
  // Estados para modales de edición/creación
  const [editingUser, setEditingUser] = useState(null)
  const [editImagePreview, setEditImagePreview] = useState(null)
  const editFileInputRef = useRef(null)

  const [isCreatingCourse, setIsCreatingCourse] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [newCourseData, setNewCourseData] = useState({ title: '', slug: '', description: '', type: 'Curso', published: false })
  const [isSaving, setIsSaving] = useState(false)

  // =================== LOGICA RECURSOS (R2) ===================
  const [isUploading, setIsUploading] = useState(false)
  const [overrideResourceId, setOverrideResourceId] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [newResourceName, setNewResourceName] = useState('')
  const [previewingId, setPreviewingId] = useState(null)
  const resourceInputRef = useRef(null)

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "")
      setNewResourceName(nameWithoutExt)
    }
  }

  const handleCancelFileSelect = () => {
    setSelectedFile(null)
    setNewResourceName('')
    setOverrideResourceId('')
    if (resourceInputRef.current) resourceInputRef.current.value = ''
  }

  const handleUploadResource = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    try {
      // 1. Pedir URL firmada
      const urlRes = await fetch('/api/admin/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fileName: selectedFile.name, 
          fileType: selectedFile.type,
          folder: editingCourse.slug || 'varios'
        })
      })

      if (!urlRes.ok) throw new Error('Error al obtener link de subida')
      const { uploadUrl, cloudflareKey } = await urlRes.json()

      // 2. Subir archivo a R2 (S3) directamente
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': selectedFile.type },
        body: selectedFile
      })

      if (!uploadRes.ok) {
        const errorText = await uploadRes.text()
        throw new Error(`Error de la nube (${uploadRes.status}): ${errorText.substring(0, 100)}`)
      }

      // 3. Guardar en BD
      const isDownloadable = selectedFile.type.includes('pdf') || selectedFile.type.includes('zip')
      const dbRes = await fetch('/api/admin/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newResourceName.trim() || selectedFile.name,
          type: selectedFile.type,
          cloudflareKey,
          isDownloadable,
          courseId: editingCourse.id,
          overridesResourceId: overrideResourceId || null
        })
      })

      if (!dbRes.ok) throw new Error('Error guardando en base de datos')
      const newResource = await dbRes.json()

      // Actualizar estado
      const updatedCourse = { 
        ...editingCourse, 
        resources: [...(editingCourse.resources || []), newResource] 
      }
      setEditingCourse(updatedCourse)
      setCourses(courses.map(c => c.id === editingCourse.id ? updatedCourse : c))
      
      handleCancelFileSelect()
    } catch (error) {
      console.error(error)
      alert(error.message || 'Error en la subida.')
    } finally {
      setIsUploading(false)
    }
  }

  const handlePreviewResource = async (resource) => {
    setPreviewingId(resource.id)
    try {
      const res = await fetch(`/api/resources/${resource.id}`)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'No se pudo generar la preview')
      }
      const { url } = await res.json()
      window.open(url, '_blank')
    } catch (error) {
      alert(error.message)
    } finally {
      setPreviewingId(null)
    }
  }

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm('¿Seguro que deseas eliminar este archivo? Se borrará permanentemente de la nube.')) return
    
    try {
      const res = await fetch(`/api/admin/resources?id=${resourceId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error borrando recurso')

      const updatedResources = (editingCourse.resources || []).filter(r => r.id !== resourceId)
      const updatedCourse = { ...editingCourse, resources: updatedResources }
      
      setEditingCourse(updatedCourse)
      setCourses(courses.map(c => c.id === editingCourse.id ? updatedCourse : c))
    } catch (error) {
      alert('Error al borrar el archivo.')
    }
  }

  // =================== LOGICA INSTANCIAS ===================
  const [courseTab, setCourseTab] = useState('data') // 'data' | 'instances' | 'resources'
  const [isCreatingInstance, setIsCreatingInstance] = useState(false)
  const [newInstanceData, setNewInstanceData] = useState({ startDate: '', endDate: '', price: '', location: '' })

  const handleCreateInstance = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const res = await fetch(`/api/admin/courses/${editingCourse.id}/instances`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInstanceData)
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Error al crear instancia')
      }
      
      const data = await res.json()
      const updatedCourse = { ...editingCourse, instances: [data.instance, ...(editingCourse.instances || [])] }
      setEditingCourse(updatedCourse)
      setCourses(courses.map(c => c.id === editingCourse.id ? updatedCourse : c))
      
      setIsCreatingInstance(false)
      setNewInstanceData({ startDate: '', endDate: '', price: '', location: '' })
    } catch (error) {
      console.error(error)
      alert(error.message || 'Hubo un error al crear la instancia.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteInstance = async (instanceId) => {
    if (!window.confirm('¿Estás seguro de que deseas ELIMINAR esta instancia?')) return
    try {
      const res = await fetch(`/api/admin/instances/${instanceId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al borrar')
      
      const updatedInstances = editingCourse.instances.filter(i => i.id !== instanceId)
      const updatedCourse = { ...editingCourse, instances: updatedInstances }
      
      setEditingCourse(updatedCourse)
      setCourses(courses.map(c => c.id === editingCourse.id ? updatedCourse : c))
    } catch (error) {
      alert('Error al eliminar la instancia.')
    }
  }

  // =================== LOGICA DE ACCESOS ===================
  const handleToggleAccess = async (userId, courseId, instanceId, isCurrentlyUnlocked) => {
    setUpdatingId(`${userId}-${instanceId}`)
    try {
      const res = await fetch('/api/admin/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          courseId,
          instanceId,
          enabled: !isCurrentlyUnlocked
        })
      })

      if (res.ok) {
        // Refrescar el usuario para obtener sus nuevos accesos completos
        const userRes = await fetch(`/api/admin/users/${userId}`)
        if (userRes.ok) {
          const { user: updatedUser } = await userRes.json()
          
          setUsers(users.map(u => u.id === userId ? updatedUser : u))
          if (editingUser?.id === userId) {
            setEditingUser(updatedUser)
          }
        }
      } else {
        const errorData = await res.json()
        alert(errorData.error || 'Error al actualizar acceso')
      }
    } catch (error) {
      console.error(error)
      alert('Error de conexión')
    } finally {
      setUpdatingId(null)
    }
  }

  // =================== LOGICA EDICION USUARIO ===================
  const openEditUser = (user) => {
    setEditingUser(user)
    setEditImagePreview(user.image || null)
    setCroppedImageBlob(null)
  }

  const handleEditImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setCropModalImage(reader.result)
      reader.readAsDataURL(file)
    } else {
      setEditImagePreview(editingUser?.image || null)
      setCroppedImageBlob(null)
    }
  }

  const handleUserSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const formData = new FormData(e.target)
      
      if (croppedImageBlob) {
        formData.set('image', croppedImageBlob, 'profile.jpg')
      }
      
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        body: formData
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
      if (editingUser?.id === userId) setEditingUser(null)
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
          type: editingCourse.type,
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
      setNewCourseData({ title: '', slug: '', description: '', type: 'Curso', published: false })
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
      (user.phone || '').toLowerCase().includes(term) ||
      (user.sparkName || '').toLowerCase().includes(term)
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
                placeholder="Buscar por nombre, email, teléfono o chispa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#9187BA] text-gray-800 transition"
              />
              <div className="absolute left-3 top-3 text-gray-400">
                <Search className="w-5 h-5" />
              </div>
            </div>
            <Link
              href="/admin/users/new"
              className="bg-[#33275f] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#4c3c86] transition shadow-sm whitespace-nowrap text-center"
            >
              + Crear Nuevo Participante
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                  <th className="py-4 px-6 w-16">Perfil</th>
                  <th className="py-4 px-6">Información</th>
                  <th className="py-4 px-6">Rol</th>
                  <th className="py-4 px-6">Cursos</th>
                  <th className="py-4 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-500">
                      No se encontraron participantes.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/30 transition group">
                      <td className="py-4 px-6">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                          {user.image ? (
                            <img src={user.image} alt={user.firstName} className="w-full h-full object-cover" />
                          ) : (
                            <UserIcon className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-[#33275f] text-base">
                          {user.firstName} {user.lastName}
                          {user.sparkName && <span className="text-[#9187BA] font-normal ml-2">✨ {user.sparkName}</span>}
                        </div>
                        <div className="text-sm text-gray-500 mt-0.5">{user.email}</div>
                        <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                          {user.phone && <span>Wa: {user.phone}</span>}
                          {user.country && <span>📍 {user.country}</span>}
                        </div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                          user.role === 'Admin' ? 'bg-red-50 text-red-600' : user.role === 'Transmisor' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-xs font-bold text-[#B681AE] bg-[#B681AE]/10 px-3 py-1 rounded-full">
                          {user.unlockedCourses?.length || 0} habilitados
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => openEditUser(user)}
                          className="text-[#9187BA] hover:text-[#33275f] font-bold text-sm bg-white border border-gray-200 hover:border-[#9187BA] px-4 py-2 rounded-lg transition shadow-sm"
                        >
                          Gestionar
                        </button>
                      </td>
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

      {/* MODAL EDITAR USUARIO COMPLETO */}
      {cropModalImage && (
        <ImageCropperModal
          imageSrc={cropModalImage}
          onCropComplete={(blob) => {
            setCroppedImageBlob(blob)
            setEditImagePreview(URL.createObjectURL(blob))
            setCropModalImage(null)
          }}
          onCancel={() => {
            setCropModalImage(null)
            if (editFileInputRef.current) editFileInputRef.current.value = ''
          }}
        />
      )}

      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 md:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-full">
            
            <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-[#33275f]">Gestionar Participante</h2>
                <p className="text-sm text-gray-500">{editingUser.email}</p>
              </div>
              <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Columna Izquierda: Formulario de Datos */}
              <div className="lg:col-span-2 space-y-8">
                <form id="editUserForm" onSubmit={handleUserSubmit} className="space-y-8">
                  
                  {/* Foto de Perfil */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
                    <div className="relative w-24 h-24 shrink-0 rounded-full border-4 border-[#B681AE]/20 bg-white overflow-hidden flex items-center justify-center group">
                      {editImagePreview ? (
                        <img src={editImagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-10 h-10 text-gray-300" />
                      )}
                      
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <UploadCloud className="w-6 h-6 text-white" />
                      </div>
                      
                      <input 
                        ref={editFileInputRef}
                        type="file" 
                        name="image" 
                        accept="image/*" 
                        onChange={handleEditImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                      />
                    </div>
                    <div className="text-center sm:text-left">
                      <span className="text-lg font-bold text-[#33275f] block mb-1">Foto de Perfil</span>
                      <p className="text-sm text-gray-500">Haz clic en la imagen para actualizarla.</p>
                    </div>
                  </div>

                  {/* Info Personal */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Información Personal</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Nombre</label>
                        <input type="text" name="firstName" required defaultValue={editingUser.firstName} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#9187BA] outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Apellido</label>
                        <input type="text" name="lastName" required defaultValue={editingUser.lastName} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#9187BA] outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Nombre de Chispa</label>
                        <input type="text" name="sparkName" defaultValue={editingUser.sparkName || ''} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#9187BA] outline-none" placeholder="Opcional" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Celular / WhatsApp</label>
                        <input type="text" name="phone" defaultValue={editingUser.phone || ''} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#9187BA] outline-none" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 mb-1">Rol en la Plataforma</label>
                        <select 
                          name="role" 
                          key={`role-${editingUser.role}-${editingUser.unlockedCourses?.length}`}
                          defaultValue={(editingUser.role === 'Guest' && editingUser.unlockedCourses?.length > 0) ? 'Participante' : editingUser.role} 
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#9187BA] outline-none bg-white"
                        >
                          <option value="Guest">Invitado (Guest)</option>
                          <option value="Participante">Participante</option>
                          <option value="Transmisor">Transmisor</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Residencia */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Residencia</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 mb-1">Dirección</label>
                        <input type="text" name="addressLine1" defaultValue={editingUser.addressLine1 || ''} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#9187BA] outline-none" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 mb-1">Ciudad, Provincia</label>
                        <input type="text" name="addressLine2" defaultValue={editingUser.addressLine2 || ''} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#9187BA] outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Código Postal</label>
                        <input type="text" name="zipCode" defaultValue={editingUser.zipCode || ''} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#9187BA] outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">País</label>
                        <select name="country" defaultValue={editingUser.country || ''} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#9187BA] outline-none bg-white">
                          <option value="" disabled>Seleccionar...</option>
                          <option value="Argentina">Argentina</option>
                          <option value="Bolivia">Bolivia</option>
                          <option value="Chile">Chile</option>
                          <option value="Colombia">Colombia</option>
                          <option value="Costa Rica">Costa Rica</option>
                          <option value="Cuba">Cuba</option>
                          <option value="Ecuador">Ecuador</option>
                          <option value="El Salvador">El Salvador</option>
                          <option value="España">España</option>
                          <option value="Estados Unidos">Estados Unidos</option>
                          <option value="Guatemala">Guatemala</option>
                          <option value="Honduras">Honduras</option>
                          <option value="México">México</option>
                          <option value="Nicaragua">Nicaragua</option>
                          <option value="Panamá">Panamá</option>
                          <option value="Paraguay">Paraguay</option>
                          <option value="Perú">Perú</option>
                          <option value="Puerto Rico">Puerto Rico</option>
                          <option value="República Dominicana">República Dominicana</option>
                          <option value="Uruguay">Uruguay</option>
                          <option value="Venezuela">Venezuela</option>
                          <option value="Otro">Otro País</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              {/* Columna Derecha: Accesos a Cursos e Historial */}
              <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-6 flex flex-col h-full">
                <h3 className="text-[#33275f] font-bold text-lg mb-2">Historial de Cursos</h3>
                <p className="text-sm text-gray-500 mb-6">Gestioná a qué talleres tiene acceso este usuario. Los cambios aquí se guardan instantáneamente.</p>
                
                <div className="space-y-3 flex-1 overflow-y-auto pr-2">
                  {courses.map((course) => {
                    // Check if they have access to ANY instance of this course to color the course header
                    const hasAnyAccess = editingUser.unlockedCourses?.some((uc) => uc.courseId === course.id)
                    
                    return (
                      <div key={course.id} className="mb-4">
                        <div className={`p-4 rounded-xl border flex items-center justify-between transition-all ${hasAnyAccess ? 'bg-white border-[#B681AE] shadow-sm' : 'bg-transparent border-gray-200'}`}>
                          <div className="flex-1 pr-4">
                            <p className={`font-bold text-sm ${hasAnyAccess ? 'text-[#33275f]' : 'text-gray-600'}`}>{course.title}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{course.type}</p>
                          </div>
                        </div>

                        {/* Instances List */}
                        <div className="space-y-2 mt-2 pl-4 border-l-2 border-gray-100 ml-4">
                          {!course.instances || course.instances.length === 0 ? (
                            <p className="text-xs text-gray-400 py-2">No hay instancias creadas para este taller.</p>
                          ) : (
                            course.instances.map(instance => {
                              const isUnlocked = editingUser.unlockedInstances?.some((ui) => ui.courseInstanceId === instance.id)
                              const isLoading = updatingId === `${editingUser.id}-${instance.id}`
                              const dateStr = new Date(instance.startDate).toLocaleDateString('es-AR')
                              
                              return (
                                <div key={instance.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                  <div className="text-sm">
                                    <span className="font-semibold text-gray-700">{dateStr}</span>
                                    {instance.location && <span className="text-xs text-gray-500 ml-2">({instance.location})</span>}
                                  </div>
                                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                    <input 
                                      type="checkbox" 
                                      className="sr-only peer"
                                      checked={isUnlocked || false}
                                      disabled={isLoading}
                                      onChange={() => handleToggleAccess(editingUser.id, course.id, instance.id, isUnlocked)}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#B681AE]"></div>
                                    {isLoading && (
                                      <span className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-full">
                                        <span className="w-4 h-4 border-2 border-[#33275f] border-t-transparent rounded-full animate-spin"></span>
                                      </span>
                                    )}
                                  </label>
                                </div>
                              )
                            })
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

            </div>

            {/* Footer Modal */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-between shrink-0 rounded-b-2xl">
              <button 
                onClick={() => handleDeleteUser(editingUser.id, `${editingUser.firstName} ${editingUser.lastName}`)}
                className="text-red-500 hover:text-red-700 font-bold text-sm underline px-2"
              >
                Eliminar Usuario
              </button>
              <div className="flex gap-3">
                <button type="button" onClick={() => setEditingUser(null)} className="px-5 py-2.5 rounded-xl text-gray-600 font-bold hover:bg-gray-200 transition">
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  form="editUserForm"
                  disabled={isSaving} 
                  className="px-6 py-2.5 rounded-xl bg-[#33275f] text-white font-bold hover:bg-[#4c3c86] transition shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Guardando...
                    </>
                  ) : (
                    'Guardar Cambios'
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL EDITAR CURSO COMPLETO */}
      {editingCourse && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 md:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[90vh]">
            
            <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-[#33275f]">Gestionar Curso</h2>
                <p className="text-sm text-gray-500">{editingCourse.title}</p>
              </div>
              <button onClick={() => setEditingCourse(null)} className="text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden" style={{ flexDirection: 'row' }}>
              {/* Menú Lateral del Modal */}
              <div 
                className="bg-gray-50 border-r border-gray-200 shrink-0 overflow-y-auto"
                style={{ width: '260px', display: 'flex', flexDirection: 'column' }}
              >
                <button 
                  onClick={() => setCourseTab('data')}
                  className={`px-6 py-4 text-left font-bold text-sm whitespace-nowrap transition-colors border-l-4 ${courseTab === 'data' ? 'bg-white text-[#33275f] border-[#B681AE]' : 'text-gray-500 border-transparent hover:bg-gray-100'}`}
                >
                  Datos Base
                </button>
                <button 
                  onClick={() => setCourseTab('instances')}
                  className={`px-6 py-4 text-left font-bold text-sm whitespace-nowrap transition-colors border-l-4 ${courseTab === 'instances' ? 'bg-white text-[#33275f] border-[#B681AE]' : 'text-gray-500 border-transparent hover:bg-gray-100'}`}
                >
                  Instancias Programadas
                </button>
                <button 
                  onClick={() => setCourseTab('resources')}
                  className={`px-6 py-4 text-left font-bold text-sm whitespace-nowrap transition-colors border-l-4 ${courseTab === 'resources' ? 'bg-white text-[#33275f] border-[#B681AE]' : 'text-gray-500 border-transparent hover:bg-gray-100'}`}
                >
                  Recursos y Archivos
                </button>
              </div>

              {/* Contenido de la Pestaña */}
              <div className="flex-1 overflow-y-auto p-6 bg-white">
                
                {courseTab === 'data' && (
                  <form id="editCourseForm" onSubmit={handleCourseSubmit} className="max-w-2xl">
                    <h3 className="text-lg font-bold text-[#33275f] mb-6">Información General</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Título</label>
                        <input type="text" required value={editingCourse.title} onChange={(e) => setEditingCourse({...editingCourse, title: e.target.value})} className="w-full px-4 py-2 rounded-xl border focus:border-[#9187BA] focus:ring-1 focus:ring-[#9187BA] outline-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Slug (URL amigable)</label>
                          <input type="text" required value={editingCourse.slug} onChange={(e) => setEditingCourse({...editingCourse, slug: e.target.value})} className="w-full px-4 py-2 rounded-xl border focus:border-[#9187BA] focus:ring-1 focus:ring-[#9187BA] outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo</label>
                          <select value={editingCourse.type} onChange={(e) => setEditingCourse({...editingCourse, type: e.target.value})} className="w-full px-4 py-2 rounded-xl border focus:border-[#9187BA] focus:ring-1 focus:ring-[#9187BA] outline-none bg-white">
                            <option value="Curso">Curso</option>
                            <option value="Taller">Taller</option>
                            <option value="Iniciacion">Iniciación</option>
                            <option value="Activacion">Activación</option>
                            <option value="Retiro">Retiro</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descripción</label>
                        <textarea rows="4" value={editingCourse.description || ''} onChange={(e) => setEditingCourse({...editingCourse, description: e.target.value})} className="w-full px-4 py-2 rounded-xl border focus:border-[#9187BA] focus:ring-1 focus:ring-[#9187BA] outline-none resize-none"></textarea>
                      </div>
                      <div className="flex items-center gap-2 mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <input type="checkbox" id="published" checked={editingCourse.published} onChange={(e) => setEditingCourse({...editingCourse, published: e.target.checked})} className="w-5 h-5 rounded text-[#33275f] focus:ring-[#9187BA] border-gray-300 transition" />
                        <label htmlFor="published" className="text-sm font-bold text-[#33275f] cursor-pointer">Hacer visible (Publicado)</label>
                      </div>
                    </div>
                  </form>
                )}

                {courseTab === 'instances' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-[#33275f]">Eventos e Instancias</h3>
                      <button onClick={() => setIsCreatingInstance(!isCreatingInstance)} className="bg-[#33275f] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#4c3c86] transition">
                        {isCreatingInstance ? 'Cancelar' : '+ Nueva Instancia'}
                      </button>
                    </div>

                    {isCreatingInstance && (
                      <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 mb-6">
                        <h4 className="font-bold text-sm text-[#33275f] mb-3">Crear Nueva Instancia</h4>
                        <form onSubmit={handleCreateInstance} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Fecha de Inicio</label>
                            <input type="datetime-local" required value={newInstanceData.startDate} onChange={(e) => setNewInstanceData({...newInstanceData, startDate: e.target.value})} className="w-full px-3 py-2 rounded-lg border outline-none text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Fecha de Fin (Opcional)</label>
                            <input type="datetime-local" value={newInstanceData.endDate} onChange={(e) => setNewInstanceData({...newInstanceData, endDate: e.target.value})} className="w-full px-3 py-2 rounded-lg border outline-none text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Ubicación / Modalidad</label>
                            <input type="text" placeholder="Ej: Zoom, o Buenos Aires" value={newInstanceData.location} onChange={(e) => setNewInstanceData({...newInstanceData, location: e.target.value})} className="w-full px-3 py-2 rounded-lg border outline-none text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Precio (Opcional)</label>
                            <input type="number" placeholder="Ej: 5000" value={newInstanceData.price} onChange={(e) => setNewInstanceData({...newInstanceData, price: e.target.value})} className="w-full px-3 py-2 rounded-lg border outline-none text-sm" />
                          </div>
                          <div className="md:col-span-2 flex justify-end">
                            <button type="submit" disabled={isSaving} className="bg-[#B681AE] text-white px-6 py-2 rounded-lg font-bold text-sm disabled:opacity-50 hover:bg-[#9187BA] transition">
                              {isSaving ? 'Guardando...' : 'Guardar Instancia'}
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    <div className="space-y-3">
                      {!editingCourse.instances || editingCourse.instances.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-8 bg-gray-50 rounded-xl">No hay instancias programadas para este curso.</p>
                      ) : (
                        editingCourse.instances.map(inst => (
                          <div key={inst.id} className="border border-gray-100 rounded-xl p-4 flex justify-between items-center bg-white shadow-sm hover:border-[#9187BA] transition">
                            <div>
                              <p className="font-bold text-[#33275f]">{new Date(inst.startDate).toLocaleString()}</p>
                              <div className="flex gap-4 text-xs text-gray-500 mt-1">
                                {inst.location && <span>📍 {inst.location}</span>}
                                {inst.price && <span>💰 ${inst.price}</span>}
                              </div>
                            </div>
                            <button onClick={() => handleDeleteInstance(inst.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition" title="Borrar Instancia">
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {courseTab === 'resources' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-[#33275f]">Archivos y Materiales del Curso</h3>
                      
                      {!selectedFile && (
                        <div className="relative">
                          <input 
                            type="file" 
                            ref={resourceInputRef}
                            onChange={handleFileSelect}
                            disabled={isUploading}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                          />
                          <button disabled={isUploading} className="bg-[#B681AE] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#9187BA] transition flex items-center gap-2 disabled:opacity-50">
                            <UploadCloud className="w-4 h-4" />
                            Seleccionar Archivo
                          </button>
                        </div>
                      )}
                    </div>

                    {selectedFile && (
                      <div className="mb-6 p-5 bg-blue-50/50 rounded-xl border border-blue-100">
                        <h4 className="font-bold text-[#33275f] text-sm mb-3">Preparar Subida</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre Público del Archivo</label>
                            <input 
                              type="text" 
                              value={newResourceName} 
                              onChange={(e) => setNewResourceName(e.target.value)}
                              placeholder="Ej: Meditación Guiada Nro 1"
                              className="w-full px-4 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-[#B681AE]"
                              disabled={isUploading}
                            />
                            <p className="text-xs text-gray-400 mt-1">Este nombre servirá para reemplazar archivos viejos y lo verán los alumnos.</p>
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-[#33275f] mb-1">
                              ¿Reemplaza a un archivo anterior? (Opcional)
                            </label>
                            <select 
                              value={overrideResourceId} 
                              onChange={e => setOverrideResourceId(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border outline-none text-sm text-gray-700 bg-white focus:ring-2 focus:ring-[#B681AE]"
                              disabled={isUploading}
                            >
                              <option value="">-- No, es un archivo nuevo --</option>
                              {courses.flatMap(c => (c.resources || []).map(r => ({ ...r, courseName: c.title }))).map(r => (
                                <option key={r.id} value={r.id}>{r.name} ({r.courseName})</option>
                              ))}
                            </select>
                          </div>

                          <div className="flex justify-end gap-3 pt-2">
                            <button 
                              type="button" 
                              onClick={handleCancelFileSelect}
                              disabled={isUploading}
                              className="px-4 py-2 rounded-xl text-gray-600 font-bold hover:bg-gray-200 transition disabled:opacity-50 text-sm"
                            >
                              Cancelar
                            </button>
                            <button 
                              onClick={handleUploadResource}
                              disabled={isUploading || !newResourceName.trim()}
                              className="bg-[#33275f] text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-[#4c3c86] transition flex items-center gap-2 disabled:opacity-50"
                            >
                              <UploadCloud className="w-4 h-4" />
                              {isUploading ? 'Subiendo...' : 'Confirmar y Subir'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      {!editingCourse.resources || editingCourse.resources.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                          No hay archivos subidos. Los audios y PDFs que subas aparecerán aquí y estarán protegidos en la bóveda.
                        </p>
                      ) : (
                        editingCourse.resources.map(res => (
                          <div key={res.id} className="border border-gray-100 rounded-xl p-4 flex justify-between items-center bg-white shadow-sm hover:border-[#9187BA] transition group">
                            <div className="flex-1 min-w-0 pr-4">
                              <p className="font-bold text-[#33275f] truncate">{res.name}</p>
                              <div className="flex gap-4 text-xs text-gray-500 mt-1">
                                <span>📄 {res.type}</span>
                                {res.isDownloadable && <span className="text-green-600 font-bold">Descargable</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => handlePreviewResource(res)} 
                                disabled={previewingId === res.id}
                                className="text-[#9187BA] hover:text-[#33275f] bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 disabled:opacity-50"
                                title="Ver Preview"
                              >
                                {previewingId === res.id ? 'Cargando...' : <><Eye className="w-4 h-4" /> Preview</>}
                              </button>
                              <button onClick={() => handleDeleteResource(res.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition opacity-0 group-hover:opacity-100" title="Borrar Archivo">
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-end shrink-0 rounded-b-2xl">
              <div className="flex gap-3">
                <button type="button" onClick={() => setEditingCourse(null)} className="px-5 py-2.5 rounded-xl text-gray-600 font-bold hover:bg-gray-200 transition">
                  Cerrar
                </button>
                {courseTab === 'data' && (
                  <button 
                    type="submit" 
                    form="editCourseForm"
                    disabled={isSaving} 
                    className="px-6 py-2.5 rounded-xl bg-[#33275f] text-white font-bold hover:bg-[#4c3c86] transition shadow-sm disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSaving ? 'Guardando...' : 'Guardar Datos Base'}
                  </button>
                )}
              </div>
            </div>

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
                    <option value="Curso">Curso</option>
                    <option value="Taller">Taller</option>
                    <option value="Iniciacion">Iniciación</option>
                    <option value="Activacion">Activación</option>
                    <option value="Retiro">Retiro</option>
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
