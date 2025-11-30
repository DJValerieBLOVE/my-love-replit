import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PortalImage from "@assets/generated_images/mystical_glowing_dimensional_portal_entrance.png";

interface SurprisePortalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaim: (amount: number) => void;
}

export function SurprisePortal({ isOpen, onClose, onClaim }: SurprisePortalProps) {
  const [step, setStep] = useState<'intro' | 'reveal'>('intro');
  
  // Reset step when opening
  useEffect(() => {
    if (isOpen) setStep('intro');
  }, [isOpen]);

  const REWARD_AMOUNT = 111; // Magic number

  const handleEnter = () => {
    setStep('reveal');
  };

  const handleClaim = () => {
    onClaim(REWARD_AMOUNT);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
          <DialogContent className="sm:max-w-md border-none bg-transparent shadow-none p-0 overflow-hidden text-white">
            {/* Magical Background Container */}
            <div className="relative w-full h-[500px] rounded-2xl overflow-hidden flex flex-col items-center justify-center text-center p-6 isolate">
              
              {/* Background Image with Overlay */}
              <div className="absolute inset-0 z-0">
                <img 
                  src={PortalImage} 
                  alt="Cosmic Portal" 
                  className="w-full h-full object-cover scale-110 animate-pulse-slow" 
                />
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
                <div className="absolute inset-0 bg-gradient-to-b from-purple-900/40 via-transparent to-black/80" />
              </div>

              {/* Content */}
              <div className="relative z-10 w-full h-full flex flex-col items-center justify-between py-8">
                
                {/* Header */}
                <div className="space-y-2">
                   <motion.div 
                     initial={{ opacity: 0, y: -20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.2 }}
                     className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-widest"
                   >
                      <Sparkles className="w-3 h-3 text-yellow-300" />
                      Rare Discovery
                   </motion.div>
                   <motion.h2 
                     initial={{ opacity: 0, scale: 0.9 }}
                     animate={{ opacity: 1, scale: 1 }}
                     transition={{ delay: 0.3, type: "spring" }}
                     className="text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-white to-purple-200 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                   >
                      Surprise Portal!
                   </motion.h2>
                </div>

                {/* Center Interaction */}
                <div className="flex-1 flex items-center justify-center w-full">
                   {step === 'intro' ? (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleEnter}
                        className="cursor-pointer group relative"
                      >
                         {/* Pulsing Orb Effect */}
                         <div className="absolute inset-0 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
                         <div className="w-32 h-32 rounded-full border-4 border-white/20 bg-black/40 backdrop-blur-sm flex items-center justify-center shadow-[0_0_50px_rgba(139,92,246,0.5)] group-hover:shadow-[0_0_80px_rgba(139,92,246,0.8)] transition-all duration-500">
                            <span className="text-4xl animate-bounce">🌌</span>
                         </div>
                         <p className="mt-6 text-lg font-medium text-purple-200 group-hover:text-white transition-colors">Tap to Enter</p>
                      </motion.div>
                   ) : (
                      <motion.div
                        initial={{ scale: 0, rotate: 180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", damping: 12 }}
                        className="text-center space-y-4"
                      >
                         <div className="w-40 h-40 mx-auto bg-gradient-to-br from-yellow-400 to-orange-600 rounded-2xl rotate-3 flex items-center justify-center shadow-[0_0_50px_rgba(234,179,8,0.6)] border-4 border-white/20">
                            <div className="text-center">
                               <Zap className="w-16 h-16 text-white mx-auto mb-1 drop-shadow-md" fill="currentColor" />
                               <p className="text-3xl font-bold text-white drop-shadow-md">+{REWARD_AMOUNT}</p>
                               <p className="text-xs font-bold text-white/80 uppercase tracking-wider">Sats</p>
                            </div>
                         </div>
                         <div className="bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10 max-w-[280px] mx-auto">
                            <p className="text-sm italic text-purple-100">
                               "The universe rewards the curious. You found a hidden pocket of abundance!"
                            </p>
                         </div>
                      </motion.div>
                   )}
                </div>

                {/* Footer Actions */}
                <div className="w-full px-8">
                   {step === 'intro' ? (
                      <Button 
                        variant="ghost" 
                        onClick={onClose}
                        className="w-full text-white/50 hover:text-white hover:bg-white/10"
                      >
                        Ignore (Close Portal)
                      </Button>
                   ) : (
                      <Button 
                        onClick={handleClaim}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold h-12 rounded-xl shadow-lg border border-white/20"
                      >
                        Claim Reward ⚡
                      </Button>
                   )}
                </div>

              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
