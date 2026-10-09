import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, ArrowRight, Award } from 'lucide-react';
import { CameraMovementDto } from '../../../application/dtos/camera-movement.dto.ts';
import { MovementId } from '../../../domain/entities/camera-movement.entity.ts';

interface QuizModeModalProps {
  readonly isOpen: boolean;
  readonly movements: readonly CameraMovementDto[];
  readonly currentQuizMovement: CameraMovementDto;
  readonly onSelectQuizMovement: (movement: CameraMovementDto) => void;
  readonly onClose: () => void;
}

export const QuizModeModal: React.FC<QuizModeModalProps> = ({
  isOpen,
  movements,
  currentQuizMovement,
  onSelectQuizMovement,
  onClose,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<MovementId | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [roundsPlayed, setRoundsPlayed] = useState<number>(0);

  if (!isOpen) return null;

  // Generate 3 random wrong options + 1 correct option
  const otherMovements = movements.filter((m) => m.id !== currentQuizMovement.id);
  const wrongOptions = otherMovements.slice(0, 3);
  const options = [currentQuizMovement, ...wrongOptions].sort((a, b) =>
    a.frenchName.localeCompare(b.frenchName)
  );

  const handleChoose = (id: MovementId): void => {
    if (isAnswered) return;
    setSelectedAnswer(id);
    setIsAnswered(true);
    setRoundsPlayed((prev) => prev + 1);
    if (id === currentQuizMovement.id) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = (): void => {
    setIsAnswered(false);
    setSelectedAnswer(null);
    // Pick another random movement
    const available = movements.filter((m) => m.id !== currentQuizMovement.id);
    const nextRandom = available[Math.floor(Math.random() * available.length)];
    if (nextRandom) {
      onSelectQuizMovement(nextRandom);
    }
  };

  const isCorrect = selectedAnswer === currentQuizMovement.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-xl rounded-xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-400" />
            <h3 className="font-cinema text-lg font-bold text-neutral-100">
              Défi : Reconnexion Visuelle
            </h3>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono-tech text-xs text-neutral-400">
              SCORE : <strong className="text-amber-400">{score}</strong> / {roundsPlayed}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Question prompt */}
        <div className="mt-4 flex flex-col gap-2">
          <p className="text-sm text-neutral-300">
            Observez l'animation en cours dans le simulateur en arrière-plan. Quel est ce mouvement de caméra ?
          </p>
          <div className="text-xs text-neutral-400 font-mono-tech">
            Indice mécanique : {currentQuizMovement.mechanicalAxis}
          </div>
        </div>

        {/* 4 Choices */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {options.map((opt) => {
            const isThisSelected = selectedAnswer === opt.id;
            const isThisCorrect = opt.id === currentQuizMovement.id;

            let btnStyle = 'border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-neutral-700';

            if (isAnswered) {
              if (isThisCorrect) {
                btnStyle = 'border-emerald-500 bg-emerald-950/60 text-emerald-200 font-semibold';
              } else if (isThisSelected) {
                btnStyle = 'border-rose-500 bg-rose-950/60 text-rose-200';
              } else {
                btnStyle = 'border-neutral-800 bg-neutral-950/30 text-neutral-400 opacity-60';
              }
            }

            return (
              <button
                key={opt.id}
                type="button"
                disabled={isAnswered}
                onClick={() => handleChoose(opt.id)}
                className={`flex flex-col items-start rounded-lg border p-3 text-left transition-all cursor-pointer ${btnStyle}`}
              >
                <span className="text-xs font-semibold">{opt.frenchName}</span>
                <span className="text-[11px] font-mono-tech opacity-70">{opt.originalName}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback area */}
        {isAnswered && (
          <div className="mt-5 flex flex-col gap-3 rounded-lg border border-neutral-800 bg-neutral-950 p-4">
            <div className="flex items-center gap-2">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  <span className="text-sm font-bold text-emerald-400">Excellente analyse !</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-rose-400" />
                  <span className="text-sm font-bold text-rose-400">
                    Ce n'est pas tout à fait ça...
                  </span>
                </>
              )}
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              {currentQuizMovement.shortDefinition}
            </p>

            <div className="text-xs text-amber-300/90 font-mono-tech">
              Scène culte : {currentQuizMovement.iconicExamples[0]?.filmTitle} ({currentQuizMovement.iconicExamples[0]?.year})
            </div>

            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={handleNextQuestion}
                className="flex items-center gap-2 rounded-md bg-amber-500 px-4 py-2 text-xs font-semibold text-neutral-950 hover:bg-amber-400 transition-colors cursor-pointer"
              >
                <span>Question Suivante</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
