import { Component, DebugElement } from '@angular/core';
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
  template: `<button [trackEvent]="config">Track</button>`,
  imports: [TrackEventDirective],
})
class HostComponent {
  config: TrackConfig<string, unknown> = { event: 'button:clicked' };
}

function setup(config?: TrackConfig<string, unknown>) {
  const adapter: TrackingAdapter = { track: vi.fn() };

  TestBed.configureTestingModule({
    imports: [HostComponent],
    providers: [{ provide: TRACKING_ADAPTER, useValue: adapter }],
  });

  const fixture: ComponentFixture<HostComponent> = TestBed.createComponent(HostComponent);
  if (config) {
    fixture.componentInstance.config = config;
  }
  fixture.detectChanges();

  const el: DebugElement = fixture.debugElement.query(By.directive(TrackEventDirective));

  return {
    fixture,
    el,
    adapter,
    trackSpy: adapter.track as ReturnType<typeof vi.fn>,
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
});
