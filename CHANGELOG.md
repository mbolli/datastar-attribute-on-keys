# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-11-10

### Added
- Support for timing modifiers: `delay`, `debounce`, and `throttle`
  - `__delay.{time}` - Postpones execution by a fixed time (e.g., `__delay.500ms` or `__delay.1s`)
  - `__debounce.{time}` - Waits for user to stop before executing (supports `__leading` and `__notrailing` options)
  - `__throttle.{time}` - Limits execution rate (supports `__trailing` and `__noleading` options)
- Support for View Transitions API with `__viewtransition` modifier
- Interactive demo showcasing all timing modifiers and view transitions in `index.html`

## [1.0.4] - 2025-11-03

Internal changes only (build and release workflow improvements).

## [1.0.3] - 2025-11-03

Internal changes only (demo fix).

## [1.0.2] - 2025-11-03

Internal changes only (build script improvements).

## [1.0.1] - 2025-11-03

Internal changes only (repository configuration updates).

## [1.0.0] - 2025-11-03

### Added
- Initial release of datastar-attribute-on-keys plugin
- Support for single key bindings (e.g., `space`, `enter`, `escape`)
- Support for key combinations with modifiers (e.g., `ctrl-k`, `alt-enter`, `shift-space`)
- Support for multiple key specifications (e.g., `enter.tab.escape`)
- Key name normalization and mapping
- Global window event handling (default)
- Element-specific event handling with `__el` modifier
- Event behavior modifiers:
  - `__noprevent` - Allow default browser behavior
  - `__stop` - Stop event propagation
  - `__up` - Trigger on keyup instead of keydown
- Event listener options:
  - `__capture` - Use capture phase
  - `__passive` - Passive event listener
  - `__once` - Remove listener after first trigger
- Auto-registration with Datastar via importmap
- Comprehensive test suite
- Interactive demo with multiple examples

[1.1.0]: https://github.com/mbolli/datastar-attribute-on-keys/compare/v1.0.4...v1.1.0
[1.0.4]: https://github.com/mbolli/datastar-attribute-on-keys/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/mbolli/datastar-attribute-on-keys/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/mbolli/datastar-attribute-on-keys/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/mbolli/datastar-attribute-on-keys/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/mbolli/datastar-attribute-on-keys/releases/tag/v1.0.0
