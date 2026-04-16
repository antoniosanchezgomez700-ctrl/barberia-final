import React, { useState, useEffect } from 'react';
import { getServices, updateService, getAllAppointments, listenToAppointments, updateAppointmentStatus, deleteAppointment, getAllUsers, addLoyaltyPoint, createNewService, removeLoyaltyPoint, deleteClient, recordWalkInSale, adminCreateClient, getBarbers, addBarber, deleteBarber } from '../firebase/db';
import { Scanner } from '@yudiel/react-qr-scanner';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('citas');
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [users, setUsers] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [newBarberName, setNewBarberName] = useState('');
  const [editingBarberId, setEditingBarberId] = useState(null);
  const [editingBarberName, setEditingBarberName] = useState('');
  const [selectedBarberFilter, setSelectedBarberFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  
  // Fidelidad
  const [loyaltyCode, setLoyaltyCode] = useState('');
  const [scanMessage, setScanMessage] = useState({ text: '', type: '' });
  const [scanMode, setScanMode] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  // Nuevo Servicio
  const [showNewServiceForm, setShowNewServiceForm] = useState(false);
  const [newService, setNewService] = useState({ name: '', price: '', duration: 30, image: '✂️' });

  // Punto de Venta (POS)
  const [chargingApp, setChargingApp] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [cashDelivered, setCashDelivered] = useState('');
  const [selectedPosService, setSelectedPosService] = useState('');
  
  // Clientes manuales
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  
  // Modal de Tarjeta QR para Clientes Físicos
  const [qrModalUser, setQrModalUser] = useState(null);

  useEffect(() => {
    loadData();
    const unsubApps = listenToAppointments((apps) => {
      setAppointments(apps);
    });
    return () => unsubApps();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [svcs, usrs, brbrs] = await Promise.all([
      getServices(),
      getAllUsers(),
      getBarbers()
    ]);
    setServices(svcs);
    setUsers(usrs);
    setBarbers(brbrs);
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

  const handleCreateService = async (e) => {
    e.preventDefault();
    if (!newService.name || !newService.price) return;
    setLoading(true);
    
    const sData = {
      name: newService.name,
      price: Number(newService.price),
      duration: Number(newService.duration),
      image: newService.image
    };
    
    const created = await createNewService(sData);
    if (created) {
      setServices([...services, created]);
      setShowNewServiceForm(false);
      setNewService({ name: '', price: '', duration: 30, image: '✂️' });
    } else {
      alert("Error al crear servicio");
    }
    setLoading(false);
  };

  const processLoyalty = async (code) => {
    setLoading(true);
    const success = await addLoyaltyPoint(code);
    setLoading(false);
    if (success) {
       setScanMessage({ text: '¡Punto añadido correctamente!', type: 'success' });
       const usrs = await getAllUsers();
       setUsers(usrs);
    } else {
       setScanMessage({ text: 'Error: No se encontró ese código.', type: 'error' });
    }
    setLoyaltyCode('');
    setTimeout(() => setScanMessage({text:'', type:''}), 3000);
  };

  const handleLoyaltySubmit = async (e) => {
    e.preventDefault();
    if (!loyaltyCode) return;
    await processLoyalty(loyaltyCode);
  };

  const handleScan = async (result) => {
    if (result && result.length > 0 && !cooldown) {
      const code = result[0].rawValue;
      setCooldown(true);
      await processLoyalty(code);
      setScanMode(false);
      setTimeout(() => setCooldown(false), 3000);
    }
  };

  const handleRemoveLoyalty = async (uid) => {
    setLoading(true);
    await removeLoyaltyPoint(uid);
    const usrs = await getAllUsers();
    setUsers(usrs);
    setLoading(false);
  };

  const handleDeleteClient = async (uid) => {
    if (window.confirm("¿Seguro que deseas ELIMINAR a este cliente para siempre?")) {
      setLoading(true);
      await deleteClient(uid);
      const usrs = await getAllUsers();
      setUsers(usrs);
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    await updateAppointmentStatus(id, newStatus);
  };

  const handleConfirmCharge = async (appId) => {
    setLoading(true);
    const app = appointments.find(a => a.id === appId);
    const svcPrice = services.find(s => s.name === app?.serviceName)?.price || 0;
    await updateAppointmentStatus(appId, 'completed', svcPrice, paymentMethod);
    setChargingApp(null);
    const apps = await getAllAppointments();
    setAppointments(apps);
    setLoading(false);
  };

  const handleLocalClientCreate = async (e) => {
    e.preventDefault();
    if (!newClientName || !newClientPhone) return;
    setLoading(true);
    await adminCreateClient(newClientName, newClientPhone);
    const usrs = await getAllUsers();
    setUsers(usrs);
    setShowNewClientForm(false);
    setNewClientName('');
    setNewClientPhone('');
    setLoading(false);
    alert('Cliente creado. Ya aparece en el directorio con 0 puntos.');
  };

  const handleDelete = async (id) => {
    if(window.confirm("¿Seguro que deseas cancelar esta cita?")){
       await deleteAppointment(id);
       const apps = await getAllAppointments();
       setAppointments(apps);
    }
  };
  const handleCreateBarber = async (e) => {
    e.preventDefault();
    if (!newBarberName) return;
    setLoading(true);
    const created = await addBarber(newBarberName);
    if (created) setBarbers([...barbers, created]);
    setNewBarberName('');
    setLoading(false);
  };

  const handleDeleteBarberObj = async (id) => {
    if(window.confirm("¿Seguro que deseas eliminar este peluquero de la plantilla? Esto reducirá las citas que caben por hora.")){
       setLoading(true);
       await deleteBarber(id);
       setBarbers(barbers.filter(b => b.id !== id));
       setLoading(false);
    }
  };

  const handleUpdateBarber = async (id) => {
    if (!editingBarberName.trim()) {
      setEditingBarberId(null);
      return;
    }
    setLoading(true);
    const success = await updateBarber(id, editingBarberName);
    if (success) {
       setBarbers(barbers.map(b => b.id === id ? { ...b, name: editingBarberName } : b));
    }
    setEditingBarberId(null);
    setLoading(false);
  };

  return (
    <div className="px-4 py-8 animate-fade-in pb-24 max-w-5xl mx-auto w-full">
      {qrModalUser && (
         <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-6 animate-fade-in">
            <h2 className="text-white text-3xl font-black uppercase tracking-widest mb-2 italic drop-shadow-lg">Tarjeta Cliente</h2>
            <p className="text-[#eab308] font-bold mb-8 text-center text-sm">{qrModalUser.name}</p>
            
            <div className="bg-white p-5 rounded-3xl border-4 border-[#eab308] shadow-[0_0_50px_rgba(234,179,8,0.3)] mb-6 animate-pulse hover:animate-none">
               <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${qrModalUser.uid}`} alt="QR" className="w-[220px] h-[220px] object-contain filter contrast-125" />
            </div>
            
            <p className="text-gray-400 mb-1 text-xs uppercase tracking-widest font-bold">ID Manual de Fidelidad</p>
            <p className="text-[#eab308] font-mono text-xl bg-[#1a1a1a] py-3 px-6 rounded-2xl border border-[#eab308]/30 mb-8 tracking-widest selection:bg-[#eab308] selection:text-black">{qrModalUser.uid}</p>
            
            <p className="text-gray-500 text-[10px] text-center max-w-xs mb-8 uppercase tracking-widest">Hazle una foto a esta pantalla con tu móvil para guardar tu tarjeta y acumular puntos en tus cortes.</p>

            <button onClick={() => setQrModalUser(null)} className="w-[200px] bg-white text-black py-4 rounded-2xl text-sm font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-xl">
               ✕ Cerrar
            </button>
         </div>
      )}

      <h2 className="text-2xl font-black mb-6 text-[#eab308] uppercase tracking-wide">Panel Admin</h2>
      
      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
        {['citas', 'peluqueros', 'caja', 'clientes', 'precios', 'fidelidad'].map(tab => (
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
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 border-l-4 border-[#eab308] pl-3">
                 <h3 className="font-bold text-white">Gestión de Citas</h3>
                 <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                    <button onClick={() => setSelectedBarberFilter('all')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase whitespace-nowrap transition-colors ${selectedBarberFilter === 'all' ? 'bg-[#eab308] text-black shadow-lg' : 'bg-[#1a1a1a] text-gray-400 border border-gray-800 hover:text-white'}`}>Todas</button>
                    {barbers.map(b => {
                       const todayStr = new Date().toISOString().split('T')[0];
                       const generated = appointments.filter(a => a.barberId === b.id && a.status === 'completed' && a.completedAt?.startsWith(todayStr)).reduce((sum, a) => sum + (Number(a.pricePaid) || 0), 0);
                       return (
                         <div key={b.id} className="relative flex-shrink-0">
                           <button onClick={() => setSelectedBarberFilter(b.id)} className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-colors flex items-center gap-2 ${selectedBarberFilter === b.id ? 'bg-[#eab308] text-black shadow-lg pr-12' : 'bg-[#1a1a1a] text-gray-400 border border-gray-800 hover:text-white pr-12'}`}>
                             {b.name}
                           </button>
                           {generated > 0 && <span className="absolute right-0 top-0 bottom-0 bg-green-500/20 text-green-500 border-l border-green-500/50 text-[10px] px-2 rounded-r-xl font-black flex items-center justify-center pointer-events-none">+{generated}€</span>}
                           {generated === 0 && <span className="absolute right-0 top-0 bottom-0 bg-gray-900 text-gray-500 border-l border-gray-800 text-[10px] px-2 rounded-r-xl font-black flex items-center justify-center pointer-events-none">0€</span>}
                         </div>
                       )
                    })}
                 </div>
              </div>
              
              {(() => {
                 const filteredApps = selectedBarberFilter === 'all' ? appointments : appointments.filter(a => a.barberId === selectedBarberFilter);
                 return (
                   <>
                     {filteredApps.length === 0 ? <p className="text-sm text-gray-500 bg-[#111] p-4 rounded-xl border border-gray-800">No hay citas registradas para esta vista.</p> : null}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {filteredApps.map(app => (
                <div key={app.id} className="bg-[#111] border border-gray-800 p-4 rounded-2xl flex flex-col gap-3 transition-transform hover:scale-[1.02]">
                   <div className="flex justify-between items-start">
                     <div>
                       <p className="text-white font-bold">{app.serviceName}</p>
                       <p className="text-[#eab308] text-[15px] font-bold tracking-wide mb-0.5 mt-1">
                         {app.clientName || 'CITA ANTIGUA (Sin Nombre)'}{app.clientPhone && <span className="ml-2 text-white/80 font-normal">📱 {app.clientPhone}</span>}
                       </p>
                       <p className="text-gray-400 text-xs mb-2 truncate">{app.userEmail}</p>
                       <p className="text-gray-400 text-xs mt-1 font-mono">Día: {app.date} | {app.time} HS</p>
                       <div className="mt-1 inline-block bg-[#1a1a1a] text-[#eab308]/80 text-[10px] px-2 py-0.5 rounded border border-[#eab308]/20 uppercase tracking-widest font-bold">
                         ✂️ Asignado a: {app.barberName || 'Peluquero Principal'}
                       </div>
                     </div>
                     <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${app.status === 'completed' ? 'bg-green-900/30 text-green-500 border border-green-900/50' : 'bg-yellow-900/30 text-yellow-500 border border-yellow-900/50'}`}>
                       {app.status || 'Pendiente'}
                     </span>
                   </div>
                   {chargingApp?.id === app.id ? (
                     <div className="mt-2 p-4 bg-black rounded-xl border border-[#eab308] border-dashed animate-fade-in">
                       <h4 className="text-[#eab308] font-black text-xs uppercase tracking-widest mb-3 border-b border-gray-800 pb-2">Procesar Cobro</h4>
                       <div className="flex gap-2 mb-4">
                         <button onClick={() => setPaymentMethod('efectivo')} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-colors ${paymentMethod === 'efectivo' ? 'bg-[#eab308] text-black' : 'bg-gray-900 text-white'}`}>💵 Efectivo</button>
                         <button onClick={() => setPaymentMethod('tarjeta')} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-colors ${paymentMethod === 'tarjeta' ? 'bg-[#eab308] text-black' : 'bg-gray-900 text-white'}`}>💳 Tarjeta</button>
                       </div>
                       
                       {(() => {
                          const svcPrice = services.find(s => s.name === app.serviceName)?.price || 0;
                          return (
                            <div className="space-y-3">
                               <div className="flex justify-between items-center">
                                  <span className="text-gray-400 text-sm">Total a cobrar:</span>
                                  <span className="text-white font-black text-xl">{svcPrice.toFixed(2)}€</span>
                               </div>
                               
                               {paymentMethod === 'efectivo' && (
                                 <>
                                   <div className="flex justify-between items-center mt-2">
                                     <span className="text-gray-400 text-sm">Entregado:</span>
                                     <div className="relative w-24">
                                       <input type="number" value={cashDelivered} onChange={e => setCashDelivered(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg py-1 pl-2 pr-6 text-right text-[#eab308] font-bold focus:border-[#eab308] outline-none" placeholder="0" />
                                       <span className="absolute right-2 top-1 text-gray-500 font-bold">€</span>
                                     </div>
                                   </div>
                                   
                                   {Number(cashDelivered) >= svcPrice && svcPrice > 0 && (
                                     <div className="flex justify-between items-center text-sm bg-green-900/20 px-3 py-2 mt-2 rounded-lg border border-green-900/50 animate-fade-in">
                                       <span className="text-green-500 font-bold uppercase tracking-widest text-[10px]">Devolver Cambio:</span>
                                       <span className="text-green-500 font-black text-lg">{(Number(cashDelivered) - svcPrice).toFixed(2)}€</span>
                                     </div>
                                   )}
                                 </>
                               )}

                               <div className="flex gap-2 mt-4 pt-4 border-t border-gray-800">
                                  <button onClick={() => setChargingApp(null)} className="px-4 py-2 bg-gray-900 text-gray-400 rounded-lg text-xs font-bold uppercase hover:bg-gray-800">Cerrar</button>
                                  <button 
                                    onClick={() => handleConfirmCharge(app.id)} 
                                    disabled={paymentMethod === 'efectivo' && (Number(cashDelivered) < svcPrice && svcPrice > 0)}
                                    className="flex-1 bg-green-600 text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-green-500 disabled:opacity-50 disabled:grayscale transition-all"
                                  >
                                    Confirmar Pago
                                  </button>
                               </div>
                            </div>
                          )
                       })()}
                     </div>
                   ) : (
                     <div className="flex gap-2 mt-2">
                       <button onClick={() => { setChargingApp(app); setCashDelivered(''); setPaymentMethod('efectivo'); }} className="flex-1 bg-green-900/10 text-green-500 border border-green-900/30 py-2.5 rounded-xl text-xs font-bold uppercase transition hover:bg-green-900/30 shadow-sm">✓ SELLAR Y COBRAR</button>
                       <button onClick={() => handleDelete(app.id)} className="flex-1 bg-red-900/10 text-red-500 border border-red-900/30 py-2.5 rounded-xl text-xs font-bold uppercase transition hover:bg-red-900/30 shadow-sm">✕ Cancelar Cita</button>
                     </div>
                   )}
                 </div>
               ))}
                     </div>
                   </>
                 );
               })()}
            </div>
          )}

          {/* CAJA TAB (Standalone POS) */}
          {activeTab === 'caja' && (
             <div className="bg-[#111] border border-[#222] p-8 rounded-3xl shadow-xl animate-fade-in relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#eab308] to-green-500"></div>
               <h3 className="font-black text-white text-xl mb-6 uppercase tracking-widest">Caja Registradora</h3>
               
               <div className="space-y-6">
                 <div>
                   <label className="text-gray-500 text-[10px] uppercase tracking-widest mb-2 block">1. Servicio Realizado (Sin Cita)</label>
                   <select 
                     value={selectedPosService} 
                     onChange={(e) => { setSelectedPosService(e.target.value); setCashDelivered(''); }} 
                     className="w-full bg-black text-[#eab308] border border-gray-800 py-4 px-4 rounded-xl outline-none focus:border-[#eab308] appearance-none font-bold tracking-wide"
                   >
                     <option value="" className="text-gray-500">-- Selecciona un corte --</option>
                     {services.map(s => (
                       <option key={s.id} value={s.id}>{s.name} - {s.price}€</option>
                     ))}
                   </select>
                 </div>

                 {selectedPosService && (() => {
                    const svcPrice = services.find(s => s.id === selectedPosService)?.price || 0;
                    return (
                      <div className="animate-fade-in border-t border-gray-800 pt-6">
                        <label className="text-gray-500 text-[10px] uppercase tracking-widest mb-3 block">2. Método de Pago</label>
                        <div className="flex gap-2 mb-6">
                          <button onClick={() => setPaymentMethod('efectivo')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-colors ${paymentMethod === 'efectivo' ? 'bg-[#eab308] text-black shadow-lg shadow-yellow-900/20' : 'bg-[#1a1a1a] text-gray-400 border border-gray-800 hover:text-white'}`}>💵 Efectivo</button>
                          <button onClick={() => setPaymentMethod('tarjeta')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-colors ${paymentMethod === 'tarjeta' ? 'bg-[#eab308] text-black shadow-lg shadow-yellow-900/20' : 'bg-[#1a1a1a] text-gray-400 border border-gray-800 hover:text-white'}`}>💳 Tarjeta</button>
                        </div>
                        
                        <div className="bg-black p-5 rounded-2xl border border-dashed border-[#eab308]/50 space-y-4">
                           <div className="flex justify-between items-center pb-4 border-b border-gray-800">
                              <span className="text-gray-400 font-bold uppercase tracking-widest text-xs">A Cobrar:</span>
                              <span className="text-[#eab308] font-black text-4xl">{svcPrice.toFixed(2)}€</span>
                           </div>
                           
                           {paymentMethod === 'efectivo' && (
                             <>
                               <div className="flex justify-between items-center mt-4">
                                 <span className="text-gray-400 uppercase tracking-widest text-[10px] font-bold">El Cliente Entrega:</span>
                                 <div className="relative w-32">
                                   <input type="number" value={cashDelivered} onChange={e => setCashDelivered(e.target.value)} className="w-full bg-[#1a1a1a] border border-gray-700 hover:border-gray-500 rounded-xl py-3 pl-4 pr-8 text-right text-white font-bold text-2xl focus:border-[#eab308] outline-none transition-colors" placeholder="0" />
                                   <span className="absolute right-3 top-3 text-gray-500 font-bold text-xl">€</span>
                                 </div>
                               </div>
                               
                               {Number(cashDelivered) >= svcPrice && svcPrice > 0 && (
                                 <div className="flex justify-between items-center mt-4 bg-green-900/20 p-4 rounded-xl border border-green-900/50">
                                   <span className="text-green-500 font-bold uppercase tracking-widest text-[10px]">Dale de Cambio:</span>
                                   <span className="text-green-500 font-black text-2xl">{(Number(cashDelivered) - svcPrice).toFixed(2)}€</span>
                                 </div>
                               )}
                             </>
                           )}

                           <button 
                             onClick={async () => {
                               setLoading(true);
                               const svcName = services.find(s => s.id === selectedPosService)?.name || 'Venta Caja';
                               await recordWalkInSale(svcName, svcPrice, paymentMethod);
                               const apps = await getAllAppointments();
                               setAppointments(apps);
                               alert('💰 ¡Cobrado con éxito en Caja Fuerte!');
                               setSelectedPosService('');
                               setCashDelivered('');
                               setLoading(false);
                             }} 
                             disabled={paymentMethod === 'efectivo' && (Number(cashDelivered) < svcPrice && svcPrice > 0)}
                             className="w-full mt-6 bg-white text-black py-4 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-gray-200 disabled:opacity-50 transition-transform active:scale-95 shadow-xl"
                           >
                             Completar Venta
                           </button>
                        </div>
                      </div>
                    )
                 })()}

                 {/* Transacciones del día */}
                 <div className="mt-8 pt-6 border-t border-gray-800">
                   <h4 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Registro de Hoy</h4>
                   
                   {(() => {
                     const todayStr = new Date().toISOString().split('T')[0];
                     const todaysSales = appointments.filter(a => a.status === 'completed' && a.completedAt?.startsWith(todayStr));
                     const totalToday = todaysSales.reduce((sum, a) => sum + (a.pricePaid || 0), 0);
                     
                     return (
                       <>
                         <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#eab308]/30 flex justify-between items-center mb-4">
                           <span className="text-white font-black uppercase tracking-widest text-sm">Caja Diaria:</span>
                           <span className="text-[#eab308] font-black text-2xl">{totalToday.toFixed(2)}€</span>
                         </div>
                         
                         <div className="space-y-2">
                           {todaysSales.map(sale => (
                             <div key={sale.id} className="flex justify-between items-center bg-black p-3 rounded-xl border border-gray-800 text-xs animate-fade-in">
                               <div>
                                 <p className="text-white font-bold">{sale.serviceName} <span className="text-gray-500 font-normal">({sale.paymentMethod === 'efectivo' ? '💵' : '💳'})</span></p>
                                 <p className="text-gray-500">{new Date(sale.completedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {sale.clientName || 'Cliente'}</p>
                               </div>
                               <div className="flex items-center gap-3">
                                 <span className="text-[#eab308] font-black shrink-0">{sale.pricePaid}€</span>
                                 <button onClick={() => handleDelete(sale.id)} className="text-red-500 bg-red-900/20 px-2.5 py-1 rounded border border-red-900/50 hover:bg-red-900/40 opacity-50 hover:opacity-100 transition-opacity">✕</button>
                               </div>
                             </div>
                           ))}
                           {todaysSales.length === 0 && <p className="text-gray-600 text-xs text-center italic">No hay cobros registrados hoy aún.</p>}
                         </div>
                       </>
                     )
                   })()}
                 </div>
               </div>
             </div>
          )}

          {/* CLIENTES TAB */}
          {activeTab === 'clientes' && (
             <div className="space-y-4">
               <div className="flex justify-between items-center mb-4 border-l-4 border-[#eab308] pl-3">
                 <h3 className="font-bold text-white">Directorio Central</h3>
                 <button onClick={() => setShowNewClientForm(!showNewClientForm)} className="bg-[#1a1a1a] text-[#eab308] hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border border-gray-800 transition-colors">
                   {showNewClientForm ? '✕ Cancelar' : '+ Registrar en Local'}
                 </button>
               </div>
               
               {showNewClientForm && (
                 <form onSubmit={handleLocalClientCreate} className="bg-black p-5 rounded-2xl border border-[#eab308]/50 animate-fade-in mb-6 flex flex-col gap-4 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                   <h4 className="text-xs text-[#eab308] font-bold uppercase tracking-widest border-b border-gray-800 pb-2">Registrar Nuevo Cliente</h4>
                   <div className="space-y-3">
                     <input type="text" placeholder="Nombre completo" value={newClientName} onChange={e => setNewClientName(e.target.value)} required className="w-full bg-[#1a1a1a] text-white border border-gray-800 py-3 px-4 rounded-xl text-sm outline-none focus:border-[#eab308]" />
                     <input type="tel" placeholder="Nº de Teléfono" value={newClientPhone} onChange={e => setNewClientPhone(e.target.value)} required className="w-full bg-[#1a1a1a] text-white border border-gray-800 py-3 px-4 rounded-xl text-sm outline-none focus:border-[#eab308]" />
                   </div>
                   <button type="submit" disabled={loading} className="w-full bg-[#eab308] text-black font-black uppercase tracking-widest py-3 rounded-xl mt-1 hover:bg-yellow-400 active:scale-95 transition-transform disabled:opacity-50">Guardar Ficha</button>
                 </form>
               )}
               
               {users.length === 0 ? <p className="text-sm text-gray-500 bg-[#111] p-4 rounded-xl border border-gray-800">Todavía no se ha registrado nadie. Sé el primero probando el registro en la página principal.</p> : null}
               {users.map(u => (
                 <div key={u.uid} className="bg-[#111] border border-gray-800 p-4 rounded-2xl flex justify-between items-center transition-transform hover:scale-[1.02]">
                    <div className="flex-1">
                      <p className="text-[#eab308] font-bold text-[15px] tracking-wide mb-0.5">{u.name || 'Sin Nombre'}</p>
                      {u.phone && <p className="text-white text-xs font-bold mb-1">📱 {u.phone}</p>}
                      <p className="text-[10px] text-gray-500 font-mono tracking-widest break-all mb-1">{u.email}</p>
                      <p className="text-[9px] text-[#eab308]/80 font-mono tracking-widest mb-3">ID: {u.uid}</p>
                      <div className="flex gap-2">
                        <button onClick={() => setQrModalUser(u)} className="text-[#eab308] bg-[#eab308]/10 px-3 py-1.5 rounded border border-[#eab308]/30 text-[10px] uppercase font-bold tracking-widest hover:bg-[#eab308]/20 transition flex items-center gap-1 shadow-sm">
                           📷 Generar QR
                        </button>
                        <button onClick={() => handleDeleteClient(u.uid)} className="text-red-500 bg-red-950/30 px-3 py-1.5 rounded border border-red-900/50 text-[10px] uppercase font-bold tracking-widest hover:bg-red-900/50 transition">
                           X
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={(e) => { e.stopPropagation(); handleRemoveLoyalty(u.uid); }} className="w-8 h-8 rounded-full bg-[#1a1a1a] text-gray-400 flex items-center justify-center font-black border border-gray-800 hover:text-white hover:border-gray-500">-</button>
                      <div className="text-center bg-black border border-gray-800 px-4 py-2 rounded-xl">
                        <p className="text-[#eab308] font-black text-xl leading-none">{u.loyaltyPoints || 0}</p>
                        <p className="text-[9px] uppercase tracking-widest text-gray-500 mt-1">Puntos</p>
                      </div>
                    </div>
                 </div>
               ))}
              </div>
          )}

          {/* FIDELIDAD TAB */}
          {activeTab === 'fidelidad' && (
             <div className="bg-[#111] border border-[#222] p-8 rounded-3xl text-center shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-black via-[#eab308] to-black"></div>
               
               <div className="flex gap-2 bg-black p-1 rounded-xl border border-gray-800 mb-6">
                 <button onClick={() => setScanMode(false)} className={`flex-1 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-colors ${!scanMode ? 'bg-[#1a1a1a] text-[#eab308]' : 'text-gray-500 hover:text-white'}`}>Manual</button>
                 <button onClick={() => setScanMode(true)} className={`flex-1 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-colors ${scanMode ? 'bg-[#1a1a1a] text-[#eab308]' : 'text-gray-500 hover:text-white'}`}>Cámara QR</button>
               </div>

               {!scanMode ? (
                 <>
                   <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-[#eab308]/20 shadow-[0_0_20px_rgba(234,179,8,0.1)]">
                     <span className="text-3xl text-[#eab308]">🏆</span>
                   </div>
                   <h3 className="text-white font-black uppercase tracking-widest mb-3">Sellar VIP</h3>
                   <p className="text-sm text-gray-400 mb-8 px-2 font-medium">Introduce abajo la ID del cliente para sumar un punto a su tarjeta.</p>
                   
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
                 </>
               ) : (
                 <div className="animate-fade-in">
                    <h3 className="text-white font-black uppercase tracking-widest mb-4">Apunta al QR</h3>
                    <div className="rounded-2xl overflow-hidden border-2 border-[#eab308]/50 shadow-[0_0_20px_rgba(234,179,8,0.2)] bg-black w-full aspect-square relative flex items-center justify-center">
                       {cooldown ? (
                         <div className="text-[#eab308] animate-pulse font-bold tracking-widest">Procesando...</div>
                       ) : (
                         <Scanner onScan={handleScan} allowMultiple={true} components={{ audio: true, finder: true }} />
                       )}
                    </div>
                    <p className="text-[10px] text-gray-500 mt-4 uppercase tracking-widest">La cámara se cerrará al confirmar</p>
                 </div>
               )}
               
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
               <div className="flex justify-between items-center mb-6 pl-3 border-l-4 border-[#eab308]">
                 <h3 className="font-bold text-white">Editar App</h3>
                 <button onClick={() => setShowNewServiceForm(!showNewServiceForm)} className="bg-[#1a1a1a] text-[#eab308] hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border border-gray-800">
                   {showNewServiceForm ? 'Cerrar' : '+ Corte'}
                 </button>
               </div>

               {showNewServiceForm && (
                 <form onSubmit={handleCreateService} className="mb-8 bg-black p-4 rounded-2xl border border-dashed border-[#eab308]/50 flex flex-col gap-3 animate-fade-in">
                   <div className="mb-2">
                     <label className="text-gray-500 text-[10px] uppercase tracking-widest mb-2 block">Selecciona un Icono</label>
                     <div className="grid grid-cols-5 gap-2 bg-[#1a1a1a] p-2 rounded-xl border border-gray-800">
                        {['✂️', '💈', '🪒', '🧔', '👨', '👦', '🎨', '🔥', '🌟', '💎', '👑', '🧴', '🚿', '💆', '⚡'].map(emoji => (
                           <button 
                             key={emoji} 
                             type="button" 
                             onClick={() => setNewService({...newService, image: emoji})}
                             className={`text-xl p-1.5 rounded-lg transition-all duration-200 ${newService.image === emoji ? 'bg-[#eab308]/20 scale-110 shadow-inner border border-[#eab308]/50 opacity-100 grayscale-0' : 'hover:bg-gray-800 grayscale opacity-40 hover:grayscale-0 hover:opacity-100'}`}
                           >
                             {emoji}
                           </button>
                        ))}
                     </div>
                   </div>
                   <div className="flex gap-2">
                     <div className="w-14 bg-[#1a1a1a] border border-[#eab308] rounded-xl flex items-center justify-center text-xl shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                       {newService.image}
                     </div>
                     <input type="text" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} placeholder="Nombre del corte..." className="flex-1 bg-[#1a1a1a] text-white border border-gray-800 py-3 px-3 rounded-xl text-sm outline-none focus:border-[#eab308]" required />
                   </div>
                   <div className="flex gap-2">
                     <div className="relative flex-1">
                       <span className="absolute left-3 top-3 text-gray-500 text-xs uppercase tracking-widest">Precio</span>
                       <input type="number" value={newService.price} onChange={e => setNewService({...newService, price: e.target.value})} className="w-full bg-[#1a1a1a] text-white font-bold border border-gray-800 py-3 pl-16 pr-3 rounded-xl text-sm outline-none focus:border-[#eab308]" required />
                     </div>
                   </div>
                   <button type="submit" disabled={loading} className="w-full mt-2 bg-[#eab308] text-black font-black py-3 rounded-xl uppercase tracking-widest hover:bg-yellow-400">
                     Crear Nuevo
                   </button>
                 </form>
               )}

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
                   Guardar en Base
                 </button>
               </div>
             </div>
          )}

          {/* PELUQUEROS TAB */}
          {activeTab === 'peluqueros' && (
             <div className="bg-[#111] border border-gray-800 p-6 rounded-3xl shadow-xl animate-fade-in">
               <h3 className="font-bold text-white mb-6 border-l-4 border-[#eab308] pl-3">Plantilla de Peluqueros</h3>
               <p className="text-xs text-gray-400 mb-6 font-medium">Nota: Cada peluquero que añadas aquí abrirá una nueva "silla" en el local para que los clientes reserven a la misma hora simultáneamente.</p>
               
               <form onSubmit={handleCreateBarber} className="flex gap-2 mb-6">
                 <input type="text" value={newBarberName} onChange={e => setNewBarberName(e.target.value)} placeholder="Ej. Juan, Pedro..." className="flex-1 bg-black text-white border border-gray-800 py-3 px-4 rounded-xl text-sm outline-none focus:border-[#eab308]" required />
                 <button type="submit" className="bg-[#eab308] text-black font-black uppercase tracking-widest px-6 rounded-xl hover:bg-yellow-400">Añadir</button>
               </form>

               <div className="space-y-3">
                 {barbers.map(b => (
                    <div key={b.id} className="flex justify-between items-center bg-black p-4 rounded-2xl border border-gray-800 transition-transform hover:scale-[1.02]">
                      {editingBarberId === b.id ? (
                        <div className="flex-1 flex gap-2 mr-2">
                           <input type="text" value={editingBarberName} onChange={e => setEditingBarberName(e.target.value)} className="flex-1 bg-[#1a1a1a] text-white border border-[#eab308] px-3 py-1.5 rounded-lg text-sm outline-none" autoFocus />
                           <button onClick={() => handleUpdateBarber(b.id)} className="text-black bg-[#eab308] px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition hover:bg-yellow-400">Guardar</button>
                           <button onClick={() => setEditingBarberId(null)} className="text-gray-400 bg-gray-800 px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition hover:text-white">Cancelar</button>
                        </div>
                      ) : (
                        <>
                          <span className="text-white font-bold text-sm tracking-wide">{b.name}</span>
                          <div className="flex gap-2">
                            <button onClick={() => { setEditingBarberId(b.id); setEditingBarberName(b.name); }} className="text-gray-400 bg-[#1a1a1a] px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-widest border border-gray-800 hover:text-white hover:border-gray-500">✎ Editar</button>
                            <button onClick={() => handleDeleteBarberObj(b.id)} className="text-red-500 bg-red-900/20 px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-widest border border-red-900/50 hover:bg-red-900/40">✕ Eliminar</button>
                          </div>
                        </>
                      )}
                    </div>
                 ))}
                 {barbers.length === 0 && <p className="text-gray-500 text-[11px] text-center italic mt-10">Creando plantilla inicial...</p>}
               </div>
             </div>
          )}

        </div>
      )}
    </div>
  );
}
