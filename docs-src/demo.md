# Demo

Use the demo to verify trigger behavior, inspect emitted payloads, or test local library changes before integrating the directive into an application.

## Open in StackBlitz

[Launch the interactive demo](https://stackblitz.com/edit/stackblitz-starters-hsdpibzj?file=package.json) when you want to try the package without cloning the repository.

## Run locally

```bash
npm install
npm run demo:start
```

Open `http://localhost:4200`. Use the event log to check click, hover, and view events as they fire.

## Browse the source

- [Application bootstrap](https://github.com/nikhilrajnair/ng-track-event-directive/blob/main/projects/demo-app/src/main.ts)
- [Adapter registration](https://github.com/nikhilrajnair/ng-track-event-directive/blob/main/projects/demo-app/src/app/app.config.ts)
- [Directive import](https://github.com/nikhilrajnair/ng-track-event-directive/blob/main/projects/demo-app/src/app/app.ts)
- [Tracked elements](https://github.com/nikhilrajnair/ng-track-event-directive/blob/main/projects/demo-app/src/app/app.html)
- [Demo adapter](https://github.com/nikhilrajnair/ng-track-event-directive/blob/main/projects/demo-app/src/app/mixpanel-live-adapter.ts)

The local demo imports the workspace library directly, so it is the best option when developing or reviewing library changes.
