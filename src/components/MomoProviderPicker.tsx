import React from 'react';
import { useLanguage } from '../lib/i18n';

export type MomoNetworkProvider = 'mtn' | 'airtel' | 'mpesa';

interface MomoProviderPickerProps {
  /** Currently selected mobile money network. */
  provider: MomoNetworkProvider;
  onProviderChange: (provider: MomoNetworkProvider) => void;
  /**
   * Optional phone number field. Only rendered when both `phone` and
   * `onPhoneChange` are supplied — callers that only need the provider
   * selector (e.g. AuthModal's signup form, which doesn't expose a phone
   * input today) can omit these and get the picker buttons only.
   */
  phone?: string;
  onPhoneChange?: (phone: string) => void;
  disabled?: boolean;
}

/**
 * Mobile money provider picker (MTN MoMo / Airtel Money / M-Pesa), extracted
 * from AuthModal.tsx's signup form so it can be reused by the onboarding
 * wallet-setup step without duplicating the UI. Visual design and behavior
 * of the button grid are unchanged from the original inline block.
 */
export const MomoProviderPicker: React.FC<MomoProviderPickerProps> = ({
  provider,
  onProviderChange,
  phone,
  onPhoneChange,
  disabled = false,
}) => {
  const { t } = useLanguage();
  const showPhoneInput = phone !== undefined && Boolean(onPhoneChange);

  return (
    <div className="space-y-1">
      <label className="text-xs font-bold text-slate-300 font-mono-code">{t('auth.label_momo_provider')}</label>
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => onProviderChange('mtn')}
          disabled={disabled}
          className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition-all ${
            provider === 'mtn' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500' : 'bg-slate-800 text-slate-400 border-slate-700'
          } disabled:opacity-50`}
        >
          🇺🇬 MTN MoMo
        </button>
        <button
          type="button"
          onClick={() => onProviderChange('airtel')}
          disabled={disabled}
          className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition-all ${
            provider === 'airtel' ? 'bg-red-500/20 text-red-400 border-red-500' : 'bg-slate-800 text-slate-400 border-slate-700'
          } disabled:opacity-50`}
        >
          🔴 Airtel Money
        </button>
        <button
          type="button"
          onClick={() => onProviderChange('mpesa')}
          disabled={disabled}
          className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition-all ${
            provider === 'mpesa' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500' : 'bg-slate-800 text-slate-400 border-slate-700'
          } disabled:opacity-50`}
        >
          🇰🇪 M-Pesa
        </button>
      </div>

      {showPhoneInput && (
        <div className="pt-2 space-y-1">
          <label className="text-xs font-bold text-slate-300 font-mono-code">{t('auth.label_mobile_number')}</label>
          <input
            type="tel"
            placeholder="+256 780 123 456"
            value={phone}
            onChange={(e) => onPhoneChange?.(e.target.value)}
            disabled={disabled}
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 disabled:opacity-50"
          />
        </div>
      )}
    </div>
  );
};
