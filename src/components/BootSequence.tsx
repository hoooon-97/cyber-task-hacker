import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Lock, Unlock, Radio, User, Shield } from 'lucide-react';
import { SoundEngine } from '../utils/SoundEngine';

const BOOT_LINES = [
  { text: 'BIOS DATE 05/27/26 21:09:34 VER 2.0.7', delay: 0 },
  { text: 'CPU: NEURAL-NET CORE i9 @ 8.00GHz', delay: 100 },
  { text: 'MEMORY TEST: 65536K OK', delay: 200 },
  { text: 'LOADING KERNEL v4.20.69...', delay: 400 },
  { text: 'MOUNTING ENCRYPTED FILESYSTEM...', delay: 600 },
  { text: 'CHECKING SECURITY CLEARANCE...', delay: 900 },
  { text: 'ACCESS LEVEL: RESTRICTED', delay: 1200 },
  { text: 'WARNING: UNAUTHORIZED ACCESS DETECTED', delay: 1400, type: 'warn' as const },
  { text: 'INITIATING BYPASS PROTOCOL...', delay: 1600 },
];

interface Props {
  isGithubUser: boolean;
  githubHandle: string;
  onComplete: () => void;
}

export default function BootSequence({ isGithubUser, githubHandle, onComplete }: Props) {
  const [phase, setPhase] = useState<'boot' | 'input' | 'hacking' | 'done'>('boot');
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [handle, setHandle] = useState('');
  const [hackLogs, setHackLogs] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-initiate hack for GitHub users
  useEffect(() => {
    if (phase === 'hacking' && isGithubUser && hackLogs.length === 0) {
      const timer = setTimeout(() => {
        initiateHack();
      }, 800);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, isGithubUser, hackLogs.length]);

  useEffect(() => {
    let timeouts: number[] = [];
    BOOT_LINES.forEach((line) => {
      timeouts.push(
        window.setTimeout(() => {
          setVisibleLines((prev) => prev + 1);
        }, line.delay)
      );
    });

    // GitHub users skip input, go straight to hacking
    const nextPhaseDelay = isGithubUser ? 2000 : 2500;
    timeouts.push(
      window.setTimeout(() => setPhase(isGithubUser ? 'hacking' : 'input'), nextPhaseDelay)
    );

    return () => timeouts.forEach(clearTimeout);
  }, [isGithubUser]);

  useEffect(() => {
    if (phase === 'input') {
      inputRef.current?.focus();
    }
  }, [phase]);

  const initiateHack = () => {
    if (!isGithubUser && !handle.trim()) return;
    SoundEngine.playBootBeep();
    setPhase('hacking');

    const logs = [
      '> ESTABLISHING SECURE CONNECTION...',
      '> BYPASSING FIREWALL LAYER 1...',
      '> BYPASSING FIREWALL LAYER 2...',
      '> DECRYPTING AUTH TOKEN...',
      '> INJECTING PAYLOAD...',
      '> ROOT ACCESS OBTAINED',
      '> ACCESS GRANTED',
    ];

    logs.forEach((log, i) => {
      setTimeout(() => {
        setHackLogs((prev) => [...prev, log]);
      }, i * 400);
    });

    setTimeout(() => {
      setPhase('done');
      setTimeout(() => onComplete(), 800);
    }, logs.length * 400 + 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') initiateHack();
  };

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          className="fixed inset-0 z-[200] bg-dark flex flex-col items-center justify-center p-4"
          exit={{ opacity: 0, y: -50, transition: { duration: 0.8 } }}
        >
          {/* CRT flicker overlay during hacking */}
          {phase === 'hacking' && (
            <motion.div
              className="absolute inset-0 bg-alert/10 pointer-events-none"
              animate={{ opacity: [0, 0.3, 0, 0.5, 0] }}
              transition={{ duration: 1.5, repeat: 2 }}
            />
          )}

          <div className="w-full max-w-2xl">
            {/* Boot lines */}
            <div className="font-mono text-[11px] sm:text-xs space-y-1 mb-6 min-h-[200px]">
              {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`${line.type === 'warn' ? 'text-warn' : 'text-text-dim'}`}
                >
                  <span className="text-primary mr-2">&gt;</span>
                  {line.text}
                </motion.div>
              ))}

              {/* GitHub user welcome */}
              {phase === 'hacking' && isGithubUser && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 text-primary font-bold"
                >
                  <Shield size={12} className="inline mr-2" />
                  WELCOME BACK, OPERATIVE {githubHandle}
                </motion.div>
              )}

              {/* Guest input phase */}
              {phase === 'input' && !isGithubUser && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4"
                >
                  <div className="flex items-center gap-2 text-primary">
                    <User size={12} />
                    <span>ENTER OPERATIVE HANDLE:</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-primary">&gt;</span>
                    <input
                      ref={inputRef}
                      type="text"
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="GH0ST_01"
                      maxLength={16}
                      className="bg-transparent border-none border-b border-primary text-primary text-lg outline-none flex-1 placeholder:text-text-dim/30"
                    />
                  </div>
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    onClick={initiateHack}
                    disabled={!handle.trim()}
                    className="mt-4 px-6 py-2.5 bg-alert/10 border border-alert text-alert text-xs font-bold hover:bg-alert/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
                    <Lock size={14} />
                    INITIATE HACK
                  </motion.button>
                </motion.div>
              )}

              {/* Hacking phase */}
              {phase === 'hacking' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 space-y-1"
                >
                  {hackLogs.map((log, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`${
                        log.includes('GRANTED')
                          ? 'text-matrix text-sm font-bold'
                          : log.includes('ROOT')
                          ? 'text-warn'
                          : 'text-secondary'
                      }`}
                    >
                      <span className="text-text-dim mr-2">
                        {log.includes('GRANTED') ? <Unlock size={10} className="inline" /> : <Radio size={10} className="inline" />}
                      </span>
                      {log}
                    </motion.div>
                  ))}
                  {hackLogs.length < 7 && (
                    <div className="text-primary animate-blink">_</div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Progress bar during hacking */}
            {phase === 'hacking' && (
              <div className="h-1 bg-border rounded overflow-hidden">
                <motion.div
                  className="h-full bg-alert"
                  initial={{ width: '0%' }}
                  animate={{ width: `${(hackLogs.length / 7) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}

            {/* Footer */}
            {phase === 'input' && !isGithubUser && (
              <div className="mt-8 text-[9px] text-text-dim text-center">
                <Terminal size={10} className="inline mr-1" />
                SECURE TERMINAL CONNECTION | ENCRYPTION: AES-256
              </div>
            )}

            {/* Auto-initiate for GitHub users */}
            {phase === 'hacking' && hackLogs.length === 0 && isGithubUser && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={initiateHack}
                className="w-full mt-4 px-4 py-2 bg-primary/10 border border-primary text-primary text-xs font-bold hover:bg-primary/20 transition-all"
              >
                <Unlock size={14} className="inline mr-2" />
                ACCESS GRANTED — PROCEED
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
