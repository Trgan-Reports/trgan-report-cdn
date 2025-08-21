## [1.0.1] - 2025-08-21

### Changed
- Updated `.gherkin` CSS:
  - Replaced `max-width: 45px` with `width: 0` to visually collapse empty gherkin keyword slots
- Added JS logic to detect `.gherkin` content:
  - If content is present, dynamically set `width: 45px`
- Updated `h1` styling:
  - Replaced `height: 10vh` with `padding-bottom: 20px` for better spacing on tall viewports
- Updated `.log` styling:
    - removed duplicate `margin:10px`
    - removed margin top and padding top

### Impact
- Eliminates visual gaps when gherkin keywords are unused
- Improves `h1` readability and layout consistency on high-viewport devices
