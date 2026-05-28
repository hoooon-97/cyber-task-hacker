import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { Terminal, Radio, GitBranch, User } from 'lucide-react';

interface Props {
  onGuest: () => void;
  onGithubLogin: () => void;
}

export default function AuthModal({ onGuest, onGithubLogin }: Props) {
  const { loading, signInWithGithub } = useAuth();

  const handleGithub = async () => {
    await signInWithGithub();
    onGithubLogin();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[200] bg-dark flex items-center justify-center">
        <div className="text-center">
          <Radio size={24} className="text-primary animate-spin mx-auto mb-4" />
          <div className="text-sm text-text-dim">CHECKING SECURITY CLEARANCE...</div>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-dark flex items-center justify-center p-4"
      >
        {/* Background effect */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background: 'radial-gradient(circle at 50% 50%, var(--theme-primary)20, transparent 70%)',
          }}
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative w-full max-w-md border border-border bg-panel/90 backdrop-blur-md p-8"
        >
          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-primary" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-primary" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-primary" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-primary" />

          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div
                className="w-16 h-16 rounded-full border-2 border-primary flex items-center justify-center"
                style={{ boxShadow: '0 0 20px var(--theme-primary)40' }}
              >
                <Terminal size={32} className="text-primary" />
              </div>
            </div>
            <h1 className="text-xl font-bold text-white mb-2">CYBER-TASK HACKER</h1>
            <p className="text-[10px] text-text-dim">
              SECURE TERMINAL ACCESS // v2.0.7
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleGithub}
              className="w-full px-4 py-3 border border-primary bg-primary/10 text-primary text-sm font-bold hover:bg-primary/20 transition-all flex items-center justify-center gap-2"
            >
              <GitBranch size={18} />
              SIGN IN WITH GITHUB
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[10px] text-text-dim">OR</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <button
              onClick={onGuest}
              className="w-full px-4 py-2 border border-border text-text-dim text-xs hover:border-text-dim hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <User size={14} />
              CONTINUE AS GUEST
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-[9px] text-text-dim/50">
              BY ACCESSING THIS TERMINAL, YOU AGREE TO THE NETWORK PROTOCOLS
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
