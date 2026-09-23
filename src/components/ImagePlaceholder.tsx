import React from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface ImagePlaceholderProps {
  className?: string;
  aspectRatio?: string;
  showIcon?: boolean;
  type?: 'generic' | 'drink' | 'interior' | 'illustration';
  variant?: 'cream' | 'dark' | 'slab';
}

export const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
  className = '',
  aspectRatio = 'aspect-4/3',
  showIcon = true,
  type = 'generic',
  variant = 'cream',
}) => {
  const bgClasses = {
    cream: 'bg-[#E7DFC8]/50 border-[#263A20]/10',
    dark: 'bg-[#202E1B]/80 border-white/10',
    slab: 'bg-[#E3DAC8]/70 border-[#263A20]/15',
  }[variant];

  return (
    <div
      className={`relative w-full ${aspectRatio} ${bgClasses} border rounded-2xl flex flex-col items-center justify-center overflow-hidden select-none transition-colors ${className}`}
    >
      {/* Subtle architectural wireframe diagonals or coordinate grid */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <svg
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <line
            x1="0"
            y1="0"
            x2="100%"
            y2="100%"
            stroke="currentColor"
            strokeWidth="0.75"
            strokeDasharray="4 4"
            className={variant === 'dark' ? 'text-white/30' : 'text-[#263A20]/25'}
          />
          <line
            x1="100%"
            y1="0"
            x2="0"
            y2="100%"
            stroke="currentColor"
            strokeWidth="0.75"
            strokeDasharray="4 4"
            className={variant === 'dark' ? 'text-white/30' : 'text-[#263A20]/25'}
          />
        </svg>
      </div>

      {/* Wireframe Silhouette or Placeholder Indicator */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-2">
        {type === 'drink' && (
          <div className="flex flex-col items-center">
            {/* Minimalist cup outline wireframe */}
            <div className="w-16 h-28 sm:w-20 sm:h-32 border-2 border-dashed border-[#263A20]/40 rounded-b-xl rounded-t-sm flex flex-col items-center justify-between p-2 relative bg-[#F7F4EC]/40">
              {/* Straw indicator */}
              <div className="w-1.5 h-6 bg-[#263A20]/30 rounded-full -mt-5 self-end mr-3 rotate-6" />
              {/* Cup rim */}
              <div className="w-full h-2 border-b border-[#263A20]/30" />
              {/* Cup fill level wireframe */}
              <div className="w-full h-12 bg-[#263A20]/10 rounded-b-lg border-t border-[#263A20]/20 flex items-end justify-center pb-2">
                {/* Boba pearls placeholder circles */}
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#263A20]/30" />
                  <span className="w-2 h-2 rounded-full bg-[#263A20]/30" />
                  <span className="w-2 h-2 rounded-full bg-[#263A20]/30" />
                </div>
              </div>
            </div>
          </div>
        )}

        {type === 'interior' && (
          <div className="flex flex-col items-center gap-3 p-4">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
              <ImageIcon className="w-6 h-6 text-white/70" />
            </div>
            <div className="flex gap-1.5 items-center">
              <div className="w-12 h-1.5 rounded-full bg-white/30" />
              <div className="w-6 h-1.5 rounded-full bg-white/20" />
            </div>
          </div>
        )}

        {type === 'generic' && showIcon && (
          <div className="flex flex-col items-center gap-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                variant === 'dark'
                  ? 'bg-white/10 border-white/20 text-white/60'
                  : 'bg-[#263A20]/5 border-[#263A20]/15 text-[#263A20]/40'
              }`}
            >
              <ImageIcon className="w-5 h-5" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
