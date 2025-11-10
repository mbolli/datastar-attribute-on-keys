# @mbolli/datastar-attribute-on-keys

[![npm version](https://img.shields.io/npm/v/@mbolli/datastar-attribute-on-keys.svg)](https://www.npmjs.com/package/@mbolli/datastar-attribute-on-keys)
[![Release](https://github.com/mbolli/datastar-attribute-on-keys/actions/workflows/release.yml/badge.svg)](https://github.com/mbolli/datastar-attribute-on-keys/actions/workflows/release.yml)
[![GitHub Pages](https://github.com/mbolli/datastar-attribute-on-keys/actions/workflows/gh-pages.yml/badge.svg)](https://github.com/mbolli/datastar-attribute-on-keys/actions/workflows/gh-pages.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A [Datastar](https://data-star.dev) plugin that provides keyboard event binding with support for key combinations and multiple keys.

## About

[Datastar](https://data-star.dev) is a hypermedia-focused framework that brings reactive signals and declarative DOM manipulation to your HTML. While it includes great event handling, this plugin extends keyboard event capabilities to support:

- **Key combinations** (e.g., `Alt-Q`, `Ctrl-Shift-S`)
- **Multiple key bindings** (e.g., `Escape.Enter` to trigger on either key)

## Installation

```bash
npm install @mbolli/datastar-attribute-on-keys
```

## Demo

**[View Interactive Demo →](https://mbolli.github.io/datastar-attribute-on-keys/)**

## Usage

This plugin requires an import map to resolve the `datastar` module. Set up your HTML like this:

```html
<script type="importmap">
{
  "imports": {
    "datastar": "https://cdn.jsdelivr.net/gh/starfederation/datastar@v1.0.0-RC.6/bundles/datastar.js"
  }
}
</script>
<script type="module">
  // Import the plugin - it will auto-register with datastar
  import 'https://cdn.jsdelivr.net/npm/@mbolli/datastar-attribute-on-keys@1/dist/index.js';
</script>
```

Note: Using `@1` will automatically use the latest v1.x.x version.

## What it does

This plugin adds an `on-keys` attribute to Datastar that allows you to bind keyboard events to reactive actions.

### Single Key Binding

```html
<div data-on-keys:escape="$modal.close()">
  <!-- Triggers when Escape key is pressed -->
</div>
```

### Key Combinations

```html
<div data-on-keys:alt-q="$app.quit()">
  <!-- Triggers when Alt+Q is pressed -->
</div>

<div data-on-keys:ctrl-shift-s="$document.save()">
  <!-- Triggers when Ctrl+Shift+S is pressed -->
</div>
```

### Multiple Keys

```html
<div data-on-keys:escape.enter="$dialog.close()">
  <!-- Triggers when either Escape OR Enter is pressed -->
</div>

<div data-on-keys:space.enter.alt-q="$action.execute()">
  <!-- Triggers on Space, Enter, or Alt+Q -->
</div>
```

### Global Events (Default)

By default, key events are listened for globally on the window:

```html
<div data-on-keys:escape="$modal.close()">
  <!-- Listens for Escape key globally -->
</div>
```

### Element-Specific Events

Use the `el` modifier to listen only when the element has focus:

```html
<input data-on-keys:enter__el="$form.submit()"><!-- Only triggers when this input is focused -->
```

### Event Modifiers

The plugin supports several modifiers:

- `el` - Listen on the element instead of window (requires focus)
- `noprevent` - Allow default browser behavior (default prevents)
- `stop` - Call `stopPropagation()` on the event  
- `up` - Listen for `keyup` instead of `keydown` (default)
- `capture` - Use capture phase
- `passive` - Use passive event listener
- `once` - Only trigger once

```html
<div data-on-keys:tab__noprevent="$counter++">
  <!-- Count tab presses but still allow tab navigation -->
</div>
```

### Timing Modifiers

Control when and how often callbacks are executed:

- `delay.{time}` - Postpone execution (e.g., `__delay.500ms`, `__delay.1s`)
- `debounce.{time}` - Wait for user to stop before executing (supports `__leading`, `__notrailing`)
- `throttle.{time}` - Limit execution rate (supports `__trailing`, `__noleading`)

```html
<div data-on-keys:enter__delay.500ms="$message = 'Delayed!'"></div>
<input data-on-keys__debounce.300ms__el="$search($event.target.value)">
<div data-on-keys:space__throttle.1s="$counter++"></div>
```

### View Transitions

- `viewtransition` - Wrap state changes in the View Transitions API for smooth animations

```html
<div data-on-keys:space__viewtransition="$counter++">
  <!-- Counter updates with smooth animation -->
</div>
```

## Supported Key Names

### Key Name Mapping

Common key aliases are automatically mapped to standard JavaScript key names:

**Special Keys:**
- `space` → Space character
- `enter` / `return` → Enter  
- `escape` / `esc` → Escape
- `tab` → Tab
- `backspace` → Backspace
- `delete` / `del` → Delete

**Navigation Keys:**
- `up` → ArrowUp
- `down` → ArrowDown
- `left` → ArrowLeft
- `right` → ArrowRight
- `pageup` → PageUp
- `pagedown` → PageDown

**Other Keys:**
- **Letters**: `a`, `b`, `c`, etc.
- **Numbers**: `1`, `2`, `3`, etc.
- **Function keys**: `f1`, `f2`, etc. → F1, F2, etc.
- **Modifiers**: `ctrl`/`control`, `alt`, `shift`, `meta`/`cmd`/`command`

## Examples

### Modal with Escape Key

```html
<div class="modal" data-on-keys:escape="$modal.close()">
  <!-- Modal content -->
</div>
```

### Counter with Space Bar

```html
<div data-on-keys:space="$counter++">
  Count: <span data-text="$counter"></span>
</div>
```

### Keyboard Shortcuts

```html
<div data-on-keys:ctrl-s="$document.save()">
  <!-- Ctrl+S to save - global and prevents browser save dialog -->
</div>
<div data-on-keys:ctrl-z="$document.undo()">
  <!-- Ctrl+Z to undo - global and prevents browser undo -->
</div>
```

## Testing

Run the automated tests:

```bash
pnpm test
```

Or open `index.html` locally in a browser to interactively test the plugin with Datastar.

## Development & Releases

This project uses automated releases via GitHub Actions. When you push to `main`:

1. **Tests run automatically** - Build and tests must pass
2. **Version bumping** - Add to your commit message:
   - `[major]` for breaking changes (1.0.0 → 2.0.0)
   - `[minor]` for new features (1.0.0 → 1.1.0)
   - Default: patch for bug fixes (1.0.0 → 1.0.1)
3. **Automatic publishing** - Package is published to npm
4. **GitHub Release created** - With auto-generated release notes

## License

MIT
