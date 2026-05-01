export type TrackTrigger = 'click' | 'view' | 'hover' | 'unknown';

export interface TrackConfig<E extends string = string, D = unknown> {
  event: E;
  data?: D;
  once?: boolean;
}
