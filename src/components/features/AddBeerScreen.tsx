import { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useFeed } from '../../contexts/FeedContext';
import { beerService } from '../../services/beerService';
import { motion } from 'motion/react';
import { Camera, Image as ImageIcon, Check, Loader2, Beer } from 'lucide-react';
import { cn } from '../../lib/utils';
import { collection, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function AddBeerScreen({ onComplete }: { onComplete: () => void }) {
  const [amount, setAmount] = useState<0.3 | 0.5 | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, updateUser } = useAuth();
  const { addPendingPost, removePendingPost, updatePendingProgress } = useFeed();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (!amount) {
      setError('Choose your poison size! 🍺');
      return;
    }
    if (!photo) {
      setError('Proof or it didn’t happen! Photo required.');
      return;
    }
    if (!user) return;

    try {
      // 1. Generate ID first
      const postId = doc(collection(db, 'posts')).id;
      
      // 2. Create optimistic post for immediate feedback
      const optimisticPost = {
        tempId: postId,
        userId: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        photoUrl: preview || '',
        amount,
        totalLitresAfter: Number((user.totalLitres + amount).toFixed(1)),
        reactions: { '🍺': [], '🔥': [], '💀': [], '😂': [] },
        progress: 0,
        photoBlob: photo,
        isPending: true
      };

      // 3. Update UI instantly
      addPendingPost(optimisticPost);
      onComplete(); // Close modal immediately!

      // 4. Background task: Compress then Upload
      (async () => {
        try {
          const compressedFile = await beerService.compressImage(photo);
          await beerService.addBeerEx(
            user, 
            amount, 
            compressedFile, 
            postId,
            (progress) => updatePendingProgress(postId, progress)
          );
          removePendingPost(postId);
        } catch (err) {
          console.error('Background upload failed:', err);
          removePendingPost(postId);
        }
      })();

    } catch (err: any) {
      setError('Failed to start round: ' + err.message);
    }
  };

  return (
    <div className="space-y-8 py-4">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-xl font-bold tracking-tight">Add New Beer</h2>
        <span className="text-[10px] bg-geometric-amber/10 text-geometric-amber px-2 py-1 rounded-full font-black uppercase">Post Live</span>
      </div>

      <div className="space-y-6">
        {/* Size Selection */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest block px-1">
            Mug Size
          </label>
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
        </div>

        {/* Photo Selection */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest block px-1">
            Visual Proof
          </label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square bg-stone-900 border-2 border-dashed border-stone-800 rounded-[32px] flex items-center justify-center cursor-pointer relative overflow-hidden group hover:border-geometric-amber/50 transition-all"
          >
            {preview ? (
              <img src={preview} className="w-full h-full object-cover" alt="Preview" />
            ) : (
              <div className="flex flex-col items-center gap-4 text-stone-600">
                <div className="w-16 h-16 rounded-full bg-stone-800 flex items-center justify-center group-hover:bg-stone-700 transition-colors">
                  <Camera className="w-8 h-8" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">Capture the Pour</span>
              </div>
            )}
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              capture="environment"
              onChange={handlePhotoChange}
              className="hidden" 
            />
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm font-bold text-center italic">
            "{error}"
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={!amount || !photo}
          className="w-full py-5 rounded-[24px] amber-action text-xl uppercase tracking-tighter flex items-center justify-center gap-3 italic"
        >
          <Beer className="w-6 h-6" />
          <span>Pour Round 🍺</span>
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
        "py-6 rounded-[24px] flex flex-col items-center justify-center gap-1 transition-all border-2",
        active 
          ? "bg-geometric-amber/10 border-geometric-amber shadow-amber-glow text-geometric-amber" 
          : "bg-stone-900/50 border-stone-800 text-stone-600 hover:border-stone-700"
      )}
    >
      <span className="text-3xl font-black">{size}L</span>
      <span className="text-[9px] font-black uppercase tracking-widest">{size === 0.3 ? 'Sipping' : 'Slamming'}</span>
    </button>
  );
}
