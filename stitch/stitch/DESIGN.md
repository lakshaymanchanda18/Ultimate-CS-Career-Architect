# Design System Strategy: The Architect’s Canvas

## 1. Overview & Creative North Star: "The Editorial Engineer"
The Creative North Star for this design system is **"The Editorial Engineer."** 

We are moving away from the "generic SaaS dashboard" look characterized by heavy borders and rigid grids. Instead, we are building a space that feels like a premium, high-end architectural studio mixed with the sophistication of a modern career journal. The design system leverages **intentional asymmetry** and **tonal layering** to guide the user through the complex task of resume building with a sense of calm authority. By utilizing wide margins, dramatic typography scales, and overlapping elements, we create a UI that feels curated and bespoke, not templated.

---

## 2. Colors: Depth Through Tones
This design system rejects the "flat" web. We use a sophisticated palette to simulate physical layers of high-quality paper and technical glass.

### The Palette
*   **Primary (#000000 / #0d1c32):** Our "Ink." Used for high-contrast headers and primary actions. It provides the grounding "Tech Blue" weight.
*   **Secondary (#006b58 / #5ffbd6):** Our "Signal." This electric accent is reserved for progress, success, and AI-driven insights.
*   **Neutral Surfaces (#f7f9fb to #ffffff):** The "Canvas." We use the full spectrum of `surface-container` tokens to define space.

### Key Color Rules
*   **The "No-Line" Rule:** 1px solid borders are strictly prohibited for sectioning. To separate a "Resume Preview" from the "Editor Sidebar," use a background shift from `surface` (#f7f9fb) to `surface-container-low` (#f2f4f6). Boundaries are felt, not seen.
*   **Surface Hierarchy & Nesting:** Treat the UI as stacked sheets.
    *   *Base:* `surface`
    *   *Section:* `surface-container-low`
    *   *Card:* `surface-container-lowest` (pure white) to make it "pop" forward.
*   **The "Glass & Gradient" Rule:** Main CTAs and AI-modals should utilize a subtle linear gradient from `primary` (#000000) to `primary_container` (#0d1c32). For floating AI-assistance panels, use `surface_container_lowest` with a 70% opacity and a 12px backdrop-blur to create a "frosted glass" effect.

---

## 3. Typography: The Editorial Scale
We pair **Manrope** (Display/Headlines) with **Inter** (Body/Labels) to create a "Technical Editorial" look. Manrope’s geometric warmth provides the "Career Coach" feel, while Inter’s precision handles the "Tech" data.

*   **Display-LG (56px, Manrope):** Use sparingly for hero moments and major section headers. It should feel authoritative.
*   **Headline-SM (24px, Manrope):** Used for card titles. Set these with tight letter-spacing (-0.02em) for a premium, custom-type feel.
*   **Body-MD (14px, Inter):** The workhorse. Used for resume content and descriptions. Ensure a line-height of 1.6 for maximum legibility.
*   **Label-MD (12px, Inter, All Caps, 0.05em Tracking):** Used for "Metadata" (e.g., *LAST EDITED 2M AGO*). This adds a technical, "blue-print" aesthetic to the tool.

---

## 4. Elevation & Depth: Tonal Layering
We avoid "boxy" shadows. Depth is an atmosphere, not a structural tool.

*   **The Layering Principle:** Instead of a shadow, place a `surface-container-lowest` element inside a `surface-container-high` wrapper. The color contrast creates a soft, natural lift.
*   **Ambient Shadows:** When a floating element (like a context menu) is required, use a shadow with a 32px blur and 4% opacity of the `on-surface` color. It should feel like a soft glow of light, not a dark stain.
*   **The "Ghost Border" Fallback:** For accessibility in form inputs, use the `outline-variant` token at **15% opacity**. This provides a "Ghost Border" that guides the eye without breaking the "No-Line" rule.
*   **Glassmorphism:** Use `surface-blur` effects for floating AI-assistant bubbles to suggest that the AI is "hovering" over the document, ready to help without obscuring the content.

---

## 5. Components: Precision & Support

*   **Buttons:** 
    *   *Primary:* Gradient fill (Primary to Primary-Container), `md` (12px) rounded corners. 
    *   *Tertiary:* No background, no border. Use `title-sm` typography with a subtle underline in `secondary_fixed`.
*   **Input Fields:** Use `surface-container-highest` for the background fill. No bottom border. On focus, transition the background to `surface-container-lowest` and apply a 1px "Ghost Border" in `secondary`.
*   **Cards:** Use the `lg` (16px) corner radius. Use vertical whitespace (32px - 48px) rather than dividers to separate list items within a card.
*   **Chips:** Use `full` (9999px) rounding. Use `secondary_container` for background with `on_secondary_container` for text to highlight "Skills" or "Keywords."
*   **The "AI-Architect" Panel:** A custom component. A high-depth card (`surface_container_lowest`) with a `secondary_fixed` (Electric Purple/Mint) left-accent glow to indicate AI-active status.
*   **Progress Steppers:** Use a horizontal "shimmer" gradient across the track rather than a solid color to imply movement and growth.

---

## 6. Do’s and Don’ts

### Do:
*   **Embrace Whitespace:** If you think a section needs a divider, add 24px of extra padding instead. 
*   **Use Asymmetry:** Place a `headline-lg` off-center to create a dynamic, editorial feel.
*   **Layer Surfaces:** Always ask, "Can I show depth using background colors instead of shadows?"

### Don’t:
*   **No 1px Black/Grey Borders:** They feel "default" and "cheap." Use tonal shifts.
*   **No High-Contrast Shadows:** Avoid the "dirty" look of 20%+ opacity shadows.
*   **No Centered-Only Layouts:** Technical tools feel more professional when they utilize a sophisticated left-aligned or asymmetric grid.
*   **Don't Overuse the Accent:** The "Electric Purple/Mint" (`secondary`) is a surgical tool. Use it for highlights, not for large backgrounds.