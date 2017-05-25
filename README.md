# svg-to-lines

Given an SVG image this library creates a new image only made up of lines.

## Usage

```
const svg = '<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="100" height="100" rx="15" ry="15"></rect></svg>'
const domParser = new DOMParser();
const svgDocument = domParser.parseFromString(svg, 'image/svg+xml');
const svgElement = svgDocument.getElementsByTagName('svg')[0];

svgFilter.lines(svgElement); // returns an SVG Element with 4 lines
```
