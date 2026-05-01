import { parseTriggerFromEvent, trackConfig } from './track.helper';

describe('parseTriggerFromEvent', () => {
  it('returns click for clicked suffix', () => {
    expect(parseTriggerFromEvent('save:clicked')).toBe('click');
  });

  it('returns view for viewed suffix', () => {
    expect(parseTriggerFromEvent('list:viewed')).toBe('view');
  });

  it('returns hover for hovered suffix', () => {
    expect(parseTriggerFromEvent('icon:hovered')).toBe('hover');
  });

  it('returns unknown for unmapped suffix', () => {
    expect(parseTriggerFromEvent('anything:opened')).toBe('unknown');
  });
});

describe('trackConfig', () => {
  it('builds config with optional payload and once', () => {
    expect(trackConfig('users:clicked', { id: 1 }, true)).toEqual({
      event: 'users:clicked',
      data: { id: 1 },
      once: true,
    });
  });

  it('omits optional fields when not provided', () => {
    expect(trackConfig('users:clicked')).toEqual({ event: 'users:clicked' });
  });
});
