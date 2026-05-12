import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/beerService';
import { FUNNY_AVATARS } from '../../types';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { Beer, Lock, User as UserIcon } from 'lucide-react';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [nickname, setNickname] = useState('');
  const [pin, setPin] = useState('');
  const [avatar, setAvatar] = useState(FUNNY_AVATARS[0]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        const user = await authService.login(nickname, pin);
        login(user);
      } else {
        if (pin.length !== 4) throw new Error('PIN must be exactly 4 digits.');
        const user = await authService.register(nickname, pin, avatar);
        login(user);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-geometric-bg">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-sm space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex w-16 h-16 bg-geometric-amber rounded-[20px] items-center justify-center shadow-amber-glow mb-4">
            <Beer className="w-8 h-8 text-black" />
          </div>
          <h2 className="text-4xl font-black text-stone-100 tracking-tighter italic text-geometric-amber">
            NAEX
          </h2>
          <p className="text-stone-500 font-medium italic">
            "Tonight’s Madness Begins Here"
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4 geometric-card p-6 border-geometric-border/50">
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-600" />
              <input
                type="text"
                placeholder="Nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-stone-900/50 border border-stone-800 rounded-2xl focus:ring-2 focus:ring-geometric-amber outline-none transition-all"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-600" />
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="4-digit PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                className="w-full pl-10 pr-4 py-3 bg-stone-900/50 border border-stone-800 rounded-2xl focus:ring-2 focus:ring-geometric-amber outline-none transition-all"
                required
              />
            </div>

            {!isLogin && (
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-widest">
                  Pick your Tavern Totem
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {FUNNY_AVATARS.map((fav) => (
                    <button
                      key={fav}
                      type="button"
                      onClick={() => setAvatar(fav)}
                      className={cn(
                        "w-10 h-10 flex items-center justify-center rounded-xl text-xl transition-all",
                        avatar === fav ? "bg-geometric-amber scale-110 shadow-amber-glow" : "bg-stone-800/50 hover:bg-stone-800"
                      )}
                    >
                      {fav}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-red-500 text-sm font-bold text-center px-2 italic"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-2xl amber-action text-lg uppercase tracking-widest italic"
          >
            {isLoading ? 'Entering Pub...' : isLogin ? 'Enter Tavern' : 'Join the Crew'}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-stone-400 text-sm font-bold hover:text-geometric-amber transition-colors underline decoration-stone-800 underline-offset-4"
          >
            {isLogin ? "New here? Create your stool" : "Already have a mug? Log in"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
