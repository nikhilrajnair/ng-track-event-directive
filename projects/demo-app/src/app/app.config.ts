import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideTrackingAdapter } from 'ng-track-event-directive';
import { mixpanelLiveAdapter } from './mixpanel-live-adapter';

export const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners(), provideTrackingAdapter(mixpanelLiveAdapter)],
};
