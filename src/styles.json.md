# Styles.json

Injected into App’s style store, enabling configurable theme.

```js
{
  "name": "Stelace Instant - Work",

  // Easily test additional fonts in dev environment with Webfontloader
  // This is also used as CSS 'font-family' name in production
  // Try to change this to "Open Sans" in styles.json during development
  "userFont": "Fira Sans",

  // In production environment, setting font in stone is preferred for better performance
  // You just have to browse [Google Fonts](https://fonts.google.com/)
  // Or even more convenient to get file URLs, including legacy formats:
  // https://google-webfonts-helper.herokuapp.com/fonts/fira-sans?subsets=latin
  // JSON file: https://google-webfonts-helper.herokuapp.com/api/fonts/fira-sans?subsets=latin
  // and copy-paste file URLs after choosing appropriate charset (latin, latin-extended, cyrillic…)
  "userFontNormal": "//fonts.gstatic.com/s/firasans/v9/va9E4kDNxMZdWfMOD5Vvl4jL.woff2", // 400
  "userFontMedium": "//fonts.gstatic.com/s/firasans/v9/va9B4kDNxMZdWfMOD5VnZKveRhf6.woff2", // 500
  "userFontBold": "//fonts.gstatic.com/s/firasans/v9/va9B4kDNxMZdWfMOD5VnLK3eRhf6.woff2", // 700
  "userFontDisplay": "fallback", // https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display
  "userFontLegacyFormat": "woff", // can also be 'truetype' for .ttf, or 'svg
  "userFontNormalLegacy": "//fonts.gstatic.com/s/firasans/v9/va9E4kDNxMZdWfMOD5Vvl4jN.woff",
  "userFontMediumLegacy": "//fonts.gstatic.com/s/firasans/v9/va9B4kDNxMZdWfMOD5VnZKveRhf8.woff",
  "userFontBoldLegacy": "//fonts.gstatic.com/s/firasans/v9/va9B4kDNxMZdWfMOD5VnLK3eRhf8.woff",

  "roundedTheme": false,
  "pageTransitions": true,
  
  // Changes home search card’s background and text color
  "homeHasLightBackground": true,
  // Replaces default home search card’s white or black background
  "homeSearchCardBackground": "rgba(0, 0, 0, 0.6)",
  // Enable customized SVG action buttons such as Search, with brand logo or anything else
  "hasSVGActionButton": true,

  // image parameters used to get appropriate size from S3 Image Handler
  // ensuring consistency to reduce network use from requesting different sizes across app
  "baseImageAspectRatioWidth": 16,
  "baseImageAspectRatioHeight": 9,
  // Try to make baseImageWidth play nicely with ratio: 640 / (16/9) = 360 is ok
  // but 640 / (3/2) = 426.6667 can be a problem for accurate resizing or worse for image server
  "baseImageWidth": 640,
  "avatarImageWidth": 96 // 6 * 16

  // Your hero image hosted on CDN (like Stelace Instant CDN)
  "homeHeroUrl": "",
  // Improves home page loading speed and UX with SVG image placeholder
  "homeHeroBase64": "data:image/svg+xml;base64…"
}
```
