import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { auth, db } from '../firebase/config';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function Auth({ onAuthenticated }) {
  const { setUser } = useAuth();
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Guardar metadata extra
        await setDoc(doc(db, "users", userCredential.user.uid), {
           name,
           phone,
           email,
           loyaltyPoints: 0,
           role: 'client'
        });
      }
      if(onAuthenticated) onAuthenticated();
    } catch(err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 animate-fade-in relative z-10">
      
      <div className="bg-white/10 dark:bg-black/40 backdrop-blur-xl p-8 rounded-[30px] border border-white/20 dark:border-gray-800 shadow-2xl">
        <h2 className="text-3xl font-bold mb-2 text-white text-center">
          {isLogin ? 'Bienvenido' : 'Únete al Club'}
        </h2>
        <p className="text-gray-300 text-sm mb-6 text-center text-balance">
          {isLogin ? 'Inicia sesión para gestionar tus citas y puntos.' : 'Regístrate para reservar tu primera cita y sumar puntos.'}
        </p>

        {errorMsg && (
          <div className="bg-red-500/20 border border-red-500 text-red-100 text-xs p-3 rounded-xl mb-4 text-center">
            {errorMsg.includes('auth/invalid-credential') ? 'Contraseña o correo incorrecto.' : errorMsg.includes('email-already-in-use') ? 'Ese correo ya está registrado.' : 'Error al autenticar: ' + errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-300">Nombre Completo</label>
                <input 
                  type="text" required value={name} onChange={e => setName(e.target.value)}
                  className="w-full bg-black/50 text-white border border-gray-600 rounded-xl p-3 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-colors"
                  placeholder="Juan Pérez"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-300">Teléfono</label>
                <input 
                  type="tel" required value={phone} onChange={e => setPhone(e.target.value)}
                  className="w-full bg-black/50 text-white border border-gray-600 rounded-xl p-3 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-colors"
                  placeholder="+34 600 000 000"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-300">Correo Electrónico</label>
            <input 
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-black/50 text-white border border-gray-600 rounded-xl p-3 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-colors"
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div className="relative">
            <label className="block text-xs font-semibold mb-1 text-gray-300">Contraseña</label>
            <input 
              type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-black/50 text-white border border-gray-600 rounded-xl p-3 pr-10 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-colors"
              placeholder="••••••••"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-7 text-gray-400 hover:text-white"
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 mt-6 rounded-xl shadow-lg transition-transform active:scale-95 flex justify-center items-center"
          >
            {loading ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div> : (isLogin ? 'Entrar' : 'Registrarme')}
          </button>

        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
          <button onClick={() => setIsLogin(!isLogin)} className="ml-2 text-primary-400 font-bold hover:underline">
            {isLogin ? 'Regístrate' : 'Inicia Sesión'}
          </button>
        </div>

      </div>
    </div>
  );
}
