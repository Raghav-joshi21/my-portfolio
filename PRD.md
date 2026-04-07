# 📋 Product Requirements Document (PRD)
## Raghav Joshi — Cinematic Portfolio Website
**Version:** 2026 Edition  
**Repository:** [github.com/Raghav-joshi21/my-portfolio](https://github.com/Raghav-joshi21/my-portfolio)  
**Stack:** Vanilla HTML · Vanilla CSS · Vanilla JS · GSAP + ScrollTrigger · Lenis  
**Last Updated:** April 2026

---

## 1. Project Overview

A high-end, cinematic single-page portfolio website for **Raghav Joshi**, a DevOps Engineer specialising in Cloud Architecture and AI Integrations. The design is inspired by premium agency websites (specifically the *Monkey Talkie* studio) featuring large-scale typography, scroll-driven animations, and a strong editorial presence.

The site is built entirely with **Vanilla HTML, CSS, and JavaScript** — no frameworks, no build steps beyond Vite dev server. The goal is maximum performance and visual impact.

---

## 2. Tech Stack & Dependencies

| Library | Version | Purpose |
|---|---|---|
| GSAP | 3.12.5 | All scroll-driven animations and timelines |
| ScrollTrigger | 3.12.5 | Pinning sections and syncing scroll to timelines |
| Lenis | 1.1.20 | Buttery smooth scroll momentum |
| Archivo Black | Google Fonts | Primary display font for `RAGHAV JOSHI` and `DEVOPS ENGINEER` |
| Plus Jakarta Sans | Google Fonts | Body copy, descriptions, nav labels |
| Outfit | Google Fonts | Headings, logo box |
| Jersey 10 | Google Fonts | Hero section display text |

---

## 3. Site Structure & Sections

### 3.1 Navigation (`<nav class="main-nav">`)
- Fixed top navigation with `z-index: 5000`
- **Logo:** Black box with `R`, followed by `coded by Raghav` text
- **Hover Effect:** The nav name slides from "coded by Raghav" → "Joshi" using a CSS `translateY` clip trick (`.name-container` overflow hidden)
- Nav is `pointer-events: none` on the wrapper, so it never interferes with scroll

### 3.2 Hero Section (`#hero`)
- **Full-viewport** (`100vh`), light `#f5f5f3` background
- Displays the phrase **"Creativity is my craft"** in large `Jersey 10` display typography
- **Animation Sequence (scroll-driven, pinned for 160% scroll distance):**
  1. Letters **scatter** to random positions across the viewport simultaneously
  2. Brief hold at scattered state
  3. The letter `y` (from "my") **zooms** to fill the entire screen (`scale: 80`)
  4. All other letters drift further outward during zoom
  5. A black overlay fades in to conceal the transition
- The `y` zoom acts as a **cinematic wipe** into the dark Name Reveal section below

### 3.3 Name Reveal Section (`#name-reveal`)
The centrepiece of the site — a high-impact, scroll-driven editorial reveal.

**Layout (z-index layering, back to front):**
1. `z-index: 1` — **RAGHAV JOSHI** top text mask (behind portrait)
2. `z-index: 2` — Portrait image of Raghav (centre stage)
3. `z-index: 3` — Floating technical labels
4. `z-index: 5` — **DEVOPS ENGINEER** bottom text mask (in front of portrait)
5. `z-index: 10` — Section-wide bottom black fade overlay

**Portrait (`RAGHAV JOSHI.png`):**
- Positioned absolute at `top: 75%`, `left: 50%`, height `95vh`
- Starts at `scale: 0.7`, `yPercent: 40`, `opacity: 0`
- Animates to full scale as scroll begins

**RAGHAV JOSHI Text:**
- Font: `Archivo Black`, `clamp(3rem, 11vw, 12rem)`, uppercase
- Positioned in `.top-text-mask` at `top: 15vh`, height `20vh`
- Each letter is an individual `<span>` in the HTML
- Starts at `yPercent: 105` (hidden below mask boundary)
- **Reveals with a left-to-right wave stagger** (`each: 0.05, from: "start"`)
- Sits **behind** the portrait (`z-index: 1`) for editorial depth

**DEVOPS ENGINEER Text:**
- Font: `Archivo Black`, `clamp(2rem, 7vw, 7.5rem)`, uppercase (40% smaller than main title)
- Positioned in `.bottom-text-mask` at `bottom: 8vh`, height `15vh`
- Each letter is an individual `<span>` in the HTML
- Starts at `yPercent: 105` (hidden below mask boundary)
- **Reveals with identical left-to-right wave stagger** — only after RAGHAV JOSHI is fully done
- Sits **in front of** the portrait (`z-index: 5`)

**Floating Technical Labels:**
| Label | Position | Colour |
|---|---|---|
| SCALABLE INFRASTRUCTURE | `top: 40%, left: 27%` | `#9fc7ff` (light blue) |
| SYSTEM DESIGN | `top: 78%, left: 16%` | `#fff` (white) |
| CLOUD & AUTOMATION | `top: 78%, left: 60%` | `#fff` (white) |

**Description Text:**
- Content: *"Building at the intersection of DevOps, cloud architecture, and AI integrations. Crafting robust ecosystems that scale effortlessly."*
- Position: `top: 55%, left: 65%`
- Colour: `#9fc7ff` (Technical Blue)
- Font: `Inter`, 0.8rem, uppercase, bold

**Bottom Black Fade:**
- `::after` pseudo-element on `.name-reveal-section`
- `height: 15vh`, `linear-gradient(to top, #000 0%, transparent 100%)`
- `z-index: 10` — sits on top of everything, creates a ground

**Portrait Bottom Shadow:**
- `::after` pseudo-element on `.name-reveal-image-container`
- `height: 250px`, `linear-gradient(to top, #000 20%, transparent 100%)`
- Creates a "melt into black" ground effect specific to the portrait

---

## 4. GSAP Animation Timeline — Name Reveal

```
SCROLL TRIGGER: #name-reveal | top → +=300% | scrub: 1 | pin: true
```

| Label | Action | Timeline Position |
|---|---|---|
| `start` | Portrait rises: scale 0.7→1, yPercent 40→0, opacity 0→1 | `"start"` |
| `start+=1.3` | **RAGHAV JOSHI** wave reveal: yPercent 105→0, stagger 0.05 left-to-right | `"start+=1.3"` |
| `start+=1.2` | Floating labels + description fade in: opacity 0→1, y 20→0 | `"start+=1.2"` |
| `start+=2` | Mild parallax drift — portrait up, top letters up, bottom letters down | `"start+=2"` |
| `start+=3.5` | **DEVOPS ENGINEER** wave reveal: yPercent 105→0, stagger 0.05 left-to-right | `"start+=3.5"` |

**Key Design Principles:**
- ✅ Zero opacity-based reveals on text — 100% hidden via **overflow clipping** on masks
- ✅ No glow, no blur, no text-shadow on final state — pure, clean white
- ✅ Both text rows use identical wave stagger physics for consistency

---

## 5. Hero Section Animation Timeline

```
SCROLL TRIGGER: #hero | top → +=160% | scrub: 0.8 | pin: true
```

| Action | Detail |
|---|---|
| Scatter | All letters fly to random viewport positions simultaneously with `expo.out` |
| Hold | Brief timeline pause |
| `y` Zoom | `scale: 80` with `power3.in` |
| Others drift | Letters continue outward with `sine.in` ease |
| Black overlay | Fades in at `opacity: 1` slightly after zoom begins |

---

## 6. Interactive Components

### 6.1 Custom Cursor (`#cursor`)
- 12×12px white dot with `mix-blend-mode: exclusion`
- Follows mouse with GSAP `power2.out`, `duration: 0.1`
- **Hover state:** Scales to 5x on links/buttons, changes background and adds border

### 6.2 Project Preview (`#project-preview`)
- Fixed position, `400×300px` card that follows mouse
- Appears on hover over `.project-row` elements
- Loads project-specific image from `data-preview` attribute
- Animates in/out with `scale + autoAlpha` via GSAP

### 6.3 Magnetic Buttons (`.bubble-btn`, `.about-me-circle`)
- Respond to `mousemove` with elastic push — element shifts 30% of cursor offset
- Returns to origin on `mouseleave` with `power2.out`

### 6.4 Timezone Clock (`#timezone-clock`)
- Displays live UK (GMT+1) time in `HH:MM:SS AM/PM` format
- Updates every 1 second with `setInterval`
- Located in the footer

---

## 7. Typography Scale

| Element | Font | Size | Weight |
|---|---|---|---|
| RAGHAV JOSHI | Archivo Black | `clamp(3rem, 11vw, 12rem)` | 400 (Black) |
| DEVOPS ENGINEER | Archivo Black | `clamp(2rem, 7vw, 7.5rem)` | 400 (Black) |
| Hero Text | Jersey 10 | `clamp(5rem, 13vw, 17rem)` | 400 |
| Section Headings | Outfit | `--` | 700 |
| Body / Nav | Plus Jakarta Sans | `0.85rem` | 400–800 |
| Float Labels | Plus Jakarta Sans | `0.8–0.9rem` | 700 |

---

## 8. Color Palette

| Token | Value | Usage |
|---|---|---|
| Black | `#000000` | Main background, section background |
| White | `#ffffff` | Primary text, RAGHAV JOSHI, DEVOPS ENGINEER |
| Technical Blue | `#9fc7ff` | SCALABLE INFRASTRUCTURE label, description paragraph |
| White (labels) | `#ffffff` | SYSTEM DESIGN, CLOUD & AUTOMATION labels |
| Accent Blue | `#007aff` | Pills, CTA buttons |
| Accent Purple | `#6c5dd3` | Bubble button hover fill |
| Near-white | `#f5f5f3` | Hero section background |
| Dark footer | `#0c0d0f` | Footer background |

---

## 9. Sections Still in Development

| Section | Status | Notes |
|---|---|---|
| About | 🚧 Placeholder | Empty `<div>`, content coming soon |
| Projects | ⚠️ Partial | 3 project rows with placeholder images |
| Footer | ✅ Done | Live clock, social links, "Get in touch" CTA |

---

## 10. Known Issues & Backlog

| Issue | Priority | Notes |
|---|---|---|
| "DEVOPS ENGINEERING" and "AI AGENTS" labels not yet added to HTML | High | Labels exist as `fly-item` in HTML but are `display: none` |
| `flyItems` reference in `main.js` line 249 is undefined (causes JS error) | High | `flyItems` variable not declared in scope |
| CSS has duplicate `.float-1/.float-3/.float-5` selectors | Low | Last rule wins, but confusing — should consolidate |
| Image may still appear slightly blurry at large `95vh` height | Medium | `drop-shadow` filter can cause GPU rasterisation at lower res |
| Mobile/tablet responsiveness not tested | Medium | Only `@media (max-width: 1024px)` basic adjustment added |
| Dark paragraph text still shows white in some states | Medium | CSS specificity conflict between `.float-item` and `.text-description` |

---

## 11. File Structure

```
/portfolio website
├── index.html        # DOM structure — all sections and floating labels
├── style.css         # All design tokens, layout, masks, and animations
├── main.js           # GSAP timelines, Lenis init, interactive components
├── RAGHAV JOSHI.png  # Portrait image used in name reveal section
├── 1.mp4             # Reference design video (Monkey Talkie inspiration)
├── PRD.md            # This document
└── package.json      # Vite dev server config
```

---

## 12. Deployment

- **Local dev:** `npm run dev` (Vite)
- **Repository:** [github.com/Raghav-joshi21/my-portfolio](https://github.com/Raghav-joshi21/my-portfolio)
- **Production build:** Not yet configured
