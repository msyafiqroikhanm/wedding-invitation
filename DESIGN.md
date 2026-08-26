---
name: Stillwater Mauve Journal
description: A quiet editorial wedding system shaped by mauve paper, mountain air, documentary photography, and moving-water lines.
colors:
  paper: "#fcfcf8"
  pearl: "#f3f5f1"
  ink: "#26312f"
  muted-ink: "#66726f"
  mineral: "#668184"
  mineral-dark: "#405e61"
  mineral-deep: "#314f52"
  mist: "#dce3df"
  hairline: "#d8dfdb"
  danger: "#a33e38"
  deep-water: "#405d60"
  pearl-blush: "#faf5f3"
  dusty-mauve: "#9a7680"
  deep-plum: "#563e47"
  garden-sage: "#8d9886"
  forest-ink: "#28332c"
  mountain-mist: "#d7d9d2"
  field-white: "#ffffff"
  inverse-ink: "#edf4ef"
typography:
  ceremonial:
    fontFamily: "Bodoni Moda Variable, Georgia, serif"
    fontWeight: 400 900
    lineHeight: 0.9
    letterSpacing: "-0.035em"
  display:
    fontFamily: "Bricolage Grotesque Variable, sans-serif"
    fontSize: "clamp(4rem, 11vw, 9rem)"
    fontWeight: 350
    lineHeight: 0.85
    letterSpacing: "-0.065em"
  headline:
    fontFamily: "Bricolage Grotesque Variable, sans-serif"
    fontSize: "clamp(2rem, 3.4vw, 3.4rem)"
    fontWeight: 530
    lineHeight: 1
    letterSpacing: "-0.04em"
  title:
    fontFamily: "Bricolage Grotesque Variable, sans-serif"
    fontSize: "1.4rem"
    fontWeight: 560
  body:
    fontFamily: "Onest Variable, sans-serif"
  label:
    fontFamily: "Onest Variable, sans-serif"
    fontSize: "0.73rem"
    fontWeight: 700
rounded:
  status: "4px"
  compact: "7px"
  control: "8px"
  pill: "30px"
  circle: "50%"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "18px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.mineral-dark}"
    textColor: "{colors.field-white}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 18px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.mineral-deep}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 18px"
    height: "44px"
  input:
    backgroundColor: "{colors.field-white}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.compact}"
    padding: "12px 13px"
    height: "46px"
  navigation-active:
    backgroundColor: "{colors.mineral-dark}"
    textColor: "{colors.field-white}"
    rounded: "{rounded.compact}"
    padding: "0 13px"
    height: "46px"
  status:
    typography: "{typography.label}"
    rounded: "{rounded.status}"
    padding: "5px 8px"
  invitation-action:
    backgroundColor: "transparent"
    textColor: "{colors.mineral-dark}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "0 18px"
    height: "48px"
---

# Design System: Stillwater Mauve Journal

## Overview

**Creative North Star: "Stillwater Mauve Journal"**

Stillwater Mauve Journal treats the invitation as a personal photo essay: warm pearl paper, dusty mauve pigment, mountain greens, fine concentric lines, and generous open space. The four primary photographs each have one clear role: cover, two individual portraits, and a full-width outdoor interlude.

The public invitation carries the most expressive scale and motion, while administration stays quiet and structurally legible. Bodoni Moda gives the invitation its ceremonial voice, Bricolage Grotesque remains the dashboard display face, Onest carries utility copy, and photography remains the emotional focus.

**Key Characteristics:**
- Warm pearl-blush surfaces with dusty mauve, deep plum, sage, and forest emphasis.
- Oversized, tightly tracked display typography beside compact utility labels.
- Hairline dividers and tonal fields instead of boxed card stacks.
- Concentric and irregular ripple outlines as the recurring signature.
- Restrained motion that opens, drifts, or pulses like disturbed water.

## Colors

The dashboard keeps its cool mineral palette. The invitation uses low-saturation pearl blush, dusty mauve, deep plum, garden sage, mountain mist, and forest ink sampled from the couple's outdoor photographs.

### Primary
- **Mineral Pigment:** The main interactive and illustrative accent for outlines, active states, links, and ripple marks.
- **Deep Mineral:** The high-contrast action color for primary buttons, active navigation, and dark editorial fields.

### Secondary
- **Mist Wash:** A pale blue-green fill for badges, avatars, and quiet selected details.

### Neutral
- **Pearl Ground:** The default application canvas and page background.
- **Paper White:** The warmer elevated surface used for forms, sheets, and login structure.
- **Ink:** The default text color, softened by muted ink for explanations and metadata.
- **Hairline:** The divider color that organizes lists and sections without card chrome.
- **Field White:** The clean input and selected-control surface.
- **Inverse Ink:** The cool pale text used over deep-water fields.
- **Danger:** A restrained red reserved for destructive actions and validation feedback.

### Named Rules
**The Mineral Restraint Rule.** Deep mineral marks the active path and major editorial fields; it does not flood every control.

## Typography

**Invitation Display Font:** Bodoni Moda Variable (with Georgia and serif fallback)
**Dashboard Display Font:** Bricolage Grotesque Variable (with sans-serif fallback)
**Body Font:** Onest Variable (with sans-serif fallback)

**Character:** Bodoni Moda gives names and emotional headings a formal editorial cadence. Bricolage Grotesque keeps dashboard hierarchy human and compact. Onest keeps body copy, forms, navigation, metadata, and instructions immediately readable.

