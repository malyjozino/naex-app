import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { BeerPost } from '../../types';
import { motion } from 'motion/react';
import { Award, LogOut, Flame, Beer, GlassWater, Trophy } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [userPosts, setUserPosts] = useState<BeerPost[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchUserPosts = async () => {
      const q = query(
        collection(db, 'posts'),
        where('userId', '==', user.id),
        orderBy('timestamp', 'desc')
      );
      const snapshot = await getDocs(q);
      setUserPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BeerPost)));
    };
    fetchUserPosts();
  }, [user]);

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Header Stat Card */}
      <div className="geometric-card relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-geometric-amber" />
        <div className="p-8 flex flex-col items-center bg-black/20">
          <div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl bg-stone-900 border-4 border-geometric-border shadow-amber-glow mb-4 relative">
             {user.avatar}
             {user.streakCurrent >= 7 && (
               <div className="absolute -bottom-1 -right-1 bg-geometric-amber p-1.5 rounded-full shadow-lg">
                 <Flame className="w-6 h-6 text-black fill-black" />
               </div>
             )}
          </div>
          <h2 className="text-3xl font-black text-stone-100 italic">{user.nickname}</h2>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-geometric-amber mt-1 bg-geometric-amber/10 px-3 py-1 rounded-full">
            {user.rankTitle}
          </span>

          <div className="grid grid-cols-3 gap-6 w-full mt-8 border-t border-geometric-border/50 pt-8">
            <Stat label="Total Litres" value={user.totalLitres.toString()} />
            <Stat label="Pints Pour" value={user.totalBeers.toString()} />
            <Stat label="Streak Days" value={user.streakCurrent.toString()} />
          </div>
        </div>
      </div>

      {/* Badges / Achievements */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-500 flex items-center gap-2 px-1">
          Recent Badges
        </h3>
        <div className="grid grid-cols-4 gap-3">
          <Badge achieved={user.totalBeers >= 1} name="First Pint" icon="🍺" />
          <Badge achieved={user.totalBeers >= 10} name="Regular" icon="🏠" />
          <Badge achieved={user.totalLitres >= 50} name="Beer Lord" icon="👑" />
          <Badge achieved={user.streakCurrent >= 7} name="7 Day Warrior" icon="🔥" />
          <Badge achieved={user.totalBeers >= 100} name="Machine" icon="🤖" />
          <Badge achieved={user.totalLitres >= 100} name="Tavern King" icon="🏰" />
          <Badge achieved={user.streakLongest >= 30} name="Legend" icon="💎" />
          <Badge achieved={user.totalBeers >= 5} name="Socialite" icon="🍻" />
        </div>
      </div>

      {/* Gallery */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-500 flex items-center gap-2 px-1">
           Drinking History
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {userPosts.map((post) => (
            <motion.div 
              key={post.id} 
              whileHover={{ scale: 0.95 }}
              className="aspect-square rounded-2xl overflow-hidden border border-geometric-border bg-stone-900 shadow-lg"
            >
              <img src={post.photoUrl} alt="Beer" className="w-full h-full object-cover" />
            </motion.div>
          ))}
          {userPosts.length === 0 && (
            <div className="col-span-3 py-12 geometric-card border-dashed flex flex-col items-center justify-center text-stone-700 bg-stone-900/10">
               <p className="text-[10px] font-black uppercase tracking-widest">No Rounds yet</p>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={logout}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border border-red-900/20 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-900/10 transition-colors italic"
      >
        <LogOut className="w-4 h-4" />
        Leave the Tavern
      </button>
    </div>
  );
}

function Stat({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="text-xl font-black text-white">{value}</div>
      <div className="text-[8px] uppercase font-bold text-stone-600 tracking-widest mt-1">
        {label}
      </div>
    </div>
  );
}

function Badge({ achieved, name, icon }: { achieved: boolean, name: string, icon: string }) {
  return (
    <div className={cn(
      "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all grayscale duration-500",
      achieved ? "bg-stone-800/50 border-tavern-amber/20 grayscale-0" : "bg-stone-900/20 border-stone-800/50 opacity-40"
    )}>
      <div className="text-2xl">{icon}</div>
      <span className="text-[8px] font-black text-center leading-tight uppercase tracking-tighter text-stone-400">
        {name}
      </span>
    </div>
  );
}
