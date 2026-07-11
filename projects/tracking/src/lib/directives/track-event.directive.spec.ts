import { Component, DebugElement, signal, ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TrackEventDirective } from './track-event.directive';
import { TRACKING_ADAPTER, TrackingAdapter } from '../providers/tracking-adapter';
import type { TrackConfig } from '../types/track.types';

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];

  readonly observe = vi.fn();
  readonly disconnect = vi.fn();

  private readonly callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    MockIntersectionObserver.instances.push(this);
  }

  trigger(isIntersecting: boolean): void {
    const entry = { isIntersecting } as IntersectionObserverEntry;
    this.callback([entry], this as unknown as IntersectionObserver);
  }
}

@Component({
  template: `<button [trackEvent]="config()">Track</button>`,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [TrackEventDirective],
})
class HostComponent {
  readonly config = signal<TrackConfig<string, unknown>>({ event: 'button:clicked' });
}

function setup(config?: TrackConfig<string, unknown>) {
  const adapter: TrackingAdapter = { track: vi.fn() };

  TestBed.configureTestingModule({
    imports: [HostComponent],
    providers: [{ provide: TRACKING_ADAPTER, useValue: adapter }],
  });

  const fixture: ComponentFixture<HostComponent> = TestBed.createComponent(HostComponent);
  if (config) {
    fixture.componentInstance.config.set(config);
  }
  fixture.detectChanges();

  const el: DebugElement = fixture.debugElement.query(By.directive(TrackEventDirective));

  return {
    fixture,
    el,
    adapter,
    trackSpy: vi.mocked(adapter.track),
  };
}

