import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideTrackingAdapter } from 'ng-track-event-directive';
import { demoTrackingAdapter } from './demo-tracking-adapter';

export const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners(), provideTrackingAdapter(demoTrackingAdapter)],
};
