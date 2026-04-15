import React, { useEffect, useState } from 'react';
import { getServices } from '../firebase/db';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const allReviewsDatabase = [
    { name: "Carlos M.", text: "El mejor fade de toda la ciudad. El trato es 10/10.", stars: 5, avatar: "https://i.pravatar.cc/150?u=carlosm" },
    { name: "David G.", text: "Excelente experiencia, muy profesionales y puntuales con la cita.", stars: 5, avatar: "https://i.pravatar.cc/150?u=davidg" },
    { name: "Jorge P.", text: "Corte impecable, ambiente brutal y música increíble. Volveré.", stars: 5, avatar: "https://i.pravatar.cc/150?u=jorgep" },
    { name: "Alex R.", text: "Por fin encontré un barbero que sabe arreglarme la barba exactamente como quiero.", stars: 5, avatar: "https://i.pravatar.cc/150?u=alexr" },
    { name: "Miguel S.", text: "Rápidos, limpios y detallistas. Se nota cuando a alguien le gusta su trabajo.", stars: 5, avatar: "https://i.pravatar.cc/150?u=miguels" },
    { name: "Luis F.", text: "Me hice un cambio de color y me dejaron espectacular. Recomendado al 100%.", stars: 5, avatar: "https://i.pravatar.cc/150?u=luisf" },
    { name: "Andrés V.", text: "El Ritual de Barba es otro nivel, súper relajante con toalla caliente. ¡Un lujo!", stars: 5, avatar: "https://i.pravatar.cc/150?u=andresv" },
    { name: "Javi L.", text: "Súper buen rollo en el local. Salí con el mejor mullet que te puedas imaginar.", stars: 5, avatar: "https://i.pravatar.cc/150?u=javil" },
    { name: "Oscar D.", text: "Puntualidad estricta. Ni esperé 2 minutos en el sofá antes de sentarme.", stars: 5, avatar: "https://i.pravatar.cc/150?u=oscard" },
    { name: "Iván T.", text: "Gran asesoramiento. No sabía qué hacerme, me sugirieron un estilo texturizado y acertaron.", stars: 5, avatar: "https://i.pravatar.cc/150?u=ivant" },
    { name: "Raúl C.", text: "Llevo a mi hijo pequeño y tienen muchísima paciencia con él. El niño sale feliz.", stars: 5, avatar: "https://i.pravatar.cc/150?u=raulc" },
    { name: "Dani M.", text: "Servicio de peluquería premium. Te lavan el pelo, asesoran y te invitan a un café.", stars: 5, avatar: "https://i.pravatar.cc/150?u=danim" }
  ];

  // Estados de reseñas
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', text: '' });

  useEffect(() => {
    // Escoger 6 reseñas aleatorias cada vez que alguien entra a la página web
    const shuffled = [...allReviewsDatabase].sort(() => 0.5 - Math.random());
    setReviews(shuffled.slice(0, 6));
  }, []);

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if(newReview.name && newReview.text) {
      setReviews([{ ...newReview, stars: 5, avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)+1}` }, ...reviews]);
      setShowReviewForm(false);
      setNewReview({ name: '', text: '' });
    }
  };

  useEffect(() => {
    getServices().then(data => {
      setServices(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="animate-fade-in pb-24">
      {/* Hero Rediseñado según la captura */}
      <section className="px-6 py-20 text-center flex flex-col items-center justify-center min-h-[60vh]">
        <div className="mb-4">
           <span className="text-yellow-500 text-xl">✂</span>
           <div className="h-[1px] w-12 bg-yellow-500 mx-auto mt-2"></div>
        </div>
        <h2 className="text-5xl font-black mb-4 tracking-tighter uppercase text-white drop-shadow-lg">
          Modern <span className="text-[#eab308] italic">Barber</span>
        </h2>
        <p className="text-gray-300 text-sm max-w-sm mx-auto mb-10">
          Donde la tradición se encuentra con la vanguardia. Experiencia premium diseñada para el hombre moderno.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button onClick={() => navigate('/booking')} className="bg-[#eab308] text-black font-bold py-3 px-8 rounded-full shadow-lg hover:scale-105 transition-transform uppercase text-sm tracking-wide">
            📅 Agendar Cita
          </button>
        </div>
      </section>

      {/* Catálogo de Servicios */}
      <section className="px-6 mt-10">
        <h3 className="text-xl font-bold mb-6 text-white uppercase tracking-wider border-l-4 border-[#eab308] pl-3">Nuestros Servicios</h3>

        {loading ? (
          <div className="flex justify-center py-10"><div className="animate-spin h-8 w-8 border-4 border-[#eab308] border-t-transparent rounded-full"></div></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div key={service.id} className="bg-black/60 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-gray-800 flex items-center justify-between transition-transform hover:scale-[1.02]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border border-gray-700 flex items-center justify-center text-2xl bg-black/50">
                    {service.image}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white uppercase tracking-wide text-sm">{service.name}</h4>
                    <p className="text-xs text-gray-400 mt-1">{service.duration} mins</p>
                  </div>
                </div>
                <div className="font-bold text-lg text-[#eab308]">
                  {service.price}€
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Galería de Trabajos (Imágenes) */}
      <section className="px-6 mt-16">
        <h3 className="text-xl font-bold mb-6 text-white uppercase tracking-wider border-l-4 border-[#eab308] pl-3">Últimos Estilos</h3>
        <p className="text-gray-400 text-sm mb-6">Un vistazo a los cortes en tendencia desde nuestra silla.</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
            "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
            "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
            "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
          ].map((imgUrl, idx) => (
            <div key={idx} className="relative rounded-2xl overflow-hidden aspect-square bg-gray-900 border border-gray-800 transition-transform hover:scale-[1.03]">
               <img src={imgUrl} alt={`Corte ${idx+1}`} className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-500" />
            </div>
          ))}
        </div>
      </section>

      {/* Reseñas (Reviews) */}
      <section className="px-6 mt-16">
        <h3 className="text-xl font-bold mb-6 text-white uppercase tracking-wider border-l-4 border-[#eab308] pl-3">Lo que dicen de nosotros</h3>
        
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-6 scrollbar-hide -mx-6 px-6">
          {reviews.map((review, i) => (
             <div key={i} className="min-w-[85%] sm:min-w-[45%] snap-center bg-black p-5 rounded-2xl border border-gray-800 shadow-xl flex flex-col justify-between transition-transform hover:scale-[1.02] shrink-0 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 text-[#eab308] opacity-10 text-6xl font-serif">"</div>
               <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <img src={review.avatar} alt={review.name} className="w-12 h-12 rounded-full border-2 border-[#eab308]/50 p-0.5 object-cover" />
                    <div>
                      <p className="text-sm text-white font-bold tracking-wide">{review.name}</p>
                      <div className="flex text-[#eab308] text-[10px] mt-0.5">{'★'.repeat(review.stars)}</div>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm italic font-medium leading-relaxed">"{review.text}"</p>
               </div>
             </div>
          ))}
        </div>

        {!showReviewForm ? (
          <button onClick={() => setShowReviewForm(true)} className="mt-4 text-[#eab308] text-sm uppercase font-bold hover:underline">
            + Escribir una reseña
          </button>
        ) : (
          <form onSubmit={handleReviewSubmit} className="mt-6 bg-black/80 backdrop-blur-md p-4 rounded-2xl border border-gray-700 animate-fade-in">
            <h4 className="text-white font-bold text-sm mb-3">Tu experiencia</h4>
            <input 
              type="text" required placeholder="Tu Nombre Oculto" value={newReview.name} onChange={e => setNewReview({...newReview, name: e.target.value})}
              className="w-full bg-gray-900 text-white border border-gray-700 rounded-xl p-2 mb-3 text-sm focus:border-[#eab308] outline-none" 
            />
            <textarea 
              required placeholder="¡Me encantó el servicio!..." value={newReview.text} onChange={e => setNewReview({...newReview, text: e.target.value})}
              className="w-full bg-gray-900 text-white border border-gray-700 rounded-xl p-2 text-sm focus:border-[#eab308] outline-none h-20 resize-none" 
            ></textarea>
            <div className="flex justify-end gap-3 mt-3">
              <button type="button" onClick={() => setShowReviewForm(false)} className="text-gray-400 text-sm">Cancelar</button>
              <button type="submit" className="bg-[#eab308] text-black font-bold py-1.5 px-4 rounded-lg text-sm">Publicar</button>
            </div>
          </form>
        )}
      </section>

      {/* Ubicación */}
      <section className="px-6 mt-16">
        <h3 className="text-xl font-bold mb-6 text-white uppercase tracking-wider border-l-4 border-[#eab308] pl-3">Nuestra Ubicación</h3>
        <div className="bg-black/60 backdrop-blur-md p-1 rounded-2xl border border-gray-800 overflow-hidden">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12148.167888741366!2d-3.7037902!3d40.4167754!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd422997800a3c81%3A0xc436dec1618c2269!2sMadrid!5e0!3m2!1ses!2ses!4v1700000000000!5m2!1ses!2ses" 
            width="100%" 
            height="250" 
            style={{ border: 0, borderRadius: '1rem' }} 
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade">
          </iframe>
        </div>
        <p className="text-gray-400 text-sm mt-4 text-center">Calle Mayor 12, Local 4, Centro, Madrid</p>
      </section>

    </div>
  );
}
