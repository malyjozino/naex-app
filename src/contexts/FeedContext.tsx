import React, { createContext, useContext, useState, useEffect } from 'react';
import { BeerPost, PendingPost } from '../types';
import { beerService } from '../services/beerService';

interface FeedContextType {
  posts: BeerPost[];
  pendingPosts: PendingPost[];
  addPendingPost: (post: PendingPost) => void;
  removePendingPost: (tempId: string) => void;
  updatePendingProgress: (tempId: string, progress: number) => void;
}

const FeedContext = createContext<FeedContextType | undefined>(undefined);

export function FeedProvider({ children }: { children: React.ReactNode }) {
  const [realtimePosts, setRealtimePosts] = useState<BeerPost[]>([]);
  const [pendingPosts, setPendingPosts] = useState<PendingPost[]>([]);

  useEffect(() => {
    const unsubscribe = beerService.subscribeToFeed(setRealtimePosts);
    return () => unsubscribe();
  }, []);

  const addPendingPost = (post: PendingPost) => {
    setPendingPosts(prev => [post, ...prev]);
  };

  const removePendingPost = (tempId: string) => {
    setPendingPosts(prev => prev.filter(p => p.tempId !== tempId));
  };

  const updatePendingProgress = (tempId: string, progress: number) => {
    setPendingPosts(prev => prev.map(p => 
      p.tempId === tempId ? { ...p, progress } : p
    ));
  };

  return (
    <FeedContext.Provider value={{ 
      posts: realtimePosts, 
      pendingPosts, 
      addPendingPost, 
      removePendingPost,
      updatePendingProgress
    }}>
      {children}
    </FeedContext.Provider>
  );
}

export function useFeed() {
  const context = useContext(FeedContext);
  if (context === undefined) {
    throw new Error('useFeed must be used within a FeedProvider');
  }
  return context;
}
