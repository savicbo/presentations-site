# Pixel Icon Library Usage Guide

This presentation app now supports the full [Pixel Icon Library](https://github.com/hackernoon/pixel-icon-library) from HackerNoon.

## Available Components

### Generic PixelIcon Component
Use any icon from the library by name:

```jsx
<PixelIcon name="warning" size={32} color="#ffcc00" />
<PixelIcon name="github" size={24} />
<PixelIcon name="heart" size={16} className="text-red-500" />
```

### Pre-configured Icon Components
For convenience, common icons have dedicated components:

- `<PixelCautionIcon />` - Warning/caution icon (yellow by default)
- `<PixelGitHubIcon />` - GitHub logo
- `<PixelTwitterIcon />` - Twitter/X logo  
- `<PixelLinkedInIcon />` - LinkedIn logo
- `<PixelEmailIcon />` - Email icon
- `<PixelHomeIcon />` - Home icon
- `<PixelSearchIcon />` - Search icon
- `<PixelSettingsIcon />` - Settings/gear icon
- `<PixelUserIcon />` - User/person icon
- `<PixelHeartIcon />` - Heart icon

## Usage in Slides

You can use these icons directly in your MDX slides:

```markdown
## My Slide Title

- <PixelCautionIcon size={24} /> Important warning
- <PixelGitHubIcon size={20} /> Check out the code
- <PixelIcon name="rocket" size={32} color="#00ff00" /> Launch ready!
```

## Available Icon Names

The Pixel Icon Library includes hundreds of icons. Common names include:

**Social & Communication:**
- `github`, `twitter`, `linkedin`, `facebook`, `instagram`
- `email`, `phone`, `chat`, `message`

**Interface & Navigation:**
- `home`, `search`, `settings`, `menu`, `close`
- `arrow-up`, `arrow-down`, `arrow-left`, `arrow-right`
- `chevron-up`, `chevron-down`, `chevron-left`, `chevron-right`

**Actions & Status:**
- `warning`, `error`, `success`, `info`
- `plus`, `minus`, `edit`, `delete`, `save`
- `download`, `upload`, `share`, `copy`

**Content & Media:**
- `image`, `video`, `music`, `file`, `folder`
- `camera`, `microphone`, `speaker`

**Business & Finance:**
- `dollar`, `euro`, `bitcoin`, `chart`, `graph`
- `briefcase`, `building`, `store`

## Props

All icon components accept these props:

- `size` (number | string): Icon size in pixels or CSS units (default: 24)
- `color` (string): Icon color (CSS color value)
- `className` (string): Additional CSS classes

## Examples

```jsx
// Basic usage
<PixelIcon name="star" />

// With custom size and color
<PixelIcon name="heart" size={48} color="#ff6b6b" />

// With Tailwind classes
<PixelIcon name="user" className="text-blue-500 hover:text-blue-700" />

// Pre-configured component
<PixelCautionIcon size={32} color="#ffd700" />
```

## Finding Icon Names

To find available icon names:
1. Visit the [Pixel Icon Library](https://github.com/hackernoon/pixel-icon-library)
2. Browse the icons in their documentation
3. Use the icon name (without the `hn-` prefix) as the `name` prop

For example, if the CSS class is `hn-rocket`, use `name="rocket"`.
