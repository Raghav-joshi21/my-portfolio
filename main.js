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

// ── Hero: letters scatter → diamond clip-path wipes to black → name-reveal rises ──
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
                charIdx++;
                line.appendChild(s);
                arr.push(s);
            }
        });
        parent.appendChild(line);
        lineIdx++;
    }

    VISIBLE_LINES.forEach(l => buildLine(l, stage, visibleLetters));

    const hiddenStage = document.createElement('div');
    hiddenStage.className = 'hero-hidden-stage';
    HIDDEN_LINES.forEach(l => buildLine(l, hiddenStage, hiddenLetters));
    document.getElementById('hero').appendChild(hiddenStage);

    const ready = Promise.race([
        document.fonts.ready,
        new Promise(r => setTimeout(r, 600)),
    ]);

    ready.then(() => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const allLetters = [...visibleLetters, ...hiddenLetters];

        // Scatter destinations
        const scatter = allLetters.map(el => {
            const rect = el.getBoundingClientRect();
            const tx = (Math.random() * 0.82 + 0.05) * vw - rect.left;
            const ty = (Math.random() * 0.82 + 0.05) * vh - rect.top;
            const r  = (Math.random() - 0.5) * 130;
            return { el, tx, ty, r };
        });

        // ── Diamond wipe overlay ──
        // Build a black div with a diamond-shaped transparent window via clip-path
        // clip-path describes the VISIBLE region (the diamond hole) — rest is opaque
        const wipeOverlay = document.createElement('div');
        wipeOverlay.id = 'diamond-wipe';
        wipeOverlay.style.cssText = `
            position: absolute; inset: 0; z-index: 50; pointer-events: none;
            background: #000; opacity: 0;
            clip-path: polygon(50% -80%, 180% 50%, 50% 180%, -80% 50%);
        `;
        document.getElementById('hero').appendChild(wipeOverlay);

        gsap.set(hiddenLetters, { opacity: 0 });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: '#hero',
                start: 'top top',
                end: '+=200%',
                scrub: 0.8,
                pin: true,
            },
        });

        // Phase 1: Letters scatter
        scatter.forEach(({ el, tx, ty, r }) => {
            tl.to(el, { x: tx, y: ty, rotation: r, opacity: 1,
                duration: 1, ease: 'expo.out' }, 0);
        });

        // Brief hold
        tl.to({}, { duration: 0.3 });

        const wipeAt = tl.duration();

        // Phase 2: Diamond overlay fades in, letters fade out
        tl.to(wipeOverlay, { opacity: 1, duration: 0.3, ease: 'none' }, wipeAt);
        tl.to(allLetters,  { opacity: 0, duration: 0.4, ease: 'power2.in' }, wipeAt);

        // Phase 3: Diamond window SHRINKS — clip-path polygon collapses to center point
        // Start: diamond extends 80% beyond screen edges (full window visible)
        // End:   diamond collapses to center — full black screen
        tl.fromTo(wipeOverlay,
            { clipPath: 'polygon(50% -80%, 180% 50%, 50% 180%, -80% 50%)' },
            { clipPath: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)',
              duration: 1.4, ease: 'power2.in' },
            wipeAt + 0.1
        );
    });
}



function initNameRevealAnimation() {
    const ready = Promise.race([
        document.fonts.ready,
        new Promise(r => setTimeout(r, 600)),
    ]);

    ready.then(() => {
        const section = document.getElementById('name-reveal');
        if (!section) return;

        const topLetters    = section.querySelectorAll('.top-text span');
        const bottomLetters = section.querySelectorAll('.bottom-text span');
        const imgContainer  = section.querySelector('.name-reveal-image-container');
        const floats        = section.querySelectorAll('.float-item');
        const desc          = section.querySelector('.text-description');

        // Initial states
        gsap.set(imgContainer,  { scale: 0.7, yPercent: 40, opacity: 0 });
        gsap.set(topLetters,    { yPercent: 105 });
        gsap.set(bottomLetters, { yPercent: 105 });
        gsap.set([floats, desc],{ opacity: 0, y: 20 });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: '#name-reveal',
                start: 'top top',
                end: '+=300%',
                scrub: 1,
                pin: true,
            }
        });

        // 1. Portrait rises
        tl.to(imgContainer, { scale:1, yPercent:0, opacity:1, duration:1.5, ease:'power2.out' }, 'start');

        // 2. RAGHAV JOSHI wave in
        tl.to(topLetters, {
            yPercent:0, stagger:{ each:0.05, from:'start' }, duration:1, ease:'power2.out'
        }, 'start+=1.3');

        // 3. Labels fade in
        tl.to([desc, ...floats], { opacity:1, y:0, stagger:0.1, duration:1, ease:'power1.out' }, 'start+=1.2');

        // 4. DEVOPS ENGINEER wave in
        tl.to(bottomLetters, {
            yPercent:0, stagger:{ each:0.05, from:'start' }, duration:1, ease:'power2.out'
        }, 'start+=3.5');

        // 5. Subtle parallax hold
        tl.to(imgContainer,  { yPercent:-5,  duration:1.5 }, 'start+=2');
        tl.to(topLetters,    { yPercent:-10, duration:1.5 }, 'start+=2');
        tl.to(bottomLetters, { yPercent:10,  duration:1.5 }, 'start+=2');

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

