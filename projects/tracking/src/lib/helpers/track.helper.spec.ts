import { parseTriggerFromEvent, trackConfig } from './track.helper';

describe('parseTriggerFromEvent', () => {
  it.each([
    ['save:clicked', 'click'],
    ['list:viewed', 'view'],
    ['icon:hovered', 'hover'],
    ['anything:opened', 'unknown'],
  ] as const)('maps %s to %s', (event, trigger) => {
    expect(parseTriggerFromEvent(event)).toBe(trigger);
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

  it('builds config with trigger options', () => {
    expect(
      trackConfig('dialog:opened', { source: 'toolbar' }, { trigger: 'dialog-opened', once: true }),
    ).toEqual({
      event: 'dialog:opened',
      data: { source: 'toolbar' },
      trigger: 'dialog-opened',
      once: true,
    });
  });
});
