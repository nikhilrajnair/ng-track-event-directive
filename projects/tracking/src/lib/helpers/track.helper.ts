import { SUFFIX_TRIGGER_MAP } from './track.constants';
import type { TrackConfig, TrackTrigger } from '../types/track.types';

export function parseTriggerFromEvent(event: string): TrackTrigger {
  const triggerSuffix = event.slice(event.lastIndexOf(':') + 1);
  return SUFFIX_TRIGGER_MAP[triggerSuffix] ?? 'unknown';
}

export function trackConfig<E extends string, D = unknown>(event: E, data?: D, once?: boolean): TrackConfig<E, D> {
  return { event, ...(data !== undefined && { data }), ...(once !== undefined && { once }) };
}
