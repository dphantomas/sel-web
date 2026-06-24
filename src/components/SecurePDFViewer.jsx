'use client'

import React, { useState, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Configurar el worker de pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

export default function SecurePDFViewer({ url }) {
  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [loading, setLoading] = useState(true)

  // Prevenir menú contextual en todo el componente
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault()
    document.addEventListener('contextmenu', handleContextMenu)
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [])

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages)
    setLoading(false)
  }

  function changePage(offset) {
    setPageNumber(prevPageNumber => prevPageNumber + offset)
  }

  function previousPage() {
    changePage(-1)
  }

  function nextPage() {
    changePage(1)
  }

  if (!url) return <p className="text-center text-gray-500 animate-pulse py-10">Cargando documento...</p>

  return (
    <div className="flex flex-col items-center bg-gray-50 p-4 md:p-8 rounded-2xl border border-gray-200 w-full max-w-4xl mx-auto select-none">
      
      {/* Controles superiores */}
      <div className="flex items-center justify-end w-full mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        {numPages && (
          <div className="flex items-center gap-4">
            <button
              type="button"
              disabled={pageNumber <= 1}
              onClick={previousPage}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 font-medium transition-colors"
            >
              Anterior
            </button>
            <p className="text-sm text-gray-600 font-medium">
              Página {pageNumber || (numPages ? 1 : '--')} de {numPages || '--'}
            </p>
            <button
              type="button"
              disabled={pageNumber >= numPages}
              onClick={nextPage}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 font-medium transition-colors"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {/* Renderizador de PDF */}
      <div 
        className="w-full flex justify-center bg-white shadow-lg overflow-x-auto min-h-[600px] relative pointer-events-none"
        style={{ pointerEvents: 'none' /* Evita interactuar directamente con el canvas/texto si no es necesario */ }}
      >
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<div className="flex h-full items-center justify-center p-20"><p className="text-gray-500 animate-pulse">Procesando PDF...</p></div>}
          error={<p className="text-red-500 p-10">Error al cargar el documento PDF.</p>}
        >
          <Page 
            pageNumber={pageNumber} 
            renderTextLayer={false} 
            renderAnnotationLayer={false}
            width={Math.min(window.innerWidth * 0.9, 800)} // Responsive width max 800px
          />
        </Document>
      </div>

      {/* Controles inferiores (para móviles) */}
      <div className="flex md:hidden items-center justify-center gap-4 w-full mt-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <button
          type="button"
          disabled={pageNumber <= 1}
          onClick={previousPage}
          className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        <p className="text-sm text-gray-600 font-medium">
          {pageNumber} / {numPages}
        </p>
        <button
          type="button"
          disabled={pageNumber >= numPages}
          onClick={nextPage}
          className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
        </button>
      </div>

    </div>
  )
}
