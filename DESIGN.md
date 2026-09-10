---
name: Album Biru / Stillwater Administration
description: A mineral-blue photographic invitation album alongside a calm pearl-and-mineral dashboard.
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
  field-white: "#ffffff"
  album-paper: "#f7f8f4"
  album-pearl: "#e7eded"
  album-ink: "#243d46"
  album-muted: "#52686d"
  album-mineral: "#6e8c96"
  album-blue: "#264b5a"
  album-sage: "#aab5a4"
  album-line: "#cbd6d6"
  album-mount: "#f4f6ef"
  album-inverse-muted: "#d6e2e4"
  album-gallery: "#dfe5da"
  album-surround: "#dbe3e4"
  album-focus: "#92b7c4"
typography:
  display:
    fontFamily: "Bodoni Moda Variable, Georgia, serif"
    fontSize: "clamp(3.8rem, 6.6vw, 6rem)"
    fontWeight: 500
    lineHeight: 1.05
    letterSpacing: "-0.04em"
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
  album-control: "3px"
  status: "4px"
  compact: "7px"
  control: "8px"
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
    rounded: "{rounded.control}"
    padding: "0 18px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.mineral-deep}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 18px"
    height: "44px"
  input:
    backgroundColor: "{colors.field-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.compact}"
    padding: "12px 13px"
    height: "46px"
  navigation-active:
    backgroundColor: "{colors.mineral-dark}"
    textColor: "{colors.field-white}"
    rounded: "{rounded.compact}"
    padding: "0 13px"
    height: "46px"
  invitation-action:
    backgroundColor: "transparent"
    textColor: "{colors.album-blue}"
    rounded: "{rounded.album-control}"
    padding: "0 22px"
    height: "52px"
  invitation-open:
    backgroundColor: "{colors.album-mount}"
    textColor: "{colors.album-blue}"
    rounded: "{rounded.album-control}"
    padding: "0 10px 0 22px"
    height: "54px"
---

# Design System: Album Biru / Stillwater Administration

## Overview

**Creative North Star: "Album Biru"**

The public invitation is a photographic keepsake: deep mineral-blue cloth-like fields, pearl album mounts, sage leaves, Bodoni names, and quiet ripple signatures. Light interior pages support daylight phone reading; real photography carries emotion. This records the implemented direction 4, seed `369ba90e`, committed in `index.html`.

Administration retains its calm Stillwater system: cool pearl, mineral actions, compact Bricolage headings, and Onest utility copy. `PRODUCT.md` supplies durable accessibility and personal/editorial commitments; its earlier Stillwater Letters direction is not the current guest palette. Surface strategy lives in `.impeccable/surfaces/src-pages-invite-jsx.md`.

**Key Characteristics:**
- Mounted rectangular photography, open page rhythm, and fine dividing lines.
- Expressive Bodoni guest typography; compact, immediately legible administration.
- Restrained blue/sage tonal fields and purposeful, reduced-motion-aware transitions.

## Colors

### Primary
- **Album Blue / Album Mineral:** Dark cover, countdown, wishes, action text, and quieter ripple/border accents respectively. `album-*` tokens apply to guest output and override the root mineral palette locally.
- **Deep Mineral / Mineral Pigment:** Dashboard primary actions, active navigation, links, and supporting marks. Deep-water remains the dashboard next-action field; mineral-deep is primary hover.

### Secondary
- **Album Sage / Album Gallery:** Portrait fallback and photographic interlude ground; gallery leaf field.
- **Mist:** Dashboard badge and quiet supporting fill.

### Neutral
- **Album Paper / Pearl / Mount:** Interior pages, opening-letter field and account panels, then cover print and opening action. Album surround fills the viewport outside the centered invitation.
- **Album Ink / Muted / Inverse Muted / Line:** Reading text, supporting copy, pale copy on blue, and fine structural borders. Album focus is the keyboard outline.
- **Paper / Pearl / Ink / Muted Ink / Hairline / Field White:** Dashboard forms, canvas, text hierarchy, dividers, and fields. Danger is reserved for destructive actions and errors.

**The Surface Boundary Rule.** Unprefixed tokens describe administration; album tokens describe the guest invitation. The admin phone mockup still uses legacy mauve (`#45303a`) and Playfair Display: it is not an accurate preview of Album Biru.

## Typography

Guest display uses **Bodoni Moda Variable, Georgia, serif**, imported by `src/pages/Invite.jsx`; body and controls use **Onest Variable, sans-serif**. Dashboard headings use **Bricolage Grotesque Variable, sans-serif**. `index.html` still loads Playfair for the legacy preview; that load does not define guest typography.

- **Guest display:** The normative display token describes desktop cover names. Interior names use weight 500, `clamp(3.2rem, 6vw, 5rem)` and 1.1 leading; section headings use roughly 2.3–4rem fluid scales, 1.1–1.2 leading, and tight tracking. Ampersands are smaller and italic.
- **Guest reading:** Onest passages use roughly .9–1rem with 1.7–1.95 leading; short supporting passages commonly stop at 32–40ch. Approved wishes use Bodoni at 1.3rem/1.65. Dates and account numbers use tabular numerals where implemented.
- **Dashboard:** Headline/title tokens preserve page and section hierarchy; label describes table metadata. Status chips use .72rem/700. Login display uses weight 350, `clamp(3rem, 5.8vw, 6rem)` and .98 leading.
- **Phone cover (≤700px):** Names wrap along a shared baseline at `clamp(2rem, 8.8vw, 2.7rem)` with 1.2 leading; interior hero names use 3.8rem. Long guest names and headings wrap rather than clip.

