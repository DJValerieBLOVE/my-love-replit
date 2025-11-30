import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ArrowRight, HelpCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

export type QuestionType = 'multiple-choice' | 'fill-blank';

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[]; // For multiple choice
  correctAnswer: string | string[]; // For fill blank, can be array of acceptable answers
  explanation?: string;
}

interface QuizProps {
  questions: Question[];
  onComplete: (score: number) => void;
  rewardAmount: number;
}

export function Quiz({ questions, onComplete, rewardAmount }: QuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / questions.length) * 100;

  const handleSubmit = () => {
    let correct = false;

    if (currentQuestion.type === 'multiple-choice') {
      correct = selectedOption === currentQuestion.correctAnswer;
    } else if (currentQuestion.type === 'fill-blank') {
      const possibleAnswers = Array.isArray(currentQuestion.correctAnswer) 
        ? currentQuestion.correctAnswer 
        : [currentQuestion.correctAnswer];
      
      correct = possibleAnswers.some(ans => 
        ans.toLowerCase().trim() === textAnswer.toLowerCase().trim()
      );
    }

    setIsAnswered(true);
    setIsCorrect(correct);
    if (correct) setScore(prev => prev + 1);

    if (correct) {
      // Mini confetti for correct answer
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#22c55e', '#ffffff'] // Green & White
      });
    } else {
       // Shake effect or bad sound could go here
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setTextAnswer('');
      setIsAnswered(false);
      setIsCorrect(false);
    } else {
      // Quiz Complete
      onComplete(score + (isCorrect ? 1 : 0)); // Add last point if correct
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
       {/* Header / Progress */}
       <div className="mb-6 space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground font-medium">
             <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
             <span className="flex items-center gap-1 text-orange-500">
                <Zap className="w-4 h-4" strokeWidth={1.5} />
                Potential Reward: {rewardAmount} Sats
             </span>
          </div>
          <Progress value={progress} className="h-2" />
       </div>

       <AnimatePresence mode="wait">
          <motion.div
             key={currentQuestionIndex}
             initial={{ x: 20, opacity: 0 }}
             animate={{ x: 0, opacity: 1 }}
             exit={{ x: -20, opacity: 0 }}
             transition={{ duration: 0.3 }}
          >
             <Card className="p-6 md:p-8 bg-card border-muted shadow-sm overflow-hidden relative">
                
                {/* Question Text */}
                <h3 className="text-xl md:text-2xl font-serif font-bold mb-6 text-muted-foreground leading-relaxed">
                   {currentQuestion.question}
                </h3>

                {/* Options / Input */}
                <div className="space-y-3">
                   {currentQuestion.type === 'multiple-choice' && currentQuestion.options?.map((option, idx) => (
                      <button
                         key={idx}
                         onClick={() => !isAnswered && setSelectedOption(option)}
                         disabled={isAnswered}
                         className={`
                            w-full text-left px-6 py-4 rounded-lg border transition-all flex items-center justify-between font-serif font-medium text-lg
                            ${isAnswered 
                               ? option === currentQuestion.correctAnswer 
                                  ? 'bg-[#6600ff] text-white border-transparent shadow-sm'
                                  : selectedOption === option 
                                     ? 'bg-destructive text-destructive-foreground border-transparent shadow-sm opacity-70'
                                     : 'bg-white text-muted-foreground border-muted shadow-sm opacity-50'
                               : selectedOption === option
                                  ? 'bg-[#F5F3FF] text-[#6600ff] border-[#6600ff]/50 shadow-md -translate-y-0.5 font-bold'
                                  : 'bg-white text-muted-foreground border-muted shadow-sm hover:bg-[#F5F3FF] hover:text-[#6600ff] hover:border-[#6600ff]/50 hover:shadow-md hover:-translate-y-0.5'
                            }
                         `}
                      >
                         <span>{option}</span>
                         {isAnswered && option === currentQuestion.correctAnswer && (
                            <Check className="w-5 h-5 text-white" />
                         )}
                         {isAnswered && selectedOption === option && option !== currentQuestion.correctAnswer && (
                            <X className="w-5 h-5" />
                         )}
                      </button>
                   ))}

                   {currentQuestion.type === 'fill-blank' && (
                      <div className="relative">
                         <Input 
                            value={textAnswer}
                            onChange={(e) => setTextAnswer(e.target.value)}
                            disabled={isAnswered}
                            placeholder="Type your answer here..."
                            className={`
                               text-base p-4 h-12 transition-all rounded-lg border font-serif
                               ${isAnswered
                                  ? isCorrect
                                     ? 'bg-[#6600ff] text-white border-transparent shadow-sm'
                                     : 'bg-destructive text-destructive-foreground border-transparent shadow-sm'
                                  : 'bg-white text-muted-foreground border-muted shadow-sm focus:bg-[#F5F3FF] focus:text-[#6600ff] focus:border-[#6600ff]/50 focus:shadow-md focus:ring-0'
                               }
                            `}
                         />
                         {isAnswered && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                               {isCorrect ? <Check className="w-5 h-5 text-white" /> : <X className="w-5 h-5 text-destructive-foreground" />}
                            </div>
                         )}
                      </div>
                   )}
                </div>

                {/* Feedback & Explanation */}
                <AnimatePresence>
                   {isAnswered && (
                      <motion.div
                         initial={{ height: 0, opacity: 0 }}
                         animate={{ height: 'auto', opacity: 1 }}
                         className="mt-6 overflow-hidden"
                      >
                         <div className={`p-6 rounded-lg border-2 ${isCorrect ? 'bg-primary/10 border-primary/30 text-foreground' : 'bg-destructive/10 border-destructive/30 text-foreground'}`}>
                            <div className="flex items-start gap-4">
                               <div className={`p-2 rounded-full flex-shrink-0 ${isCorrect ? 'bg-primary/20' : 'bg-destructive/20'}`}>
                                  {isCorrect ? <Check className="w-5 h-5 text-primary" /> : <HelpCircle className="w-5 h-5 text-destructive" />}
                               </div>
                               <div className="flex-1">
                                  <p className={`font-bold text-lg mb-2 ${isCorrect ? 'text-primary' : 'text-destructive'}`}>{isCorrect ? 'Correct!' : 'Not quite right'}</p>
                                  <p className="text-base text-muted-foreground leading-relaxed">
                                     {currentQuestion.explanation || (isCorrect ? "Great job!" : `The correct answer is: ${currentQuestion.correctAnswer}`)}
                                  </p>
                               </div>
                            </div>
                         </div>
                      </motion.div>
                   )}
                </AnimatePresence>

                {/* Footer / Actions */}
                <div className="mt-8 flex justify-end">
                   {!isAnswered ? (
                      <Button 
                         onClick={handleSubmit}
                         disabled={currentQuestion.type === 'multiple-choice' ? !selectedOption : !textAnswer}
                         variant="default"
                      >
                         Check Answer
                      </Button>
                   ) : (
                      <Button 
                         onClick={handleNext}
                         variant="default"
                      >
                         {currentQuestionIndex < questions.length - 1 ? (
                            <>Next Question <ArrowRight className="w-4 h-4" strokeWidth={1.5} /></>
                         ) : (
                            <>Complete Quiz <Zap className="w-4 h-4" strokeWidth={1.5} /></>
                         )}
                      </Button>
                   )}
                </div>

             </Card>
          </motion.div>
       </AnimatePresence>
    </div>
  );
}
