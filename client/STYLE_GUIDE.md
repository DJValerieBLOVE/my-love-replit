# 11x LOVE Lab - Frontend Style Guide

## Typography
- **Font Family**: "Marcellus", serif (for ALL text elements).
- **Usage**: Headings, body text, buttons, inputs, labels, textareas.
- **Rule**: Do not use sans-serif fonts. The aesthetic is "Elevated/Magical".

## UI Components

### Inputs & Textareas
- **Background**: `bg-muted/30`
- **Border**: `border-muted`
- **Focus**: `focus:bg-background`
- **Text Size**: `text-base` (avoid text-sm for inputs to prevent zoom on mobile)
- **Font**: `font-serif` (Marcellus)

### Buttons
- **Standard**: `h-8`, `rounded-lg`, `font-bold`.
- **Primary**: `bg-[#6600ff]` (Brand Purple) with hover lift effect.
- **Font**: `font-serif` (Marcellus)

### Cards
- **Accent**: All major cards must have a purple accent line at the top:
  ```jsx
  <div className="h-[2px] w-full bg-primary" />
  ```
- **Structure**: Clean white/dark background, consistent padding.

### Category Badges (Image Cards)
- **Position**: Top-Right (`absolute top-3 right-3`)
- **Style**: `bg-white/90` (Glass/White), `text-black`, `font-normal`.
- **Hover**: `hover:bg-white`
- **Z-Index**: Ensure `z-20` to sit above image overlays.
- **Example**:
  ```jsx
  <Badge className="absolute top-3 right-3 z-20 bg-white/90 text-black hover:bg-white">
    Category Name
  </Badge>
  ```

## Feed Interactions
- **Icons**:
  - **Zap**: Centered, Largest (28px), Orange (`text-orange-500`).
  - **Comment**: Blue (`text-blue-500`).
  - **Repost**: Green (`text-green-500`).
  - **Like (Heart)**: Red (`text-red-500`).
  - **Bookmark**: Purple (`text-purple-500`).

## Color Palette
- **Primary Brand**: #6600ff (Purple)
- **Secondary**: #eb00a8 (Pink/Love God)
- **Sats/Gold**: #ff9900
- **Text Base**: #4D3D5C (Deep Muted Purple)

## Iconography
- **Sidebar/Navigation**:
  - **Style**: Minimalist, Thin Stroke.
  - **Stroke Width**: `1.5` (do not use bold/thick icons).
  - **Color**: `text-muted-foreground` (No primary colors for nav icons).
  - **Background**: Transparent (No colored backgrounds/boxes around icons).

## Button Standardization
- **Consistency**: All action buttons should share consistent height and padding.
- **Height**: Avoid over-sized buttons (like `h-12` or `h-14`) inside cards or sidebars. Use standard sizes.
- **Padding**: Ensure optical balance.
- **Typography**: Only primary brand buttons (Purple/White) should use **Bold** text. Secondary/Ghost buttons should be `font-normal` or `font-medium`.

