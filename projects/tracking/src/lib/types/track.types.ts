export type TrackTrigger = 'click' | 'view' | 'hover' | 'unknown' | (string & {});

export interface TrackOptions {
  trigger?: TrackTrigger;
  once?: boolean;
}

export interface TrackConfig<E extends string = string, D = unknown> {
  event: E;
  data?: D;
  trigger?: TrackTrigger;
  once?: boolean;
}
