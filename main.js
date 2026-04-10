import './style.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger);

// Initialize Smooth Scroll (Lenis)
const lenis = new Lenis({
  lerp: 0.1,
  wheelMultiplier: 1,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

document.addEventListener('DOMContentLoaded', () => {
    initCustomCursor();
    initProjectPreview();
    initTimezoneClock();
    initMagneticButtons();
    initHeroScrollAnimation();
    initConstructionScene(); // Run FIRST so worker DOM nodes exist
    initNameRevealAnimation();
    initCityRevealAnimation();
});

// ── Hero: scatter → SVG rounded-triangle shrinks from corners → reveals name-reveal below ──
function initHeroScrollAnimation() {
    const hero        = document.getElementById('hero');
    const clipLayer   = document.getElementById('hero-clip-layer');
    const stage       = document.getElementById('hero-text-stage');
    if (!hero || !clipLayer || !stage) return;

    const phrases = ["INNOVATION", "DEVOPS", "PLATFORM", "AUTOMATION", "AI AGENTS"];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    
    // Inject letters for scattering
    stage.innerHTML = phrase.split('').map(char => `<span>${char}</span>`).join('');
    const letters = stage.querySelectorAll('span');

    // Scatter setup
    letters.forEach(span => {
        const x = (Math.random() - 0.5) * 400;
        const y = (Math.random() - 0.5) * 400;
        const r = (Math.random() - 0.5) * 180;
        gsap.set(span, { x, y, rotation: r, opacity: 0 });
    });

    const mainTl = gsap.timeline({
        scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: '+=150%',
            scrub: 1.2,
            pin: true,
        }
    });

    // Phase A: Letters gather to center
    mainTl.to(letters, {
        x: 0, y: 0, rotation: 0, opacity: 1,
        duration: 1,
        stagger: { each: 0.02, from: 'random' },
        ease: 'power2.inOut'
    });

    // Phase B: Wait briefly
    mainTl.to({}, { duration: 0.4 });

    // Phase C: SVG Mask shrinks (The Triangle Reveal)
    // We use a CSS mask property or clip-path. 
    // The name-reveal is BEHIND hero, but Content Overlay is ABOVE.
    mainTl.to(clipLayer, {
        clipPath: 'polygon(50% 50%, 50% 50%, 50% 50%)',
        duration: 1.5,
        ease: 'power2.in'
    });
}

// ── Name Reveal: Content rising + Wave Text ──
function initNameRevealAnimation() {
    const hero = document.getElementById('hero');
    if (!hero) return;

    ScrollTrigger.matchMedia({
        "(min-width: 768px)": function() {
            runRevealTimeline();
        }
    });

    function runRevealTimeline() {
        const topLetters    = hero.querySelectorAll('.top-text span');
        const bottomLetters = hero.querySelectorAll('.bottom-text span');
        const imgContainer  = hero.querySelector('.name-reveal-image-container');
        const floats        = hero.querySelectorAll('.float-item');
        const desc          = hero.querySelector('.text-description');

        // Initial states
        gsap.set(imgContainer,  { scale: 0.7, yPercent: 40, opacity: 0 });
        gsap.set(topLetters,    { yPercent: 105 });
        gsap.set(bottomLetters, { yPercent: 105 });
        gsap.set([floats, desc],{ opacity: 0, y: 20 });

        // scrub matches hero (0.8) for frame-perfect sync
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: '#name-reveal',
                start: 'top top',
                end: '+=350%',
                scrub: 0.8,
                pin: true,
            }
        });

        tl.to({}, { duration: 1.4 });

        tl.to(imgContainer, {
            scale: 1, yPercent: 0, opacity: 1,
            duration: 1.2, ease: 'power2.out',
        }, 1.4);

        tl.to(topLetters, {
            yPercent: 0,
            stagger: { each: 0.04, from: 'start' },
            duration: 0.8, ease: 'power3.out',
        }, 1.6);

        tl.to([...floats, desc], {
            opacity: 1, y: 0,
            stagger: 0.07, duration: 0.6, ease: 'power1.out',
        }, 2.0);

        tl.to(bottomLetters, {
            yPercent: 0,
            stagger: { each: 0.02, from: 'start' },
            duration: 0.5, ease: 'power3.out',
        }, 1.5);

        tl.to(imgContainer,  { yPercent: -4, duration: 1.2 }, 2.8);
        tl.to(topLetters,    { yPercent: -8, duration: 1.2 }, 2.8);
        tl.to(bottomLetters, { yPercent:  6, duration: 1.2 }, 2.8);

        ScrollTrigger.sort();
    }
}

function initCityRevealAnimation() {
    const section = document.getElementById('city-transit');
    if (!section) return;

    const bg = section.querySelector('.city-static-bg');

    // Parallax the plants background (Now replacing the city)
    gsap.fromTo(bg, 
        { yPercent: 15, scale: 1.1 },
        {
            yPercent: -15,
            scale: 1,
            ease: 'none',
            scrollTrigger: {
                trigger: section,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
            }
        }
    );
}

// ── Construction Scene: Placeholder (Empty as shared wrapper is hidden) ──
function initConstructionScene() {}

function initCustomCursor() {
    const cursor = document.getElementById('cursor');
    if (!cursor) return;
    window.addEventListener('mousemove', (e) => {
        gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1, ease: "power2.out" });
    });
}

function initProjectPreview() {}
function initTimezoneClock() {}
function initMagneticButtons() {}

