import React from 'react';

interface VisorLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  customSize?: number;
  showText?: boolean;
  textClassName?: string;
  glow?: boolean;
  animated?: boolean;
}

export const VisorLogo: React.FC<VisorLogoProps> = ({
  className = '',
  size = 'md',
  customSize,
  showText = true,
  textClassName = '',
  glow = false,
  animated = false,
}) => {
  const getDimension = () => {
    if (customSize) return { w: customSize, h: customSize };
    switch (size) {
      case 'sm':
        return { w: 26, h: 32 };
      case 'md':
        return { w: 34, h: 42 };
      case 'lg':
        return { w: 46, h: 58 };
      case 'xl':
        return { w: 68, h: 86 };
      default:
        return { w: 34, h: 42 };
    }
  };

  const { w, h } = getDimension();

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div className={`relative flex items-center justify-center ${glow ? 'drop-shadow-[0_0_12px_rgba(0,168,255,0.6)]' : ''}`}>
        <svg
          width={w}
          height={h}
          viewBox="0 0 100 125"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`transition-transform duration-300 ${animated ? 'hover:scale-105' : ''}`}
        >
          {/* Cyan/Electric Blue "V" Visor Polygon with precise angles */}
          <path
            d="M5 5 L18 5 L43 108 L95 56 L103 66 L44 122 L5 5 Z"
            fill="#00B4D8"
            stroke="#0A1118"
            strokeWidth="3.5"
            strokeLinejoin="miter"
            className="transition-colors duration-300 hover:fill-[#38BDF8]"
          />
          {/* Inner Accent highlight gradient on the tall left stem */}
          <path
            d="M6 7 L17 7 L42 106 L38 108 L6 7 Z"
            fill="white"
            fillOpacity="0.18"
          />
          {/* Black Play Button Triangle in the center hollow */}
          <polygon
            points="42,50 42,86 78,68"
            fill="#0D1117"
            stroke="#00B4D8"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <polygon
            points="43,53 43,83 74,68"
            fill="#0A0E14"
          />
        </svg>

        {/* Live indicator dot optional */}
        <span className="sr-only">Visor Stream</span>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span className={`font-rajdhani font-bold tracking-wider text-white text-xl sm:text-2xl uppercase ${textClassName}`}>
              VISOR<span className="text-[#00B4D8] font-extrabold ml-1">STREAM</span>
            </span>
            <span className="hidden sm:inline-block text-[9px] font-mono-code uppercase font-semibold px-1.5 py-0.5 rounded bg-[#00B4D8]/10 text-[#00B4D8] border border-[#00B4D8]/30">
              AFRICA • LIVE
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
