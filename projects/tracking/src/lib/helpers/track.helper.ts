import { SUFFIX_TRIGGER_MAP } from './track.constants';
import type { TrackConfig, TrackOptions, TrackTrigger } from '../types/track.types';

export function parseTriggerFromEvent(event: string): TrackTrigger {
  const triggerSuffix = event.slice(event.lastIndexOf(':') + 1);
  return SUFFIX_TRIGGER_MAP[triggerSuffix] ?? 'unknown';
}

export function trackConfig<E extends string, D = unknown>(
  event: E,
  data?: D,
  onceOrOptions?: boolean | TrackOptions,
): TrackConfig<E, D> {
  const options: TrackOptions =
    typeof onceOrOptions === 'boolean' ? { once: onceOrOptions } : (onceOrOptions ?? {});

  return {
    event,
    ...(data !== undefined && { data }),
    ...(options.trigger !== undefined && { trigger: options.trigger }),
    ...(options.once !== undefined && { once: options.once }),
  };
}
