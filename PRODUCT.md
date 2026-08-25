# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Delegated: React with Vite for the frontend, Express for the API, MongoDB Atlas for data, Vercel Blob for public media, and Vercel for deployment. The product is one application for one wedding.

## Users

The primary users are the couple administering their own invitation from both phones and laptops. Guests receive a personalized link, read the invitation primarily on a phone, copy event or gift details, and leave a moderated message.

## Product Purpose

The product keeps guest records, invitation content, WhatsApp sending progress, media, digital gift details, and guest wishes in one private dashboard. Success means the couple can configure and send every invitation without editing source code, while each registered guest receives a polished personal invitation.

## Positioning

Every invitation URL is backed by an exact registered guest record. The dashboard joins personal-link generation, simple WhatsApp handoff, and sending status without requiring the WhatsApp Business API.

## Operating Context

The couple prepares guest names and Indonesian WhatsApp numbers, configures two wedding events, uploads existing photos and music, then works through unsent guests. WhatsApp opens with a prefilled message. A sent timestamp means the WhatsApp handoff was opened, not that WhatsApp confirmed delivery. Guest wishes remain private until approved.

## Capabilities and Constraints

- One wedding and one admin account.
- Email and password authentication with no public registration.
- Guest records contain name, WhatsApp number, connection, unique slug, and sending timestamp.
- Public invitation data is returned only after an exact guest-slug lookup.
- Two configurable events, gallery, countdown, backsound, digital gift details, WhatsApp template, and moderated wishes.
- Mobile-first invitation and a dashboard usable on phones and laptops.
- MongoDB Atlas and Vercel free-tier constraints apply.
- No RSVP, CSV import, multi-admin, multi-wedding, payment gateway, analytics suite, or WhatsApp delivery receipts in the MVP.

## Brand Commitments

The experience is clean and calm. The invitation must feel personal and editorial rather than like a generic wedding template. The dashboard must be immediately understandable and avoid decorative dashboard patterns. The working visual direction is Stillwater Letters: cool pearl, mineral blue, muted sage, restrained ripple lines, generous space, and photography as the emotional focus.

## Evidence on Hand

The couple has real photos and music, but they are not yet present in the repository. The build must provide upload and preview paths and must not fabricate personal names, dates, addresses, accounts, or family details.

## Product Principles

- Never reveal invitation content for an unregistered slug.
- Keep the next administrative action obvious.
- Let real photography carry emotion; interface decoration stays restrained.
- Explain WhatsApp tracking honestly.
- Make every public interaction work comfortably on a phone.

## Accessibility & Inclusion

Use WCAG AA contrast, visible focus, semantic forms, text-supported statuses, 44px touch targets, controllable audio, and reduced-motion support.