### Hierarchy
- **Display:** Light variable weights and fluid sizing create the invitation's names and major moments; the largest observed role uses the normative display token.
- **Headline:** A medium variable weight with compact leading identifies dashboard pages and major administrative actions.
- **Title:** A firm compact display face labels sections, list groups, and smaller content moments.
- **Body:** Onest carries all operational copy, form content, and supporting invitation text, commonly with relaxed line-height for passages.
- **Label:** Small, bold Onest labels support table headings and metadata; ceremonial eyebrow text adds wide tracking and uppercase treatment only where observed.

### Named Rules
**The Role Rule.** Use Bodoni only in the public invitation, Bricolage only for dashboard display hierarchy, and Onest for reading and operation. Never mix both display faces in one surface.

## Layout

The invitation uses full-width tonal chapters around centered reading widths, with editorial asymmetry in portraits and a 12-column photographic gallery. Major invitation sections use fluid vertical padding and long pauses; hairline-separated event and account rows preserve continuity instead of becoming isolated cards.

The dashboard uses a sticky 252px sidebar beside a centered 1240px work area. Settings pair a 760px form column with a 300px phone preview. At 1050px, dense guest rows become a two-column card-like grid and the phone preview disappears. At 760px, the sidebar becomes a fixed 72px bottom navigation, dashboard grids collapse, and invitation spacing tightens. At 430px, media and account controls reduce again for narrow phones.

Recurring compact spacing steps are 4px, 8px, 12px, 18px, and 24px. Larger composition gaps are contextual and fluid rather than forced onto that compact control rhythm.

## Elevation & Depth

The system is flat by default. Depth comes first from pearl-to-paper tonal shifts, dark-water chapter fields, photography, borders, and sticky positioning. Soft green-black shadows appear only on temporary, floating, selected, or device-preview surfaces.

### Shadow Vocabulary
- **Selected Control** (`box-shadow: 0 2px 7px rgba(39,54,49,.08)`): Lifts the active segment by one quiet layer.
- **Floating Notice** (`box-shadow: 0 10px 30px rgba(40,55,50,.12)`): Separates transient feedback from the page.
- **Overlay Sheet** (`box-shadow: -15px 0 50px rgba(26,40,35,.14)`): Establishes the side sheet above its backdrop.
- **Device Preview** (`box-shadow: 0 24px 55px rgba(32,45,41,.18)`): Gives the physical phone mockup its strongest structural depth.

### Named Rules
**The Flat-by-Default Rule.** Lists, sections, and resting controls use lines and tonal layering; shadows are reserved for state, overlay, or physical-object cues.

## Shapes

Administrative controls use gently compact corners, with 7px fields and navigation, 8px buttons and segmented containers, and 4px status chips. Public invitation actions become 30px to 40px pills. Avatars, icon controls, loaders, and marks use circles.

Photography remains rectangular and edge-clean. The signature exception is the family of concentric ripple outlines, whose ellipses and irregular radii shift slightly between rings to suggest floated pigment rather than perfect geometry.

## Components

### Buttons
- **Shape:** Administrative buttons use a compact 8px radius and a minimum 44px touch height; invitation actions use open 30px to 40px pills.
- **Primary:** Deep mineral fill, white text, semibold body type, and 18px horizontal padding.
- **Hover / Focus:** Hover darkens the mineral fill and lifts by 1px over 180ms ease. Keyboard focus uses a 3px translucent mineral outline with 2px offset.
- **Secondary / Ghost:** Secondary actions use a transparent field with a pale green border; text and icon actions remove the container and rely on underline or deep-mineral text.

### Chips
- **Style:** Status chips are compact 4px rectangles with bold small labels. Unsent uses warm sand; sent uses pale green with dark green text.
- **State:** Segmented filters sit in an 8px outlined track; the active 5px segment turns white and gains the selected-control shadow.

### Cards / Containers
- **Corner Style:** Core content remains square and section-like; compact corners belong to transient menus, fields, and controls.
- **Background:** Pearl and paper carry most content, while deep-water fields mark major next actions and invitation chapters.
- **Shadow Strategy:** Resting sections are flat; overlays and sticky surfaces use the elevation vocabulary.
- **Border:** One-pixel hairlines separate rows and sections.
- **Internal Padding:** Dense controls use the compact spacing scale; editorial fields use fluid padding tied to viewport width.

### Inputs / Fields
- **Style:** White fields use a 1px cool gray-green stroke, 7px corners, and 12px by 13px internal padding. Inputs and selects maintain a 46px minimum height.
- **Focus:** The shared 3px translucent mineral focus outline sits 2px outside the field.
- **Error / Disabled:** Errors use dark red text on a pale red field with a red-tinted border; disabled controls reduce opacity and suppress lift.

### Navigation

Desktop navigation is a quiet vertical list on a pale sage-gray sidebar. Links use 46px rows and compact corners; hover introduces a translucent white wash and active state becomes deep mineral with white text. Below 760px, navigation becomes a fixed, blurred bottom bar with four equal destinations and text-supported icons.

### Ripple Mark

The signature mark is a family of thin concentric mineral outlines. It appears as a circular loader, an elliptical empty-state and gift mark, irregular hero rings, and large cover pigment contours; repeated rings vary their inset, rotation, or curvature rather than becoming a logo stamp.

## Do's and Don'ts

### Do:
- **Do** let pearl space, hairlines, and typography establish hierarchy before adding containers.
- **Do** keep public actions comfortable at phone scale with at least the observed 44px touch target.
- **Do** use ripple outlines as restrained structural accents and motion cues.
- **Do** let real photography carry the invitation's emotion.

### Don't:
- **Don't** replace the editorial section flow with a generic stack of floral wedding cards.
- **Don't** add decorative dashboard cards where a line, row, or tonal field already provides structure.
- **Don't** spread shadows across resting surfaces.
- **Don't** introduce saturated accents or mix Bodoni and Bricolage on the same surface.
