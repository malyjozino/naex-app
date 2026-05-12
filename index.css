import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { FeedProvider } from './contexts/FeedContext';
import AuthScreen from './components/auth/AuthScreen';
import FeedScreen from './components/features/FeedScreen';
import AddBeerScreen from './components/features/AddBeerScreen';
import LeaderboardScreen from './components/features/LeaderboardScreen';
import ProfileScreen from './components/features/ProfileScreen';
import { Home, Trophy, User as UserIcon, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'feed' | 'add' | 'leaderboard' | 'profile'>('feed');

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-geometric-bg">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-6xl"
        >
          🍺
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'feed': return <FeedScreen />;
      case 'add': return <AddBeerScreen onComplete={() => setActiveTab('feed')} />;
      case 'leaderboard': return <LeaderboardScreen />;
      case 'profile': return <ProfileScreen />;
      default: return <FeedScreen />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-geometric-bg max-w-lg mx-auto border-x border-geometric-border shadow-deep relative">
      <header className="sticky top-0 z-40 flex items-center justify-between p-6 bg-geometric-bg/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-geometric-amber rounded-xl flex items-center justify-center shadow-amber-glow">
            <span className="text-xl font-black text-black">NX</span>
          </div>
          <h1 className="text-2xl font-black text-geometric-amber tracking-tighter italic">
            NaEx
          </h1>
        </div>
        <div className="text-[10px] bg-geometric-amber/10 text-geometric-amber px-2 py-1 rounded-full font-black uppercase tracking-widest">
          {user.rankTitle}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="p-4"
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around h-20 nav-blur max-w-lg mx-auto px-6">
        <NavButton 
          active={activeTab === 'feed'} 
          onClick={() => setActiveTab('feed')}
          icon={<Home className="w-5 h-5" />}
          label="Feed"
        />
        <NavButton 
          active={activeTab === 'leaderboard'} 
          onClick={() => setActiveTab('leaderboard')}
          icon={<Trophy className="w-5 h-5" />}
          label="Ranks"
        />
        <div className="relative">
          <button
            onClick={() => setActiveTab('add')}
            className={cn(
              "p-4 rounded-full amber-action border-4 border-geometric-card -mt-16",
              activeTab === 'add' ? "scale-110" : "hover:scale-105"
            )}
          >
            <PlusCircle className="w-8 h-8" />
          </button>
        </div>
        <NavButton 
          active={activeTab === 'profile'} 
          onClick={() => setActiveTab('profile')}
          icon={<UserIcon className="w-5 h-5" />}
          label="Me"
        />
        <div className="w-10" /> {/* Spacer for symmetry if needed, but the design has 4 items + center */}
      </nav>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 transition-all",
        active ? "text-geometric-amber scale-110" : "text-stone-600 hover:text-stone-400"
      )}
    >
      {icon}
      <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <FeedProvider>
        <AppContent />
      </FeedProvider>
    </AuthProvider>
  );
}
