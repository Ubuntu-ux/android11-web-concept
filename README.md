# Android 11 Web

A web-based version of the Android 11 interface designed specifically for mobile Chrome browsers. This project recreates the look and feel of Android 11, including:

- Home screen with app grid and dock
- Status bar with time and icons
- Pull-down notification panel with quick settings
- Navigation gestures

## Features

- **Responsive Design**: Optimized for mobile phone screens
- **Interactive Elements**: Clickable apps, toggleable quick settings
- **Gesture Support**: Swipe down for notifications, swipe up to dismiss
- **Material Design Icons**: Uses Google's Material Icons for an authentic look

## Usage

To view the interface:

1. Open this webpage on a mobile device using Chrome
2. Interact with the UI as you would with a real Android 11 device:
   - Tap the status bar or swipe down from the top to open notifications
   - Tap app icons to "launch" them (shows alert in this demo)
   - Use the navigation buttons at the bottom
   - Toggle quick settings in the notification panel

## Technical Details

This project is built with:

- Vanilla HTML, CSS and JavaScript
- Material Icons from Google Fonts
- SVG icons for app icons
- CSS Grid for app layouts
- Flexbox for various UI components

## Web vs Native Differences

This web implementation has some limitations compared to a native Android experience:
- Limited system integration (can't actually make calls, send messages, etc.)
- Some animations and transitions may differ from native Android
- Device-specific features aren't available

## Development

To run this project locally:

```bash
# Install dependencies
bun install

# Start the development server
bun run dev
```

## License

This is a demonstration project for educational purposes only. Android is a trademark of Google LLC.
