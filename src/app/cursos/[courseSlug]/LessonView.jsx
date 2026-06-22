'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LessonView({ lesson, initialCompleted, nextLesson, courseSlug }) {
  const router = useRouter()
  const [completed, setCompleted] = useState(initialCompleted)
  const [loading, setLoading] = useState(false)

  // Reset completion state when switching lessons
  useEffect(() => {
    setCompleted(initialCompleted)
  }, [lesson.id, initialCompleted])

  const toggleCompletion = async () => {
    setLoading(true)
    const newCompleted = !completed

    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          lessonId: lesson.id,
          completed: newCompleted
        })
      })

      if (!response.ok) {
        throw new Error('Error al actualizar el progreso.')
      }

      setCompleted(newCompleted)
      router.refresh() // Refresca los datos del servidor (como el menú de lecciones completadas)
    } catch (error) {
      console.error(error)
      alert(error.message || 'No se pudo actualizar el progreso.')
    } finally {
      setLoading(false)
    }
  }

  // Helper para generar el embed a partir de una URL de YouTube o Vimeo
  const getVideoEmbedUrl = (url) => {
    if (!url) return null

    // YouTube
    const ytRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const ytMatch = url.match(ytRegExp)
    if (ytMatch && ytMatch[2].length === 11) {
      return `https://www.youtube.com/embed/${ytMatch[2]}`
    }

    // Vimeo
    const vimeoRegExp = /vimeo\.com\/(?:video\/)?([0-9]+)/
    const vimeoMatch = url.match(vimeoRegExp)
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`
    }

    return url // fallback
  }

  const embedUrl = getVideoEmbedUrl(lesson.videoUrl)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Video Container */}
      {embedUrl && (
        <div className="relative aspect-video w-full bg-black">
          <iframe
            src={embedUrl}
            title={lesson.title}
            className="absolute top-0 left-0 w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>
      )}

      {/* Lesson Content Area */}
      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6 mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#33275f]">
              {lesson.title}
            </h1>
          </div>
          
          <button
            onClick={toggleCompletion}
            disabled={loading}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 border ${
              completed
                ? 'bg-green-500 border-green-500 text-white hover:bg-green-600'
                : 'bg-white border-[#9187BA] text-[#33275f] hover:bg-[#9187BA]/5'
            } disabled:opacity-50`}
          >
            <span className="text-base">{completed ? '✓' : '○'}</span>
            {completed ? 'Clase Completada' : 'Marcar como Completada'}
          </button>
        </div>

        {/* Lesson Description/Content */}
        {lesson.content ? (
          <div className="prose max-w-none text-[#666] text-[15px] leading-relaxed mb-8">
            <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
          </div>
        ) : (
          <p className="text-gray-500 italic mb-8">No hay contenido de lectura provisto para esta clase.</p>
        )}

        {/* Footer Navigation */}
        {nextLesson && (
          <div className="flex justify-end pt-6 border-t border-gray-100">
            <button
              onClick={() => router.push(`/cursos/${courseSlug}?lesson=${nextLesson.slug}`)}
              className="flex items-center gap-2 bg-[#33275f] hover:bg-[#4c3c86] text-white text-sm font-bold py-3 px-6 rounded-xl transition duration-300"
            >
              Siguiente Clase
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
