import type { ISoundsInfoStoreValue } from '@/utils/interfaces/SoundsManagerInterfaces';
import SoundsManager from '@/utils/SoundModule/SoundsManager';

export default function getPercentagesData(
  value: ISoundsInfoStoreValue | Partial<ISoundsInfoStoreValue>
) {
  return {
    reverb: SoundsManager.valueConverter(
      'reverb',
      value.reverbEffectValue || 0,
      false
    ),
    distance: SoundsManager.valueConverter(
      'distance',
      value.lowKeyEffectValue || 0,
      false
    ),
    speed: {
      type: (() => {
        if (!value.speedValue || value.speedValue === 1) return 'normal';
        if (value.speedValue < 1) return 'slowed';
        return 'sped up';
      })(),
      value: (() => {
        const computed = SoundsManager.valueConverter(
          'speed',
          value.speedValue ?? 1,
          false
        );
        if (computed === 50) return 50;
        if (computed < 50) return computed * 2;
        return (computed - 50) * 2;
      })(),
    },
  };
}
