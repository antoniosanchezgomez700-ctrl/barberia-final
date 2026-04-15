import { db } from './config';
import { collection, doc, getDocs, getDoc, setDoc, addDoc, updateDoc, deleteDoc, query, where } from "firebase/firestore";

// Fetch Services (si está vacío, inicializa)
export const getServices = async () => {
  const querySnapshot = await getDocs(collection(db, "services"));
  
  if (querySnapshot.empty) {
     // Semillar base de datos
     const mockServices = [
      { name: 'Corte Clásico Premium', price: 15.00, duration: 30, image: '✂️' },
      { name: 'Corte + Barba Ritual', price: 22.00, duration: 45, image: '🧔' },
      { name: 'Arreglo de Barba', price: 10.00, duration: 20, image: '🪒' },
      { name: 'Coloración / Mechas', price: 35.00, duration: 90, image: '🎨' }
     ];
     const createdServices = [];
     for (const sv of mockServices) {
         const d = await addDoc(collection(db, "services"), sv);
         createdServices.push({ id: d.id, ...sv });
     }
     return createdServices;
  }
  
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateService = async (id, updatedData) => {
  await updateDoc(doc(db, "services", id), updatedData);
};

export const createNewService = async (serviceData) => {
  try {
     const docRef = await addDoc(collection(db, "services"), serviceData);
     return { id: docRef.id, ...serviceData };
  } catch(e) {
     console.error(e);
     return null;
  }
};

export const bookAppointment = async (appointmentData) => {
  try {
     const docRef = await addDoc(collection(db, "appointments"), { ...appointmentData, status: 'pending' });
     return { success: true, id: docRef.id };
  } catch(e) {
     console.error(e);
     return { success: false, error: e.message };
  }
};

export const getAllAppointments = async () => {
  const snapshot = await getDocs(collection(db, "appointments"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getUserAppointments = async (uid) => {
  const q = query(collection(db, "appointments"), where("userId", "==", uid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateAppointmentStatus = async (id, status) => {
  await updateDoc(doc(db, "appointments", id), { status });
};

export const deleteAppointment = async (id) => {
  await deleteDoc(doc(db, "appointments", id));
};

export const getUserData = async (uid) => {
   const d = await getDoc(doc(db, "users", uid));
   if (d.exists()) {
       return { uid, ...d.data() };
   }
   return null;
}

export const getAllUsers = async () => {
  const snapshot = await getDocs(collection(db, "users"));
  return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
};

export const addLoyaltyPoint = async (uid) => {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const currentPoints = userSnap.data().loyaltyPoints || 0;
    await updateDoc(userRef, { loyaltyPoints: currentPoints + 1 });
    return true;
  }
  return false;
};

export const removeLoyaltyPoint = async (uid) => {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const currentPoints = userSnap.data().loyaltyPoints || 0;
    const newPoints = currentPoints > 0 ? currentPoints - 1 : 0;
    await updateDoc(userRef, { loyaltyPoints: newPoints });
    return true;
  }
  return false;
};

export const deleteClient = async (uid) => {
  try {
     await deleteDoc(doc(db, "users", uid));
     return true;
  } catch(e) {
     return false;
  }
};
