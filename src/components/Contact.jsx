'use client'

import { useState } from 'react'

export default function Contact({ lang = 'es' }) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    redSocial: '',
    mensaje: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Open WhatsApp with the message content
    const msg = encodeURIComponent(
      lang === 'en'
        ? `Hello! I'm contacting you from the website.\n\nName: ${formData.nombre} ${formData.apellido}\nEmail: ${formData.email}\nPhone: ${formData.telefono}\nSocial: ${formData.redSocial}\n\nMessage: ${formData.mensaje}`
        : `Hola! Me contacto desde el sitio web.\n\nNombre: ${formData.nombre} ${formData.apellido}\nEmail: ${formData.email}\nTeléfono: ${formData.telefono}\nRed Social: ${formData.redSocial}\n\nMensaje: ${formData.mensaje}`
    )
    window.open(`https://api.whatsapp.com/send/?phone=5491141771120&text=${msg}`, '_blank')
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 5000)
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #bbb',
    fontFamily: "'Open Sans', sans-serif",
    fontSize: '14px',
    color: '#4e4e4e',
    backgroundColor: '#fff',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  }

  const labelStyle = {
    display: 'block',
    fontFamily: "'Open Sans', sans-serif",
    fontSize: '13px',
    fontWeight: '600',
    color: '#33275f',
    marginBottom: '6px',
  }

  return (
    <section id="contacto" className="pb-16" style={{ background: 'linear-gradient(90deg, #d4aeea 0%, #fefdff 100%)' }}>

      {/* Section header */}
      <div
        className="section-header-bg flex flex-col items-center justify-center"
        style={{ minHeight: '160px', paddingTop: '60px', paddingBottom: '20px' }}
      >
        <h2 className="text-white text-[28px] md:text-[34px] tracking-[5px] md:tracking-[10px] font-light text-center pl-[5px] md:pl-[10px]">
          {lang === 'en' ? 'Contact Us' : 'Contacto'}
        </h2>
      </div>

      {/* Main content area with parallax background */}
      <div 
        className="relative pt-8 pb-16 md:pt-10 md:pb-24 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/assets/fondo-quienes.jpg')" }}
      >
        <div className="absolute inset-0 bg-white/10"></div> 

        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 md:px-6">
          {/* Arrow ornament */}
          <div className="text-center mb-16">
            <img
              src="/assets/flecha2.png"
              alt=""
              style={{ width: '60px', height: 'auto', margin: '0 auto' }}
            />
          </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

          {/* Contact info */}
          <div>
            <h3
              style={{
                fontFamily: "'Lato', Helvetica, Arial, Lucida, sans-serif",
                fontSize: '24px',
                color: '#33275f',
                fontWeight: 700,
                marginBottom: '24px',
              }}
            >
              {lang === 'en' ? 'Get in touch' : 'Ponete en contacto'}
            </h3>
            <p
              style={{
                fontFamily: "'Open Sans', sans-serif",
                fontSize: '15px',
                color: '#555',
                lineHeight: '1.7em',
                marginBottom: '32px',
              }}
            >
              {lang === 'en'
                ? 'We are here to accompany you in your process. Write to us via WhatsApp, email, or social media and we will gladly answer your questions.'
                : 'Estamos aquí para acompañarte en tu proceso. Escribínos por WhatsApp, email o redes sociales y con gusto respondemos tus consultas.'}
            </p>

            {/* Contact items */}
            <div className="space-y-5">
              <a
                href="https://api.whatsapp.com/send/?phone=5491141771120"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 group"
                style={{ textDecoration: 'none' }}
              >
                <img
                  src="/assets/wapp.png"
                  alt="WhatsApp"
                  className="w-10 h-10 object-contain transition-transform group-hover:scale-110"
                />
                <div>
                  <p style={{ fontFamily: "'Open Sans', sans-serif", fontSize: '12px', color: '#9187ba', marginBottom: '2px' }}>WhatsApp</p>
                  <p style={{ fontFamily: "'Lato', sans-serif", fontSize: '16px', color: '#33275f', fontWeight: 700 }}>+54 911 4177-1120</p>
                </div>
              </a>

              <a
                href="mailto:contacto@sanacionenluz.com"
                className="flex items-center gap-4 group"
                style={{ textDecoration: 'none' }}
              >
                <img
                  src="/assets/mail.png"
                  alt="Email"
                  className="w-10 h-10 object-contain transition-transform group-hover:scale-110"
                />
                <div>
                  <p style={{ fontFamily: "'Open Sans', sans-serif", fontSize: '12px', color: '#9187ba', marginBottom: '2px' }}>Email</p>
                  <p style={{ fontFamily: "'Lato', sans-serif", fontSize: '15px', color: '#33275f', fontWeight: 700 }}>contacto@sanacionenluz.com</p>
                </div>
              </a>

              <a
                href="https://www.instagram.com/sanacion_en_luz"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 group"
                style={{ textDecoration: 'none' }}
              >
                <img
                  src="/assets/ig.png"
                  alt="Instagram"
                  className="w-10 h-10 object-contain transition-transform group-hover:scale-110"
                />
                <div>
                  <p style={{ fontFamily: "'Open Sans', sans-serif", fontSize: '12px', color: '#9187ba', marginBottom: '2px' }}>Instagram</p>
                  <p style={{ fontFamily: "'Lato', sans-serif", fontSize: '15px', color: '#33275f', fontWeight: 700 }}>@sanacion_en_luz</p>
                </div>
              </a>

              <a
                href="https://www.facebook.com/sanacionenluz.2020"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 group"
                style={{ textDecoration: 'none' }}
              >
                <img
                  src="/assets/face.png"
                  alt="Facebook"
                  className="w-10 h-10 object-contain transition-transform group-hover:scale-110"
                />
                <div>
                  <p style={{ fontFamily: "'Open Sans', sans-serif", fontSize: '12px', color: '#9187ba', marginBottom: '2px' }}>Facebook</p>
                  <p style={{ fontFamily: "'Lato', sans-serif", fontSize: '15px', color: '#33275f', fontWeight: 700 }}>sanacionenluz.2020</p>
                </div>
              </a>
            </div>
          </div>

          {/* Contact form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-nombre" style={labelStyle}>{lang === 'en' ? 'First Name *' : 'Nombre *'}</label>
                  <input
                    id="contact-nombre"
                    type="text"
                    name="nombre"
                    required
                    value={formData.nombre}
                    onChange={handleChange}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#33275f'}
                    onBlur={e => e.target.style.borderColor = '#bbb'}
                  />
                </div>
                <div>
                  <label htmlFor="contact-apellido" style={labelStyle}>{lang === 'en' ? 'Last Name *' : 'Apellido *'}</label>
                  <input
                    id="contact-apellido"
                    type="text"
                    name="apellido"
                    required
                    value={formData.apellido}
                    onChange={handleChange}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#33275f'}
                    onBlur={e => e.target.style.borderColor = '#bbb'}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-email" style={labelStyle}>{lang === 'en' ? 'Email *' : 'Correo electrónico *'}</label>
                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#33275f'}
                  onBlur={e => e.target.style.borderColor = '#bbb'}
                />
              </div>

              <div>
                <label htmlFor="contact-telefono" style={labelStyle}>{lang === 'en' ? 'Phone' : 'Teléfono'}</label>
                <input
                  id="contact-telefono"
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#33275f'}
                  onBlur={e => e.target.style.borderColor = '#bbb'}
                />
              </div>

              <div>
                <label htmlFor="contact-red" style={labelStyle}>{lang === 'en' ? 'Social network (username)' : 'Red social (usuario)'}</label>
                <input
                  id="contact-red"
                  type="text"
                  name="redSocial"
                  placeholder="@tuusuario"
                  value={formData.redSocial}
                  onChange={handleChange}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#33275f'}
                  onBlur={e => e.target.style.borderColor = '#bbb'}
                />
              </div>

              <div>
                <label htmlFor="contact-mensaje" style={labelStyle}>{lang === 'en' ? 'Message *' : 'Mensaje *'}</label>
                <textarea
                  id="contact-mensaje"
                  name="mensaje"
                  required
                  rows={5}
                  value={formData.mensaje}
                  onChange={handleChange}
                  style={{ ...inputStyle, resize: 'vertical', padding: '10px 12px' }}
                  onFocus={e => e.target.style.borderColor = '#33275f'}
                  onBlur={e => e.target.style.borderColor = '#bbb'}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 font-semibold transition-all duration-200 hover:opacity-90 cursor-pointer"
                style={{
                  backgroundColor: '#33275f',
                  color: '#fff',
                  fontFamily: "'Lato', sans-serif",
                  fontSize: '15px',
                  border: 'none',
                  letterSpacing: '1px',
                }}
              >
                {submitted
                  ? (lang === 'en' ? 'Message sent! ✓' : '¡Mensaje enviado! ✓')
                  : (lang === 'en' ? 'Send message' : 'Enviar mensaje')}
              </button>

              <p style={{ fontFamily: "'Open Sans', sans-serif", fontSize: '12px', color: '#9187ba', textAlign: 'center' }}>
                {lang === 'en'
                  ? 'By submitting, WhatsApp will open with your message ready to send.'
                  : 'Al enviar, se abrirá WhatsApp con tu mensaje listo para enviar.'}
              </p>
            </form>
          </div>
        </div>
        </div>
      </div>
    </section>
  )
}
