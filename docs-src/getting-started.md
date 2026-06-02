# Getting Started

## Install

```bash
npm install ng-track-event-directive
```

Peer dependencies:

- `@angular/core` v21.2+
- `@angular/common` v21.2+

## Register an adapter

Create a tracking adapter and provide it at app startup.

For standalone Angular apps, this is typically done in `app.config.ts`.
In this repository's demo app, the file is `projects/demo-app/src/app/app.config.ts`.

```ts
import { ApplicationConfig } from '@angular/core';
import { provideTrackingAdapter, type TrackingAdapter } from 'ng-track-event-directive';

const myAdapter: TrackingAdapter = {
  track(eventName, data) {
    console.log('[analytics]', eventName, data);
  },
};

export const appConfig: ApplicationConfig = {
  providers: [provideTrackingAdapter(myAdapter)],
};
```

## Use the directive

Use the directive in the component where you want tracking behavior.
In this repository's demo app, that is `projects/demo-app/src/app/app.ts`.

```ts
import { Component } from '@angular/core';
import { TrackEventDirective, trackConfig } from 'ng-track-event-directive';

@Component({
  selector: 'app-root',
  imports: [TrackEventDirective],
  template: `
    <button [trackEvent]="trackConfig('signup:clicked', { source: 'hero' })">Sign Up</button>
  `,
})
export class AppComponent {
  protected readonly trackConfig = trackConfig;
}
```

Continue with [Adapter Setup](/guide/adapter-setup), [Events and Triggers](/guide/events-and-triggers), and [Demo](/demo).
