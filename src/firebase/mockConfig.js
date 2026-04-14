// Simulador de Firebase para que puedas probar la App Premium sin tener la base de datos real enchufada aún.

// Datos simulados (Mocks)
export const mockServices = [
  { id: '1', name: 'Corte Clásico Premium', price: 15.00, duration: 30, image: '✂️' },
  { id: '2', name: 'Corte + Barba Ritual', price: 22.00, duration: 45, image: '🧔' },
  { id: '3', name: 'Arreglo de Barba', price: 10.00, duration: 20, image: '🪒' },
  { id: '4', name: 'Coloración / Mechas', price: 35.00, duration: 90, image: '🎨' },
];

export const mockUser = {
  uid: 'user123',
  name: 'Cliente VIP',
  email: 'cliente@ejemplo.com',
  phone: '+34600000000',
  loyaltyPoints: 7, // 7/10 para corte gratis
  role: 'client' // 'client' o 'admin'
};

// Simulador de llamadas a base de datos
export const getServices = async () => {
  return new Promise((resolve) => setTimeout(() => resolve([...mockServices]), 800));
};

export const loginWithEmail = async (email, password) => {
  return new Promise((resolve) => setTimeout(() => resolve(mockUser), 1000));
};

export const bookAppointment = async (appointmentData) => {
  return new Promise((resolve) => setTimeout(() => resolve({ success: true, id: 'apt123' }), 1200));
};
