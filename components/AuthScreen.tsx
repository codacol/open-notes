
import React, { useState } from 'react';
import { User, Language } from '../types';
import { api } from '../services/api';
import { translations } from '../translations';
import { Loader2 } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (user: User) => void;
  lang: Language;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, lang }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const t = translations[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      let user: User;
      if (isLogin) {
        if (!email || !password) {
          throw new Error(t.auth_error_fill);
        }
        user = await api.login(email, password);
      } else {
        if (!email || !password || !name) {
          throw new Error(t.auth_error_fill);
        }
        user = await api.signup({ email, password, name });
      }
      
      // Persist ID for simple session restoration
      localStorage.setItem('codacol_user_id', user.id);
      onLogin(user);

    } catch (err: any) {
      setError(err.message || t.auth_error_invalid);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="mb-8 text-center">
         <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-orange-500/20 mx-auto mb-4">
            C
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t.app_name}
          </h1>
      </div>

      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100">
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {isLogin ? t.login : t.signup}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.name}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.email}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                placeholder="demo@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.password}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:shadow-orange-500/30 transition-all transform hover:-translate-y-0.5 mt-2 flex justify-center items-center"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? t.login_button : t.signup_button)}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isLogin ? t.no_account : t.have_account}{' '}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                }}
                className="text-orange-600 font-medium hover:underline"
              >
                {isLogin ? t.signup : t.login}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
