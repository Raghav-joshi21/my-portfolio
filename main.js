/**
 * Raghav Joshi Portfolio
 * ----------------------
 * Lenis smooth scroll, GSAP ScrollTrigger word-dismantle hero,
 * and interactive UI components.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialise GSAP
    gsap.registerPlugin(ScrollTrigger);

    // 2. Initialise Lenis Smooth Scroll
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // 3. Components
    initCustomCursor();
    initProjectPreview();
    initTimezoneClock();
    initMagneticButtons();
    initHeroScrollAnimation();
    initNameRevealAnimation();
});

// ── Hero: "Creativity is my craft" visible → 1st scroll: hold → 2nd scroll: scatter → "y" zooms black ──
function initHeroScrollAnimation() {
    const stage = document.getElementById('hero-text-stage');
    if (!stage) return;

    // Visible text (shown in viewport on load)
    const VISIBLE_LINES = ['Creativity is', 'my craft'];
    // Extra text (below fold, hidden — letters appear during scatter)
    const HIDDEN_LINES  = ['abstract thinking is', 'my passion'];

    const visibleLetters = [];
    const hiddenLetters  = [];
    let zoomEl = null;     // will point to 'y' of 'my'
    let lineIdx = 0;

    function buildLine(text, parent, arr) {
        const line = document.createElement('div');
        line.className = 'hero-line';
        let charIdx = 0;
        [...text].forEach(ch => {
            if (ch === ' ') {
                const s = document.createElement('span');
                s.className = 'hero-space';
                line.appendChild(s);
            } else {
                const s = document.createElement('span');
                s.className = 'hero-letter';
                s.textContent = ch;
                // 'y' = visible line 1 ("my craft"), char index 1
                if (lineIdx === 1 && charIdx === 1) zoomEl = s;
                charIdx++;
                line.appendChild(s);
                arr.push(s);
            }
        });
        parent.appendChild(line);
        lineIdx++;
    }

    VISIBLE_LINES.forEach(l => buildLine(l, stage, visibleLetters));

    // Hidden stage placed below viewport (clipped by overflow:hidden on hero)
    const hiddenStage = document.createElement('div');
    hiddenStage.className = 'hero-hidden-stage';
    HIDDEN_LINES.forEach(l => buildLine(l, hiddenStage, hiddenLetters));
    document.getElementById('hero').appendChild(hiddenStage);

    // Wait for fonts + layout before measuring positions
    const ready = Promise.race([
        document.fonts.ready,
        new Promise(r => setTimeout(r, 600)),
    ]);

    ready.then(() => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const allLetters = [...visibleLetters, ...hiddenLetters];

        // Pre-compute scatter destinations + continued drift during zoom
        const scatter = allLetters.map(el => {
            const rect = el.getBoundingClientRect();
            const tx = (Math.random() * 0.82 + 0.05) * vw - rect.left;
            const ty = (Math.random() * 0.82 + 0.05) * vh - rect.top;
            const r  = (Math.random() - 0.5) * 130;
            // Continue drifting outward during zoom phase (same direction, further)
            const dx = tx + (tx >= 0 ? 1 : -1) * (0.15 + Math.random() * 0.25) * vw;
            const dy = ty + (ty >= 0 ? 1 : -1) * (0.15 + Math.random() * 0.25) * vh;
            const dr = r  + (Math.random() - 0.5) * 90;
            return { el, tx, ty, r, dx, dy, dr };
        });

        const zoomDat = scatter.find(d => d.el === zoomEl);
        const others  = scatter.filter(d => d.el !== zoomEl);

        const overlay = document.getElementById('hero-zoom-overlay');

        // Initial state: hidden letters invisible
        gsap.set(hiddenLetters, { opacity: 0 });
        if (overlay) gsap.set(overlay, { opacity: 0 });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: '#hero',
                start: 'top top',
                end: '+=160%',   // Reduced from 220% to tighten section transition after zoom
                scrub: 0.8,
                pin: true,
            },
        });

        // ── Scatter starts immediately ──
        const scatterAt = 0;

        // ── Scatter: all letters fly at once ──
        [...others, zoomDat].filter(Boolean).forEach(({ el, tx, ty, r }) => {
            tl.to(el, {
                x: tx, y: ty, rotation: r,
                opacity: 1,
                duration: 1,
                ease: 'expo.out',
            }, scatterAt);
        });

        // ── Brief hold at scattered state ──
        tl.to({}, { duration: 0.3 });

        const zoomAt = tl.duration();

        // ── 'y' zooms to fill screen ──
        tl.to(zoomEl, {
            scale: 80,
            duration: 1,
            ease: 'power3.in',
        }, zoomAt);

        // ── Other letters drift outward during zoom ──
        others.forEach(({ el, dx, dy, dr }) => {
            tl.to(el, {
                x: dx, y: dy, rotation: dr,
                duration: 1,
                ease: 'sine.in',
            }, zoomAt);
        });

        // ── Black overlay ──
        if (overlay) {
            tl.to(overlay, {
                opacity: 1,
                duration: 0.6,
                ease: 'power3.in',
            }, zoomAt + 0.1); // Slightly sooner
        }
    });
}

function initNameRevealAnimation() {
    // Wait for fonts to load so ScrollTrigger calculates pins in the correct DOM order
    const ready = Promise.race([
        document.fonts.ready,
        new Promise(r => setTimeout(r, 600)),
    ]);

    ready.then(() => {
        const section = document.getElementById('name-reveal');
        if (!section) return;

        const topLetters = section.querySelectorAll('.top-text span');
        const bottomLetters = section.querySelectorAll('.bottom-text span');
        const imgContainer = section.querySelector('.name-reveal-image-container');
        const img = section.querySelector('.name-image');
        const floats = section.querySelectorAll('.float-item');
        const desc = section.querySelector('.text-description');

        // Initial cinematic states based on Monkey Talkie video
        gsap.set(imgContainer, { scale: 0.7, yPercent: 40, opacity: 0 });
        gsap.set(topLetters, { yPercent: 105 }); // Corrected: Hiding BELOW the mask to slide UP
        gsap.set(bottomLetters, { yPercent: 105 }); // Hidden BELOW the mask to slide UP
        gsap.set([floats, desc], { opacity: 0, y: 20 });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: '#name-reveal',
                start: 'top top',
                end: '+=300%',
                scrub: 1,
                pin: true,
            }
        });

        // 1. Image Rises and Scales (Must be done before text starts)
        tl.to(imgContainer, {
            scale: 1,
            yPercent: 0,
            opacity: 1,
            duration: 1.5,
            ease: "power2.out"
        }, "start");

        // 2. FIRST: RAGHAV JOSHI Reveal (Starts only once image is up)
        tl.to(topLetters, {
            yPercent: 0,
            stagger: {
                each: 0.05,
                from: "start"
            },
            duration: 1,
            ease: "power2.out"
        }, "start+=1.3"); // Wait for image to settle

        // 3. THEN AFTER: DEVOPS ENGINEER Reveal (Delayed until Raghav Joshi is fully out)
        tl.to(bottomLetters, {
            yPercent: 0,
            stagger: {
                each: 0.05,
                from: "start"
            },
            duration: 1,
            ease: "power2.out"
        }, "start+=3.5"); // Substantial delay to ensure previous text is fully seen first

        // 3. Labels and Description Fade-In (Staggered red text)
        tl.to([desc, ...floats], {
            opacity: 1,
            y: 0,
            stagger: 0.1,
            duration: 1,
            ease: "power1.out"
        }, "start+=1.2");

        // 4. Subtle Parallax on scroll continue
        tl.to(imgContainer, { yPercent: -5, duration: 2 }, "start+=2");
        tl.to(topLetters, { yPercent: -15, duration: 2 }, "start+=2");
        tl.to(bottomLetters, { yPercent: 15, duration: 2 }, "start+=2");

        // 6. PHASE TWO: The skill items emerge sequentially AFTER the layout settles!
        tl.to(flyItems, {
            keyframes: [
                // Phase 1: Emerge from deep space and come into focus close to camera
                { opacity: 1, z: 200, scale: 1.5, filter: 'blur(0px)', duration: 2.5, ease: 'power2.out' },
                // Phase 2: Violently accelerate past camera lens, get massive, and disappear
                { opacity: 0, z: 1500, scale: 10, filter: 'blur(20px)', duration: 1.5, ease: 'power3.in' }
            ],
            stagger: 0.5 // Ultra wide stagger for prominent solo display
        }, "start+=3.5"); // Starts way after the initial texts ascend

        // Assure correct scroll ordering
        ScrollTrigger.sort();
    });
}

function initCustomCursor() {
    const cursor = document.getElementById('cursor');
    if (!cursor) return;
    window.addEventListener('mousemove', (e) => {
        gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1, ease: "power2.out" });
    });
    document.querySelectorAll('a, button, .project-row').forEach(el => {
        el.addEventListener('mouseenter', () => gsap.to(cursor, { scale: 5, backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid #fff" }));
        el.addEventListener('mouseleave', () => gsap.to(cursor, { scale: 1, backgroundColor: "#fff", border: "none" }));
    });
}


function initProjectPreview() {
    const previewBox = document.getElementById('project-preview');
    const rows = document.querySelectorAll('.project-row');
    const previewImg = previewBox?.querySelector('img');
    if (!previewBox || !rows.length) return;
    rows.forEach(row => {
        row.addEventListener('mouseenter', () => {
            const imgSrc = row.getAttribute('data-preview');
            if (previewImg && imgSrc) previewImg.src = imgSrc;
            gsap.to(previewBox, { scale: 1, autoAlpha: 1, duration: 0.3 });
        });
        row.addEventListener('mouseleave', () => gsap.to(previewBox, { scale: 0, autoAlpha: 0, duration: 0.3 }));
        row.addEventListener('mousemove', (e) => {
            gsap.to(previewBox, { x: e.clientX, y: e.clientY, duration: 0.4, ease: "power2.out" });
        });
    });
}

function initTimezoneClock() {
    const clockEl = document.getElementById('timezone-clock');
    if (!clockEl) return;
    const updateClock = () => {
        const now = new Date();
        const options = { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
        const timeString = new Intl.DateTimeFormat('en-GB', options).format(now);
        clockEl.textContent = `${timeString} UK (GMT+1)`;
    };
    setInterval(updateClock, 1000);
    updateClock();
}

function initMagneticButtons() {
    const buttons = document.querySelectorAll('.bubble-btn, .about-me-circle, .menu-circle-btn');
    buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            gsap.to(btn, { x: x * 0.3, y: y * 0.3, scale: 1.1, duration: 0.3, ease: "power2.out" });
        });
        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, { x: 0, y: 0, scale: 1, duration: 0.3, ease: "power2.out" });
        });
    });
}

