import React, { useState, useEffect } from 'react';
import { bookAppointment, getServices, getUserData, saveAnonymousClient, getAvailableHours } from '../firebase/db';
import { useAuth } from '../contexts/AuthContext';

export default function Booking() {
  const { user } = useAuth();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [service, setService] = useState('');
  const [servicesList, setServicesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [availableHours, setAvailableHours] = useState([]);
  const [loadingHours, setLoadingHours] = useState(false);

  useEffect(() => {
    getServices().then(data => {
      setServicesList(data);
      if(data.length > 0) setService(data[0].id);
      
      if (user && user.uid) {
         getUserData(user.uid).then(uData => {
            if (uData) {
               setClientName(uData.name || '');
               setClientPhone(uData.phone || '');
            }
            setLoading(false);
         });
      } else {
         setLoading(false);
      }
    });
  }, [user]);

  useEffect(() => {
    if (date) {
      setLoadingHours(true);
      setTime('');
      getAvailableHours(date).then(hours => {
        setAvailableHours(hours);
        setLoadingHours(false);
      });
    }
  }, [date]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !time || !service || !clientName || !clientPhone) return;
    
    setLoading(true);
    const selectedSvc = servicesList.find(s => s.id === service);
    const result = await bookAppointment({ 
      date, 
      time, 
      serviceId: selectedSvc.id, 
      serviceName: selectedSvc.name, 
      userId: user ? user.uid : 'anonymous',
      userEmail: user ? user.email : 'No Registrado',
      clientName,
      clientPhone
    });
    
    if (!user) {
      await saveAnonymousClient(clientName, clientPhone);
    }
    
    if (result.success) {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="px-6 py-20 text-center animate-fade-in">
        <div className="w-20 h-20 bg-green-900/30 text-green-500 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto text-4xl mb-6">
          ✓
        </div>
        <h2 className="text-2xl font-black uppercase tracking-wider mb-2 text-white">¡Cita Confirmada!</h2>
        <p className="text-gray-400 mb-8">La cita ha sido agendada en nuestro sistema. Te esperamos puntualmente.</p>
        <button onClick={() => window.location.href='/'} className="bg-[#eab308] text-black px-8 py-3 rounded-xl font-black uppercase tracking-widest hover:scale-105 transition-transform">
          Volver al Inicio
        </button>
      </div>
    );
  }

  return (
    <div className="px-6 py-10 animate-fade-in pb-24">
      <h2 className="text-2xl font-black mb-6 text-white uppercase tracking-wide">Reserva tu cita</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Selector de Servicio */}
        <div className="bg-[#111] border border-gray-800 p-5 rounded-2xl shadow-sm">
          <label className="block text-sm font-black mb-4 text-[#eab308] uppercase tracking-wider">¿Qué te hacemos?</label>
          {loading ? (
             <div className="animate-pulse h-10 bg-gray-800 rounded-xl w-full"></div>
          ) : (
             <div className="flex flex-col gap-3">
               {servicesList.map(svc => (
                 <label key={svc.id} className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${service === svc.id ? 'bg-[#eab308]/10 border-[#eab308]' : 'bg-black border-gray-800 hover:border-gray-600'}`}>
                   <div className="flex items-center gap-3">
                     <input type="radio" name="service" value={svc.id} checked={service === svc.id} onChange={(e) => setService(e.target.value)} className="hidden" />
                     <span className="text-2xl">{svc.image}</span>
                     <span className="text-white font-semibold text-sm">{svc.name}</span>
                   </div>
                   <span className="text-[#eab308] font-bold">{svc.price}€</span>
                 </label>
               ))}
             </div>
          )}
        </div>

        {/* Selector de Fecha */}
        <div className="bg-[#111] border border-gray-800 p-5 rounded-2xl shadow-sm">
          <label className="block text-sm font-black mb-3 text-[#eab308] uppercase tracking-wider">¿Qué día prefieres?</label>
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
            className="w-full bg-black text-white border border-gray-800 rounded-xl p-4 focus:ring-2 focus:ring-[#eab308] outline-none"
            style={{ colorScheme: 'dark' }}
            required
            min={new Date().toISOString().split("T")[0]}
          />
        </div>

        {/* Selector de Hora */}
        {date && (
          <div className="bg-[#111] border border-gray-800 p-5 rounded-2xl shadow-sm animate-fade-in">
            <label className="block text-sm font-black mb-3 text-[#eab308] uppercase tracking-wider">Horas disponibles</label>
            {loadingHours ? (
              <div className="text-gray-500 text-sm animate-pulse flex items-center gap-2">
                 <div className="animate-spin h-4 w-4 border-2 border-[#eab308] border-t-transparent rounded-full"></div>
                 Consultando disponibilidad...
              </div>
            ) : availableHours.length === 0 ? (
              <p className="text-red-500 text-sm font-bold bg-red-900/20 p-3 rounded-lg border border-red-900/50">Lo sentimos, no hay sillas libres este día. Por favor, elige otro.</p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {availableHours.map(h => (
                  <button 
                    key={h}
                    type="button"
                    onClick={() => setTime(h)}
                    className={`p-3 rounded-xl border text-center font-bold transition-colors ${time === h ? 'bg-[#eab308] border-[#eab308] text-black shadow-lg shadow-[#eab308]/30' : 'bg-black border-gray-800 text-white hover:border-gray-600'}`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tus Datos: Ocultos si el usuario ya está logueado y tiene sus datos listos */}
        {(!user || (!clientName && !clientPhone)) && (
          <div className="bg-[#111] border border-gray-800 p-5 rounded-2xl shadow-sm">
            <label className="block text-sm font-black mb-4 text-[#eab308] uppercase tracking-wider">Tus Datos</label>
            <div className="flex flex-col gap-4">
              <input 
                type="text" 
                placeholder="Tu Nombre y Apellido" 
                value={clientName} 
                onChange={(e) => setClientName(e.target.value)} 
                className="w-full bg-black text-white border border-gray-800 rounded-xl p-4 focus:ring-2 focus:ring-[#eab308] outline-none transition-all"
                required
              />
              <input 
                type="tel" 
                placeholder="Tu Teléfono (para avisos)" 
                value={clientPhone} 
                onChange={(e) => setClientPhone(e.target.value)} 
                className="w-full bg-black text-white border border-gray-800 rounded-xl p-4 focus:ring-2 focus:ring-[#eab308] outline-none transition-all"
                required
              />
            </div>
            <p className="text-gray-500 text-xs mt-3">Para no tener que rellenarlo más, regístrate en el Inicio.</p>
          </div>
        )}

        <button 
          type="submit" 
          disabled={!date || !time || !service || !clientName || !clientPhone || loading}
          className="w-full bg-[#eab308] disabled:bg-gray-800 disabled:text-gray-500 text-black font-black uppercase tracking-widest py-4 rounded-xl shadow-lg transition-transform active:scale-95 flex justify-center"
        >
          {loading ? <div className="animate-spin h-6 w-6 border-2 border-black border-t-transparent rounded-full"></div> : 'Confirmar Reserva'}
        </button>
      </form>
    </div>
  );
}
