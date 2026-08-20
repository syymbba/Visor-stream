import React, { useId } from 'react';

interface VisorLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  customSize?: number;
  showText?: boolean;
  textClassName?: string;
  glow?: boolean;
  animated?: boolean;
  customLogoUrl?: string;
  includeBackground?: boolean;
}

export const VisorLogo: React.FC<VisorLogoProps> = ({
  className = '',
  size = 'md',
  customSize,
  showText = true,
  textClassName = '',
  glow = false,
  animated = false,
  customLogoUrl,
  includeBackground = true,
}) => {
  const uniqueId = useId().replace(/[:]/g, '_');

  const getDimension = () => {
    if (customSize) return { w: customSize, h: customSize };
    switch (size) {
      case 'sm':
        return { w: 34, h: 34 };
      case 'md':
        return { w: 42, h: 42 };
      case 'lg':
        return { w: 56, h: 56 };
      case 'xl':
        return { w: 84, h: 84 };
      default:
        return { w: 42, h: 42 };
    }
  };

  const { w, h } = getDimension();

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <div className={`relative flex items-center justify-center flex-shrink-0 ${glow ? 'drop-shadow-[0_0_16px_rgba(56,189,248,0.6)]' : ''}`}>
        {customLogoUrl ? (
          <img
            src={customLogoUrl}
            alt="Visor Stream Logo"
            className="rounded-2xl object-contain shadow-md"
            style={{ width: `${w}px`, height: `${h}px` }}
            referrerPolicy="no-referrer"
          />
        ) : (
          <svg
            width={w}
            height={h}
            viewBox="0 0 512 512"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`transition-transform duration-300 ${animated ? 'hover:scale-105 active:scale-95' : ''}`}
          >
            <defs>
              {/* Blue / Indigo Radial-to-Linear Background Gradient */}
              <linearGradient id={`visorBg_${uniqueId}`} x1="15%" y1="10%" x2="85%" y2="90%">
                <stop offset="0%" stopColor="#22397e" />
                <stop offset="40%" stopColor="#2a4b99" />
                <stop offset="75%" stopColor="#3561a7" />
                <stop offset="100%" stopColor="#487cbd" />
              </linearGradient>

              {/* Outer Rim Accent Gradient with Neon Pink & Sky Blue tones */}
              <linearGradient id={`visorRim_${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff3388" stopOpacity="0.75" />
                <stop offset="25%" stopColor="#38bdf8" stopOpacity="0.3" />
                <stop offset="75%" stopColor="#2563eb" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#ff3388" stopOpacity="0.85" />
              </linearGradient>

              {/* Neon Pink Underline for Speed Slats */}
              <linearGradient id={`pinkNeon_${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ff2a85" />
                <stop offset="100%" stopColor="#ff5a9d" />
              </linearGradient>

              {/* Electric Cyan Edge Glow */}
              <linearGradient id={`cyanNeon_${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
            </defs>

            {/* Squircle Rounded Container */}
            {includeBackground && (
              <rect
                x="14"
                y="14"
                width="484"
                height="484"
                rx="116"
                fill={`url(#visorBg_${uniqueId})`}
                stroke={`url(#visorRim_${uniqueId})`}
                strokeWidth="3.5"
              />
            )}

            {/* Main Electric Cyan 'V' Icon Symbol */}
            <path
              d="M 54 71 L 133 44 L 234 345 L 297 230 L 321 260 L 235 410 L 182 410 Z"
              fill="#13a7e8"
              stroke="#000000"
              strokeWidth="4.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Speed Slat 1 (Longest) */}
            <path
              d="M 330 276 L 349 294 L 280 410 L 254 410 Z"
              fill="#0a0a0a"
              stroke="#000000"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <line x1="254" y1="410" x2="280" y2="410" stroke={`url(#pinkNeon_${uniqueId})`} strokeWidth="4" strokeLinecap="round" />
            <line x1="330" y1="276" x2="349" y2="294" stroke="#13a7e8" strokeWidth="2" strokeOpacity="0.8" />

            {/* Speed Slat 2 */}
            <path
              d="M 356 303 L 372 318 L 318 410 L 296 410 Z"
              fill="#0a0a0a"
              stroke="#000000"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <line x1="296" y1="410" x2="318" y2="410" stroke={`url(#pinkNeon_${uniqueId})`} strokeWidth="4" strokeLinecap="round" />
            <line x1="356" y1="303" x2="372" y2="318" stroke="#13a7e8" strokeWidth="2" strokeOpacity="0.8" />

            {/* Speed Slat 3 */}
            <path
              d="M 380 329 L 394 342 L 353 410 L 334 410 Z"
              fill="#0a0a0a"
              stroke="#000000"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <line x1="334" y1="410" x2="353" y2="410" stroke={`url(#pinkNeon_${uniqueId})`} strokeWidth="4" strokeLinecap="round" />
            <line x1="380" y1="329" x2="394" y2="342" stroke="#13a7e8" strokeWidth="2" strokeOpacity="0.8" />

            {/* Speed Slat 4 (Shortest) */}
            <path
              d="M 402 351 L 414 362 L 385 410 L 368 410 Z"
              fill="#0a0a0a"
              stroke="#000000"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <line x1="368" y1="410" x2="385" y2="410" stroke={`url(#pinkNeon_${uniqueId})`} strokeWidth="4" strokeLinecap="round" />
            <line x1="402" y1="351" x2="414" y2="362" stroke="#13a7e8" strokeWidth="2" strokeOpacity="0.8" />
          </svg>
        )}
        <span className="sr-only">Visor Stream</span>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span className={`font-rajdhani font-bold tracking-wider text-slate-100 text-xl sm:text-2xl uppercase ${textClassName}`}>
              VISOR<span className="text-[#38BDF8] font-extrabold ml-1">STREAM</span>
            </span>
            <span className="hidden sm:inline-block text-[9px] font-mono-code uppercase font-semibold px-1.5 py-0.5 rounded bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30">
              PRO • LIVE
            </span>
          </div>
          <span className="text-[10px] tracking-widest uppercase font-medium text-slate-400 font-rajdhani mt-0.5">
            Stream • Play • Connect
          </span>
        </div>
      )}
    </div>
  );
};
