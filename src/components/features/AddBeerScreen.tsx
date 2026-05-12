import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useFeed } from '../../contexts/FeedContext';
import { beerService } from '../../services/beerService';
import { Beer } from 'lucide-react';
import { cn } from '../../lib/utils';
import { collection, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function AddBeerScreen({ onComplete }: { onComplete: () => void }) {
  const [amount, setAmount] = useState<0.3 | 0.5 | null>(null);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const { addPendingPost, removePendingPost } = useFeed();

  const handleSubmit = async () => {
    if (!amount) {
      setError('Choose your poison size! 🍺');
      return;
    }
    if (!user) return;

    try {
      const postId = doc(collection(db, 'posts')).id;
      
      // Univerzálna fotka piva, keďže reálnu neposielame
      const placeholderPhoto = "https://images.unsplash.com/photo-1535958636474-b021ee887b13?q=80&w=1000&auto=format&fit=crop";

      const optimisticPost = {
        tempId: postId,
        userId: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        photoUrl: placeholderPhoto,
        amount,
        totalLitresAfter: Number((user.totalLitres + amount).toFixed(1)),
        reactions: { '🍺': [], '🔥': [], '💀': [], '😂': [] },
        progress: 100,
        isPending: true
      };

      addPendingPost(optimisticPost as any);
      onComplete();

      // Odoslanie do databázy na pozadí
      (async () => {
        try {
          const dummyBlob = new Blob(); 
          await beerService.addBeerEx(
            user, 
            amount, 
            dummyBlob, 
            postId
          );
          removePendingPost(postId);
        } catch (err) {
          console.error('Failed to log beer:', err);
          removePendingPost(postId);
        }
      })();

    } catch (err: any) {
      setError('Tavern error: ' + err.message);
    }
  };

  return (
    <div className="space-y-8 py-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black italic tracking-tighter uppercase">New Round?</h2>
        <p className="text-stone-500 text-xs font-bold tracking-widest uppercase">Select your mug and pour it down</p>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-2 gap-4">
          <SizeButton 
            size={0.3} 
            active={amount === 0.3} 
            onClick={() => setAmount(0.3)} 
          />
          <SizeButton 
            size={0.5} 
            active={amount === 0.5} 
            onClick={() => setAmount(0.5)} 
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm font-bold text-center italic">
            "{error}"
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={!amount}
          className={cn(
            "w-full py-6 rounded-[32px] text-2xl uppercase font-black tracking-tighter flex items-center justify-center gap-3 transition-all italic",
            amount 
              ? "amber-action shadow-amber-glow" 
              : "bg-stone-800 text-stone-600 opacity-50 cursor-not-allowed"
          )}
        >
          <Beer className="w-8 h-8" />
          <span>Pour it! 🍺</span>
        </button>
      </div>
    </div>
  );
}

function SizeButton({ size, active, onClick }: { size: 0.3 | 0.5, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "py-10 rounded-[32px] flex flex-col items-center justify-center gap-2 transition-all border-4",
        active 
          ? "bg-geometric-amber/20 border-geometric-amber text-geometric-amber shadow-[0_0_20px_rgba(245,158,11,0.3)]" 
          : "bg-stone-900/50 border-stone-800 text-stone-600 hover:border-stone-700"
      )}
    >
      <span className="text-5xl font-black tracking-tighter">{size}L</span>
      <span className="text-[10px] font-black uppercase tracking-[0.2em]">{size === 0.3 ? 'Sipping' : 'Slamming'}</span>
    </button>
  );
}
