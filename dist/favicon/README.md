# Favicon and Social Media Assets

This directory contains all the favicon and social media assets generated from the original `fire_graph_icon.png` using FFmpeg.

## Generated Files

### Favicon Files
- `favicon.ico` - Standard favicon file (16x16)
- `favicon-16x16.png` - 16x16 PNG favicon
- `favicon-32x32.png` - 32x32 PNG favicon  
- `favicon-48x48.png` - 48x48 PNG favicon

### Apple Touch Icons
- `apple-touch-icon.png` - 180x180 Apple touch icon for iOS devices

### Android Chrome Icons
- `android-chrome-192x192.png` - 192x192 Android Chrome icon
- `android-chrome-512x512.png` - 512x512 Android Chrome icon

### Social Media Images
- `og-banner.png` - 1200x630 Open Graph banner for Facebook/LinkedIn
- `twitter-card.png` - 1200x600 Twitter card image

### Configuration Files
- `manifest.json` - Web app manifest for PWA support
- `meta-tags.html` - HTML template with all meta tags

## Usage

1. **Favicon**: Include the favicon links in your HTML `<head>` section
2. **Social Media**: Use the OG banner and Twitter card images in your meta tags
3. **PWA**: Link the manifest.json for Progressive Web App support
4. **Mobile**: The Apple touch icon and Android Chrome icons will be used automatically

## Meta Tags Template

Copy the contents of `meta-tags.html` into your HTML `<head>` section and update the URLs to match your domain.

## Original Image

Source: `../fire_graph_icon.png` (474x391 pixels)

## Generation Commands

All images were generated using FFmpeg with the following commands:

```bash
# Favicon sizes
ffmpeg -i ../fire_graph_icon.png -vf "scale=16:16" favicon-16x16.png
ffmpeg -i ../fire_graph_icon.png -vf "scale=32:32" favicon-32x32.png
ffmpeg -i ../fire_graph_icon.png -vf "scale=48:48" favicon-48x48.png

# ICO file
ffmpeg -i ../fire_graph_icon.png -vf "scale=16:16" -f ico favicon.ico

# Apple touch icon
ffmpeg -i ../fire_graph_icon.png -vf "scale=180:180" apple-touch-icon.png

# Android Chrome icons
ffmpeg -i ../fire_graph_icon.png -vf "scale=192:192" android-chrome-192x192.png
ffmpeg -i ../fire_graph_icon.png -vf "scale=512:512" android-chrome-512x512.png

# Social media banners
ffmpeg -i ../fire_graph_icon.png -vf "scale=1200:630:force_original_aspect_ratio=decrease,pad=1200:630:(ow-iw)/2:(oh-ih)/2:black" og-banner.png
ffmpeg -i ../fire_graph_icon.png -vf "scale=1200:600:force_original_aspect_ratio=decrease,pad=1200:600:(ow-iw)/2:(oh-ih)/2:black" twitter-card.png
``` 