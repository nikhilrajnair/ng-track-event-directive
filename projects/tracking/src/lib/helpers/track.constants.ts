import type { TrackTrigger } from '../types/track.types';

export const SUFFIX_TRIGGER_MAP: Record<string, TrackTrigger> = {
  viewed: 'view',
  clicked: 'click',
  hovered: 'hover',
};
