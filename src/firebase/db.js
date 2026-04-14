import { db } from './config';
import { collection, doc, getDocs, getDoc, setDoc, addDoc, updateDoc } from "firebase/firestore";

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

export const bookAppointment = async (appointmentData) => {
  try {
     const docRef = await addDoc(collection(db, "appointments"), appointmentData);
     return { success: true, id: docRef.id };
  } catch(e) {
     console.error(e);
     return { success: false, error: e.message };
  }
};

export const getUserData = async (uid) => {
   const d = await getDoc(doc(db, "users", uid));
   if (d.exists()) {
       return { uid, ...d.data() };
   }
   return null;
}
