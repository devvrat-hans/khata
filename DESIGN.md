---
version: "1.0"
name: Aback Design System

themes:
  light:
    canvas: "#ffffff"            # --background
    surface: "#ffffff"           # --card
    popover: "#ffffff"           # --popover
    muted: "#f5f5f5"             # --muted / --secondary / --accent
    ink: "#0a0a0a"               # --foreground
    mute: "#737373"              # --muted-foreground (lowest readable text tier)
    faint: "#b9b9b9"             # mute at 50% (decorative only, never text)
    action: "#171717"            # --primary (NEUTRAL ink fill, not brand blue)
    on-action: "#fafafa"         # --primary-foreground
    hairline: "#e5e5e5"          # --border (cards, controls, dividers)
    separator: "#d7d7d7"         # --separator (page chrome rules only)
    input: "#e5e5e5"             # --input
    ring: "#a1a1a1"              # --ring (shadcn default ring)
    destructive: "#e7000b"       # --destructive
    link: "#005d95"              # primary-700
    link-hover: "#003e63"        # primary-800
    brand-icon: "#007cc7"        # primary-600
    brand-chip: "#ccedff"        # primary-100
    brand-wash: "#e6f6ff"        # primary-50
    brand-fill: "#005d95"        # primary-700 (filled brand buttons)
    on-brand-fill: "#ffffff"
    focus-ring: "#007cc7"        # primary-600
    overlay: "rgba(0, 0, 0, 0.40)"
    scrollbar-thumb: "#b4b4b4"
    scrollbar-thumb-hover: "#949494"
    scrollbar-track: "#f1f1f1"
  dark:
    canvas: "#0a0a0a"
    surface: "#171717"
    popover: "#171717"
    muted: "#262626"
    ink: "#fafafa"
    mute: "#a1a1a1"
    faint: "#565656"
    action: "#e5e5e5"
    on-action: "#171717"
    hairline: "rgba(255, 255, 255, 0.10)"
    separator: "rgba(255, 255, 255, 0.15)"
    input: "rgba(255, 255, 255, 0.15)"
    ring: "#737373"
    destructive: "#ff6467"
    link: "#33b7ff"              # primary-400
    link-hover: "#66c9ff"        # primary-300
    brand-icon: "#33b7ff"        # primary-400
    brand-chip: "#001f32"        # primary-900
    brand-wash: "rgba(0, 31, 50, 0.30)"   # primary-900/30
    brand-fill: "#33b7ff"        # primary-400
    on-brand-fill: "#000f19"     # primary-950
    focus-ring: "#33b7ff"
    overlay: "rgba(0, 0, 0, 0.60)"
    scrollbar-thumb: "#3d3d3d"
    scrollbar-thumb-hover: "#525252"
    scrollbar-track: "#1a1a1a"

colors:
  # Semantic roles resolve to the LIGHT theme (the :root base theme).
  canvas: "#ffffff"
  surface: "#ffffff"
  muted: "#f5f5f5"
  ink: "#0a0a0a"
  mute: "#737373"
  action: "#171717"
  on-action: "#fafafa"
  hairline: "#e5e5e5"
  separator: "#d7d7d7"
  destructive: "#e7000b"
  link: "#005d95"
  # Aback Blue brand ramp (--color-primary-*). Tailwind: primary-50 ... primary-950
  primary-50: "#e6f6ff"
  primary-100: "#ccedff"
  primary-200: "#99dbff"
  primary-300: "#66c9ff"
  primary-400: "#33b7ff"
  primary-500: "#009bf9"         # Aback Blue, the brand anchor
  primary-600: "#007cc7"
  primary-700: "#005d95"
  primary-800: "#003e63"
  primary-900: "#001f32"
  primary-950: "#000f19"
  # Status families (Tailwind v4 default palette, sRGB approximations of oklch)
  success: "#008236"             # green-700 (text on light)
  success-soft: "#dcfce7"        # green-100
  success-strong: "#016630"      # green-800
  success-dark-text: "#05df72"   # green-400
  warning: "#bb4d00"             # amber-700
  warning-soft: "#fffbeb"        # amber-50
  warning-strong: "#973c00"      # amber-800
  danger: "#c10007"              # red-700
  danger-soft: "#fef2f2"         # red-50
  danger-strong: "#9f0712"       # red-800
  # Content-type accents (search, quick navigation, callouts)
  type-tool: "#009bf9"           # primary-500
  type-guide: "#00bc7d"          # emerald-500
  type-blog: "#8e51ff"           # violet-500
  # Brand marketing surface (OG / social art only, never app UI)
  marketing-canvas: "#05080f"
  marketing-glow-blue: "#0073e6"
  marketing-glow-cyan: "#06b6d4"
  # Data visualization (CSS vars --chart-1 ... --chart-5, light values)
  chart-1: "oklch(0.646 0.222 41.116)"
  chart-2: "oklch(0.6 0.118 184.704)"
  chart-3: "oklch(0.398 0.07 227.392)"
  chart-4: "oklch(0.828 0.189 84.429)"
  chart-5: "oklch(0.769 0.188 70.08)"

typography:
  display-lg:
    fontFamily: Geist, GeistSansFallback, ui-sans-serif, system-ui, sans-serif
    fontSize: 36px
    fontWeight: 700
    lineHeight: 40px
    letterSpacing: -0.9px
  heading-xl:
    fontFamily: Geist, GeistSansFallback, ui-sans-serif, system-ui, sans-serif
    fontSize: 30px
    fontWeight: 700
    lineHeight: 36px
    letterSpacing: -0.75px
  heading-lg:
    fontFamily: Geist, GeistSansFallback, ui-sans-serif, system-ui, sans-serif
    fontSize: 24px
    fontWeight: 700
    lineHeight: 32px
    letterSpacing: -0.6px
  heading-md:
    fontFamily: Geist, GeistSansFallback, ui-sans-serif, system-ui, sans-serif
    fontSize: 20px
    fontWeight: 600
    lineHeight: 28px
    letterSpacing: 0
  heading-sm:
    fontFamily: Geist, GeistSansFallback, ui-sans-serif, system-ui, sans-serif
    fontSize: 18px
    fontWeight: 600
    lineHeight: 28px
    letterSpacing: 0
  title-md:
    fontFamily: Geist, GeistSansFallback, ui-sans-serif, system-ui, sans-serif
    fontSize: 16px
    fontWeight: 500
    lineHeight: 24px
    letterSpacing: 0
  body-lg:
    fontFamily: Geist, GeistSansFallback, ui-sans-serif, system-ui, sans-serif
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
    letterSpacing: 0
  body-md:
    fontFamily: Geist, GeistSansFallback, ui-sans-serif, system-ui, sans-serif
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: 0
  body-prose:
    fontFamily: Geist, GeistSansFallback, ui-sans-serif, system-ui, sans-serif
    fontSize: 14px
    fontWeight: 400
    lineHeight: 22.75px
    letterSpacing: 0
  body-sm:
    fontFamily: Geist, GeistSansFallback, ui-sans-serif, system-ui, sans-serif
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
    letterSpacing: 0
  label-md:
    fontFamily: Geist, GeistSansFallback, ui-sans-serif, system-ui, sans-serif
    fontSize: 14px
    fontWeight: 500
    lineHeight: 20px
    letterSpacing: 0
  eyebrow:
    fontFamily: Geist, GeistSansFallback, ui-sans-serif, system-ui, sans-serif
    fontSize: 12px
    fontWeight: 500
    lineHeight: 16px
    letterSpacing: 0.025em
    textTransform: uppercase
  overline:
    fontFamily: Geist, GeistSansFallback, ui-sans-serif, system-ui, sans-serif
    fontSize: 11px
    fontWeight: 600
    lineHeight: 16px
    letterSpacing: 0.05em
    textTransform: uppercase
  micro-caps:
    fontFamily: Geist, GeistSansFallback, ui-sans-serif, system-ui, sans-serif
    fontSize: 10px
    fontWeight: 700
    lineHeight: 12px
    letterSpacing: 0.12em
    textTransform: uppercase
  button-md:
    fontFamily: Geist, GeistSansFallback, ui-sans-serif, system-ui, sans-serif
    fontSize: 14px
    fontWeight: 500
    lineHeight: 20px
    letterSpacing: 0
  button-xs:
    fontFamily: Geist, GeistSansFallback, ui-sans-serif, system-ui, sans-serif
    fontSize: 12px
    fontWeight: 500
    lineHeight: 16px
    letterSpacing: 0
  code:
    fontFamily: Geist Mono, ui-monospace, SFMono-Regular, Menlo, monospace
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: 0
  code-sm:
    fontFamily: Geist Mono, ui-monospace, SFMono-Regular, Menlo, monospace
    fontSize: 12px
    fontWeight: 400
    lineHeight: 19.5px
    letterSpacing: 0
  numeric-display:
    fontFamily: Geist, GeistSansFallback, ui-sans-serif, system-ui, sans-serif
    fontSize: 36px
    fontWeight: 800
    lineHeight: 36px
    letterSpacing: -0.9px
    fontVariantNumeric: tabular-nums

rounded:
  none: 0px
  card: 0px
  control: 0px
  chip: 0px
  icon-chip: 0px
  dialog: 0px
  avatar: 0px
  scrollbar-thumb: 4px            # native scrollbar chrome only

spacing:
  unit: 4px
  hair: 2px          # 0.5
  xs: 4px            # 1   Stack xs
  sm: 8px            # 2   Stack sm
  md: 16px           # 4   Stack md
  lg: 24px           # 6   Stack lg (tool page rhythm)
  xl: 32px           # 8   Stack xl (homepage rhythm)
  2xl: 40px          # 10  article / sidebar gutter
  3xl: 48px          # 12  empty-state padding
  4xl: 64px          # 16
  inset-control-x: 12px
  inset-tight: 12px
  inset-panel: 16px
  inset-card: 24px
  page-gutter-mobile: 16px
  page-gutter: 24px

layout:
  navbar-height: 64px
  sidebar-width: 256px
  sidebar-drawer-width: 288px
  rail-width-lg: 240px
  rail-width-xl: 288px
  article-sidebar-width: 260px
  dialog-search-max-width: 660px
  dialog-form-max-width: 448px
  prose-measure: 72ch
  control-height: 36px
  control-height-sm: 32px
  control-height-xs: 24px
  control-height-lg: 40px

breakpoints:
  sm: 640px
  md: 768px
  lg: 1024px
  xl: 1280px
  2xl: 1536px

elevation:
  level-0: "none"
  level-1: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)"
  level-1-xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)"
  level-2: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)"
  level-3: "0 25px 50px -12px rgb(0 0 0 / 0.25)"
  level-3-search-light: "0 0 0 1px rgba(0,0,0,0.04), 0 24px 48px -12px rgba(0,0,0,0.3)"
  level-3-search-dark: "0 0 0 1px rgba(255,255,255,0.04), 0 24px 48px -12px rgba(0,0,0,0.6)"
  kbd-light: "0 1px 0 0 rgba(0,0,0,0.04)"
  kbd-dark: "0 1px 0 0 rgba(255,255,255,0.04)"

motion:
  duration-instant: 100ms
  duration-fast: 150ms
  duration-base: 200ms
  duration-slow: 300ms
  duration-drawer-open: 500ms
  easing-standard: "cubic-bezier(0.4, 0, 0.2, 1)"
  easing-out: "cubic-bezier(0, 0, 0.2, 1)"
  hover-lift-card: "translateY(-4px)"
  hover-lift-tile: "translateY(-2px)"
  press-scale: 0.98
  marquee-duration: 48s

zIndex:
  base: 0
  footer: 10
  dropdown: 10
  rail: 20
  sidebar: 30
  rail-divider: 30
  sticky-navbar: 40
  modal-backdrop: 45
  modal: 50
  popover: 60
  tooltip: 70
  toast: 80
  max: 100