## Layout

Guest pages are centered at a maximum 1200px on the album surround; the fixed cover spans the viewport with an inner maximum 1100px. Desktop uses paired columns, staggered portraits, spacious 8–12% gutters, and approximately 96–112px chapter padding. Events auto-fit from 270px columns. The gallery is a horizontal scroll-snap strip, not a 12-column grid: prints occupy 36% with a 240px minimum.

At 700px, the cover stacks names, print, and dedication; the print caps at 290px. Interior columns collapse, portraits alternate alignment at 88% width, gutters become 28–30px, and gallery prints occupy 84%. Safe-area padding protects fixed controls. The closing page reserves bottom space for navigation.

Dashboard: sticky 252px sidebar, centered 1240px work area, settings columns of up to 760px plus a 300px preview. At 1050px, guest rows become two-column cards and the preview hides. At 760px, grids collapse and a fixed 72px bottom navigation replaces the sidebar; at 430px, media/account controls tighten. Compact spacing follows the frontmatter scale; editorial gaps remain contextual.

## Elevation & Depth

Flat pages, tonal chapters, borders, and photography provide most depth. Guest print mounts and floating navigation are deliberate physical-object exceptions; dashboard shadows remain reserved for selected, floating, and overlay surfaces.

- **Album print:** `0 16px 40px #102c3a33`; **guest navigation:** `0 8px 32px #16354426`.
- **Selected segment:** `0 2px 7px rgba(39,54,49,.08)`; **toast:** `0 10px 30px rgba(40,55,50,.12)`.
- **Side sheet:** `-15px 0 50px rgba(26,40,35,.14)`; **phone preview:** `0 24px 55px rgba(32,45,41,.18)`.

## Shapes

Album photography is rectangular with square mounts, including 4:5 portraits and gallery images; the cover print rotates 2deg. Guest actions use compact album-control corners, navigation uses 4px, and the music control remains circular. Ripple ellipses accent selected moments rather than surrounding every photograph. Dashboard fields/navigation retain compact corners, buttons use control corners, and chips use status corners; legacy preview pills are not guest action rules.

## Components

- **Dashboard buttons and fields:** Primary buttons use mineral fill, white text, weight 650, and minimum 44px height; secondary buttons use transparent fill and a pale green border. Hover lifts 1px over 180ms and primary fill darkens. Fields have a cool gray-green 1px stroke and minimum 46px height for inputs/selects. Focus is a 3px translucent mineral outline, offset 2px; errors use red-tinted fields and disabled buttons suppress lift.
- **Dashboard status/navigation:** Sand means unsent; pale green means sent, both with text. Segmented filters use an outlined 8px track and white selected segment. Sidebar rows are minimum 46px; active rows use mineral/white, hover a white wash. Mobile navigation retains four labeled destinations. Core lists use hairlines rather than decorative cards.
- **Guest actions:** Opening uses a pale filled minimum 54px button; maps use 50px outlined actions, gift reveal 52px, account copy 46px, and wish submit 48px. Hover applies brightness .94; opening presses scale .97; disabled guest buttons show reduced opacity and a waiting cursor.
- **Guest focus:** Preserve `.invitation :is(button, a, textarea):focus-visible`: a 3px album-focus outline with 5px offset, including the wishes textarea on blue.
- **Gallery and navigation:** The labeled, keyboard-focusable native scroll region contains numbered mounted prints. Fixed bottom navigation caps at 420px and uses labeled minimum 50px links; optional destinations follow actual content. A separate 44px music control appears only with audio.
- **Gifts and wishes:** Gift details expand with inert/hidden closed content, selectable account numbers, copy confirmation, and failure guidance. Wishes use a transparent, square, bottom-bordered textarea on blue, a character count, submission status, and moderated published quotes.
- **Opening and motion:** Closed content/navigation are inert and hidden; opening transfers focus to the interior heading and attempts audio only on that action. Cover exit fades over .8s and moves over 1s; scroll reveals rise 20px with .9–1s easing, interlude parallax is subtle, and gift expansion takes .45s. Reduced motion disables parallax/reveal preparation and minimizes CSS motion.
- **Loading and unavailable states:** Keep explanatory Indonesian text and restrained ripple marks. Error/not-ready headings use Bodoni; the loading screen retains the shared root loader. Missing media uses initials or omits optional sections, without fabricated personal details.

## Do's and Don'ts

- **Do** preserve the blue cover/light-page distinction, mounted photography, and reading-first hierarchy.
- **Do** keep visible keyboard focus, comfortable phone targets, controllable audio, reduced motion, and text-supported feedback.
- **Do** preserve dashboard mineral/Bricolage rules and treat the legacy phone mockup as a separate surface.
- **Don't** restore mauve/Playfair, pill actions, full-screen text-over-photo covers, or the obsolete grid gallery in guest output.
- **Don't** turn every chapter into a card, add shadows to resting lists, or duplicate page strategy as a global design rule.
