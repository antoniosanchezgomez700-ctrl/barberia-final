import React, { useState, useEffect } from 'react';
import { getServices, updateService, getAllAppointments, updateAppointmentStatus, deleteAppointment, getAllUsers, addLoyaltyPoint } from '../firebase/db';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('citas');
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [loyaltyCode, setLoyaltyCode] = useState('');
  const [scanMessage, setScanMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [svcs, apps, usrs] = await Promise.all([
      getServices(),
      getAllAppointments(),
      getAllUsers()
    ]);
    setServices(svcs);
    setAppointments(apps);
    setUsers(usrs);
    setLoading(false);
  };

  const handlePriceChange = (id, field, value) => {
    setServices(services.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const savePrices = async () => {
    setLoading(true);
    for (const sv of services) {
      await updateService(sv.id, { name: sv.name, price: Number(sv.price) });
    }
    setLoading(false);
    alert("Precios actualizados en la base de datos.");
  };

  const handleLoyaltySubmit = async (e) => {
    e.preventDefault();
    if (!loyaltyCode) return;
    setLoading(true);
    const success = await addLoyaltyPoint(loyaltyCode);
    setLoading(false);
    if (success) {
       setScanMessage({ text: '¡Punto añadido correctamente!', type: 'success' });
       const usrs = await getAllUsers();
       setUsers(usrs);
    } else {
       setScanMessage({ text: 'Error: No se encontró ese código de cliente.', type: 'error' });
    }
    setLoyaltyCode('');
    setTimeout(() => setScanMessage({text:'', type:''}), 3000);
  };

  const handleStatusChange = async (id, newStatus) => {
    await updateAppointmentStatus(id, newStatus);
    const apps = await getAllAppointments();
    setAppointments(apps);
  };

  const handleDelete = async (id) => {
    if(window.confirm("¿Seguro que deseas cancelar esta cita?")){
       await deleteAppointment(id);
       const apps = await getAllAppointments();
       setAppointments(apps);
    }
  };

  return (
    <div className="px-4 py-8 animate-fade-in pb-24 max-w-lg mx-auto">
      <h2 className="text-2xl font-black mb-6 text-[#eab308] uppercase tracking-wide">Panel Admin</h2>
      
      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
        {['citas', 'clientes', 'precios', 'fidelidad'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-bold uppercase tracking-wider transition-colors border ${
              activeTab === tab ? 'bg-[#eab308] text-black border-[#eab308]' : 'bg-[#111] text-gray-400 border-gray-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading && <div className="text-center py-10 text-[#eab308]"><div className="animate-spin h-8 w-8 border-4 border border-t-transparent mx-auto rounded-full"></div></div>}

      {!loading && (
        <div className="animate-fade-in">
          
          {/* CITAS TAB */}
          {activeTab === 'citas' && (
            <div className="space-y-4">
              <h3 className="font-bold text-white mb-4 border-l-4 border-[#eab308] pl-3">Gestión de Citas</h3>
              {appointments.length === 0 ? <p className="text-sm text-gray-500 bg-[#111] p-4 rounded-xl border border-gray-800">No hay citas registradas en tu calendario aún.</p> : null}
              {appointments.map(app => (
                <div key={app.id} className="bg-[#111] border border-gray-800 p-4 rounded-2xl flex flex-col gap-3 transition-transform hover:scale-[1.02]">
                   <div className="flex justify-between items-start">
                     <div>
                       <p className="text-white font-bold">{app.serviceName}</p>
                       <p className="text-gray-400 text-xs mt-1 font-mono">Día: {app.date} | {app.time} HS</p>
                     </div>
                     <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${app.status === 'completed' ? 'bg-green-900/30 text-green-500 border border-green-900/50' : 'bg-yellow-900/30 text-yellow-500 border border-yellow-900/50'}`}>
                       {app.status || 'Pendiente'}
                     </span>
                   </div>
                   <div className="flex gap-2 mt-2">
                     <button onClick={() => handleStatusChange(app.id, 'completed')} className="flex-1 bg-green-900/10 text-green-500 border border-green-900/30 py-2.5 rounded-xl text-xs font-bold uppercase transition hover:bg-green-900/30">✓ Sellar como Lista</button>
                     <button onClick={() => handleDelete(app.id)} className="flex-1 bg-red-900/10 text-red-500 border border-red-900/30 py-2.5 rounded-xl text-xs font-bold uppercase transition hover:bg-red-900/30">✕ Cancelar</button>
                   </div>
                </div>
              ))}
            </div>
          )}

          {/* CLIENTES TAB */}
          {activeTab === 'clientes' && (
             <div className="space-y-4">
               <h3 className="font-bold text-white mb-4 border-l-4 border-[#eab308] pl-3">Directorio Central</h3>
               {users.length === 0 ? <p className="text-sm text-gray-500 bg-[#111] p-4 rounded-xl border border-gray-800">Todavía no se ha registrado nadie. Sé el primero probando el registro en la página principal.</p> : null}
               {users.map(u => (
                 <div key={u.uid} className="bg-[#111] border border-gray-800 p-4 rounded-2xl flex justify-between items-center transition-transform hover:scale-[1.02]">
                    <div>
                      <p className="text-white font-bold text-sm tracking-wide">{u.email}</p>
                      <p className="text-[10px] text-gray-500 mt-1 font-mono tracking-widest">ID: {u.uid}</p>
                    </div>
                    <div className="text-center bg-black border border-gray-800 px-4 py-2 rounded-xl">
                      <p className="text-[#eab308] font-black text-xl leading-none">{u.loyaltyPoints || 0}</p>
                      <p className="text-[9px] uppercase tracking-widest text-gray-500 mt-1">Puntos</p>
                    </div>
                 </div>
               ))}
             </div>
          )}

          {/* FIDELIDAD TAB */}
          {activeTab === 'fidelidad' && (
             <div className="bg-[#111] border border-[#222] p-8 rounded-3xl text-center shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-black via-[#eab308] to-black"></div>
               <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-[#eab308]/20 shadow-[0_0_20px_rgba(234,179,8,0.1)]">
                 <span className="text-3xl text-[#eab308]">🏆</span>
               </div>
               <h3 className="text-white font-black uppercase tracking-widest mb-3">Recompensa VIP</h3>
               <p className="text-sm text-gray-400 mb-8 px-2 font-medium">1. El cliente te dicta su código secreto desde su móvil.<br/>2. Tú lo pegas aquí abajo.<br/>3. Gana 1 punto al instante.</p>
               
               <form onSubmit={handleLoyaltySubmit} className="flex flex-col gap-4">
                 <input 
                   type="text" 
                   required
                   value={loyaltyCode}
                   onChange={e => setLoyaltyCode(e.target.value)}
                   placeholder="Pega el código aquí..." 
                   className="bg-black border border-gray-700 text-white px-5 py-4 rounded-xl text-center font-mono tracking-widest focus:border-[#eab308] outline-none placeholder:text-gray-600 transition-colors"
                 />
                 <button type="submit" className="bg-[#eab308] text-black font-black uppercase tracking-widest py-4 rounded-xl hover:bg-yellow-400 transition-transform active:scale-95 shadow-lg">
                   Añadir Punto
                 </button>
               </form>
               
               {scanMessage.text && (
                 <div className={`mt-6 p-4 rounded-xl text-sm font-bold animate-fade-in ${scanMessage.type === 'success' ? 'bg-green-900/20 text-green-500 border border-green-900/50' : 'bg-red-900/20 text-red-500 border border-red-900/50'}`}>
                   {scanMessage.text}
                 </div>
               )}
             </div>
          )}

          {/* PRECIOS TAB */}
          {activeTab === 'precios' && (
             <div className="bg-[#111] border border-gray-800 p-6 rounded-3xl shadow-xl">
               <h3 className="font-bold text-white mb-6 border-l-4 border-[#eab308] pl-3">Cambiar Precios</h3>
               <div className="space-y-4">
                 {services.map(s => (
                   <div key={s.id} className="flex gap-4 items-center bg-black p-4 rounded-2xl border border-gray-800 transition-colors focus-within:border-[#eab308]">
                     <div className="w-12 h-12 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                        {s.image}
                     </div>
                     <input type="text" value={s.name} onChange={e => handlePriceChange(s.id, 'name', e.target.value)} className="flex-1 bg-transparent border-none py-1 text-white font-bold text-sm tracking-wide outline-none placeholder:text-gray-600 w-full" />
                     <div className="relative w-20 shrink-0 bg-gray-900 rounded-lg border border-gray-800">
                       <input type="number" value={s.price} onChange={e => handlePriceChange(s.id, 'price', e.target.value)} className="w-full bg-transparent py-2 pl-2 pr-6 text-white font-black text-right outline-none text-sm"/>
                       <span className="absolute right-2 top-2 text-sm font-bold text-[#eab308]">€</span>
                     </div>
                   </div>
                 ))}
                 
                 <button onClick={savePrices} className="w-full mt-8 bg-white text-black font-black py-4 rounded-2xl uppercase tracking-widest hover:bg-gray-200 transition-transform active:scale-95 shadow-lg border-2 border-white">
                   Guardar en la Bolsa
                 </button>
               </div>
             </div>
          )}

        </div>
      )}
    </div>
  );
}