components:
  skip-link:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    borderColor: "{colors.hairline}"
    typography: "{typography.label-md}"
    padding: "{spacing.sm} {spacing.md}"
    shadow: "{elevation.level-2}"
  navbar:
    backgroundColor: "rgba(255, 255, 255, 0.95)"   # bg-background/95 + backdrop-blur-sm
    textColor: "{colors.ink}"
    borderColor: "{colors.separator}"
    height: "{layout.navbar-height}"
    padding: "0 {spacing.md}"                      # md+: 0 24px
    rounded: "{rounded.none}"
  nav-link:
    textColor: "{colors.mute}"
    typography: "{typography.label-md}"
    padding: "{spacing.sm} {spacing.inset-tight}"
    height: 36px
    rounded: "{rounded.none}"
  nav-link-active:
    backgroundColor: "{colors.primary-50}"
    textColor: "{colors.primary-700}"
  icon-button:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    width: 36px
    height: 36px
    rounded: "{rounded.none}"
  sidebar:
    backgroundColor: "{colors.canvas}"
    borderColor: "{colors.separator}"
    width: "{layout.sidebar-width}"
    rounded: "{rounded.none}"
  sidebar-brand-strip:
    background: "linear-gradient(to right, #e6f6ff, transparent)"
    borderColor: "{colors.separator}"
    height: 64px
    padding: "0 {spacing.md}"
  sidebar-category-row:
    textColor: "{colors.ink}"
    typography: "{typography.label-md}"
    padding: "{spacing.sm} 12px"
    rounded: "{rounded.none}"
  sidebar-row-active:
    backgroundColor: "{colors.primary-50}"
    textColor: "{colors.primary-700}"
  sidebar-tool-row:
    textColor: "{colors.mute}"
    typography: "{typography.body-md}"
    padding: "{spacing.sm} {spacing.sm}"
  sidebar-tool-row-active:
    backgroundColor: "{colors.primary-100}"
    textColor: "{colors.primary-700}"
    typography: "{typography.label-md}"
  sidebar-count-strip:
    background: "linear-gradient(to right, #e6f6ff, #ccedff)"
    textColor: "{colors.primary-700}"
    padding: "16px 16px 12px"
  search-trigger:
    backgroundColor: "rgba(245, 245, 245, 0.30)"   # bg-muted/30
    textColor: "{colors.ink}"
    borderColor: "{colors.hairline}"
    height: 40px
    padding: "0 14px"
    typography: "{typography.label-md}"
    rounded: "{rounded.none}"
  page-header:
    textColor: "{colors.ink}"
    typography: "{typography.heading-xl}"
    descriptionTypography: "{typography.body-lg}"
    descriptionColor: "{colors.mute}"
    gap: "{spacing.sm}"
  breadcrumbs:
    textColor: "{colors.mute}"
    currentColor: "{colors.ink}"
    typography: "{typography.body-md}"
    separator: "IconChevronRight 16px"
  button-primary:
    backgroundColor: "{colors.action}"
    textColor: "{colors.on-action}"
    typography: "{typography.button-md}"
    height: "{layout.control-height}"
    padding: "0 16px"
    rounded: "{rounded.none}"
  button-brand:
    backgroundColor: "{colors.primary-700}"
    textColor: "#ffffff"
    hoverBackgroundColor: "{colors.primary-800}"
    typography: "{typography.button-md}"
    height: "{layout.control-height}"
    padding: "0 16px"
    rounded: "{rounded.none}"
  button-outline:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    borderColor: "{colors.hairline}"
    shadow: "{elevation.level-1-xs}"
    typography: "{typography.button-md}"
    height: "{layout.control-height}"
    padding: "0 16px"
    rounded: "{rounded.none}"
  button-secondary:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.action}"
    typography: "{typography.button-md}"
    height: "{layout.control-height}"
    rounded: "{rounded.none}"
  button-ghost:
    backgroundColor: "transparent"
    hoverBackgroundColor: "{colors.muted}"
    textColor: "{colors.ink}"
    typography: "{typography.button-md}"
    height: "{layout.control-height}"
    rounded: "{rounded.none}"
  button-destructive:
    backgroundColor: "{colors.destructive}"
    textColor: "#ffffff"
    typography: "{typography.button-md}"
    height: "{layout.control-height}"
    rounded: "{rounded.none}"
  text-input:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    borderColor: "{colors.hairline}"
    typography: "{typography.body-md}"
    height: "{layout.control-height}"
    padding: "4px 12px"
    shadow: "{elevation.level-1-xs}"
    rounded: "{rounded.none}"
  select:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    borderColor: "{colors.hairline}"
    typography: "{typography.body-md}"
    height: "{layout.control-height}"
    padding: "0 32px 0 12px"
    rounded: "{rounded.none}"
  code-editor:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    borderColor: "{colors.hairline}"
    typography: "{typography.code}"
    height: 320px
    padding: "{spacing.inset-tight}"
    rounded: "{rounded.none}"
  code-output:
    backgroundColor: "rgba(245, 245, 245, 0.50)"   # bg-muted/50
    textColor: "{colors.ink}"
    borderColor: "{colors.hairline}"
    typography: "{typography.code}"
    height: 320px
    padding: "{spacing.inset-tight}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    borderColor: "{colors.hairline}"
    shadow: "{elevation.level-1}"
    padding: "{spacing.lg}"
    gap: "{spacing.lg}"
    rounded: "{rounded.card}"
  card-title:
    typography: "{typography.heading-sm}"
    textColor: "{colors.ink}"
  tool-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    borderColor: "{colors.hairline}"
    borderWidth: 2px
    shadow: "{elevation.level-1}"
    padding: "32px {spacing.lg}"
    hoverTransform: "{motion.hover-lift-card}"
    rounded: "{rounded.card}"
  tool-card-icon:
    backgroundColor: "{colors.primary-100}"
    textColor: "{colors.primary-600}"
    hoverBackgroundColor: "{colors.primary-500}"
    hoverTextColor: "#ffffff"
    size: 40px
    iconSize: 20px
    rounded: "{rounded.icon-chip}"
  link-chip:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    borderColor: "{colors.separator}"
    hoverBorderColor: "{colors.primary-400}"
    hoverTextColor: "{colors.primary-700}"
    typography: "{typography.label-md}"
    padding: "6px 12px"
    rounded: "{rounded.chip}"
  filter-pill:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.mute}"
    borderColor: "{colors.hairline}"
    typography: "{typography.button-xs}"
    padding: "6px 14px"
    rounded: "{rounded.chip}"
  filter-pill-active:
    backgroundColor: "{colors.primary-700}"
    textColor: "#ffffff"
  workbench-card:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.hairline}"
    shadow: "{elevation.level-1}"
    titleTypography: "{typography.heading-sm}"
    titleIconColor: "{colors.primary-600}"
    padding: "{spacing.lg}"
    rounded: "{rounded.card}"
  options-panel:
    backgroundColor: "rgba(245, 245, 245, 0.20)"   # bg-muted/20
    borderColor: "{colors.hairline}"
    padding: "{spacing.inset-panel}"
    gap: "{spacing.md}"
    rounded: "{rounded.none}"
  dropzone:
    backgroundColor: "transparent"
    borderColor: "rgba(115, 115, 115, 0.25)"       # border-muted-foreground/25
    borderStyle: "2px dashed"
    padding: "32px"
    rounded: "{rounded.none}"
  dropzone-active:
    backgroundColor: "{colors.primary-50}"
    borderColor: "{colors.primary-500}"
  file-row:
    backgroundColor: "rgba(245, 245, 245, 0.30)"
    borderColor: "{colors.hairline}"
    padding: "{spacing.inset-tight}"
  result-hero:
    backgroundColor: "rgba(230, 246, 255, 0.50)"   # primary-50/50
    borderColor: "{colors.primary-200}"
    borderWidth: 2px
    padding: "{spacing.lg}"
    valueTypography: "{typography.numeric-display}"
  stat-tile:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.hairline}"
    padding: "{spacing.inset-tight}"
    labelTypography: "{typography.body-sm}"
    valueTypography: "{typography.label-md}"
  alert-error:
    backgroundColor: "{colors.danger-soft}"
    borderColor: "#ffc9c9"
    textColor: "{colors.danger-strong}"
    typography: "{typography.body-md}"
    padding: "{spacing.inset-tight}"
  alert-success:
    backgroundColor: "{colors.success-soft}"
    borderColor: "#b9f8cf"
    textColor: "{colors.success-strong}"
    typography: "{typography.body-md}"
    padding: "{spacing.inset-tight}"
  alert-warning:
    backgroundColor: "{colors.warning-soft}"
    borderColor: "#fee685"
    textColor: "{colors.warning-strong}"
    typography: "{typography.body-md}"
    padding: "{spacing.inset-tight}"
  alert-info:
    backgroundColor: "rgba(230, 246, 255, 0.50)"
    borderColor: "{colors.primary-200}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    padding: "{spacing.inset-panel}"
  feature-item-icon:
    backgroundColor: "{colors.primary-100}"
    textColor: "{colors.primary-600}"
    size: 40px
    rounded: "{rounded.icon-chip}"
  use-case-item:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.hairline}"
    hoverBackgroundColor: "rgba(245, 245, 245, 0.50)"
    padding: "{spacing.inset-panel}"
  faq-item:
    borderColor: "{colors.hairline}"
    questionTypography: "{typography.title-md}"
    answerTypography: "{typography.body-md}"
    answerColor: "{colors.mute}"
    padding: "{spacing.md} 0"
  related-tool-item:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.hairline}"
    hoverBorderColor: "{colors.primary-300}"
    padding: "{spacing.inset-panel}"
  search-dialog:
    backgroundColor: "{colors.canvas}"
    borderColor: "{colors.hairline}"
    shadow: "{elevation.level-3-search-light}"
    maxWidth: "{layout.dialog-search-max-width}"
    inputHeight: 56px
    resultsMaxHeight: 420px
    rounded: "{rounded.dialog}"
  search-result-row-selected:
    backgroundColor: "rgba(230, 246, 255, 0.80)"
    accentBar: "2px x 24px {colors.primary-500}"
    titleColor: "{colors.primary-700}"
  kbd:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.mute}"
    borderColor: "{colors.hairline}"
    shadow: "{elevation.kbd-light}"
    typography: "{typography.micro-caps}"
    size: 20px
  modal-panel:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.hairline}"
    shadow: "{elevation.level-3}"
    maxWidth: "{layout.dialog-form-max-width}"
    rounded: "{rounded.dialog}"
  menu:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.hairline}"
    shadow: "{elevation.level-2}"
    width: 208px
    itemPadding: "10px 14px"
  prose-h2:
    typography: "{typography.heading-lg}"
    textColor: "{colors.ink}"
  prose-paragraph:
    typography: "{typography.body-prose}"
    textColor: "{colors.mute}"
    maxWidth: "{layout.prose-measure}"
  prose-link:
    textColor: "{colors.link}"
    decoration: "underline on hover"
  code-block:
    backgroundColor: "#fafafa"                    # zinc-50; dark zinc-900
    barBackgroundColor: "#f4f4f5"                 # zinc-100; dark zinc-800
    borderColor: "{colors.hairline}"
    typography: "{typography.code}"
    padding: "{spacing.md}"
  sidebar-widget:
    backgroundColor: "rgba(245, 245, 245, 0.20)"
    borderColor: "{colors.hairline}"
    titleTypography: "{typography.overline}"
    padding: "{spacing.inset-panel}"
  toc-item-active:
    backgroundColor: "{colors.primary-50}"
    textColor: "{colors.primary-700}"
    borderLeft: "2px solid {colors.primary-500}"
  reading-progress:
    height: 3px
    background: "linear-gradient(to right, #33b7ff, #007cc7)"
  footer:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.mute}"
    borderColor: "{colors.separator}"
    typography: "{typography.body-sm}"
    padding: "40px {spacing.md}"
  footer-column-title:
    typography: "{typography.overline}"
    textColor: "{colors.mute}"
  footer-legal-bar:
    backgroundColor: "rgba(245, 245, 245, 0.40)"
    padding: "{spacing.inset-tight} {spacing.md}"
  right-rail:
    backgroundColor: "transparent"
    width: "{layout.rail-width-lg}"
    paddingBottom: 160px
  ad-reservation:
    height: 88px
    captionTypography: "{typography.micro-caps}"
    captionColor: "{colors.faint}"
---

# Aback Tools Design System

## 0. How to Read This Document

This file is the single source of truth for how Aback Tools looks, behaves and reads. It was produced from a full audit of the production codebase (`src/app/globals.css`, every layout and shared component, representative tool UIs across all categories, the blog and guide templates, and a frequency count of every Tailwind token in `src/`).

- **Tokens** in the front matter are the contract. Light values are the base theme (`:root`); dark values live in `themes.dark`.
- **"Standard"** means the rule for all new work. Where the current code differs, the deviation is logged in Appendix A with a migration note. A small number of standards deliberately tighten current behaviour for accessibility (contrast, focus, text floors); these are marked **(normative)**.
- **Class strings** are given in Tailwind v4 syntax because that is how the system is implemented. Designers can read them as exact values: `p-4` = 16px, `gap-6` = 24px, `text-sm` = 14px/20px.

---

## 1. Overview and Design Philosophy

Aback Tools is a free, no-signup library of 3,200+ utilities (the live count comes from `TOTAL_TOOL_COUNT`, currently 3,220) that run entirely in the browser. The design exists to get a person from "I need to convert/format/calculate X" to a finished result as fast as possible, and to make the privacy promise ("your files never leave your device") feel credible.

The visual language is a **Swiss utilitarian app shell**: a neutral grayscale, a single saturated brand blue, square corners, 1px hairlines and dense, well-ordered typography. It looks like a precise instrument, not a marketing site.

**Design pillars**

1. **Utility first, no hero theatre.** Pages open with a plain H1 and description and put tools above the fold. There is no marketing hero on the homepage by design.
2. **One brand colour, used as a signal.** Aback Blue (`#009bf9` and its ramp) marks interactivity and state: links, icon chips, active navigation, drag-over, selection, progress. Everything else is neutral.
3. **Square geometry.** Every corner radius is 0. This is enforced globally in CSS and is the most recognisable trait of the brand.
4. **Hairline structure over shadow.** Borders define surfaces; shadows are whisper-light and reserved for floating layers.
5. **Consistency across 2,000+ pages.** Every tool page follows one anatomy and one set of shared components, so moving between tools feels like moving between tabs of one app.
6. **Privacy is visible.** The "processed locally" promise is stated in the description, in a feature item and in an About block on every tool page.
7. **Performance is a design constraint.** Layout reservations prevent CLS, hover motion on large grids is compositor-only, heavy UI (search) loads on idle. Visual ideas that cost Core Web Vitals are rejected.
8. **Theme follows the user.** Light and dark are both first class; the OS preference decides on first paint.

---

## 2. Brand Identity

### 2.1 Name and wordmark

- Product name: **Aback Tools**. Domain: **abacktools.com**. Social handle: **@abacktools**.
- Wordmark: "Aback Tools" set in Geist Sans Bold, `tracking-tight`.
  - In the sidebar (primary placement): `text-primary-700 dark:text-primary-400`, hover `primary-800 / primary-300`.
  - In the footer: `text-sm font-semibold text-foreground` beside a 24px mark.

### 2.2 Logo mark

