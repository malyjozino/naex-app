import { useEffect, useState } from 'react';
import { beerService } from '../../services/beerService';
import { User } from '../../types';
import { motion } from 'motion/react';
import { Trophy, Medal, Star, Flame } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function LeaderboardScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [tab, setTab] = useState<'all' | 'weekly' | 'streaks'>('all');

  useEffect(() => {
    const unsubscribe = beerService.subscribeToLeaderboard((allUsers) => {
      let sorted = [...allUsers];
      if (tab === 'streaks') {
        sorted.sort((a, b) => b.streakCurrent - a.streakCurrent);
      } else {
        sorted.sort((a, b) => b.totalLitres - a.totalLitres);
      }
      setUsers(sorted);
    });
    return () => unsubscribe();
  }, [tab]);

  const top3 = users.slice(0, 3);
  const others = users.slice(3);

  const podiumLayout = [
    top3[1], // 2nd
    top3[0], // 1st
    top3[2], // 3rd
  ].filter(Boolean);

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="flex bg-stone-900 border border-geometric-border p-1 rounded-2xl">
        <TabButton active={tab === 'all'} onClick={() => setTab('all')} label="Top Volume" />
        <TabButton active={tab === 'streaks'} onClick={() => setTab('streaks')} label="Top Streaks" />
      </div>

      {/* Podium */}
      <div className="flex items-end justify-center gap-2 pt-12 px-2 h-72">
        {podiumLayout.map((user, idx) => {
          const rank = users.indexOf(user) + 1;
          const isGold = rank === 1;
          const isSilver = rank === 2;
          const isBronze = rank === 3;

          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                "flex-1 flex flex-col items-center gap-3 rounded-t-[32px] relative",
                isGold ? "h-64 bg-geometric-amber/10 border-x border-t border-geometric-amber shadow-amber-glow" : 
                isSilver ? "h-52 bg-stone-800/40 border-x border-t border-stone-600/40" : 
                "h-44 bg-stone-900/40 border-x border-t border-stone-800"
              )}
            >
              <div className="absolute -top-14 flex flex-col items-center">
                <div className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center text-3xl border-4 relative overflow-hidden bg-stone-900 shadow-2xl",
                  isGold ? "border-geometric-amber shadow-amber-glow" : 
                  isSilver ? "border-stone-500" : 
                  "border-stone-800"
                )}>
                  {user.avatar}
                </div>
              </div>
              
              <div className="mt-6 text-center px-1">
                <p className="font-black text-[10px] uppercase truncate max-w-[80px]">{user.nickname}</p>
                <p className="text-geometric-amber font-black text-xs mt-1">
                  {tab === 'streaks' ? `${user.streakCurrent}d` : `${user.totalLitres}L`}
                </p>
              </div>

              <div className={cn(
                "mt-auto mb-4 w-9 h-9 rounded-full flex items-center justify-center text-black font-black text-sm",
                isGold ? "bg-geometric-amber" : 
                isSilver ? "bg-stone-400" : 
                "bg-stone-700 text-stone-200"
              )}>
                {rank}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* List */}
      <div className="space-y-4">
        {others.map((user, idx) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="geometric-card flex items-center justify-between p-4 bg-stone-900/20"
          >
            <div className="flex items-center gap-4">
              <span className="text-stone-700 font-black text-sm w-4">{idx + 4}</span>
              <div className="w-10 h-10 flex items-center justify-center bg-stone-900 border border-stone-800 rounded-xl text-xl shadow-lg">
                {user.avatar}
              </div>
              <div>
                <p className="font-black text-stone-200 text-sm">{user.nickname}</p>
                <p className="text-[9px] text-stone-600 font-black uppercase tracking-widest leading-none">{user.rankTitle}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-stone-100 font-black text-sm">
                {tab === 'streaks' ? `${user.streakCurrent} days` : `${user.totalLitres}L`}
              </p>
              {tab === 'streaks' && user.streakCurrent > 0 && (
                <div className="flex justify-end gap-1 mt-1">
                  <Flame className="w-3 h-3 text-geometric-amber fill-geometric-amber" />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl",
        active ? "bg-geometric-card text-geometric-amber shadow-lg border border-geometric-border" : "text-stone-600 hover:text-stone-400"
      )}
    >
      {label}
    </button>
  );
}
