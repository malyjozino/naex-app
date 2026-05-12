import { useEffect, useState } from 'react';
import { beerService } from '../../services/beerService';
import { BeerPost, PendingPost } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useFeed } from '../../contexts/FeedContext';
import { motion, AnimatePresence } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageSquare, Share2, Flame, Skull, Laugh, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function FeedScreen() {
  const { posts, pendingPosts } = useFeed();
  const { user } = useAuth();

  const filteredPendingPosts = pendingPosts.filter(
    pending => !posts.some(real => real.id === pending.tempId)
  );

  return (
    <div className="space-y-6">
      <AnimatePresence mode="popLayout">
        {/* Pending Posts */}
        {filteredPendingPosts.map((post) => (
          <PostCard key={post.tempId} post={post as any} userId={user?.id || ''} />
        ))}
        
        {/* Realtime Posts */}
        {posts.map((post) => (
          <PostCard key={post.id} post={post} userId={user?.id || ''} />
        ))}
      </AnimatePresence>
      
      {posts.length === 0 && pendingPosts.length === 0 && (
        <div className="text-center py-20 text-stone-600">
          <p className="italic">"The tavern is quiet... too quiet."</p>
          <p className="text-sm font-bold mt-2">BE THE FIRST TO POUR! 🍺</p>
        </div>
      )}
    </div>
  );
}

function PostCard({ post, userId }: { post: BeerPost & Partial<PendingPost>, userId: string }) {
  const handleReaction = (emoji: string) => {
    if (post.isPending) return;
    const hasReacted = post.reactions[emoji]?.includes(userId);
    beerService.toggleReaction(post.id, emoji, userId, hasReacted);
  };

  const getReactionCount = (emoji: string) => post.reactions[emoji]?.length || 0;
  const iReacted = (emoji: string) => post.reactions[emoji]?.includes(userId);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "geometric-card overflow-hidden",
        post.isPending && "opacity-80 grayscale-[0.5]"
      )}
    >
      <div className="p-4 flex items-center justify-between bg-black/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center bg-stone-800 border-2 border-geometric-amber/50 rounded-full text-xl shadow-lg">
            {post.avatar}
          </div>
          <div>
            <h3 className="font-bold text-stone-100 text-sm tracking-tight">{post.nickname}</h3>
            <p className="text-[9px] text-stone-500 uppercase font-black tracking-widest">
              {post.isPending ? 'Uploading 🍺...' : (post.timestamp?.toDate ? formatDistanceToNow(post.timestamp.toDate(), { addSuffix: true }) : 'just now')}
            </p>
          </div>
        </div>
        <div className="px-2.5 py-1 bg-geometric-amber text-black text-[10px] font-black rounded-lg italic">
          {post.amount}L PINT
        </div>
      </div>

      <div className="aspect-square relative bg-stone-900 overflow-hidden">
        <img 
          src={post.photoUrl} 
          alt="Beer" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
        
        {post.isPending && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
             <div className="w-12 h-12 rounded-full bg-geometric-amber flex items-center justify-center shadow-amber-glow animate-pulse">
                <Loader2 className="w-6 h-6 text-black animate-spin" />
             </div>
             <div className="mt-4 w-32 h-1.5 bg-stone-800 rounded-full overflow-hidden">
                <motion.div 
                   className="h-full bg-geometric-amber"
                   initial={{ width: 0 }}
                   animate={{ width: `${post.progress || 10}%` }}
                />
             </div>
          </div>
        )}

        <div className="absolute bottom-4 left-4 flex gap-2">
          <div className="bg-stone-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/5 text-[10px] font-black text-white uppercase tracking-widest">
            {post.totalLitresAfter}L Total
          </div>
        </div>
      </div>

      {!post.isPending && (
        <div className="p-4 flex justify-between items-center bg-black/10">
          <div className="flex items-center gap-2">
            <ReactionButton 
              emoji="🍺" 
              count={getReactionCount('🍺')} 
              active={iReacted('🍺')} 
              onClick={() => handleReaction('🍺')} 
            />
            <ReactionButton 
              emoji="🔥" 
              count={getReactionCount('🔥')} 
              active={iReacted('🔥')} 
              onClick={() => handleReaction('🔥')} 
            />
            <ReactionButton 
              emoji="💀" 
              count={getReactionCount('💀')} 
              active={iReacted('💀')} 
              onClick={() => handleReaction('💀')} 
            />
            <ReactionButton 
              emoji="😂" 
              count={getReactionCount('😂')} 
              active={iReacted('😂')} 
              onClick={() => handleReaction('😂')} 
            />
          </div>
          <div className="text-[10px] text-stone-600 font-bold uppercase tracking-tighter">
            Tavern Hall
          </div>
        </div>
      )}
    </motion.div>
  );
}

function ReactionButton({ emoji, count, active, onClick }: { emoji: string, count: number, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all active:scale-90 border",
        active 
          ? "bg-geometric-amber/20 border-geometric-amber/40 text-geometric-amber shadow-[0_0_10px_rgba(245,158,11,0.2)]" 
          : "bg-stone-800/30 border-stone-800/50 text-stone-500 hover:border-stone-700"
      )}
    >
      <span className="text-base leading-none">{emoji}</span>
      {count > 0 && <span className="text-[10px] font-black">{count}</span>}
    </button>
  );
}
