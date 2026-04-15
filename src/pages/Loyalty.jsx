import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getUserAppointments, deleteAppointment } from '../firebase/db';

export default function Loyalty() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);
  
  useEffect(() => {
    if (user) {
      getUserAppointments(user.uid).then(data => {
        const upcoming = data.filter(a => a.status !== 'completed');
        setAppointments(upcoming);
        setLoadingApps(false);
      });
    }
  }, [user]);

  const handleDeleteAppointment = async (id) => {
    if (window.confirm("¿Seguro que deseas cancelar esta cita?")) {
       setLoadingApps(true);
       await deleteAppointment(id);
       const newData = await getUserAppointments(user.uid);
       const upcoming = newData.filter(a => a.status !== 'completed');
       setAppointments(upcoming);
       setLoadingApps(false);
    }
  };

  if (!user) return <p className="p-6 text-center text-gray-500">Inicia sesión para ver tu tarjeta.</p>;

  const totalPoints = 10;
  const currentPoints = user.loyaltyPoints || 0;
  
  return (
    <div className="px-6 py-10 animate-fade-in pb-24 max-w-sm mx-auto">

      {/* Tarjeta Visual (Estilo Captura) */}
      <div className="bg-[#0f0f0f] text-white p-8 rounded-[30px] border border-[#222] shadow-2xl relative mb-10">
        
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-3xl font-black italic uppercase leading-tight tracking-tight drop-shadow-md">
            Tarjeta de<br/>Fidelidad
          </h2>
          <div className="bg-[#eab308] text-black font-bold uppercase text-[10px] px-3 py-1.5 rounded-full inline-block tracking-wider">
            Gold Member
          </div>
        </div>
        
        <p className="text-gray-400 text-sm mb-10 pr-6">Completa 10 servicios y obtén un corte gratis</p>

        {/* Puntos circulares al estilo de la foto */}
        <div className="grid grid-cols-5 gap-y-4 gap-x-2 relative z-10 mb-10 px-2 pl-4">
          {[...Array(totalPoints)].map((_, i) => {
            const isCompleted = i < currentPoints;
            return (
              <div key={i} className="flex justify-center">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  isCompleted 
                    ? 'border-2 border-dashed border-[#eab308] text-[#eab308]' 
                    : 'bg-[#1a1a1a] text-gray-600'
                }`}>
                  {i + 1}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between items-end border-t border-gray-800 pt-6">
          <p className="text-gray-400 text-sm italic pr-6 pb-2">
            Faltan {10 - currentPoints} para el premio
          </p>
          <button onClick={() => navigate('/booking')} className="text-[#eab308] font-semibold text-sm hover:underline flex items-center gap-1 shrink-0 pb-2">
            Agendar servicio <span className="text-xl leading-none ml-1">›</span>
          </button>
        </div>

        {/* CÓDIGO DE CLIENTE PARA ENTREGAR AL ADMIN */}
        <div className="mt-8 border-t border-dashed border-gray-800 pt-6 text-center">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-4 font-bold">Muestra esto en Caja</p>
          
          <div className="bg-white p-2 w-32 h-32 mx-auto rounded-2xl shadow-[0_0_20px_rgba(234,179,8,0.15)] mb-4 border-2 border-[#eab308]">
             <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${user.uid}`} alt="QR Cliente" className="w-full h-full filter contrast-125" />
          </div>
          
          <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-1">O dicta tu ID Manual</p>
          <div className="bg-black border border-gray-800 py-2 px-4 rounded-xl inline-block mb-3">
             <span className="font-mono text-[#eab308] font-black tracking-widest text-xs">{user.uid}</span>
          </div>
          
          <p className="text-[10px] text-gray-500 max-w-xs mx-auto italic">El peluquero introducirá este código en su sistema para sellarte la tarjeta.</p>
        </div>
      </div>

      {/* Sección Próximas Citas */}
      <div className="bg-[#0f0f0f] rounded-[30px] p-6 border border-[#222]">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
          <span className="text-[#eab308]">📅</span> Próximas Citas
        </h3>

        {loadingApps ? (
           <div className="animate-pulse h-24 bg-[#1a1a1a] rounded-2xl border border-gray-800"></div>
        ) : appointments.length === 0 ? (
           <div className="text-center py-6">
             <p className="text-gray-500 text-sm mb-4">No tienes ninguna cita próxima.</p>
             <button onClick={() => navigate('/booking')} className="bg-[#1a1a1a] text-[#eab308] hover:bg-[#222] font-bold text-xs uppercase tracking-widest py-3 px-6 rounded-full transition-colors border border-gray-800">Agendar Ahora</button>
           </div>
        ) : (
           <div className="space-y-4">
             {appointments.map(app => (
               <div key={app.id} className="bg-black border border-gray-800 rounded-2xl p-5 relative">
                 <div className="flex justify-between items-start mb-2">
                   <span className="bg-[#eab308]/10 text-[#eab308] text-[10px] font-bold uppercase px-3 py-1 rounded">
                     {app.serviceName || 'Servicio General'}
                   </span>
                   <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${app.status === 'pending' ? 'bg-yellow-900/30 text-yellow-500' : 'bg-gray-800 text-gray-400'}`}>
                     {app.status === 'pending' ? 'Confirmada' : app.status}
                   </span>
                 </div>
                 
                 <div className="flex items-end gap-3 mb-2 mt-4">
                   <span className="text-3xl font-bold text-white tracking-tight">{app.date.split("-").reverse().join("/")}</span>
                   <span className="text-gray-500 text-sm font-medium pb-1">{app.time} HS</span>
                 </div>
                 <button onClick={() => handleDeleteAppointment(app.id)} className="w-full mt-3 bg-[#1a1a1a] text-red-500 hover:bg-red-950/30 hover:text-red-400 font-bold text-xs uppercase tracking-widest py-3 rounded-full transition-colors border border-red-900/30">
                   ✕ Cancelar Cita
                 </button>
               </div>
             ))}
           </div>
        )}
      </div>

    </div>
  );
}
