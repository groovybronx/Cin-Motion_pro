import React from 'react';

interface InteractiveTextWithGlossaryProps {
  readonly text: string;
  readonly onOpenGlossaryTerm: (key: string) => void;
}

// Map of keywords to their glossary key
const GLOSSARY_KEYWORDS: readonly { readonly phrase: RegExp; readonly key: string }[] = [
  { phrase: /\bparallaxe\b/gi, key: 'parallaxe' },
  { phrase: /\bfocale\b/gi, key: 'focale' },
  { phrase: /\btéléobjectif\b/gi, key: 'focale' },
  { phrase: /\bgrand-angle\b/gi, key: 'focale' },
  { phrase: /\bprofondeur de champ\b/gi, key: 'profondeur-de-champ' },
  { phrase: /\bchariot \(dolly\)\b/gi, key: 'dolly' },
  { phrase: /\bdolly\b/gi, key: 'dolly' },
  { phrase: /\bsteadicam\b/gi, key: 'steadicam' },
  { phrase: /\btête fluide\b/gi, key: 'tete-fluide' },
  { phrase: /\bcrash-zoom\b/gi, key: 'crash-zoom' },
  { phrase: /\bcrash zoom\b/gi, key: 'crash-zoom' },
  { phrase: /\bplan débullé\b/gi, key: 'dutch-angle' },
  { phrase: /\bdutch angle\b/gi, key: 'dutch-angle' },
  { phrase: /\btechnocrane\b/gi, key: 'technocrane' },
  { phrase: /\brègle des 180 degrés\b/gi, key: 'regle-180' },
  { phrase: /\brègle des 180°\b/gi, key: 'regle-180' },
  { phrase: /\bobturateur à 180°\b/gi, key: 'obturateur-180' },
  { phrase: /\beasyrig\b/gi, key: 'easyrig' },
  { phrase: /\bfrustum\b/gi, key: 'frustum' },
];

export const InteractiveTextWithGlossary: React.FC<InteractiveTextWithGlossaryProps> = ({
  text,
  onOpenGlossaryTerm,
}) => {
  // Simple clean token matching: find matches and split
  const combinedRegex = /(parallaxe|focale|téléobjectif|grand-angle|profondeur de champ|chariot \(dolly\)|dolly|steadicam|tête fluide|crash-zoom|crash zoom|plan débullé|dutch angle|technocrane|règle des 180 degrés|règle des 180°|obturateur à 180°|easyrig|frustum)/gi;

  const parts = text.split(combinedRegex);

  return (
    <span>
      {parts.map((part, index) => {
        const lower = part.toLowerCase();
        const matched = GLOSSARY_KEYWORDS.find((item) =>
          lower.match(item.phrase)
        );

        if (matched) {
          return (
            <button
              key={index}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenGlossaryTerm(matched.key);
              }}
              title="Cliquer pour voir la définition technique"
              className="inline-flex items-baseline text-amber-300 font-medium underline decoration-amber-500/50 decoration-dotted underline-offset-2 hover:text-amber-200 hover:decoration-amber-300 transition-colors cursor-pointer bg-amber-500/10 px-1 py-0.5 rounded text-inherit"
            >
              {part}
            </button>
          );
        }

        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </span>
  );
};