- A lowercase geometric **"a" in Aback Blue (#009bf9)** with three circuit traces exiting to the right, each ending in a ring node. It reads as "a" plus "connected utilities".
- Files: `public/aback-logo-64.png`, `-80.png`, `-128.png` (128px source is used everywhere for 2-3x DPR), `aback-ai-only-logo-1280-no-bg.png` (large mark for OG and JSON-LD publisher logo), `favicon-32x32.png`, `favicon.png` (256px).
- Logo component sizes (`src/components/common/Logo.tsx`): `sm` 24px, `md` 32px (default), `lg` 40px; mark-to-wordmark gap 12px (`gap-3`). Hover: mark scales to 110% over 200ms.
- On mobile (< 768px) the navbar shows the mark only.
- Do not recolour, outline, box, or place the mark on a saturated background. On dark marketing art it may carry a soft blue glow (see 2.4).

### 2.3 Brand colour

Aback Blue `#009bf9` (`primary-500`) is the anchor of an 11-step ramp (Section 3.3). Browser chrome uses `themeColor: #009af9` in `layout.tsx` and `site.webmanifest`; treat that as the same colour (it is one unit off; align to `#009bf9` when next touched). The manifest `background_color` is `#05080f`, the marketing canvas.

`#2596be`, named as a primary colour in `.github/instructions/platform.instructions.md`, is **legacy**. It still appears hardcoded 28 times and must not be used in new work.

### 2.4 Marketing and social expression

OG and Twitter images (`scripts/generate-og-image.py`, 2400x1260 rendered at 2x) define the brand's marketing look. It is a stronger, darker cousin of the app UI:

- Canvas `#05080f` with blurred radial glows (blue `#0073e6` centre-left, cyan `#06b6d4` bottom-left) and a 60px white hairline grid at about 3% opacity.
- A 2px framed layout, inset 28px, split into columns, with **"+" crosshairs in Aback Blue** at grid intersections.
- **HUD typography**: uppercase Geist Mono labels with `//` separators ("SYS.STATUS: OPERATIONAL", "ENGINE: PURE CLIENT-SIDE", "// 01").
- Big numerals in Geist Bold white ("2,000+"), the tagline in Aback Blue.
- Square spec chips (12% white fill, 32% white outline) and square count badges tinted with a category accent (blue, sky, purple, red, emerald, amber).
- Sharp corners only.

This HUD style is for marketing art, social cards and launch graphics. Do not import crosshairs, glows or grid backgrounds into the product UI.

### 2.5 Voice in one line

Plain, confident and specific: say what the tool does, that it is free, and that it runs locally. No hype, no exclamation marks, no em dashes (Section 13).

---

## 3. Color System

### 3.1 The one naming trap you must know

The codebase has two different things called "primary":

| You write | It resolves to | Light | Dark | Meaning |
|---|---|---|---|---|
| `bg-primary`, `text-primary`, `border-primary`, `ring-primary` | `--primary` (shadcn semantic) | `#171717` | `#e5e5e5` | **Ink / Action**: neutral high-emphasis fill |
| `bg-primary-500`, `text-primary-700`, ... | `--color-primary-NNN` (brand ramp) | ramp | ramp | **Aback Blue** |

Bare `primary` is **not blue**. The shadcn `Button` default variant is therefore an ink button (near-black in light, near-white in dark). When you mean brand blue, always write a ramp step. The audit found about 6,900 bare `text-primary` usages (mostly icons) that render ink while their authors likely intended blue; see Appendix A.

### 3.2 Semantic surface and text tokens

All defined in `src/app/globals.css` as CSS custom properties and exposed as Tailwind colours via `@theme inline`.

| Role | CSS var / Tailwind | Light | Dark | Use |
|---|---|---|---|---|
| Canvas | `--background` / `bg-background` | `#ffffff` | `#0a0a0a` | Page, sidebar, navbar, rail, footer |
| Surface | `--card` / `bg-card` | `#ffffff` | `#171717` | Cards, panels, menus, modals |
| Popover | `--popover` / `bg-popover` | `#ffffff` | `#171717` | Floating layers |
| Muted | `--muted` / `bg-muted` | `#f5f5f5` | `#262626` | Hover fills, wells, tinted panels (usually at /10 to /50) |
| Secondary / Accent | `--secondary`, `--accent` | `#f5f5f5` | `#262626` | shadcn secondary and ghost hover fills |
| Ink | `--foreground` / `text-foreground` | `#0a0a0a` | `#fafafa` | Headings, labels, primary text |
| Mute | `--muted-foreground` / `text-muted-foreground` | `#737373` | `#a1a1a1` | Descriptions, meta, captions, idle nav. **Lowest readable tier** |
| Action | `--primary` / `bg-primary` | `#171717` | `#e5e5e5` | Primary action button fill |
| On-action | `--primary-foreground` | `#fafafa` | `#171717` | Text on Action |
| Hairline | `--border` / `border-border` (default for bare `border`) | `#e5e5e5` | `white / 10%` | Cards, controls, inner dividers |
| Separator | `--separator` / `border-separator`, `bg-separator` | `#d7d7d7` | `white / 15%` | **Page chrome only**: navbar bottom, sidebar edge and tree guides, footer top, rail divider, link chips |
| Input | `--input` / `border-input` | `#e5e5e5` | `white / 15%` | Form control outlines |
| Ring | `--ring` | `#a1a1a1` | `#737373` | shadcn default focus ring (see 14.3) |
| Destructive | `--destructive` | `#e7000b` | `#ff6467` | Errors, destructive actions |

Rules:
- The global base layer applies `border-border` and `outline-ring/50` to `*`, so a bare `border` class is always the Hairline.
- `--separator` is intentionally a shade heavier than `--border` so long chrome rules do not disappear, while form outlines stay light. Never use Separator on controls, never use Hairline for chrome rules.
- `--sidebar-*` tokens exist (shadcn scaffold) but the sidebar uses `bg-background`. Do not adopt them.

### 3.3 Aback Blue ramp and role map

| Step | Hex | Role in light theme | Role in dark theme |
|---|---|---|---|
| 50 | `#e6f6ff` | Active nav wash, drag-over fill, selected row, tinted panels | (not used) |
| 100 | `#ccedff` | Icon chip fill, active tool row, tags | Hover/active text on deep fills |
| 200 | `#99dbff` | Tinted borders (callouts, result hero) | Text on deep brand fills |
| 300 | `#66c9ff` | Hover borders on cards and chips | Link hover |
| 400 | `#33b7ff` | Hover borders on chips | **Links, brand icons, focus ring, brand fill** |
| 500 | `#009bf9` | **Brand anchor**: accent bars, progress, drag-over border, hover chip flood, decorative fills | Accents, markers, borders |
| 600 | `#007cc7` | **Brand icons, focus ring**, small UI marks | Fills only with white text 18px+ |
| 700 | `#005d95` | **Link text, active nav text, brand-filled buttons** | Borders on deep fills |
| 800 | `#003e63` | Link and brand-button hover | Tinted borders |
| 900 | `#001f32` | (not used) | **Icon chip fill** (`bg-primary-900`), active washes at /30 to /50 |
| 950 | `#000f19` | (not used) | Text on brand fill, deep washes at /20 to /30 |

Measured contrast (WCAG 2.x):

| Pair | Ratio | Verdict |
|---|---|---|
| primary-700 on white | 7.0:1 | AAA text |
| primary-600 on white | 4.46:1 | Fails AA for normal text by 0.04; OK for icons and 18px+ text |
| primary-500 on white | 2.98:1 | Decorative only on light; never text, never the only state cue |
| white on primary-500 | 2.98:1 | Fails; do not put white labels on primary-500 |
| primary-400 on `#0a0a0a` | 8.8:1 | AAA |
| primary-400 on `#171717` | 8.0:1 | AAA |
| primary-950 on primary-400 | 8.6:1 | AAA |
| primary-600 icon on primary-100 chip | 3.6:1 | Passes 3:1 non-text |

Hence the standard pairings:
- **Link text**: `text-primary-700 dark:text-primary-400`, hover `hover:text-primary-800 dark:hover:text-primary-300` plus underline.
- **Brand icon**: `text-primary-600 dark:text-primary-400`.
- **Icon chip**: `bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400`.
- **Active wash** (nav, ToC, selected row): `bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300`.
- **Brand fill (normative)**: `bg-primary-700 text-white hover:bg-primary-800 dark:bg-primary-400 dark:text-primary-950 dark:hover:bg-primary-300`.

### 3.4 Status colours

There are no status tokens in CSS; status uses the Tailwind v4 palette with one fixed recipe per family. Success is **green**, warning is **amber**, danger is **red** (or `destructive`), info is the **brand ramp**.

| State | Container (light) | Container (dark) | Inline text | Icon |
|---|---|---|---|---|
| Success | `border-green-200 bg-green-50 text-green-800` | `dark:border-green-800/50 dark:bg-green-950/30 dark:text-green-300` | `text-green-700 dark:text-green-400` | `IconCircleCheck` green-600 / green-400 |
| Warning | `border-amber-200 bg-amber-50 text-amber-800` | `dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-300` | `text-amber-700 dark:text-amber-400` | `IconAlertTriangle` |
| Danger | `border-red-200 bg-red-50 text-red-800` | `dark:border-red-800/50 dark:bg-red-950/30 dark:text-red-300` | `text-red-700 dark:text-red-400` | `IconAlertCircle` |
| Info | `border-primary-200 bg-primary-50/50 text-foreground` | `dark:border-primary-800/60 dark:bg-primary-950/30` | `text-primary-700 dark:text-primary-300` | `IconInfoCircle` |

Never use 500 or 600 status shades for small text on white (green-600 is 3.2:1). Never signal state with colour alone; pair it with an icon or a word.

### 3.5 Content-type accents

Used only where tools, guides and blog posts appear side by side (search dialog, quick navigation, callout variants):

| Type | Accent | Badge recipe |
|---|---|---|
| Tool | primary-500 | `bg-primary-100 text-primary-700 border-primary-200 dark:bg-primary-900/35 dark:text-primary-300 dark:border-primary-800/40` |
| Guide | emerald-500 | `bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/30` |
| Blog | violet-500 | `bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800/30` |

Emerald is reserved for "guide" and for the blog "Tip" callout. Do not use it as a generic success colour.

### 3.6 Categories have no colours

All 20 tool categories share the same blue icon chip. Differentiation comes from the Tabler icon (Section 9.4), not hue. Do not introduce per-category colours in the product UI; the per-category accents in the OG image are marketing-only.

### 3.7 Colour inside tools

Tools whose subject is colour (palettes, contrast checkers, CSS generators, charts, regex railroads) may render arbitrary user or data colours through inline `style`. That is content, not chrome. Their surrounding UI (cards, labels, buttons) still follows this system. Data visualisations use `--chart-1` to `--chart-5` before anything else.

### 3.8 Third-party brand colours

Allowed only on the brand's own mark, at hover, in share or "Ask AI" controls: X (ink), LinkedIn `#0a66c2`, Facebook blue-700, WhatsApp emerald-600. At rest these icons are monochrome `text-muted-foreground`.

---

## 4. Theming

### 4.1 Mechanism

- Light is the base theme on `:root`. Dark is applied by the class `dark` on `<html>`.
- Tailwind variant: `@custom-variant dark (&:is(.dark *));` so every `dark:` utility applies under `<html class="dark">`.
- Preference is stored in `localStorage` under the key **`theme`** with values `light`, `dark` or `system`. A missing value means `system`.
- `CriticalScriptInjector` injects an inline `theme-init` script through `useServerInsertedHTML` that reads the key and the `prefers-color-scheme` media query **before first paint**, so there is no flash of the wrong theme.
- `ThemeToggle` (`src/components/common/ThemeToggle.tsx`) switches between explicit `light` and `dark`, listens to OS changes while the preference is `system`, and renders a disabled placeholder during SSR to stay hydration-safe.

### 4.2 Dark theme rules

- Dark canvas is `#0a0a0a`, surfaces step up to `#171717`, wells to `#262626`. Hierarchy comes from lighter surfaces, not from shadows (shadows are near-invisible on dark).
- Borders become translucent white (10% hairline, 15% separator and input).
- Brand shifts up the ramp: 600/700 in light become 400/300 in dark. Tints shift down: 50/100 become 900/950 at 20% to 50% opacity.
- Status containers use `-950/30` fills, `-800/50` borders, `-300` text.
- Every component that sets a light colour explicitly must set its dark pair in the same class string. Never ship a `bg-primary-50` without `dark:bg-primary-900/30` (or similar).

### 4.3 Scrollbars

Thin, theme-aware scrollbars are defined globally: 8px wide, thumb radius 4px (the only rounded element in the UI), thumb `#b4b4b4` / `#3d3d3d`, hover `#949494` / `#525252`, track `#f1f1f1` / `#1a1a1a`. Firefox uses `scrollbar-width: thin`.

---

## 5. Typography

### 5.1 Families

- **Geist Sans** for all UI and prose. Self-hosted through the `geist` npm package (`GeistSans.variable`), no network font requests.
- **GeistSansFallback**: a local Arial/Helvetica face with `size-adjust: 105%`, `ascent-override: 95%`, `descent-override: 22%`, `line-gap-override: 0%`, calibrated so the font swap causes under 1px of reflow (CLS budget).
- **Geist Mono** (`GeistMono.variable`, Tailwind `font-mono`) for code, editors and outputs, hex values, file names and sizes, and technical chips. Add `ui-monospace, SFMono-Regular, Menlo, monospace` as the fallback when you define it.
- Body is set with `antialiased`.
- No per-script fonts. Supported locales are Latin and Cyrillic only (Section 13.5).

### 5.2 Scale

| Token | Tailwind | Size / line | Weight | Tracking | Used for |
|---|---|---|---|---|---|
| `display-lg` | `text-4xl font-bold tracking-tight` | 36 / 40 | 700 | -0.025em | Standalone hero titles (Support page at `sm:`), 404 |
| `heading-xl` | `text-3xl font-bold tracking-tight` | 30 / 36 | 700 | -0.025em | **The page H1** (`PageHeader`) |
| `heading-lg` | `text-2xl font-bold tracking-tight` | 24 / 32 | 700 | -0.025em | Article H2 in blog prose, blog FAQ title |
| `heading-md` | `text-xl font-semibold` | 20 / 28 | 600 | 0 | Free-standing section H2 (SectionHeader, CategoryHeader, listing sections, legal sections) |
| `heading-sm` | `text-lg font-semibold` | 18 / 28 | 600 | 0 | **H2 inside a Card** (`CardTitle className="text-lg"`), article H3 |
| `title-md` | `font-medium` (base) | 16 / 24 | 500 | 0 | Item H3: feature, use case, info block, FAQ question, related tool |
| `body-lg` | `text-base` | 16 / 24 | 400 | 0 | Page description under H1, blog lead |
| `body-md` | `text-sm` | 14 / 20 | 400 | 0 | Default UI text, card descriptions, controls |
| `body-prose` | `text-sm leading-relaxed` | 14 / 22.75 | 400 | 0 | Blog, guide and legal paragraphs, About blocks |
| `body-sm` | `text-xs` | 12 / 16 | 400 | 0 | Meta, captions, helper text, footer links, counts |
| `label-md` | `text-sm font-medium` | 14 / 20 | 500 | 0 | Form labels, nav links, buttons, sidebar categories |
| `eyebrow` | `text-xs font-medium uppercase tracking-wide` | 12 / 16 | 500 | 0.025em | In-tool option-group labels, table headers, result labels |
| `overline` | `text-[11px] font-semibold uppercase tracking-wider` | 11 / 16 | 600 | 0.05em | Footer column titles, sidebar widget titles, form labels in modals |
| `micro-caps` | `text-[10px] font-bold uppercase tracking-[0.12em]` | 10 / 12 | 700 | 0.12em | Search group headers, right-rail section labels, type badges, ad caption |
| `code` | `font-mono text-sm` | 14 / 20 | 400 | 0 | Editors, code blocks |
| `code-sm` | `font-mono text-xs leading-relaxed` | 12 / 19.5 | 400 | 0 | Output lists, hex values, format chips |
| `numeric-display` | `text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums` | 30-36 | 800 | -0.025em | Calculator result heroes, stat boxes |

### 5.3 Rules

1. **Exactly one H1 per page**, always `PageHeader` (or a hero that reuses its classes). `ToolWorkbench` can render its own H1; never pass it a title on a page that already has `PageHeader`.
2. **Heading level follows structure, size follows context.** An H2 inside a Card is 18px; a free-standing H2 is 20px; an H2 inside long-form prose is 24px.
3. **Weights**: 400, 500, 600, 700. 800 is reserved for `numeric-display`. Never use 300 or 900.
4. **Tracking**: `tracking-tight` on 24px and up only. Uppercase labels always get positive tracking. Body is never tracked.
5. **Text floor (normative)**: readable content is never below 12px. 10px and 11px exist only as uppercase `micro-caps` and `overline`. Nothing is ever set below 10px (the audit found 1,085 sub-10px usages; Appendix A).
6. **Opacity floor (normative)**: never apply opacity modifiers (`text-muted-foreground/50`, `/60`, `/70`) to text a user needs to read. In light mode `#737373` at 70% drops to 2.7:1. `text-muted-foreground` is the lowest text tier; reduced-opacity text is for decorative glyphs and disabled states only.
7. **Numbers**: counts, stats, sizes and anything in a column use `tabular-nums`.
8. **Measure**: long-form text is capped at about 72ch (`max-w-[72ch]`). UI descriptions under an H1 may run the column width.
9. **Truncation**: single-line titles in lists use `truncate`; card descriptions use `line-clamp-2`; excerpts use `line-clamp-3`. Always provide the full text via `title` or the destination page.
10. **Case**: Title Case for H1, H2, nav labels, category and tool names, and button labels ("Calculate Tip", "Browse All Tools" style is acceptable but keep one style per surface). Sentence case for descriptions, helper text and messages.

---

## 6. Spacing, Layout and Grid

### 6.1 Scale

A 4px base unit (Tailwind default spacing). Most used values in production: `p-3`/`p-4` for panels, `px-3 py-2` for controls, `gap-2`/`gap-3`/`gap-4` inside components, `gap-6` between page blocks.

| Token | px | Tailwind | Typical use |
|---|---|---|---|
| `hair` | 2 | `0.5` | Badge vertical padding, mark offsets |
| `xs` | 4 | `1` | Icon-to-text in tight chips, `Stack xs` |
| `sm` | 8 | `2` | Default inner gap, `Stack sm`, control vertical padding |
| `inset-tight` | 12 | `3` | Compact panels, alerts, file rows, control horizontal padding |
| `md` / `inset-panel` | 16 | `4` | Panels, grid gaps, page gutter on mobile, `Stack md` |
| `lg` / `inset-card` | 24 | `6` | Card padding, **gap between tool-page blocks**, page gutter at md+ |
| `xl` | 32 | `8` | Homepage section rhythm, dropzone padding |
| `2xl` | 40 | `10` | Article/sidebar gutter, footer vertical padding |
| `3xl` | 48 | `12` | Empty and loading states |
| `4xl` | 64 | `16` | Large page padding (404) |

### 6.2 Layout primitives (`src/components/layout-primitives`)

Use these instead of ad hoc flex/grid wrappers.

| Primitive | Classes | Notes |
|---|---|---|
| `Stack gap=` | `flex flex-col` + `xs gap-1`, `sm gap-2`, `md gap-4` (default), `lg gap-6`, `xl gap-8` | `gap="lg"` is the mandatory top-level wrapper of every tool page |
| `Group` | `flex flex-row flex-wrap` + gap, `align` (default center), `justify` | Toolbars, action rows |
| `Grid cols=` | 1: `grid-cols-1`; 2: `1 / sm:2`; 3 (default): `1 / sm:2 / lg:3`; 4: `1 / sm:2 / lg:4`; 6: `2 / sm:3 / lg:6` | Card grids |
| `Container size=` | `mx-auto w-full px-4` + sm `max-w-2xl`, md `max-w-4xl`, lg `max-w-6xl` (default), xl `max-w-7xl` | Standalone pages only (404). Never inside tool pages |

`src/components/layout/primitives/Stack.tsx` (numeric `gap-${n}`) is a deprecated duplicate whose dynamic class names Tailwind cannot detect.

### 6.3 App shell

```
+--------------+----------------------------------------------+-------------+
| SIDEBAR      | NAVBAR  sticky, h-16, bg-background/95 blur   |             |
| fixed, w-64  +----------------------------------------------+ RIGHT RAIL  |
| md and up    | MAIN  #main-content  p-4 md:p-6               | fixed       |
|              |   Stack gap-6 ... page content                | w-60 lg     |
| logo strip   |                                              | w-72 xl     |
| search       |                                              | transparent |
| category tree|                                              | bottom-     |
| (scroll,     +----------------------------------------------+ pinned      |
|  faded ends) | FOOTER  border-t separator, stops at rail     | stack       |
| tool count + |                                              |             |
| ad reserve   |                                              |             |
+--------------+----------------------------------------------+-------------+
                one continuous 1px rail divider (z-30), lg and up
```

- **Document scroll is native.** No `h-screen overflow-hidden` shells and no inner scroll containers for page content (this previously broke scrolling when ad scripts mutated the DOM).
- **Sidebar**: `fixed top-0 left-0 z-30 h-screen w-64 border-r border-separator bg-background`, visible from `md` (768px). Below `md` it becomes a left `Sheet` drawer, `w-72`.
- **Content column**: `md:ml-64`, applied before hydration so there is no layout shift.
- **Navbar**: `sticky top-0 z-40 h-16`.
- **Main**: `p-4 md:p-6`, fluid, **no max-width** on tool and listing pages.
- **Right rail**: `hidden lg:block w-60 xl:w-72`, its card stack fixed below the navbar and pinned to the bottom (`mt-auto`), `pb-40` clearance for Mediavine's fixed bottom bars, `print:hidden`, intentionally no background so injected ads show through.
- **Rail divider**: a single absolutely positioned `w-px bg-separator` from `top-16` to the bottom of the document, `z-30`. Never give the rail or footer their own vertical border.
- **Footer**: inside the content column with `lg:mr-60 xl:mr-72` so it ends at the rail. The wrapper owns the only top border.

### 6.4 Effective content width

Because the sidebar and rail are fixed, the usable column is narrower than the viewport:

| Viewport | Sidebar | Rail | Main padding | Content width |
|---|---|---|---|---|
| 375 | 0 | 0 | 32 | 343px |
| 768 (md) | 256 | 0 | 48 | 464px |
| 1024 (lg) | 256 | 240 | 48 | **480px** |
| 1280 (xl) | 256 | 288 | 48 | 688px |
| 1440 | 256 | 288 | 48 | 848px |
| 1920 | 256 | 288 | 48 | 1,328px |

Design implication: viewport breakpoints over-predict available width between 1024 and 1279px. A `lg:grid-cols-3` tool-card grid at 1024px yields about 149px cards. For new grids, prefer container queries (`@container` on the section, `@xl:grid-cols-3`) or start three columns at `xl`. Two-pane tool layouts should split at `xl` (`xl:grid-cols-2`) unless each pane is compact.

### 6.5 Breakpoints

Tailwind defaults: `sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536 (unused). Mobile first. Sidebar appears at `md`, rail at `lg`, rail widens and article sidebars (ToC) appear at `xl`. Navbar text links appear at `sm`; locale endonym label at `lg`.

### 6.6 Standard grids

| Context | Classes |
|---|---|
| Tool cards (home, popular) | `Grid cols={3} gap="md"` |
| Features (4 items) | `grid grid-cols-1 md:grid-cols-2 gap-6` |
| Use cases (6 items) | `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4` |
| Related tools | `grid grid-cols-1 sm:grid-cols-2 gap-4` |
| Name-only link lists (hubs) | `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1.5 text-sm` |
| Stat tiles | `grid grid-cols-2 sm:grid-cols-4 gap-3` |
| Options panel | `grid grid-cols-1 md:grid-cols-3 gap-4` |
| Blog cards | `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4` (index uses `gap-5`) |
| Chips | `flex flex-wrap gap-2` |

### 6.7 Z-index

From `src/config/theme.ts` plus the shell: footer 10, rail 20, sidebar and rail divider 30, navbar 40, modal backdrop 45, modal 50, popover 60, tooltip 70, toast 80, max 100. Reading-progress bars currently use `z-[200]` and `z-[9999]`; new work should use `max` (100).

---

## 7. Shape: Square Corners

Every radius is 0. `globals.css` sets `--radius: 0` and `--radius-sm` through `--radius-6xl` to 0 inside `@theme inline`, and overrides `.rounded-full { border-radius: 0 }`. As a result `rounded-sm`, `-md`, `-lg`, `-xl`, `-2xl` and `-full` all render square. This is deliberate and is the brand's most distinctive trait; it matches the sharp-cornered OG art.

Rules:
- **New code should not write radius classes at all.** Existing `rounded-*` classes are inert and may be removed when a file is touched.
- Three things still leak a radius and must not be used: bare `rounded` (renders 4px, about 5,700 usages), `rounded-xs` (2px), and side pills `rounded-l-full` / `rounded-r-full` / `rounded-t-full` (render as full pills). Inline `borderRadius` in JSX is also banned for UI chrome.
- Circular affordances are square: avatars, step markers, status dots, switch thumbs, slider thumbs, spinners, remove badges. Design them to read well as squares (a square avatar with initials, a square step number, a square dot).
- The only rounded element in the interface is the native scrollbar thumb (4px).
- Tool **output** may contain radius when radius is the subject (a "rounded corners" image tool, a CSS `border-radius` generator preview). That is content, not chrome.

---

## 8. Borders, Elevation and Overlays

### 8.1 Border hierarchy

| Weight | Class | Use |
|---|---|---|
| 1px Hairline | `border` (= `border-border`) | Cards, panels, controls, dividers inside components, `divide-y` lists |
| 1px Separator | `border-separator` | Shell chrome rules, sidebar tree guides, link chips |
| 1px Input | `border-input` | Text inputs, selects, checkboxes |
| 2px | `border-2` | ToolCard (directory card), dropzone (dashed), result hero |
| 2px left accent | `border-l-2 border-primary-500` | Active ToC item |
| 4px left accent | `border-l-4 border-primary-300 dark:border-primary-500` | Blockquote |
| Dashed | `border-2 border-dashed` | Dropzones only |

Inner structure uses `divide-y` (FAQ lists, result tables) rather than stacked borders. Never draw two adjacent borders (the shell comments document past double-line bugs).

### 8.2 Elevation levels

Depth comes from borders first. Shadows are light and always paired with a border.

| Level | Recipe | Use |
|---|---|---|
| 0 Flat | border only | Panels inside cards, chips, list rows, sidebar, navbar |
| 1 Whisper | `shadow-sm` (shadcn Card default) or `shadow-xs` (outline buttons, inputs) | Every `Card`: editorial sections, workbench, tool cards |
| 2 Floating | `shadow-lg` | Menus and dropdowns (LocaleSwitcher), sheets |
| 3 Modal | `shadow-2xl`, or the search recipe `0 0 0 1px rgba(0,0,0,.04), 0 24px 48px -12px rgba(0,0,0,.3)` (dark: white ring at 4%, black at 60%) | Dialogs |

Rules:
- Hover never adds a shadow on directory grids (non-composited repaint). Elsewhere, a hover may go at most one level up (`hover:shadow-md` on blog cards).
- No coloured shadows except the subtle `shadow-primary-500/10` on the selected search row icon.
- `drop-shadow` is allowed only on text placed over user colours (swatch labels).

### 8.3 Overlays and blur

- Modal backdrop: `bg-black/40 dark:bg-black/60` with `backdrop-blur-md` (search) or `bg-black/50 backdrop-blur-sm` (form modals, sheets).
- Backdrop blur on in-flow content is not allowed. The only non-overlay blur is the sticky navbar (`bg-background/95 backdrop-blur-sm`).

### 8.4 Gradients

Gradients are **single-hue brand tints**, low contrast, used to mark chrome or a featured surface. Allowed instances:
- Sidebar logo strip: `bg-gradient-to-r from-primary-50 to-transparent` (dark `from-primary-900/30`).
- Sidebar tool-count strip: `from-primary-50 to-primary-100` (dark `from-primary-900/30 to-primary-800/20`).
- Search dialog top accent bar: 2px `from-primary-500/80 via-primary-400/60 to-primary-500/80`.
- Reading progress: 3px `from-primary-400 to-primary-600`.
- Featured surfaces: blog featured hero, series banner, 404 hero, sidebar "Free tools" widget (`bg-gradient-to-br from-primary-50/60`).

No multi-hue gradients, no gradient text, no gradient buttons in the product UI.

---

## 9. Iconography

### 9.1 Library

**Tabler Icons only** (`@tabler/icons-react`, default 2px stroke, outline style). Lucide is installed but deprecated; 46 files still import it (Appendix A). Filled Tabler variants (`IconHeartFilled`) are allowed for single emphasis marks. Do not draw inline SVG icons except third-party brand marks and the "Ask AI" logos in the footer.

### 9.2 Sizes

| Size | Class | Use |
|---|---|---|
| 12px | `h-3 w-3` | Arrows in compact links, search group icons |
| 14px | `h-3.5 w-3.5` | Meta icons (date, read time), share buttons |
| 16px | `h-4 w-4` | Default in buttons, nav links, inputs, breadcrumbs separators, option headings |
| 20px | `h-5 w-5` | Sidebar categories, card-title icons, feature and tool-card chips, FAQ chevrons |
| 24px | `h-6 w-6` | Dropzone upload icon |
| 48px | `h-12 w-12` | Empty and loading states (at `opacity-30`) |

shadcn `Button` auto-sizes child SVGs to 16px (`[&_svg]:size-4`).

### 9.3 Icon containers

- **Icon chip** (ToolCardIcon, FeatureItem, CategoryIcon, InfoBlock icon mode): 40px square, `bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400`, icon 20px. On a hovered ToolCard a pre-painted `bg-primary-500` overlay fades in (opacity only) and the icon turns white.
- **Dropzone chip**: 48px square, same colours, icon 24px.
- **Search tiles**: 32px, `bg-muted/50 border border-border/60`; selected `bg-primary-100 border-primary-200`.
- Icon-only buttons are 36px (`size-9`) with a 16-20px glyph and an `aria-label`.

### 9.4 Registry and category icons

Tool and category icons are strings resolved by `getIcon()` in `src/config/icons.ts` (fallback `IconSettings`). Every icon name used in a category config must be registered there, or the static export fails.

| Category | Icon | Category | Icon |
|---|---|---|---|
| ai | IconSparkles | image | IconPhoto |
| audio-video | IconMusic | math | IconMathFunction |
| calendar | IconCalendar | network | IconWorldWww |
| compress | IconVideo | obfuscator | IconShieldLock |
| crypto | IconShieldLock | payment | IconMoneybag |
| data | IconFileCode | pdf | IconFileTypePdf |
| deobfuscator | IconEye | productivity | IconBolt |
| design | IconPalette | science | IconAtom |
| file | IconFileCode | text | IconAlignLeft |
| tip-calculators | IconCash | web | IconWorldCog |

Duplicates to resolve when convenient: data/file share IconFileCode, crypto/obfuscator share IconShieldLock, compress uses IconVideo (IconFileZip would be clearer).

### 9.5 Glyph rules

- Use `IconArrowRight` for "go" affordances, `IconChevronRight` for hierarchy (breadcrumbs, tree, list rows), `IconChevronDown/Up` for disclosure.
- Use `IconBrandX`, not `IconBrandTwitter`.
- No emoji in UI (the blog empty state's emoji is a deviation). Unicode check and cross marks are allowed only inside comparison table cells, and must be coloured with the status text recipe.

---

## 10. Motion

| Token | Value | Use |
|---|---|---|
| instant | 100ms | Search row selection |
| fast | 150ms | Dialog exit, ToC item, small hovers |
| base | 200ms | **Default**: colour transitions, card lift, accordions, dialog enter |
| slow | 300ms | Sheet close, result fade-in, progress fill |
| drawer-open | 500ms | Sheet open |
| marquee | 48s linear infinite | Footer badge marquee |

Patterns:
- **Colour hover**: `transition-colors duration-200`. Do not use `transition-all` (it animates layout properties and shadows).
- **Directory card hover**: `transition-transform duration-200 will-change-transform hover:-translate-y-1`. Transform and opacity only, because these grids are large and colour or shadow transitions are non-composited.
- **Small tile lift**: `hover:-translate-y-0.5`, back to 0 on `active`.
- **Arrow nudge**: `group-hover:translate-x-0.5` (or `translate-x-1` on 20px arrows).
- **Press**: `active:scale-[0.98]` on primary actions.
- **Enter/exit**: `tw-animate-css` `animate-in fade-in zoom-in-95` for dialogs, `slide-in-from-bottom-4` for form modals, `fade-in duration-300` for new results.
- **Loading**: `animate-spin` on `IconRefresh` or `IconLoader2`; `animate-pulse` on skeleton blocks and empty-state icons.
- **Reduced motion (normative)**: every non-essential animation must stop under `prefers-reduced-motion` (`motion-reduce:animate-none`, `motion-reduce:transition-none`, `motion-reduce:hover:translate-y-0`). The marquee already does this; card lifts and dialog zooms must follow.

---

## 11. Component Specifications

Shared components live in `src/components/ui` (shadcn new-york, several rewritten as native elements), `src/components/common` (Aback building blocks, import from the `@/components/common` barrel) and `src/components/layout` (shell). Always reuse these before writing markup.

### 11.1 Buttons (`ui/button.tsx`)

Base: `inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50`, child SVGs 16px.

| Variant | Classes | When |
|---|---|---|
| `default` (Primary / Ink) | `bg-primary text-primary-foreground hover:bg-primary/90` | **The** main action of a tool ("Convert", "Calculate", "Generate"). One per workbench |
| Brand (normative) | `bg-primary-700 text-white hover:bg-primary-800 dark:bg-primary-400 dark:text-primary-950 dark:hover:bg-primary-300` | Cross-sell and navigation CTAs outside the workbench (404, blog tool CTA, support partners) |
| `outline` | `border bg-background shadow-xs hover:bg-accent dark:bg-input/30 dark:border-input dark:hover:bg-input/50` | Secondary actions: Download, Upload, Reset, Copy in toolbars. Most used variant in tools |
| `secondary` | `bg-secondary text-secondary-foreground hover:bg-secondary/80` | Low-emphasis filled actions |
| `ghost` | `hover:bg-accent dark:hover:bg-accent/50` | Icon buttons in chrome, inline copy, close |
| `destructive` | `bg-destructive text-white hover:bg-destructive/90 dark:bg-destructive/60` | Clear all, remove all |
| `link` | `text-primary underline-offset-4 hover:underline` | Renders ink. For blue text links use an anchor with the link recipe |

| Size | Height | Padding | Notes |
|---|---|---|---|
| `xs` | 24 | `px-2`, `text-xs` | Inline row actions |
| `sm` | 32 | `px-3` | Toolbar actions above editors (Copy, Download) |
| `default` | 36 | `px-4` (`px-3` with icon) | Standard |
| `lg` | 40 | `px-6` | Prominent single actions |
| `icon` / `icon-sm` / `icon-lg` / `icon-xs` | 36 / 32 / 40 / 24 square | | Must have `aria-label` |

Shared wrappers:
- **ActionButton** (`common/ActionButton`): `Button` plus `loading` (swaps the icon for `IconRefresh h-4 w-4 animate-spin`, shows `loadingLabel` such as "Converting...", disables the button). Use it for every primary tool action.
- **CopyButton**: ghost, `sm`; `IconCopy` swaps to `IconCheck` with "Copied" for 2s; labels from i18n `common.copy/copied`; disabled when empty.
- **DownloadButton**: outline, `sm`, `IconDownload`, builds a Blob; disabled when empty.

Rules: one primary (ink) button per workbench; action rows are `flex flex-wrap gap-2` (or `gap-3`, centred for single CTAs with `min-w-[220px]`); never hand-roll `<button>` styling for actions (1,558 tool files do today); never use gradient buttons.

### 11.2 Form controls

| Control | Spec |
|---|---|
| Text input (`ui/input`) | `h-9 w-full border border-input bg-transparent px-3 py-1 text-base md:text-sm shadow-xs dark:bg-input/30 placeholder:text-muted-foreground`; invalid `aria-invalid:border-destructive aria-invalid:ring-destructive/20` |
| Label (`ui/label`) | `text-sm font-medium leading-none`, peer-disabled opacity 70% |
| LabeledInput | `flex flex-col gap-1.5`: Label, Input, helper `text-xs text-muted-foreground`; required star `text-destructive` after the label |
| Select (`ui/select`, LabeledSelect) | Native `<select>`, `appearance-none border border-input bg-background pl-3 pr-8 text-sm`, chevron at right 8px. **Standard height 36px** (currently `h-10`) |
| Number input | Use `ui/input type="number"` with `tabular-nums`; LabeledNumberInput's raw `h-10` input is deprecated |
| Code editor (TextInputBox) | Label row `flex items-center justify-between` (label `text-sm font-medium`, optional Upload outline `sm`), textarea `h-80 w-full resize-none border bg-background p-3 font-mono text-sm`; error `border-destructive` |
| Code output (TextOutputBox) | Same frame, `readOnly`, `bg-muted/50`, toolbar with CopyButton and DownloadButton |
| Textarea (TextAreaInput, `ui/textarea`) | `border border-input p-3 text-sm resize-y`, `font-mono` for data input, `min-h` from rows |
| Checkbox (`ui/checkbox`) | Native 16px square, `accent-primary-600`, `border-input` |
| CheckboxGroup | Group label `text-sm font-semibold`, grid `gap-2` (1/2/3 cols), row `flex items-center gap-2 p-2 text-sm hover:bg-muted/50` |
| Switch (`ui/switch`) | `role="switch"`, track 36x20 `bg-input`, checked `bg-primary`, square 16px thumb |
| Slider (`ui/slider`) | Track 8px `bg-secondary`, fill `bg-primary`, 16px square thumb with `border-2 border-background`. Must receive a real `aria-label` |
| Example / preset chips | Outline `xs` buttons or `link-chip` recipe with `font-mono text-xs`; never hand-rolled pills |

All controls: 36px height (normative alignment), `text-sm`, placeholder in `text-muted-foreground`, disabled `opacity-50 cursor-not-allowed`, focus per 14.3. Labels are always visible; placeholders are examples, not labels.

### 11.3 Shell and navigation

**Navbar** (`layout/Navbar.tsx`): `sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-separator bg-background/95 backdrop-blur-sm px-4 md:px-6`. Left to right: mobile menu ghost icon button (`md:hidden`), mobile logo mark, flexible title area (optional tool name `text-lg font-semibold`), text nav (`hidden sm:flex gap-1`: Feedback button, Support Us, Blog, Guides), a `h-5 w-px bg-border` divider, LocaleSwitcher, ThemeToggle.
- Nav link: `flex items-center gap-1.5 px-3 py-2 text-sm font-medium`, 16px icon; idle `text-muted-foreground hover:bg-muted hover:text-foreground`; active `bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300`.

**ThemeToggle**: ghost icon button 36px, `IconMoon` in light, `IconSun` in dark, `hover:bg-muted`, localized `aria-label`.

**LocaleSwitcher**: trigger `h-9 px-2.5 gap-1.5 text-sm font-medium text-muted-foreground hover:bg-muted` with `IconWorld` and the endonym (`hidden lg:inline`). Menu `absolute right-0 top-full mt-2 w-52 z-50 border bg-card shadow-lg`; items `px-3.5 py-2.5 text-sm`; current item uses the active wash plus `IconCheck`. Closes on Escape and outside click; add arrow-key navigation for menus.

**Sidebar** (`layout/Sidebar.tsx`):
- Logo strip: `h-16 border-b border-separator px-4` with the brand gradient wash.
- Search trigger strip: `px-3 py-3 border-b border-separator`.
- Category tree in a Radix ScrollArea with an always-visible thumb and a mask fade (32px top, 56px bottom); content `px-3 pt-8 pb-6 pr-4 space-y-1`.
- Category row: `text-sm font-medium hover:bg-muted`, link `px-3 py-2 gap-3` with a 20px icon, separate 36px chevron toggle. Active (contains the current tool): active wash colours.
- Subcategory group: `ml-2 border-l border-separator pl-2 space-y-1`; row `text-sm px-2 py-2 gap-2`, 16px icon, 32px chevron button with 12px glyph.
- Tool row: `px-2 py-2 gap-2 text-sm text-muted-foreground hover:bg-muted`, 16px icon, `truncate` with `title`; active `bg-primary-100 text-primary-700 font-medium dark:bg-primary-900/50 dark:text-primary-400`.
- Loading a category: chevron replaced by a 16px `animate-pulse bg-muted-foreground/20` block; "Loading" row `text-xs italic`.
- Tool-count strip (fixed, not scrolled): brand gradient, `IconTools` 16px primary-600 and `text-sm font-bold text-primary-700` "{count} Free Tools", followed by the 88px ad reservation.
- SEO: collapsed categories still render their subcategory links with `hidden`, so all hub links exist in the HTML.
- Mobile: same content in a left `Sheet` (`w-72 p-0`), ghost close button top right, link clicks close the drawer.

**Breadcrumbs** (`common/Breadcrumbs.tsx`, canonical; `BreadcrumbNav` and `BreadcrumbsNav` are aliases): `nav` > `ol.flex flex-wrap items-center gap-1 text-sm`; separators `IconChevronRight mx-1 h-4 w-4 text-muted-foreground`; links `text-muted-foreground hover:text-foreground`; current `text-foreground font-medium aria-current="page"`. Placed **directly below the H1**. Always paired with `BreadcrumbSchema`.

**Skip link**: first focusable element, `sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-background focus:px-4 focus:py-2 focus:border focus:shadow-lg focus:text-sm focus:font-medium`, target `#main-content`.

### 11.4 Search

**Search trigger** (`common/SearchBar.tsx`, sidebar): full-width button `h-10 border border-border/70 bg-muted/30 px-3.5 text-[13px] font-medium`, hover `bg-muted/60 border-border`, `IconSearch` 16px, `kbd` "⌘K" (`hidden sm:flex`). Opens the dialog via a window `open-search` event. It must open on click and Enter, not on focus; show "Ctrl K" on non-Apple platforms.

**Search dialog** (`common/SearchDialog.tsx`, Radix Dialog, mounted lazily on idle by `LazySearchDialog`, or immediately on ⌘/Ctrl+K):
- Overlay per 8.3. Panel `fixed left-1/2 top-[40%] md:top-1/2 w-[96vw] max-w-[660px] border border-border/80 bg-background` with Level 3 search shadow, `zoom-in-95` 200ms in, 150ms out.
- 2px brand gradient bar at the top.
- Input row `h-14 px-4 gap-3 border-b`: 32px brand icon tile, input `text-sm md:text-[15px] font-medium`, result-count chip, clear button, `ESC` close chip.
- Results `max-h-[420px] overflow-y-auto`, grouped Tools (max 5, `IconBolt`), Guides (3, `IconBook` emerald), Blog (3, `IconPencil` violet), group headers in `micro-caps`, groups divided by `border-t border-border/40`.
- Row `relative flex items-center gap-3 px-4 py-2.5`: 32px icon tile, title `text-sm font-semibold truncate`, description `text-xs text-muted-foreground truncate`, subcategory chip (`md:` only), type badge (3.5), chevron. Selected: `bg-primary-50/80 dark:bg-primary-950/30`, 2x24px `bg-primary-500` left bar, title `text-primary-700`, chevron visible and nudged.
- Query matches: `<mark>` `bg-primary-200/70 text-primary-800 dark:bg-primary-500/25 dark:text-primary-200 font-semibold`.
- Empty query: "Quick navigation" with three tiles (All Tools / Guides / Blog in their type accents) and a hint line with the tool count.
- No results: centred 56px muted icon tile, message, hint, "Browse all tools" outline button.
- Footer `border-t px-4 py-2.5 bg-muted/10` with `kbd` hints (↑ ↓ navigate, ↵ open, esc close).
- Keyboard: ⌘/Ctrl+K toggles, arrows move, Enter opens, Escape closes. Rows should be `role="option"` inside a `role="listbox"` with `aria-activedescendant` on the input.

**kbd**: `inline-flex h-5 min-w-5 items-center justify-center border border-border/60 bg-background px-1 text-[10px] font-semibold text-muted-foreground` with the `kbd` shadow token.

### 11.5 Directory components

**ToolCard** (`tools/ToolCard.tsx`): whole card is the link. `Card` + `h-full border-2 bg-card cursor-pointer group transition-transform duration-200 will-change-transform hover:-translate-y-1`; `CardHeader px-6 py-2`; row `flex items-center gap-4`: ToolCardIcon, then title `text-base font-semibold group-hover:text-primary-700 dark:group-hover:text-primary-400` and description `text-sm text-muted-foreground line-clamp-2`. No badges, no border or shadow change on hover. Needs `focus-visible` ring (14.3).

**CategoryHeader**: `flex items-center gap-3`, CategoryIcon (40px chip) and `SectionHeader` (H2 `text-xl font-semibold`, description `text-sm text-muted-foreground`, e.g. "48 tools in 6 subcategories"). Linked headers use `hover:opacity-80`. On a hub page do not link the header to the page itself and do not repeat the H1 text.

**"View all" link**: `inline-flex items-center gap-1 text-sm font-medium` link recipe plus `IconArrowRight h-4 w-4`, copy "View all {count} {category} tools".

**CompactToolLinks** (name-only lists on hubs, kept lightweight for page weight): `ul` grid per 6.6 or `flex flex-wrap` (inline), links `text-primary-700 dark:text-primary-400 hover:underline`.

**Link chip** (facets, A-Z letters, "Browse related groups"): `inline-flex items-baseline gap-1 border border-separator px-3 py-1.5 text-sm font-medium hover:border-primary-400 hover:text-primary-700 dark:hover:text-primary-400`, count `text-xs font-normal text-muted-foreground`. This one recipe replaces the three chip variants found in the audit.

**Filter pill** (blog categories, stateful filters): `px-3.5 py-1.5 text-xs font-medium border bg-background text-muted-foreground hover:bg-muted`; active uses the brand fill recipe and `aria-pressed="true"`.

**Tag**: `bg-muted px-2 py-0.5 text-xs text-muted-foreground truncate max-w-[7rem]`; brand tag `bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200`.

**Badge** (`ui/badge`): `inline-flex items-center border px-2.5 py-0.5 text-xs font-semibold`, variants default (ink), secondary, destructive, outline. Badges are labels, not buttons; no hover styles on non-interactive badges.

**Pagination** (blog index only): buttons `h-8 min-w-8 px-2 text-sm font-medium`, current = brand fill, disabled `opacity-40`, ellipsis "…". Listings otherwise avoid pagination; the catalogue is sliced by category, subcategory, facet and A-Z instead.

### 11.6 Tool workbench

The interactive area of a tool page (`UploadSection`, `ToolSection` or `GeneratorSection`).

**Workbench card** (canonical):
```tsx
<Card>
  <CardHeader>
    <CardTitle className="text-lg flex items-center gap-2">
      <IconPhoto className="h-5 w-5 text-primary-600 dark:text-primary-400" />
      Resize Image
    </CardTitle>
    <CardDescription>Short instruction in one sentence.</CardDescription>
  </CardHeader>
  <CardContent>
    <Stack gap="lg">{/* input, options, actions, results */}</Stack>
  </CardContent>
</Card>
```
- Card: `bg-card border shadow-sm py-6 gap-6`, header and content `px-6`. Optional header band: `CardHeader className="border-b bg-muted/10"` with `CardContent className="pt-6"`.
- Do not use the glass variant (`bg-card/50 backdrop-blur-sm`) or `shadow-lg` on workbench cards.
- Multi-pane tools may use `ToolWorkbench` (`common/ToolWorkbench.tsx`): `border bg-card shadow-sm overflow-hidden` with stacked panes (`p-6 border-b`, middle pane `bg-muted/30`).

**Input**
- **DropZone / MultiDropZone**: `border-2 border-dashed border-muted-foreground/25 p-8 text-center cursor-pointer transition-colors hover:border-primary-300 hover:bg-muted/50 dark:hover:border-primary-600`; drag-over `border-primary-500 bg-primary-50 dark:bg-primary-900/30`. Content `flex flex-col items-center gap-3`: 48px brand chip with `IconUpload`, "Drop your file here" `font-medium`, "or click to browse" `text-sm text-muted-foreground`, accepted formats `text-xs text-muted-foreground`. Must be keyboard operable (focusable, Enter/Space opens the picker, visible focus ring) and localized.
- **Two-pane text tools**: `grid grid-cols-1 xl:grid-cols-2 gap-6` of TextInputBox and TextOutputBox.
- **File row** (FileInfo): `flex items-center justify-between p-3 border bg-muted/30`; name `font-medium truncate`, size `text-sm text-muted-foreground tabular-nums`, ghost 32px remove button with "Remove file" label.
- **Image preview**: `max-h-64 border object-contain bg-muted/30`; thumbnails 80px `object-cover border`; remove control always visible (not hover-only) on touch.

**Options**
- Options panel: `border bg-muted/20 p-4 space-y-4`, or a grid `grid grid-cols-1 md:grid-cols-3 gap-4 border bg-muted/10 p-4`.
- Option heading: `text-sm font-semibold text-muted-foreground flex items-center gap-1.5` with a 16px icon, or the `eyebrow` style for dense panels.
- Nested sub-panel: `border bg-card p-3`.
- Info note: `bg-muted/40 p-3 text-sm text-muted-foreground`; inline code `bg-background px-1 font-mono text-xs`.

**Actions**: an action row under the options (11.1). Primary ActionButton first.

**Results**
- Result block: `border p-4 space-y-3`, revealed with `animate-in fade-in duration-300`.
- **Result hero** (one headline number): `border-2 border-primary-200 bg-primary-50/50 p-6 text-center dark:border-primary-800 dark:bg-primary-950/30`; eyebrow `text-xs font-semibold uppercase tracking-widest text-primary-700 dark:text-primary-300`; value `numeric-display`; unit `text-base font-normal text-muted-foreground`.
- **Stat tiles**: grid per 6.6, tile `border bg-card p-3`, optional 36px `bg-primary-100` icon chip, label `text-xs text-muted-foreground`, value `text-sm font-semibold tabular-nums`.
- **Mono output list**: `max-h-[420px] overflow-y-auto border bg-muted/20 p-4 font-mono text-xs leading-relaxed`; per-row copy on hover plus always on focus.
- **Key/value rows**: `divide-y`, row `flex px-3 py-2.5 hover:bg-muted/30`, key `font-mono text-xs text-muted-foreground min-w-[70px]`.
- **Savings and deltas**: smaller output `text-green-700 dark:text-green-400`, larger output `text-amber-700 dark:text-amber-400`, always with a sign and percentage.
- **Batch progress** (BatchProgress): header `px-4 py-3 border-b bg-muted/20`; bar `h-2 bg-muted` with `bg-primary-500` fill (300ms width transition); per-file status icons (spinner primary, check green, x red, clock muted).

**Messages**
- ErrorMessage, SuccessMessage, warning and info use the status container recipes (3.4) with `p-3 text-sm`, a leading 16px icon, `role="alert"` for errors and `role="status"` for success. Place them directly under the control that caused them or above the result.

**Empty and loading states**
- Empty: `flex flex-col items-center justify-center border bg-muted/10 p-12 text-center text-sm text-muted-foreground`, 48px icon at `opacity-30`. Say what will appear and how to start.
- Loading: the same frame with the icon `animate-pulse`, or skeleton blocks `bg-muted animate-pulse` sized like the final content. Never collapse the area while loading.

### 11.7 Editorial sections (tool pages)

One `Card` per section, H2 in `CardTitle className="text-lg"`, no subtitle under the H2, never nested cards. Enforced by `scripts/audit-tool-ui.mjs`.

| Section | Content rule | Layout | Item spec |
|---|---|---|---|
| FeaturesSection "Why Use Our [Tool]?" | exactly 4 FeatureItems | `grid grid-cols-1 md:grid-cols-2 gap-6` | `flex gap-3`: 40px brand chip with 20px icon, H3 `font-medium text-foreground`, `text-sm text-muted-foreground` |
| UseCasesSection "Common Use Cases for [Tool]" / "When to Convert A to B" | exactly 6 UseCaseItems | `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4` | `p-4 border bg-card hover:bg-muted/50 transition-colors`; header `flex items-center gap-3 mb-2` with brand icon, H3, description |
| AboutSection "Understanding [Subject]" | exactly 4 InfoBlocks; last is "Privacy, Security & Availability" | `Stack gap="md"` | H3 `font-medium mb-2`, body `text-sm text-muted-foreground`; steps `ol.space-y-3` with run-in labels `font-semibold text-foreground` |
| RelatedToolsSection "Related Tools" | up to 8, same category | `grid grid-cols-1 sm:grid-cols-2 gap-4` | item `group block p-4 border bg-card transition-colors hover:border-primary-300 hover:bg-muted/50 dark:hover:border-primary-700`; title `font-medium truncate group-hover:text-primary-700`; description `mt-1 text-sm text-muted-foreground line-clamp-2`; arrow 20px nudging right |
| FAQSection "Frequently Asked Questions" | at least 7, mirrored in `FAQSchema` | `div.divide-y` | FAQItem accordion: button `w-full flex items-center justify-between py-4 text-left font-medium hover:text-primary-700 dark:hover:text-primary-400`, chevron 20px muted; answer `text-sm text-muted-foreground pb-4`, paragraphs split on blank lines; first item open |

Accordion behaviour: closed answers stay in the DOM (SEO), expose `aria-expanded` and `aria-controls`, and must not clip long answers (avoid fixed `max-h-96`; use a grid-rows or `<details>` transition).

### 11.8 Long-form content (blog, guides, legal)

**Article layout** (BlogPostLayout, GuidePostLayout): `Stack gap="lg"`: PageHeader, Breadcrumbs, optional series banner, author/meta bar, then `flex gap-10 items-start` with the article (`min-w-0 flex-1`, body `space-y-8`, capped at 72ch) and an `xl`-only sticky aside (`w-[260px] sticky top-[68px] self-start space-y-5`, add `max-h-[calc(100vh-84px)] overflow-y-auto`). Use one aside width (260px) for blog and guides.

| Element | Spec |
|---|---|
| Lead | `text-base text-muted-foreground leading-relaxed` |
| H2 (BlogSection) | `text-2xl font-bold tracking-tight`, section `space-y-3 scroll-mt-24`, body `space-y-4` |
| H3 | `text-lg font-semibold scroll-mt-24 pt-2` |
| Paragraph | `text-sm text-muted-foreground leading-relaxed`; bold `font-semibold text-foreground` |
| Link | link recipe; external links open in a new tab with `rel="noopener noreferrer"` |
| Lists | `ml-6 space-y-1.5 text-sm text-muted-foreground leading-relaxed list-disc|list-decimal marker:text-muted-foreground/60` |
| Callout | `border p-4 space-y-1`, label `text-xs font-semibold uppercase tracking-wide`; info (brand), tip (emerald), warning (amber) |
| Blockquote | `border-l-4 border-primary-300 dark:border-primary-500 pl-4 py-1 italic text-muted-foreground` |
| Figure | `w-full border bg-muted`, caption `text-xs text-center text-muted-foreground`, real alt text |
| Key takeaways | `border bg-muted/30 p-5 space-y-3 dark:border-primary-900/50 dark:bg-primary-950/20`, markers `primary-500` |
| Step | 32px square marker `bg-primary-600 text-white text-xs font-bold` (dark `primary-500`), 1px connector `bg-primary-200 dark:bg-primary-800`, H4 `text-base font-semibold` |
| Stat box | `grid gap-px border overflow-hidden`, cells `p-5 bg-muted/30 text-center`, value `text-3xl font-extrabold tracking-tight text-primary-700 dark:text-primary-400` |
| Code block | `figure border overflow-hidden`; bar `bg-zinc-100 dark:bg-zinc-800 border-b px-4 py-2` with filename (`font-mono text-xs`) and language (`text-xs font-semibold uppercase tracking-wider`) and a copy button; `pre bg-zinc-50 dark:bg-zinc-900 p-4 text-sm leading-relaxed overflow-x-auto`. Decorative traffic-light dots are optional |
| Comparison table | wrapper `overflow-x-auto border`; `thead` `bg-muted/60 dark:bg-muted/30`, `th px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground`; rows zebra `bg-muted/20` on odd, hover `bg-muted/30`; first column `font-medium text-foreground`; ✓ `text-green-700 dark:text-green-400`, ✗ `text-red-700 dark:text-red-400` |
| Divider | `hr border-t border-border` |
| Inline code | `bg-muted px-1 font-mono text-[0.9em]` (add; not yet supported in prose) |

**Sidebar widget**: `border bg-muted/20 dark:bg-muted/10 p-4 space-y-3`, title in `overline`. Variants: Table of contents, Article info (rows `flex justify-between text-sm`, label muted with 14px icon, value `font-medium`), "Free tools" (brand gradient wash, tool rows `border border-primary-100/60 bg-background p-2.5 text-xs`), Share, Related guides.

**Table of contents**: header `pb-2 border-b` with `IconList` 16px primary-500 and "On this page"; items `w-full text-left px-3 py-1.5 text-xs leading-snug`; active `bg-primary-50 text-primary-700 font-semibold border-l-2 border-primary-500 pl-2.5` (dark `bg-primary-950/50 text-primary-300`); IntersectionObserver tracking, smooth scroll. Below `xl` a collapsible toggle `border bg-muted/40 px-4 py-3 text-sm font-semibold` sits above the article.

**Reading progress**: `fixed top-0 inset-x-0 h-[3px] pointer-events-none`, gradient `from-primary-400 to-primary-600`, transform `scaleX` (compositor only), `aria-hidden`. One implementation for blog and guides.

**Author and meta bar**: `flex flex-wrap items-center gap-3 p-4 border bg-muted/20`; 40px square avatar `bg-primary-600 text-white text-sm font-bold` with initials; name `text-sm font-semibold`; role `text-xs text-muted-foreground`; divider; category tag; meta items (date, read time, word count) `text-xs text-muted-foreground` with 14px icons.

**Content cards** (BlogPostCard, RelatedArticleCard, prev/next): `group flex flex-col gap-2 border bg-card p-5` (related `p-4`), hover `border-primary-300 shadow-md -translate-y-0.5 duration-200`; category tag, title `font-semibold leading-snug line-clamp-2 group-hover:text-primary-700`, excerpt `text-sm text-muted-foreground line-clamp-3`, CTA `text-xs font-medium` link recipe with arrow. Featured hero: `border border-primary-100 bg-gradient-to-br from-primary-50 via-primary-50/60 to-background px-6 pt-14 pb-7 sm:px-8`, square "Featured" badge in brand fill, H2 `text-2xl sm:text-3xl font-bold tracking-tight`.

**Tool CTA (in articles)**: `border border-primary-100 bg-background p-6 flex flex-col sm:flex-row gap-6`, 44px brand chip, H4 `text-base sm:text-lg font-bold tracking-tight`, brand-fill button. Never adjacent to an ad slot.

**Share controls**: one component everywhere. Pill row `inline-flex items-center gap-1.5 border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted` (X, LinkedIn, Copy link), or compact column rows `border px-3 py-2 text-xs`. Icons monochrome at rest, brand colour on hover; copied state swaps to `IconCheck` green for 2s; each control has an `aria-label`.

**Legal pages** (LegalPageLayout): PageHeader, Breadcrumbs, last-updated tag (`bg-muted/50 px-3 py-1 text-xs text-muted-foreground`), sections (`space-y-3`, H2 `text-xl font-semibold`, body `text-sm text-muted-foreground leading-relaxed`), contact box `border bg-card p-4`, links in the link recipe.

### 11.9 Overlays

| Overlay | Spec |
|---|---|
| Search dialog | 11.4 |
| Form modal (FeedbackModal) | Radix Dialog (focus trap, Escape, return focus). Backdrop `bg-black/50 backdrop-blur-sm`; panel `w-full max-w-md max-h-[90vh] border border-border/50 bg-card shadow-2xl flex flex-col`, `fade-in zoom-in-95 slide-in-from-bottom-4 duration-200`; header `px-5 py-3.5 border-b` with 36px icon tile, title `text-sm font-semibold`, subtitle `text-xs text-muted-foreground`, ghost close; body `p-5 space-y-4`; labels in `overline`; fields `border border-input bg-background px-3 py-2.5 text-sm`; choice chips `grid grid-cols-2 gap-1.5`, selected active wash; footer `border-t bg-muted/20 px-5 py-2.5 text-[10px]` with Esc hint; success view centred 64px green tile with `IconCheck` |
| Picker modal (ToolSelectorModal) | `pt-[10vh]` top-aligned, `max-w-lg` panel, search row, list `max-h-[50vh]`, selected row `bg-primary-50 text-primary-700` with `IconCheck` |
| Sheet (mobile nav) | Radix Sheet, overlay `bg-black/50`, left panel `w-72`, `shadow-lg`, 500ms open / 300ms close |
| Menu (LocaleSwitcher) | 11.3 |

There is no global toast system. Feedback for copy, subscribe and similar actions is an inline state swap (label and icon change for 2s, or an inline status box). `ui/use-toast` exists for a few obfuscator tools only; do not spread it without adding a single accessible Toaster.

### 11.10 Right rail

Bottom-pinned stack `space-y-4`, order fixed:
1. Ad zone (inert; Mediavine inserts beside it).
2. **ShareSlot**: `micro-caps` label, five 36px icon buttons `border border-border/60 bg-card text-muted-foreground` (X, LinkedIn, Facebook, WhatsApp, Copy link), brand hover colours.
3. **SupportSlot**: `border border-primary-200 bg-primary-50 px-3.5 py-2.5 text-xs font-semibold text-primary-700 hover:bg-primary-100` (dark `border-primary-800/50 bg-primary-950/30 text-primary-300`) with a rose `IconHeart` and an external-arrow icon.
4. **NewsletterSignup**: label, blurb `text-xs`, email input `pl-8 py-2 text-xs border` with `IconMail`, full-width ink button `text-xs`, inline success or error box (status recipes).

### 11.11 Footer

- Main grid `px-4 md:px-6 py-10`, `grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4`:
  - Brand: 24px mark + "Aback Tools" (`text-sm font-semibold tracking-tight`), tagline `max-w-[34ch] text-xs leading-relaxed text-muted-foreground`, "From the maker" line with an underlined link.
  - **Ask AI**: ChatGPT, Claude, Perplexity, Grok deep links with 16px monochrome marks (`rel="nofollow noopener noreferrer"`). The prompt is neutral and must never instruct a model to prefer Aback.
  - **For AI agents**: llms.txt, llms-full.txt, ai.txt, AI Docs, auth.md, sitemap.xml, robots.txt.
  - **Company**: About, Blog, Guides, Support Us, Contact.
- Column titles: `overline` (`mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground`); links `text-xs text-muted-foreground hover:text-foreground`, list `gap-2`.
- Legal bar: `bg-muted/40 px-4 md:px-6 py-3`, copyright left, Privacy, Terms, DMCA, a 12px divider and "Cookie settings" (reopens the Mediavine CMP) right; stacks centred on mobile.
- Badge marquee: homepage only, `badge-marquee-track` 48s linear, pause on hover, `motion-reduce:animate-none`, 6% edge mask fade, badges `h-3 opacity-50 hover:opacity-70`, text links `text-[10px] text-muted-foreground`.

### 11.12 Advertising surfaces

Journey by Mediavine owns all ad inventory and auto-inserts units. Design rules:
- Slot components (`AdSlotT1/T2/T3`, `AdSlotC`, `AdSlotH`, `AdSlotG`, `AdSlotB`, `AdSlotInFeed`, `AdSlotInArticle`, `AdSlotMultiplex`, `AdSlotRightRail`) currently render `null`. They remain in markup as **position anchors** in the order defined in Section 12. Never remove them from templates.
- Layouts must tolerate an ad block being injected between any two `Stack` children and beside the rail. Do not rely on adjacency for meaning (a caption must not depend on the block above it).
- Reserved space is explicit, never hidden padding: the sidebar footer reservation (`AdSlotSidebarFooter`) is `h-22` (88px), no border or background, with a centred "Advertisement" caption in `micro-caps` and `role="note"`.
- The right rail is transparent and bottom padded (`pb-40`) so fixed bottom ad bars do not cover its last card.
- Never style a content element to look like an ad or an ad to look like content.

---

## 12. Page Templates

All templates render inside MainLayout's `main` and start with JSON-LD (not visual). Every page has exactly one H1, then Breadcrumbs (except the homepage).

### 12.1 Homepage (`/`, `/{locale}`)
1. PageHeader: "Free Online Tools & Utilities" + one-sentence promise (fast, secure, browser-based, no signup).
2. `Stack gap="xl" className="mt-8"` (32px rhythm):
   - Most Popular Tools: SectionHeader + `Grid cols={3}` of ToolCards.
   - [AdSlotH]
   - Per category: CategoryHeader ("N tools in M subcategories"), 6 ToolCards, "View all" link. [AdSlotInFeed] after every 2nd category.
   - [AdSlotH], [AdSlotMultiplex]
3. Footer badge marquee (homepage only).

No hero, no carousel, no stats band. The category grid loads lazily behind a reserved-height placeholder (`contain-intrinsic-size`) to keep CLS at 0. Popular Tools should reflect real usage across categories (it is currently six image "to RAW" converters).

### 12.2 All tools (`/tools`)
PageHeader, Breadcrumbs, "Browse all tools A-Z" link, [AdSlotC], AllToolsGrid (per category: H2 `text-xl font-semibold` link + muted "(N tools)", inline subcategory links "Name (n)", 5 sample tool links), [AdSlotC], [AdSlotMultiplex]. Text-only on purpose: no cards, no icons, minimal bytes.

### 12.3 Category hub (`/tools/{category}`) and subcategory hub (`/tools/{category}/{sub}`)
`Stack gap="lg"`: PageHeader + Breadcrumbs, [AdSlotC], CategoryHeader, then per subcategory an H3 (`text-lg font-medium`, link + "N tools") with 8 CompactToolLinks (category) or all tools (subcategory), "Browse by topic" link chips on subcategories with facets, [AdSlotC], [AdSlotMultiplex]. Thin hubs are `noindex, follow`.

### 12.4 Facet page (`/tools/{category}/{sub}/{facet}`) and A-Z (`/tools/a-z`, `/tools/a-z/{letter}`)
Facet: PageHeader + Breadcrumbs, [AdSlotC], link list grid, "Browse related groups" link chips, [AdSlotC], [AdSlotMultiplex]. A-Z index: letter link chips (letter uppercase, count muted). Letter pages: link grid; add a letter strip and previous/next letter links.

### 12.5 Tool page (canonical anatomy)

```
JSON-LD: WebApplication + BreadcrumbSchema + FAQSchema
<Stack gap="lg">                         24px between every block, no wrappers
  PageHeader            H1 + description (states the local-processing promise)
  Breadcrumbs           Home > Tools > Category > Subcategory > Tool
  [AdSlotT1]
  Workbench             UploadSection | ToolSection | GeneratorSection (11.6)
  [AdSlotT2]
  FeaturesSection       4 items
  UseCasesSection       6 items
  AboutSection          4 InfoBlocks
  RelatedToolsSection   up to 8
  [AdSlotT3]
  FAQSection            7+ items
  [AdSlotMultiplex]
</Stack>
```

Hard rules (checked by `scripts/audit-tool-ui.mjs` and `docs/tools/tools-structure.md`):
- The only top-level wrapper is `<Stack gap="lg">`. No `<main>`, no `min-h-screen`, no `max-w-*`, no `px/py/space-y/my-*` wrappers around sections.
- All four ad anchors present in this order.
- Editorial sections use the Card pattern with their primitives (FeatureItem, UseCaseItem, InfoBlock, FAQItem), the required grids, and `divide-y` for FAQ.
- The H1 names the tool with its key phrase ("PNG to JPG Converter"); the workbench title is a short verb phrase.
- Legacy shells `ToolLayout` and `ToolPageLayout` (nested `<main>`, `max-w-7xl`) are deprecated. `ToolPageShell` documents the same anatomy with semantic landmarks and may be adopted, but is not in use.

Localized tool pages (`/{locale}/tools/...`, LocalizedToolPage) follow the same order with translated PageHeader, the tool wrapped in `ToolUiProvider` (string overlay via `useToolText`), registry-driven body Cards (`CardTitle text-lg font-bold`, content `space-y-3 text-sm text-muted-foreground leading-relaxed`), and FAQ.

### 12.6 Blog index (`/blog`)
PageHeader, Breadcrumbs, featured hero card, a toolbar row (category filter pills left, search input `sm:w-60` right), 3-column card grid (9 per page), pagination, empty state. Ads per the blog slot map.

### 12.7 Blog post and guide
Per 11.8. Slot order for posts: [AdSlotB] after the meta bar, [AdSlotInArticle] after the body, FAQ, share row, [AdSlotB] before related articles, related articles (3-column), prev/next, "Browse all articles" link, [AdSlotMultiplex]. Guides use [AdSlotG] in the same two positions. Comparison guides follow `docs/guides/FORMAT-COMPARISON-PAGES-SPEC.md`: Quick table (with TL;DR box), Key differences (winner rows `bg-primary-50 border-primary-200` with `IconCheck` and a "Winner" label), When to use A, When to use B, Technical, Conversion tools, FAQ, Related; each a Card with a `text-lg` H2.

### 12.8 Legal, About, Contact
LegalPageLayout (11.8). About and Contact reuse it; Contact may add a static FAQ (`font-medium` question, `mt-1` muted answer).

### 12.9 Support page
Hero card `border bg-card p-8 sm:p-10` with H1 `text-3xl sm:text-4xl font-bold tracking-tight`, intro `max-w-3xl leading-relaxed text-muted-foreground` and an affiliate disclosure `text-sm`, then Breadcrumbs, [AdSlotC], partner Cards (`p-6 sm:p-8 flex flex-col sm:flex-row gap-4`, H2 `text-lg font-semibold`, brand-fill CTA with `rel="sponsored"`), a "Why" Card (`sm:grid-cols-3 gap-8`), [AdSlotMultiplex].

### 12.10 404
`Container size="lg"` with `py-12 md:py-16`, a featured hero (`border border-primary-200 bg-gradient-to-br from-primary-50 via-background to-primary-100/60 p-6 md:p-10`), an "Error 404" chip, PageHeader "Page Not Found", actions (brand-fill "Go Home", outline "Explore Tools", ghost "Contact Support"), then "Popular Recovery Paths" as a 2-column grid of link cards. Must be localized.

---

## 13. Content, Voice and Microcopy

### 13.1 Voice
- Plain, specific, confident. Lead with the outcome: "Resize images to exact pixel dimensions."
- Always true to the product promise: free, no signup, no upload, runs in the browser.
- No hype or superlatives ("best-ever", "revolutionary"), no exclamation marks, no emoji in UI.
- **No em dashes or en dashes** anywhere (UI, docs, code comments). Use a hyphen with spaces, a colon or a comma.

### 13.2 Privacy statements (use these exact phrasings)
- "Runs locally in your browser."
- "Your files never leave your device."
- "100% client-side. No uploads, no signup."
Never claim server-side processing, never add upload-to-server flows to a tool without changing this copy and the About block.

### 13.3 Heading formulas on tool pages
| Section | File converter | Code or calculator tool |
|---|---|---|
| H2 1 | Why Use Our [Tool Name]? | Why Use Our [Tool Name]? |
| H2 2 | When to Convert [A] to [B] | Common Use Cases for [Tool Name] |
| H2 3 | Understanding How to Convert [A] to [B] | Understanding [Subject] |
| H2 4 | Related Tools | Related Tools |
| H2 5 | Frequently Asked Questions | Frequently Asked Questions About [Tool Name] |

### 13.4 Microcopy patterns
- Loading labels: present participle with an ellipsis character, one per action ("Converting…", "Calculating…", "Generating…", "Analyzing…"). Pick "…" (U+2026) consistently.
- Buttons: verb first, specific ("Convert to JPG", "Calculate Tip", "Copy", "Download", "Clear").
- Copy feedback: "Copy" becomes "Copied" for 2 seconds.
- Counts: always from `TOTAL_TOOL_COUNT` via `formatToolCount(locale)`; marketing rounding is "2,000+". Never hardcode a tool count.
- Empty states: say what will appear and the first step ("Upload an image to see the resized preview.").
- Errors: what happened plus how to fix it ("This file is not a valid PNG. Choose a .png file and try again.").

### 13.5 Localization
- Locales: English (root, no prefix), Spanish, French, Portuguese (`pt-BR`), German, Russian, Indonesian. All left-to-right; RTL is not supported, so new components should still prefer logical properties (`ms-`, `me-`, `ps-`, `pe-`) to stay RTL-ready.
- Every visible string in shared chrome must come from i18n (`useT`). Known hardcoded English is listed in Appendix A.
- Allow 30% text expansion (German, Russian): no fixed-width buttons with text, truncate with `title` in lists, wrap in toolbars.
- Dates use `Intl.DateTimeFormat` with the full locale; numbers use `Intl.NumberFormat`.
- "Ask AI" prompts stay in English by design.

---

## 14. Accessibility

Full WCAG validation requires manual testing with assistive technologies and expert review; the rules below are the design-level requirements.

### 14.1 Structure
- One H1 per page; heading levels never skip.
- Landmarks: `header` (navbar), `aside` (sidebar, rail), `main#main-content`, `footer`, `nav` for breadcrumbs and menus. A skip link is the first focusable element.
- Static export pages keep all SEO-relevant text in the DOM (closed FAQ answers, collapsed sidebar links) and hide it accessibly.

### 14.2 Contrast
| Pair | Light | Dark | Status |
|---|---|---|---|
| Ink on canvas | 19.8:1 | 18.1:1 | AAA |
| Mute on canvas | 4.7:1 | 7.6:1 | AA |
| Mute on `bg-muted` (solid) | 4.3:1 | 5.8:1 | Light fails AA: use tinted `bg-muted/20` to `/50` behind mute text, or ink text on solid muted |
| Link (700 / 400) | 7.0:1 | 8.8:1 | AAA |
| Action button label | 17.9:1 | 14.2:1 | AAA |
| Destructive text on canvas | 4.8:1 | AA | AA |

### 14.3 Focus (normative)
- Every interactive element shows a visible focus indicator with at least 3:1 contrast. Standard: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:focus-visible:ring-primary-400`.
- The shadcn default (`ring-[3px] ring-ring/50`) measures about 1.5:1 on white and should be migrated to the standard in `ui/button` and `ui/input`.
- Use `focus-visible`, not `focus`, so mouse clicks do not show rings.
- Cards that are links (ToolCard, related items, blog cards) carry the ring on the link element.

### 14.4 Interaction
- Minimum target 32px (36px standard) for controls; footer and inline text links get padding to reach 24px.
- Everything reachable and operable by keyboard: dropzones, chips, accordions, menus (arrow keys), dialogs (focus trap, Escape, focus return).
- Never open UI on focus alone (the search trigger currently does).
- No hover-only affordances: per-row copy and remove buttons also appear on focus and on touch devices.
- Icon-only buttons require `aria-label`; decorative icons are `aria-hidden`.
- Status and error messages use `role="status"` / `role="alert"`; progress uses `role="progressbar"` with values.
- Do not convey meaning by colour alone (status icons and words, ✓/✗ glyphs plus colour).
- Respect `prefers-reduced-motion` (Section 10).

---

## 15. Performance-Driven Design Rules

These come from real Lighthouse and CLS fixes and are binding:
1. **Reserve space for anything that loads late**: lazily loaded grids use `content-visibility:auto` with `contain-intrinsic-size`; the sidebar skeleton keeps its 256px width; the ad reservation has a fixed 88px height.
2. **Apply layout state before hydration** (sidebar margin is set on the first render).
3. **Compositor-only hover on repeated elements**: transforms and opacity only; colour floods use a pre-painted overlay that fades in (ToolCardIcon pattern).
4. **Heavy UI loads on intent or idle**: the search dialog and its index mount after `requestIdleCallback` or on ⌘K.
5. **Fonts are self-hosted** with a metric-matched fallback.
6. **Images**: logo source 128px for 2-3x DPR, favicons at 32 and 256px, `loading="lazy"` and explicit dimensions below the fold.
7. **Hub pages stay light**: name-only link lists instead of cards for large catalogues.
8. **No backdrop blur on scrolling content**, no large box-shadow animations, no `transition-all`.

---

## 16. Implementation Reference

| Concern | Location |
|---|---|
| Colour, radius and font tokens, scrollbars, sidebar mask, marquee | `src/app/globals.css` |
| Fonts, theme-color, root metadata | `src/app/layout.tsx` |
| Theme init script | `src/components/common/CriticalScriptInjector.tsx` |
| Theme toggle | `src/components/common/ThemeToggle.tsx` |
| Z-index scale | `src/config/theme.ts` |
| Icon registry | `src/config/icons.ts` |
| Layout primitives | `src/components/layout-primitives/index.tsx` |
| Shell | `src/components/layout/{MainLayout,Navbar,Sidebar,RightRail,Footer}.tsx` |
| shadcn primitives | `src/components/ui/*` |
| Aback building blocks | `src/components/common/*` (barrel `@/components/common`) |
| Tool page spec | `docs/tools/tools-structure.md`; audit `bun run audit:ui` |
| Blog and guide content rules | `docs/guides/BLOG-POST-CREATION-GUIDE.md`, `GUIDE-CREATION-MANUAL.md`, `FORMAT-COMPARISON-PAGES-SPEC.md` |
| OG art | `scripts/generate-og-image.py` |

Engineering rules: Tailwind utilities only (no CSS modules except complex animation), `cn()` for conditional classes, no inline styles except data-driven values, every light colour paired with a `dark:` value, Tabler icons only, bun as the package manager.

**New tool checklist**
- [ ] `page.tsx` follows 12.5 exactly; schema FAQ array matches the visible FAQ.
- [ ] Workbench uses the canonical Card, ActionButton, shared inputs and status messages.
- [ ] No hex colours, no `gray-*`/`slate-*`/`zinc-*`/`neutral-*` in chrome, no bare `primary` where blue is intended.
- [ ] No radius classes, no shadows beyond Level 1 on cards, no gradients.
- [ ] Text 12px minimum, no opacity on readable text, `tabular-nums` on numbers.
- [ ] Keyboard and focus verified on every control, including the dropzone.
- [ ] Icon registered in `src/config/icons.ts`.
- [ ] Light and dark checked; 1024px and 375px widths checked.

---

## 17. Do's and Don'ts

### Do
- Keep every corner square.
- Use Aback Blue as a signal: links, icon chips, active and selected states, drag-over, progress.
- Use ink (`bg-primary`) for the one primary action in a workbench, outline for secondary actions.
- Use `text-primary-700 dark:text-primary-400` for links and `text-primary-600 dark:text-primary-400` for brand icons.
- Build structure with 1px hairlines; reserve Separator for shell chrome.
- Use `Stack gap="lg"` as the only wrapper on tool pages and keep the canonical section order.
- Reuse `@/components/common` and `@/components/ui` before writing markup.
- Pair every light colour with its dark value and test both themes.
- Use Geist Mono for code, data, file names, sizes and hex values; `tabular-nums` for numbers.
- State the local-processing promise on every tool page.
- Reserve space for anything that loads late.

### Don't
- Don't write `rounded`, `rounded-xs`, `rounded-*-full` or inline `borderRadius` in UI chrome.
- Don't use bare `text-primary`/`bg-primary` when you mean blue.
- Don't put white text on `primary-500` or use `primary-500`/`primary-600` for small text on white.
- Don't hardcode hex values (including `#009bf9`, `#007cc7`, legacy `#2596be`) or use raw gray families in chrome.
- Don't use Lucide or hand-drawn SVG icons.
- Don't use `transition-all`, hover shadows on directory grids, glass cards, gradient buttons or multi-hue gradients.
- Don't set readable text below 12px or fade it with opacity modifiers.
- Don't wrap tool pages in `<main>`, `min-h-screen`, `max-w-*` or margin wrappers, and don't render a second H1.
- Don't nest Cards or add a subtitle under editorial H2s.
- Don't remove ad anchors, style content like ads, or hide reserved ad space in padding.
- Don't introduce per-category colours, emoji, exclamation marks, em dashes or en dashes.
- Don't add server uploads or claims that contradict "runs locally in your browser".

---

## Appendix A. Audit Findings and Migration Backlog

Counts are from a token scan of `src/` (October 2026; about 17,700 `.tsx` files under `src/components/tools`, about 3,400 tool `page.tsx` files). Prioritise shared components first: one fix there propagates to thousands of pages.

| # | Finding | Scale | Standard / fix |
|---|---|---|---|
| A1 | Bare `primary` renders neutral ink, not blue | text-primary 6,895; bg-primary* 3,339; border-primary* 2,778 | Replace with ramp steps where blue was intended (icons, hover borders, result heroes, UseCaseItem icons, RelatedTools hover). Longer term, alias the ramp as `brand-*` to remove the ambiguity |
| A2 | Bare `rounded` renders 4px; `rounded-xs` 2px; `rounded-*-full` pills; inline `borderRadius` | 5,712; 1; 36; 87 in 34 files | Remove, or zero `--radius-xs` and add `.rounded { border-radius: 0 }` globally |
| A3 | White labels on primary-500 brand buttons | ~80 class strings | Brand fill recipe (3.3) |
| A4 | Links in primary-600 (4.46:1) | ~2,300 text-primary-600 | primary-700 for text, keep 600 for icons |
| A5 | Opacity-reduced readable text | muted-foreground /70 1,360, /60 1,139, /50 872, /40 547, /30 172 | Plain `text-muted-foreground` |
| A6 | Micro type | text-[10px] 5,784; [9px] 919; [8px] 123; below 8px 43 | 12px floor; 10-11px only as uppercase labels |
| A7 | Hardcoded hex | #009bf9 554 in 191 files; #007cc7 168; #2596be 28; 4,982 hex literals in 773 files | Ramp utilities; keep hex only for data/user colours |
| A8 | Raw gray families in chrome | gray/neutral/slate/zinc: ~1,900 text, ~1,400 bg, ~1,100 border; off-scale shades (neutral-850, -750, primary-350) | Semantic tokens; delete off-scale classes (they compile to nothing) |
| A9 | Lucide icons | 46 files (31 tip-calculator pages, payment and productivity pages, 8 FAQSections) | Tabler equivalents; then remove `lucide-react` from package.json |
| A10 | Shadows beyond the scale | 2,596 utilities; workbench `shadow-lg` (116); glass card `bg-card/50 backdrop-blur-sm` (348) | Level 1 for cards; Level 2/3 for floating layers only |
| A11 | Focus styling | focus: 4,222 vs focus-visible: 1,482; 2,014 `focus:outline-none`; no focus style on DropZone, TextAreaInput, LabeledNumberInput, ToolCard | Standard ring (14.3) |
| A12 | Control heights | Input/Button 36px vs Select, LabeledSelect, LabeledNumberInput 40px | 36px |
| A13 | Hand-rolled buttons | raw `<button` in 1,558 tool files vs `<Button` in 556 | ActionButton / Button variants |
| A14 | Duplicate components | Two Stacks (one with undetectable dynamic classes), two InfoBlocks (`common/InfoBlock` vs `ui-blocks`), three accordions (ui/accordion, common/Accordion, FAQItem), three breadcrumb names, ToolGrid vs Grid, CategoryPage vs PageHeader, SectionHeading/SectionWrapper vs SectionHeader, three share implementations, two reading-progress bars, two ToCs | Keep the canonical one named in Section 11; alias or delete the rest |
| A15 | Dead or legacy | ToolLayout, ToolPageLayout (nested main), ToolPageShell (unused), CompactRelatedTools (0 uses), BatchProgress and ConversionSummary (0 uses in tools), SubcategorySection | Delete or adopt deliberately |
| A16 | Heading drift | Features/UseCases H2 `text-xl` inside Cards vs `text-lg` standard; hubs repeat the H1 as a self-linking H2 | Standard sizes (5.2); unlinked, non-duplicated hub headers |
| A17 | Success colour split | green and emerald both used for success | Green for success, emerald for "guide" only |
| A18 | Accessibility gaps | Search opens on focus, result rows are clickable divs, ⌘ shown on all OSes, ErrorMessage lacks `role="alert"`, FAQ answers clip at 384px without `aria-controls`, slider has a fixed `aria-label="Slider"`, hover-only remove buttons, FeedbackModal and LocaleSwitcher are hand-rolled (no focus trap / arrow keys), guide mobile ToC unreachable below `xl` | Section 14 |
| A19 | Hardcoded English in localized chrome | DropZone copy, TextInputBox/TextOutputBox labels, ToC labels, Share label, code-block Copy, callout titles, "Key takeaways", series banner, GuideShareButtons, ToolBlogLinks, 404, AllToolsGrid "(N tools)", RelatedTools names; `useToolText` used in 1 tool | Move to i18n |
| A20 | Layout width at 1024-1279px | 3-column grids at ~149-218px per card | Container queries or `xl:` breakpoints (6.4) |
| A21 | Long-form measure | Blog paragraphs reach ~130 characters per line on wide screens | `max-w-[72ch]` on article bodies |
| A22 | Brand constants | `themeColor` and manifest `#009af9` vs token `#009bf9`; OG says "2,000+" and "2,334"; `platform.instructions.md` lists `#2596be` | Align to `#009bf9` and `TOTAL_TOOL_COUNT` |
| A23 | Bugs noticed | BlogStep connector never hides (no parent `group`); BlogComparison `last:border-b-0` targets cells, not the last row; featured blog hero prints the raw category id and uses an unlocalized `<a>`; blog and guide sidebars have no max-height | Fix in place |
| A24 | Misc. | z-[9999]/z-[200] progress bars; `flex-shrink-0` and `bg-gradient-to-*` v3 spellings; `IconBrandTwitter`; emoji empty state; Popular Tools not representative | Section-specific standards above |

## Appendix B. Token Quick Reference

| Token | CSS / Tailwind |
|---|---|
| Canvas / Surface / Muted | `bg-background` / `bg-card` / `bg-muted` (tints `/10` to `/50`) |
| Ink / Mute | `text-foreground` / `text-muted-foreground` |
| Action (ink) fill | `bg-primary text-primary-foreground` |
| Hairline / Separator / Input | `border` / `border-separator` / `border-input` |
| Link | `text-primary-700 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 hover:underline` |
| Brand icon | `text-primary-600 dark:text-primary-400` |
| Icon chip | `bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400` |
| Active wash | `bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300` |
| Brand fill | `bg-primary-700 text-white hover:bg-primary-800 dark:bg-primary-400 dark:text-primary-950 dark:hover:bg-primary-300` |
| Focus ring | `focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:focus-visible:ring-primary-400` |
| Page rhythm | `Stack gap="lg"` (24px), homepage `gap="xl"` (32px) |
| Card | `Card` (border, `shadow-sm`, `py-6 gap-6`, `px-6`) with `CardTitle className="text-lg"` |
| Panel | `border bg-muted/20 p-4` |
| Eyebrow | `text-xs font-medium uppercase tracking-wide text-muted-foreground` |
| Overline | `text-[11px] font-semibold uppercase tracking-wider text-muted-foreground` |
| Micro caps | `text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground` |
| Motion | `transition-colors duration-200`; cards `transition-transform hover:-translate-y-1` |
