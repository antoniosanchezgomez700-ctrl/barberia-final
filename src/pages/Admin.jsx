import React, { useState, useEffect } from 'react';
import { getServices } from '../firebase/db';

export default function Admin() {
  const [services, setServices] = useState([]);
  const [qrMode, setQrMode] = useState(false);

  useEffect(() => {
    getServices().then(data => setServices(data));
  }, []);

  return (
    <div className="px-6 py-10 animate-fade-in pb-24">
      <h2 className="text-2xl font-bold mb-6 text-primary-500">Panel de Administración</h2>
      
      {/* Botones de acción rápida */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <button 
          onClick={() => setQrMode(!qrMode)}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transform transition-all active:scale-95 shadow-sm border ${qrMode ? 'bg-primary-500 text-white border-primary-500' : 'bg-white dark:bg-dark-card border-gray-100 dark:border-gray-800'}`}
        >
          <span className="text-3xl">📱</span>
          <span className="font-semibold text-sm">Escanear QR</span>
        </button>
        <button className="p-4 rounded-2xl flex flex-col items-center justify-center gap-2 bg-white dark:bg-dark-card shadow-sm border border-gray-100 dark:border-gray-800 transform transition-all active:scale-95">
          <span className="text-3xl">📅</span>
          <span className="font-semibold text-sm">Ver Agenda</span>
        </button>
      </div>

      {qrMode && (
        <div className="bg-gray-900 rounded-3xl p-6 text-center animate-fade-in mb-8 shadow-xl">
          <div className="w-full h-48 border-2 border-dashed border-primary-500/50 rounded-xl flex items-center justify-center mb-4 relative overflow-hidden">
            <div className="absolute w-full h-1 bg-primary-500 top-0 shadow-[0_0_15px_#22c55e] animate-[bounce_3s_infinite]"></div>
            <p className="text-gray-400 text-sm">Apuntando cámara...</p>
          </div>
          <button className="bg-primary-500 text-white w-full py-3 rounded-xl font-bold">Simular Cliente Escaneado</button>
        </div>
      )}

      {/* Gestión de Precios */}
      <div className="bg-white dark:bg-dark-card p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="text-lg font-bold mb-4">Editar Precios y Servicios</h3>
        <div className="space-y-4">
          {services.map(s => (
            <div key={s.id} className="flex gap-3 items-center">
               <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xl shrink-0">
                  {s.image}
               </div>
               <input type="text" defaultValue={s.name} className="flex-1 bg-transparent border-b border-gray-200 dark:border-gray-700 py-2 focus:border-primary-500 outline-none text-sm"/>
               <div className="relative w-20">
                 <input type="number" defaultValue={s.price} className="w-full bg-transparent border-b border-gray-200 dark:border-gray-700 py-2 pl-1 pr-4 focus:border-primary-500 outline-none text-sm font-bold text-right"/>
                 <span className="absolute right-0 top-2 text-sm text-gray-500">€</span>
               </div>
            </div>
          ))}
          <button className="w-full mt-4 py-3 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-gray-500 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            + Añadir Servicio
          </button>
          
          <button className="w-full mt-6 bg-gray-900 dark:bg-white text-white dark:text-black font-bold py-3 rounded-xl">
            Guardar Cambios
          </button>
        </div>
      </div>

    </div>
  );
}
