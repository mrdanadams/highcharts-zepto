# Highcharts adapter for Zepto.js

This is an adapter for using [Zepto.js](http://zeptojs.com) with [Highcharts](http://www.highcharts.com/) rather than jQuery.

Animations are not yet supported on non-DOM elements (such as the SVG wrapper object) since we are using Zepto CSS-based transformations.

## Usage

Include it between zepto and highcharts:

```html
<script src="zepto.js"></script>
<script src="highcharts-zepto.src.js"></script>
<script src="highcharts.src.js"></script>
```

Use `highcharts-zepto.src.js` but get the others from the official distributions.

See the examples for additional samples.

## License

MIT
