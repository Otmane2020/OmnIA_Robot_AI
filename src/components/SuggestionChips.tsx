import React from 'react';

interface SuggestionChipsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  quickActions?: { label: string; action: string }[];
}

export const SuggestionChips: React.FC<SuggestionChipsProps> = ({ 
  suggestions, 
  onSuggestionClick,
  quickActions
}) => {
  // Ne pas afficher de suggestions automatiques
  if (!suggestions || suggestions.length === 0) {
    return null;
  }
  
  // Limiter à 1 suggestion maximum et seulement si pertinente
  const displaySuggestions = suggestions.slice(0, 1);

  return (
    <div className="mb-4">
      {/* Regular Suggestions */}
      <div className="flex gap-1 sm:gap-2 lg:gap-3 overflow-x-auto pb-2 sm:pb-3 scrollbar-hide">
        {displaySuggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
            className="flex-shrink-0 px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 hover:text-white text-xs rounded-lg border border-cyan-500/30 transition-all whitespace-nowrap"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};