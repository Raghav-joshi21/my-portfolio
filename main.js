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
    initConstructionScene(); // Run FIRST so worker DOM nodes exist
    initNameRevealAnimation();
});

// ── Hero: scatter → SVG rounded-triangle shrinks from corners → reveals name-reveal below ──
function initHeroScrollAnimation() {
    const stage = document.getElementById('hero-text-stage');
    if (!stage) return;

    const VISIBLE_LINES = ['Creativity is', 'my craft'];
    const HIDDEN_LINES  = ['abstract thinking is', 'my passion'];

    const visibleLetters = [];
    const hiddenLetters  = [];
    let lineIdx = 0;

    function buildLine(text, parent, arr) {
        const line = document.createElement('div');
        line.className = 'hero-line';
        [...text].forEach(ch => {
            if (ch === ' ') {
                const s = document.createElement('span'); s.className = 'hero-space'; line.appendChild(s);
            } else {
                const s = document.createElement('span'); s.className = 'hero-letter'; s.textContent = ch;
                line.appendChild(s); arr.push(s);
            }
        });
        parent.appendChild(line); lineIdx++;
    }

    VISIBLE_LINES.forEach(l => buildLine(l, stage, visibleLetters));
    const hiddenStage = document.createElement('div');
    hiddenStage.className = 'hero-hidden-stage';
    HIDDEN_LINES.forEach(l => buildLine(l, hiddenStage, hiddenLetters));
    // Append inside #hero-clip-layer so hidden letters are clipped with the white panel
    document.getElementById('hero-clip-layer').appendChild(hiddenStage);

    const ready = Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 600))]);

    ready.then(() => {
        const vw = window.innerWidth, vh = window.innerHeight;
        const allLetters = [...visibleLetters, ...hiddenLetters];
        const heroClipLayer = document.getElementById('hero-clip-layer');

        // Scatter destinations
        const scatter = allLetters.map(el => {
            const rect = el.getBoundingClientRect();
            return {
                el,
                tx: (Math.random() * 0.82 + 0.05) * vw - rect.left,
                ty: (Math.random() * 0.82 + 0.05) * vh - rect.top,
                r:  (Math.random() - 0.5) * 130,
            };
        });

        gsap.set(hiddenLetters, { opacity: 0 });
        // --mask-scale starts at 3.5 (set in CSS). No JS set needed.

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: '#hero',
                start: 'top top',
                end: '+=350%',   // long enough for scatter + triangle collapse
                scrub: 0.8,
                pin: true,
                pinSpacing: false,  // name-reveal floats up BEHIND the hero visually
            },
        });

        // Phase A: Letters scatter (0→1.0)
        scatter.forEach(({ el, tx, ty, r }) => {
            tl.to(el, { x: tx, y: ty, rotation: r, opacity: 1, duration: 1, ease: 'expo.out' }, 0);
        });

        // Phase B: Brief hold (1.0→1.4)
        tl.to({}, { duration: 0.4 });

        // Phase C: White panel SHRINKS — CSS mask-image triangle scales 3.5 → 0 (1.4→3.4)
        // Same technique as monkeytalkie.com: animate --mask-scale CSS variable via GSAP.
        // The black hero bg is revealed in the corners as the white panel collapses to a point.
        tl.to(heroClipLayer, {
            '--mask-scale': 0,
            duration: 2,
            ease: 'power2.in',
        }, 1.4);
    });
}


