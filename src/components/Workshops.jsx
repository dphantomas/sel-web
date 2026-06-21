import Link from 'next/link'

export default function Workshops({ lang = 'es' }) {
  const isEn = lang === 'en';

  const t = {
    title: isEn ? 'WORKSHOPS' : 'TALLERES',
    moreInfo: isEn ? 'more info' : 'más info',
    items: [
      {
        id: 'inicio',
        title: isEn ? 'Beginning of Sanación en Luz' : 'Inicio a la Sanación en Luz',
        image: '/assets/taller1-1.jpg',
        text: null,
      },
      {
        id: 'quietud',
        title: isEn ? 'Quietude' : 'Quietud',
        image: '/assets/Conexion.jpeg',
        text: isEn ? (
          <>
            <p className="mb-4"><strong>Quietude is a sacred state of consciousness.</strong></p>
            <p className="mb-4">The state of Quietude occurs when there is no inner movement. It is not just about thoughts and emotions, it happens when preconceptions, stereotypes, the known and the unknown, the dual and the non-dual stop.</p>
            <p className="mb-4">Quietude is the purity of our consciousness, the pure state of our essence.</p>
            <p className="italic">«In the moment of Quietude you experience the deepest [state], the one that makes your molecules become a single vibration where they cannot recognize your physical body from the rest of your bodies. That is the state of connection with the Highest Self and the Absolute Truth.»</p>
          </>
        ) : (
          <>
            <p className="mb-4"><strong>Quietud es un estado de consciencia sagrado.</strong></p>
            <p className="mb-4">El estado de Quietud ocurre cuando no hay movimientos internos. No se trata solo de pensamientos y emociones, sucede cuando los preconceptos, los estereotipos, lo conocido y lo desconocido, lo dual y lo no dual se detiene.</p>
            <p className="mb-4">Quietud es la pureza de nuestra consciencia, el estado puro de nuestra esencia.</p>
            <p className="italic">«En el momento de Quietud experimentas el [estado] más profundo, el que hace que tus moléculas se conviertan en una sola vibración donde no pueden reconocer tu cuerpo físico del resto de tus cuerpos. Ese es el estado de conexión con el Yo más Elevado y la Verdad Absoluta.»</p>
          </>
        )
      },
      {
        id: 'templos',
        title: isEn ? 'Initiation of the Seven Temples' : 'Iniciación de los Siete Templos',
        image: '/assets/taller2.jpg',
        text: isEn ? (
          <>
            <p className="mb-4">This is a major step on the Path of Healing in Light and will be carried out through seven of the <strong>Etheric Temples of the Central Sun</strong>:</p>
            <ul className="list-disc pl-5 mb-4 space-y-1">
              <li>The Temple of <strong>Forgiveness</strong></li>
              <li>The Temple of <strong>Purity</strong></li>
              <li>The Temple of <strong>Light</strong></li>
              <li>The Temple of <strong>Recognition</strong></li>
              <li>The Temple of <strong>Truth</strong></li>
              <li>The Temple of <strong>Healing</strong></li>
              <li>The Temple of <strong>Wisdom</strong></li>
            </ul>
            <p className="mb-4">The <strong>Initiation of the Seven Temples</strong> is an initiatory process that prepares us for the New Time, it is the preparation for a great change in the <strong>Unified Consciousness</strong> in Gaia.</p>
          </>
        ) : (
          <>
            <p className="mb-4">Este es un gran paso en el Camino de la Sanación en Luz y se realizará a través de siete de los <strong>Templos Etéricos del Sol Central</strong>:</p>
            <ul className="list-disc pl-5 mb-4 space-y-1">
              <li>El Templo del <strong>Perdón</strong></li>
              <li>El Templo de la <strong>Pureza</strong></li>
              <li>El Templo de la <strong>Luz</strong></li>
              <li>El Templo del <strong>Reconocimiento</strong></li>
              <li>El Templo de la <strong>Verdad</strong></li>
              <li>El Templo de la <strong>Sanación</strong></li>
              <li>El Templo de la <strong>Sabiduría</strong></li>
            </ul>
            <p className="mb-4">La <strong>Iniciación de los Siete Templos</strong> es un proceso iniciático que nos prepara para el Nuevo Tiempo, es la preparación para un gran cambio en la <strong>Consciencia Unificada</strong> en Gaia.</p>
          </>
        )
      },
      {
        id: 'retiro',
        title: isEn ? 'Initiatory Retreat of Sanación en Luz' : 'Retiro Iniciático de Sanación en Luz',
        image: '/assets/taller3.jpg',
        text: null
      },
      {
        id: 'rocas',
        title: isEn ? 'Initiation workshop with the Rocks of the Origin' : 'Taller de iniciación con las Rocas del Origen',
        image: '/assets/taller9.jpg',
        text: null
      },
      {
        id: 'cristales',
        title: isEn ? 'Connecting with the Master Crystals on the New Earth' : 'Conectando con los Cristales Maestros en la Nueva Tierra',
        image: '/assets/taller8.jpg',
        text: isEn ? (
          <>
            <p className="italic mb-4">«Gaia has been evolving and in its evolution new crystals begin to show themselves and those that already existed in Gaia have also evolved. Some have changed their composition and others have raised their vibration without modifying the composition. Each of them has a purpose in Gaia, but in this time of the Age of Light it will not have a single purpose, because those that only had a certain purpose in the old Earth, in this new time each of them will interact with each soul that summons it and will bring new information, new purposes.»</p>
            <p className="italic">«Each crystal in Gaia has new information for this New Time. Crystals have existed on planet Earth since the origin of the molecules that have given life and the crystals have evolved according to the different times of evolution on the Planet, but they have all been there and could only become visible at certain times. And in the Age of Light it was time for the crystals of the highest vibration to become visible. These crystals have become visible, but they are only activated in the presence of a Master in this new time.»</p>
          </>
        ) : (
          <>
            <p className="italic mb-4">«Gaia ha ido evolucionando y en su evolución nuevos cristales comienzan a mostrarse y los que ya existían en Gaia también han evolucionado. Algunos han cambiado su composición y otros han elevado su vibración sin modificar la composición. Cada uno de ellos tiene un propósito en Gaia, pero en este tiempo de la Era de la Luz no tendrá un único propósito, pues aquellos que sólo tenían un propósito determinado en la vieja Tierra, en este nuevo tiempo cada uno de ellos interactuará con cada alma que lo convoque y traerá nueva información, nuevos propósitos.»</p>
            <p className="italic">«Cada cristal en Gaia tiene nueva información para este Nuevo Tiempo. Los cristales existen en el planeta Tierra desde el origen de las moléculas que han dado vida y los cristales han ido evolucionando según los diferentes tiempos de evolución en el Planeta, pero todos han estado allí y sólo podían hacerse visibles en determinados momentos. Y en la Era de la Luz era el tiempo para que los cristales de más elevada vibración se hagan visibles. Estos cristales se han visibilizado, pero sólo se activan ante la presencia de un Maestro en este nuevo tiempo.»</p>
          </>
        )
      },
      {
        id: 'humano',
        title: isEn ? 'Initiation Retreat to the New Human' : 'Retiro de iniciación al Nuevo Humano',
        image: '/assets/taller7.jpg',
        text: null
      }
    ]
  };

  return (
    <section id="talleres" className="w-full">
      {/* Header section identical to other pages */}
      <div
        className="section-header-bg flex flex-col items-center justify-end"
        style={{ minHeight: '190px', paddingBottom: '30px' }}
      >
        <h2 className="text-white text-[28px] md:text-[34px] tracking-[5px] md:tracking-[10px] font-light uppercase text-center mb-6 pl-[5px] md:pl-[10px]">
          {t.title}
        </h2>
        <img
          src="/assets/flecha.png"
          alt=""
          className="w-[50px] h-auto"
        />
      </div>

      {/* Main content area with parallax background */}
      <div 
        className="relative py-16 md:py-24 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/assets/fondo-quienes.jpg')" }}
      >
        {/* Semi-transparent overlay to ensure readability if needed, original was fairly dark though, but let's keep it close to original */}
        <div className="absolute inset-0 bg-white/10"></div> 

        <div className="relative max-w-5xl mx-auto px-4 md:px-6">
          <div className="space-y-20 md:space-y-24">
            {t.items.map((item) => (
              <div key={item.id} className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-16">
                
                {/* Left Side: Image and Button */}
                <div className="w-full md:w-2/5 flex flex-col items-center">
                  <div className="shadow-[4px_4px_12px_rgba(0,0,0,0.3)] overflow-hidden w-full max-w-[350px]">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-auto object-cover hover:scale-95 transition-transform duration-500 ease-in-out cursor-pointer"
                    />
                  </div>
                  <Link
                    href={lang === 'en' ? "/en/contact" : "/contacto"}
                    className="mt-6 inline-block bg-[#9187BA] hover:bg-[#B681AE] text-white text-[14px] font-bold py-2 px-6 rounded-[10px] transition-colors"
                  >
                    {t.moreInfo}
                  </Link>
                </div>

                {/* Right Side: Title and Text */}
                <div className="w-full md:w-3/5 text-center md:text-left">
                  <h2 className="text-[24px] md:text-[30px] leading-[1.2] text-[#33275f] font-bold mb-6">
                    {item.title}
                  </h2>
                  <div className="mb-6 flex justify-center md:justify-start">
                    <img src="/assets/flecha-blanca.png" alt="" className="w-[40px] opacity-80" />
                  </div>
                  {item.text && (
                    <div className="text-[#666] text-[15px] leading-[1.7em] text-left">
                      {item.text}
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
