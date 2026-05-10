# Events and Triggers

Trigger behavior is inferred from the event name suffix.

| Event suffix | Trigger | Default `once` |
| --- | --- | --- |
| `:clicked` | click | false |
| `:hovered` | mouseenter | false |
| `:viewed` | IntersectionObserver | true |

## Examples

```html
<button [trackEvent]="trackConfig('checkout:clicked', { step: 1 })">Checkout</button>
<section [trackEvent]="trackConfig('hero:viewed')">Hero Banner</section>
<div [trackEvent]="trackConfig('help:hovered', { area: 'pricing' })">Hover me</div>
```

## Override one-time behavior

```ts
trackConfig('promo:viewed', { campaign: 'summer' }, false);
```