function initNameRevealAnimation() {
    const ready = Promise.race([
        document.fonts.ready,
        new Promise(r => setTimeout(r, 600)),
    ]);

    ready.then(() => {
        // Content is now inside #hero's .name-reveal-content-overlay (z-index 4),
        // above the clip layer, so it's never masked by the triangle.
        const hero = document.getElementById('hero');
        if (!hero) return;

        const topLetters    = hero.querySelectorAll('.top-text span');
        const bottomLetters = hero.querySelectorAll('.bottom-text span');
        const imgContainer  = hero.querySelector('.name-reveal-image-container');
        const floats        = hero.querySelectorAll('.float-item');
        const desc          = hero.querySelector('.text-description');

        // No clip-path on name-reveal — it sits fully below the hero
        // The hero's SVG triangle clip reveals MORE of this section as it shrinks
        // Content starts hidden, waves in mid-way through the hero collapse
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

        // ── Hold while hero scatter plays (hero Phase A+B = 1.4s) ──
        // Nothing visible yet — triangle is still large, corners just starting to appear
        tl.to({}, { duration: 1.4 });

        // ── 1.4s: Triangle starts collapsing → content rises simultaneously ──

        // Photo rises from bottom-center
        tl.to(imgContainer, {
            scale: 1, yPercent: 0, opacity: 1,
            duration: 1.2, ease: 'power2.out',
        }, 1.4);

        // RAGHAV JOSHI letters rise one by one (left to right)
        tl.to(topLetters, {
            yPercent: 0,
            stagger: { each: 0.04, from: 'start' },
            duration: 0.8, ease: 'power3.out',
        }, 1.6);

        // Floating labels + description fade up
        tl.to([...floats, desc], {
            opacity: 1, y: 0,
            stagger: 0.07, duration: 0.6, ease: 'power1.out',
        }, 2.0);

        // Bottom text "DevOps Engineer" — starts early so it's fully revealed
        // before the mask finishes collapsing (mask ends at hero t=3.4)
        tl.to(bottomLetters, {
            yPercent: 0,
            stagger: { each: 0.02, from: 'start' },
            duration: 0.5, ease: 'power3.out',
        }, 1.5);

        // Subtle upward parallax drift as triangle fully closes
        tl.to(imgContainer,  { yPercent: -4, duration: 1.2 }, 2.8);
        tl.to(topLetters,    { yPercent: -8, duration: 1.2 }, 2.8);
        tl.to(bottomLetters, { yPercent:  6, duration: 1.2 }, 2.8);

        ScrollTrigger.sort();
    });
}


