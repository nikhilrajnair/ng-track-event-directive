import { Component, DebugElement, signal } from '@angular/core';
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
    // #15: vi.mocked() provides correct Mock type without a manual cast.
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

  it('tracks on click events', () => {
    const { el, trackSpy } = setup({ event: 'user-save:clicked' });

    el.nativeElement.click();
    el.nativeElement.click();

    expect(trackSpy).toHaveBeenCalledTimes(2);
    expect(trackSpy).toHaveBeenCalledWith('user-save:clicked', undefined);
  });

  it('tracks on hover events', () => {
    const { el, trackSpy } = setup({ event: 'menu:hovered' });

    el.nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
    el.nativeElement.dispatchEvent(new MouseEvent('mouseenter'));

    expect(trackSpy).toHaveBeenCalledTimes(2);
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

  it('forwards event payload to adapter', () => {
    const { el, trackSpy } = setup({ event: 'user-edit:clicked', data: { id: 12 } });

    el.nativeElement.click();

    expect(trackSpy).toHaveBeenCalledWith('user-edit:clicked', { id: 12 });
  });

  it('tracks click only once when once is true', () => {
    const { el, trackSpy } = setup({ event: 'user-save:clicked', once: true });

    el.nativeElement.click();
    el.nativeElement.click();
    el.nativeElement.click();

    expect(trackSpy).toHaveBeenCalledTimes(1);
  });

  it('tracks hover only once when once is true', () => {
    const { el, trackSpy } = setup({ event: 'menu:hovered', once: true });

    el.nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
    el.nativeElement.dispatchEvent(new MouseEvent('mouseenter'));

    expect(trackSpy).toHaveBeenCalledTimes(1);
  });

  it('disconnects the observer on destroy', () => {
    const { fixture } = setup({ event: 'table:viewed' });

    const [observer] = MockIntersectionObserver.instances;
    fixture.destroy();

    expect(observer.disconnect).toHaveBeenCalled();
  });

  // #12: null adapter — documented graceful no-op.
  it('does not throw when no adapter is provided', () => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.debugElement.query(By.directive(TrackEventDirective));

    expect(() => el.nativeElement.click()).not.toThrow();
  });

  // #13: SSR guard — IntersectionObserver unavailable.
  it('does not create an observer when IntersectionObserver is unavailable', () => {
    vi.stubGlobal('IntersectionObserver', undefined);

    setup({ event: 'table:viewed' });

    expect(MockIntersectionObserver.instances).toHaveLength(0);
  });

  // #3/#4: observer torn down and hasFired reset when trackEvent changes.
  it('tears down the observer and resets state when trigger changes from view to click', () => {
    const { fixture, trackSpy } = setup({ event: 'table:viewed' });

    const [observer] = MockIntersectionObserver.instances;
    console.log('instances after setup:', MockIntersectionObserver.instances.length);
    fixture.componentInstance.config.set({ event: 'table:clicked' });
    fixture.detectChanges();
    console.log('after 1st detectChanges, disconnect called:', (observer.disconnect as ReturnType<typeof vi.fn>).mock.calls.length);
    fixture.detectChanges();
    console.log('after 2nd detectChanges, disconnect called:', (observer.disconnect as ReturnType<typeof vi.fn>).mock.calls.length);

    expect(observer.disconnect).toHaveBeenCalled();
    expect(trackSpy).not.toHaveBeenCalled();
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

  // #4: firedEventKey signal is keyed by event name — no effect flush needed because
  // sendOnce() reads trackEvent() synchronously at click time.
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
