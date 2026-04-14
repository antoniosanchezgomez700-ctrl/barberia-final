import React, { useState } from 'react';
import { bookAppointment } from '../firebase/db';

export default function Booking() {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const availableHours = ['10:00', '10:30', '11:00', '12:00', '16:00', '17:30'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !time) return;
    
    setLoading(true);
    const result = await bookAppointment({ date, time });
    if (result.success) {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="px-6 py-20 text-center animate-fade-in">
        <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto text-4xl mb-6">
          ✓
        </div>
        <h2 className="text-2xl font-bold mb-2">¡Cita Confirmada!</h2>
        <p className="text-gray-500 mb-8">Te hemos enviado un SMS de confirmación. Te recordaremos 1 día antes.</p>
        <button onClick={() => window.location.href='/'} className="bg-primary-500 text-white px-8 py-3 rounded-full font-semibold">
          Volver al Inicio
        </button>
      </div>
    );
  }

  return (
    <div className="px-6 py-10 animate-fade-in pb-24">
      <h2 className="text-2xl font-bold mb-6">Reserva tu cita</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Selector de Fecha */}
        <div className="bg-white dark:bg-dark-card p-5 rounded-2xl shadow-sm">
          <label className="block text-sm font-semibold mb-3">¿Qué día prefieres?</label>
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
            className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-700 rounded-xl p-4 focus:ring-2 focus:ring-primary-500 outline-none"
            required
          />
        </div>

        {/* Selector de Hora */}
        {date && (
          <div className="bg-white dark:bg-dark-card p-5 rounded-2xl shadow-sm animate-fade-in">
            <label className="block text-sm font-semibold mb-3">Horas disponibles</label>
            <div className="grid grid-cols-3 gap-3">
              {availableHours.map(h => (
                <button 
                  key={h}
                  type="button"
                  onClick={() => setTime(h)}
                  className={`p-3 rounded-xl border text-center font-medium transition-colors ${time === h ? 'bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/30' : 'border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500'}`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>
        )}

        <button 
          type="submit" 
          disabled={!date || !time || loading}
          className="w-full bg-primary-500 disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95 flex justify-center"
        >
          {loading ? <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"></div> : 'Confirmar Reserva'}
        </button>
      </form>
    </div>
  );
}