// ── Construction Scene: Worker Sprites ──
function initConstructionScene() {
    const scene = document.getElementById('construction-scene');
    if (!scene) return;
    const layer = scene.querySelector('.cs-construction-layer');
    if (!layer) return;

    function makeWorker(config) {
        const wrap = document.createElement('div');
        wrap.className = 'cs-worker-container';
        wrap.style.cssText = `position:absolute; left:${config.left}; bottom:${config.bottom}; z-index:${config.zIndex||8};`;

        const img = document.createElement('img');
        img.style.cssText = `height:${config.size}; image-rendering:pixelated; pointer-events:none; transform:${config.flip ? 'scaleX(-1)' : 'none'};`;

        const bubble = document.createElement('div');
        bubble.style.cssText = `position:absolute; top:-5vh; left:50%; transform:translateX(-50%); background:white; color:#111; padding:0.4rem 0.8rem; border-radius:15px; font-family:'Caveat',cursive; font-size:1.1rem; font-weight:bold; white-space:nowrap; opacity:0; transition:opacity 0.2s; box-shadow:0 5px 15px rgba(0,0,0,0.3); pointer-events:none;`;
        if (config.terminalStyle) {
            Object.assign(bubble.style, { background:'rgba(0,0,0,0.8)', color:'#fff', fontFamily:'"Courier New",monospace', fontSize:'0.9rem', fontWeight:'normal', border:'1px solid transparent' });
        }
        wrap.appendChild(img); wrap.appendChild(bubble);
        layer.appendChild(wrap);

        let moveOffset=0, distanceWalked=0, frameIndex=0;
        let currentState = config.isStationary ? 'action' : 'walking';
        let isPaused = false;
        const walkSeq=config.walkSequence||[], actionSeq=config.actionSequence||[];
        const walkLimit=config.walkLimit||120;
        const lazyQ=["watching reels while AI generates...","just one more tiktok...","artificial delegation!"];
        const devQ=["Oh shit! Forgot to commit!","I pushed to main!!","Who broke the build?!"];
        const flows=[
            {error:"> git push [REJECTED]", resolve:"> git pull --rebase ✅"},
            {error:"> npm run dev ERROR!",  resolve:"> killall node ✅"},
            {error:"> Merge conflict!",     resolve:"> Resolved manually ✅"}
        ];
        img.src=(currentState==='walking'?walkSeq:actionSeq)[0]||'';

        setTimeout(()=>{
            setInterval(()=>{
                if(isPaused) return;
                const seq=(currentState==='walking'||currentState==='running_back'||currentState==='panicking')?walkSeq:actionSeq;
                if(!seq.length) return;
                if(currentState==='action'&&frameIndex===seq.length-1){
                    if(config.isStationary){frameIndex=-1;}
                    else if(config.behavior==='forgetful_dev'){
                        currentState='panicking'; img.style.transform='scaleX(-1)';
                        bubble.innerText=devQ[Math.floor(Math.random()*devQ.length)]; bubble.style.opacity='1';
                        setTimeout(()=>{currentState='running_back';},1500); frameIndex=-1;
                    } else { currentState='walking'; frameIndex=-1; distanceWalked=0; }
                }
                if(currentState!=='panicking'){ frameIndex=(frameIndex+1)%seq.length; img.src=seq[frameIndex]; }
                if(config.behavior==='lazy_dev'&&currentState==='action'&&seq[frameIndex]?.includes('20')){
                    isPaused=true; bubble.innerText=lazyQ[Math.floor(Math.random()*lazyQ.length)]; bubble.style.opacity='1';
                    setTimeout(()=>{bubble.style.opacity='0';isPaused=false;},4000);
                }
                if(config.behavior==='git_workflow'&&currentState==='action'&&seq[frameIndex]?.includes('10')&&Math.random()<0.35){
                    isPaused=true; const fl=flows[Math.floor(Math.random()*flows.length)];
                    bubble.style.border='1px solid rgba(255,50,50,0.8)'; bubble.innerText=fl.error; bubble.style.opacity='1';
                    setTimeout(()=>{ bubble.style.border='1px solid rgba(50,255,50,0.8)'; bubble.innerText=fl.resolve;
                        setTimeout(()=>{bubble.style.opacity='0';isPaused=false;},2500);
                    },3500);
                }
            },config.frameDelay||300);
            setInterval(()=>{
                if(config.isStationary||isPaused||currentState==='panicking') return;
                if(currentState==='walking'){
                    moveOffset+=2.0; distanceWalked+=2.0;
                    wrap.style.marginLeft=`${moveOffset}px`;
                    if(config.behavior==='vehicle_loop'){
                        moveOffset+=1.0;
                        if(moveOffset>window.innerWidth+500) moveOffset=-800;
                        wrap.style.marginLeft=`${moveOffset}px`; return;
                    }
                    const hit=config.behavior==='forgetful_dev'?moveOffset>=walkLimit:distanceWalked>=walkLimit;
                    if(hit){currentState='action';frameIndex=-1;}
                } else if(currentState==='running_back'){
                    moveOffset-=4.5; wrap.style.marginLeft=`${moveOffset}px`;
                    if(moveOffset<=-300){img.style.transform='none';bubble.style.opacity='0';currentState='walking';distanceWalked=0;}
                }
            },30);
        },config.delayOffset||0);
    }

    makeWorker({ left:'-15vw',bottom:'5vh',size:'15vh',flip:false,behavior:'forgetful_dev',walkLimit:window.innerWidth*0.40,
        walkSequence:['https://res.cloudinary.com/dam86kngr/image/upload/v1775566444/sprite_1_thovwa.png','https://res.cloudinary.com/dam86kngr/image/upload/v1775566444/sprite_2_dkynn2.png','https://res.cloudinary.com/dam86kngr/image/upload/v1775566444/sprite_3_agmfgr.png','https://res.cloudinary.com/dam86kngr/image/upload/v1775566444/sprite_4_qy5myo.png'],
        actionSequence:['https://res.cloudinary.com/dam86kngr/image/upload/v1775566451/sprite_17_ldyqgf.png','https://res.cloudinary.com/dam86kngr/image/upload/v1775566454/sprite_12_w1ilkq.png','https://res.cloudinary.com/dam86kngr/image/upload/v1775566450/sprite_21_gugcd4.png']});
    makeWorker({ left:'70vw',bottom:'8vh',size:'15vh',flip:true,isStationary:true,behavior:'lazy_dev',frameDelay:2000,delayOffset:400,
        actionSequence:['https://res.cloudinary.com/dam86kngr/image/upload/v1775566451/sprite_19_y7uwol.png','https://res.cloudinary.com/dam86kngr/image/upload/v1775566450/sprite_21_gugcd4.png','https://res.cloudinary.com/dam86kngr/image/upload/v1775566453/sprite_11_ocyxsh.png','https://res.cloudinary.com/dam86kngr/image/upload/v1775566451/sprite_20_zpzyjr.png']});
    makeWorker({ left:'60vw',bottom:'38vh',size:'9vh',flip:false,isStationary:true,behavior:'git_workflow',terminalStyle:true,frameDelay:2000,
        actionSequence:['https://res.cloudinary.com/dam86kngr/image/upload/v1775566451/sprite_18_kdgskv.png','https://res.cloudinary.com/dam86kngr/image/upload/v1775566451/sprite_17_ldyqgf.png','https://res.cloudinary.com/dam86kngr/image/upload/v1775566454/sprite_12_w1ilkq.png','https://res.cloudinary.com/dam86kngr/image/upload/v1775566454/sprite_10_xubdj4.png']});
    makeWorker({ left:'69.5vw',bottom:'75vh',size:'9vh',flip:true,zIndex:'3',isStationary:true,behavior:'git_workflow',terminalStyle:true,frameDelay:2000,delayOffset:1000,
        actionSequence:['https://res.cloudinary.com/dam86kngr/image/upload/v1775566451/sprite_18_kdgskv.png','https://res.cloudinary.com/dam86kngr/image/upload/v1775566451/sprite_19_y7uwol.png','https://res.cloudinary.com/dam86kngr/image/upload/v1775566451/sprite_17_ldyqgf.png','https://res.cloudinary.com/dam86kngr/image/upload/v1775566454/sprite_12_w1ilkq.png','https://res.cloudinary.com/dam86kngr/image/upload/v1775566454/sprite_10_xubdj4.png']});
    makeWorker({ left:'-20vw',bottom:'10vh',size:'22vh',flip:false,zIndex:'1',behavior:'vehicle_loop',frameDelay:150,
        walkSequence:['https://res.cloudinary.com/dam86kngr/image/upload/v1775566446/sprite_1_jvyr6x.png','https://res.cloudinary.com/dam86kngr/image/upload/v1775566447/sprite_2_ds77bf.png','https://res.cloudinary.com/dam86kngr/image/upload/v1775566446/sprite_3_rtiwnq.png','https://res.cloudinary.com/dam86kngr/image/upload/v1775566449/sprite_4_bemdai.png','https://res.cloudinary.com/dam86kngr/image/upload/v1775566448/sprite_5_i8yob4.png','https://res.cloudinary.com/dam86kngr/image/upload/v1775566448/sprite_6_llqkh7.png','https://res.cloudinary.com/dam86kngr/image/upload/v1775566444/sprite_8_qgaetl.png','https://res.cloudinary.com/dam86kngr/image/upload/v1775566444/sprite_9_fkgyjz.png','https://res.cloudinary.com/dam86kngr/image/upload/v1775566446/sprite_14_qmipy7.png','https://res.cloudinary.com/dam86kngr/image/upload/v1775566447/sprite_15_ocvjw0.png','https://res.cloudinary.com/dam86kngr/image/upload/v1775566446/sprite_16_ftfufw.png','https://res.cloudinary.com/dam86kngr/image/upload/v1775566445/sprite_18_nqimle.png'],
        actionSequence:[]});
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