describe('TrackEventDirective', () => {
  beforeEach(() => {
    MockIntersectionObserver.instances.length = 0;
    vi.stubGlobal(
      'IntersectionObserver',
      MockIntersectionObserver as unknown as typeof IntersectionObserver,
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('tracks inferred DOM events and forwards configured data', () => {
    const { el, trackSpy } = setup({ event: 'user-save:clicked', data: { id: 12 } });

    el.nativeElement.click();
    el.nativeElement.click();

    expect(trackSpy).toHaveBeenCalledTimes(2);
    expect(trackSpy).toHaveBeenCalledWith('user-save:clicked', { id: 12 });
  });

  it('tracks an explicit DOM event using configured data, not CustomEvent detail', () => {
    const { el, trackSpy } = setup({
      event: 'dialog:opened',
      trigger: 'dialog-opened',
      data: { source: 'toolbar' },
    });

    el.nativeElement.dispatchEvent(
      new CustomEvent('dialog-opened', { detail: { paymentToken: 'secret' } }),
    );

    expect(trackSpy).toHaveBeenCalledWith('dialog:opened', { source: 'toolbar' });
  });

  it('uses an explicit trigger instead of the event-name suffix', () => {
    const { el, trackSpy } = setup({ event: 'save:clicked', trigger: 'focus' });

    el.nativeElement.click();
    expect(trackSpy).not.toHaveBeenCalled();

    el.nativeElement.dispatchEvent(new FocusEvent('focus'));
    expect(trackSpy).toHaveBeenCalledWith('save:clicked', undefined);
  });

  it('tracks view once by default and disconnects observer', () => {
    const { trackSpy } = setup({ event: 'table:viewed' });

    const [observer] = MockIntersectionObserver.instances;
    observer.trigger(true);
    observer.trigger(true);

    expect(trackSpy).toHaveBeenCalledTimes(1);
    expect(observer.disconnect).toHaveBeenCalledTimes(1);
  });

  it('tracks view repeatedly when once is false', () => {
    const { trackSpy } = setup({ event: 'table:viewed', once: false });

    const [observer] = MockIntersectionObserver.instances;
    observer.trigger(true);
    observer.trigger(true);

    expect(trackSpy).toHaveBeenCalledTimes(2);
    expect(observer.disconnect).not.toHaveBeenCalled();
  });

  it('tracks click only once when once is true', () => {
    const { el, trackSpy } = setup({ event: 'user-save:clicked', once: true });

    el.nativeElement.click();
    el.nativeElement.click();
    el.nativeElement.click();

    expect(trackSpy).toHaveBeenCalledTimes(1);
  });

  it('does not track events with an unknown suffix', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { el, trackSpy } = setup({ event: 'dialog:opened' });

    el.nativeElement.click();
    el.nativeElement.dispatchEvent(new MouseEvent('mouseenter'));

    expect(trackSpy).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('has no trigger'));
  });

  it('disconnects the observer on destroy', () => {
    const { fixture } = setup({ event: 'table:viewed' });

    const [observer] = MockIntersectionObserver.instances;
    fixture.destroy();

    expect(observer.disconnect).toHaveBeenCalled();
  });

  it('removes a DOM listener on destroy', () => {
    const { el, fixture, trackSpy } = setup({
      event: 'dialog:opened',
      trigger: 'dialog-opened',
    });

    fixture.destroy();
    el.nativeElement.dispatchEvent(new CustomEvent('dialog-opened'));

    expect(trackSpy).not.toHaveBeenCalled();
  });

  it('does not throw when no adapter is provided', () => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.debugElement.query(By.directive(TrackEventDirective));

    expect(() => el.nativeElement.click()).not.toThrow();
  });

  it('does not create an observer when IntersectionObserver is unavailable', () => {
    vi.stubGlobal('IntersectionObserver', undefined);

    setup({ event: 'table:viewed' });

    expect(MockIntersectionObserver.instances).toHaveLength(0);
  });

  it('replaces a DOM listener and resets once-only state when the trigger changes', () => {
    const { el, fixture, trackSpy } = setup({
      event: 'panel:interaction',
      trigger: 'panel-opened',
      once: true,
    });

    el.nativeElement.dispatchEvent(new CustomEvent('panel-opened'));

    fixture.componentInstance.config.set({
      event: 'panel:interaction',
      trigger: 'panel-closed',
      once: true,
    });
    fixture.detectChanges();
    fixture.detectChanges();
    el.nativeElement.dispatchEvent(new CustomEvent('panel-opened'));
    el.nativeElement.dispatchEvent(new CustomEvent('panel-closed'));

    expect(trackSpy).toHaveBeenCalledTimes(2);
  });

  it('creates a new observer and fires when trackEvent changes to a new view event', () => {
    const { fixture, trackSpy } = setup({ event: 'table:viewed' });

    const [firstObserver] = MockIntersectionObserver.instances;
    firstObserver.trigger(true);
    expect(trackSpy).toHaveBeenCalledWith('table:viewed', undefined);

    fixture.componentInstance.config.set({ event: 'card:viewed' });
    fixture.detectChanges(); // updates signal input → marks effect dirty
    fixture.detectChanges(); // flushes effect → onCleanup disconnects, new observer created

    expect(firstObserver.disconnect).toHaveBeenCalled();
    const [, secondObserver] = MockIntersectionObserver.instances;
    secondObserver.trigger(true);
    expect(trackSpy).toHaveBeenCalledWith('card:viewed', undefined);
    expect(trackSpy).toHaveBeenCalledTimes(2);
  });

  // sendOnce reads the updated input synchronously at click time.
  it('resets hasFired so the new event fires after trackEvent config changes', () => {
    const { el, fixture, trackSpy } = setup({ event: 'save:clicked', once: true });

    el.nativeElement.click();
    expect(trackSpy).toHaveBeenCalledTimes(1);

    fixture.componentInstance.config.set({ event: 'delete:clicked', once: true });
    fixture.detectChanges(); // updates trackEvent signal; sendOnce() reads it at next click

    el.nativeElement.click();
    expect(trackSpy).toHaveBeenCalledTimes(2);
    expect(trackSpy).toHaveBeenLastCalledWith('delete:clicked', undefined);
  });
});
