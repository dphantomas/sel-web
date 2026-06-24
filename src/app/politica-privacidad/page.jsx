export const metadata = {
  title: 'Política de Privacidad | Sanación en Luz',
  description: 'Política de Privacidad y uso de Cookies'
}

export default function PoliticaPrivacidad() {
  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-16 px-4 md:px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-8 md:p-12 text-gray-700 leading-relaxed">
        <h1 className="text-3xl font-bold text-[#33275f] mb-8">Política de Privacidad y Cookies</h1>
        
        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-bold text-[#33275f] mb-3">1. Uso de Cookies</h2>
            <p>
              Nuestra plataforma utiliza cookies técnicas estrictamente necesarias para su funcionamiento. Estas cookies nos permiten mantener tu sesión iniciada de forma segura una vez que te has identificado con tu correo y contraseña o mediante tu cuenta de Google. Sin estas cookies, no sería posible acceder al área privada de alumnos ni a los recursos.
            </p>
            <p className="mt-2">
              Eventualmente, podríamos utilizar herramientas de análisis (como Google Analytics) para comprender mejor cómo interactúan los usuarios con nuestra plataforma y así mejorar su experiencia. En caso de implementar cookies con fines analíticos o de seguimiento que no sean estrictamente necesarias, se solicitará tu consentimiento explícito.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#33275f] mb-3">2. Datos Personales Recopilados</h2>
            <p>
              Al registrarte en Sanación en Luz, recopilamos los datos básicos necesarios para crear y gestionar tu cuenta: nombre, apellido, dirección de correo electrónico y foto de perfil (si te registras a través de Google). Estos datos son utilizados exclusivamente para la gestión de tus cursos, inscripciones y para mantenerte informado sobre novedades relacionadas a la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#33275f] mb-3">3. Registro mediante Google</h2>
            <p>
              Si decides registrarte o iniciar sesión utilizando tu cuenta de Google, recibiremos de manera segura tu nombre, correo electrónico y foto de perfil pública para agilizar la creación de tu cuenta. No tenemos acceso a tus contraseñas de Google ni a otros datos privados de tu cuenta.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#33275f] mb-3">4. Protección de Datos</h2>
            <p>
              Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos personales contra accesos no autorizados, pérdida o alteración. Tus datos no serán vendidos ni compartidos con terceros con fines comerciales o publicitarios.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#33275f] mb-3">5. Derechos del Usuario</h2>
            <p>
              Tienes el derecho de acceder, rectificar o solicitar la eliminación de tus datos personales de nuestra plataforma en cualquier momento. Si deseas ejercer estos derechos o tienes alguna duda sobre nuestra política, puedes contactarnos a <strong>contacto@sanacionenluz.com</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
