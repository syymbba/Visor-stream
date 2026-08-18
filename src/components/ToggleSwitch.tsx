import React from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  size?: 'sm' | 'md';
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  id,
  size = 'md',
}) => {
  const isSm = size === 'sm';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      id={id}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex flex-shrink-0 cursor-pointer rounded-full border transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 ${
        isSm ? 'h-5 w-9' : 'h-6 w-11'
      } ${
        checked
          ? 'bg-[#0284c7]/20 border-[#0369a1]/40 shadow-[0_0_10px_rgba(2,132,199,0.15)]'
          : 'bg-[#121824] border-[#2a475e]/60'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block rounded-full transform transition duration-200 ease-in-out shadow-sm ${
          isSm ? 'h-3.5 w-3.5 mt-[2px]' : 'h-4.5 w-4.5 mt-[2px]'
        } ${
          checked
            ? `${isSm ? 'translate-x-4' : 'translate-x-5'} bg-[#38bdf8] shadow-[0_0_8px_rgba(56,189,248,0.5)]`
            : `${isSm ? 'translate-x-0.5' : 'translate-x-0.5'} bg-slate-400`
        }`}
      />
    </button>
  );
};
