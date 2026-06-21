'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import testimonialsData from '../../content/testimonios.json'

export default function Testimonials({ lang = 'es' }) {
  const testimonials = lang === 'en' ? testimonialsData.en : testimonialsData.es

  return (
    <section id="testimonios" className="bg-[#fcfbfe] pb-24">
      {/* Section header */}
      <div
        className="section-header-bg flex flex-col items-center justify-center"
        style={{ minHeight: '160px', paddingTop: '60px', paddingBottom: '20px' }}
      >
        <h2 className="text-white text-[28px] md:text-[34px] tracking-[5px] md:tracking-[10px] font-light text-center pl-[5px] md:pl-[10px]">
          {lang === 'en' ? 'Testimonials' : 'Testimonios'}
        </h2>
      </div>

      {/* Main content area with parallax background */}
      <div 
        className="relative pt-8 pb-16 md:pt-10 md:pb-24 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/assets/fondo-quienes.jpg')" }}
      >
        {/* Semi-transparent overlay to ensure readability */}
        <div className="absolute inset-0 bg-white/10"></div> 

        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 md:px-6">
          {/* Arrow ornament */}
          <div className="text-center mb-16">
            <img
              src="/assets/flecha2.png"
              alt=""
              style={{ width: '60px', height: 'auto', margin: '0 auto' }}
            />
          </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative border border-[#e3e1e8]"
            >
              {/* Quote mark background */}
              <div
                className="absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#f9f7fc' }}
                aria-hidden="true"
              >
                <span style={{ color: '#9187ba', fontSize: '22px', fontFamily: 'Georgia, serif', lineHeight: 1 }}>"</span>
              </div>

              {/* Text */}
              <p
                style={{
                  fontFamily: "'Lato', Helvetica, Arial, Lucida, sans-serif",
                  fontStyle: 'italic',
                  fontSize: '16px',
                  color: '#555',
                  lineHeight: '1.7em',
                  marginBottom: '24px',
                  marginTop: '16px',
                  padding: '0 10px',
                }}
              >
                {t.text}
              </p>

              {/* Author */}
              <p
                style={{
                  fontFamily: "'Lato', Helvetica, Arial, Lucida, sans-serif",
                  fontWeight: 'bold',
                  fontSize: '15px',
                  color: '#b085b3',
                  textAlign: 'right',
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
              >
                — {t.author}
              </p>
            </div>
          ))}
        </div>
        </div>
      </div>
    </section>
  )
}
