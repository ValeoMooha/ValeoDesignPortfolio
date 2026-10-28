// Zencastr v2 motion layer: scroll reveals, split headings, count-up numbers, tilt,
// roadmap progress, scroll progress bar and an image lightbox. Pure progressive
// enhancement: styles live in styles/works/zencastr-v2.css.
const root = document.querySelector<HTMLElement>('.zc.zc2');

if (root) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $$ = <T extends HTMLElement>(sel: string, from: ParentNode = root) => [...from.querySelectorAll<T>(sel)];
  const inSlider = (el: Element) => !!el.closest('.splide');

  lightbox();
  videos();
  if (reduce) {
    root.classList.add('zc2-ready');
    countUps(false);
  } else {
    reveals();
    roadmap();
    if (fine) tilt();
    progress();
    requestAnimationFrame(() => root.classList.add('zc2-ready'));
  }

  // ---------------------------------------------------------------- reveals
  function reveals() {
    const io = new IntersectionObserver(
      (entries) => {
        entries
          .filter((e) => e.isIntersecting)
          .forEach((e, i) => {
            const el = e.target as HTMLElement;
            io.unobserve(el);
            el.style.transitionDelay = `${Math.min(i, 6) * 80}ms`;
            el.classList.add('is-in');
            if (el.matches('.number-box')) countUps(true, el);
            // the delay is only for the entrance, not for later hovers
            setTimeout(() => (el.style.transitionDelay = ''), 1800);
          });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    );
    const tag = (el: HTMLElement, kind: string) => {
      if (el.dataset.rv) return;
      el.dataset.rv = kind;
      io.observe(el);
    };

    // headings: big ones split into words, the hero title into letters
    $$('.brxe-heading').forEach((h) => {
      if (h.closest('.zc-rm, #brxe-shwvqj, .number-box, .des-sys-box, .backtoportfolioblock')) return; // animated with their block
      if (h.matches('h6')) return tag(h, 'pop');
      const size = parseFloat(getComputedStyle(h).fontSize);
      if (h.matches('h2')) split(h, 'letters');
      else if (size >= 56) split(h, 'words');
      tag(h, h.dataset.split ? 'split' : 'up');
    });
    $$('.brxe-text-basic').forEach((p) => {
      if (p.closest('.zc-rm, #brxe-shwvqj, .number-box, .des-sys-box')) return;
      tag(p, 'up');
    });
    $$('.zc-rm__row').forEach((row) => io.observe(row));
    $$('.zc-rm').forEach((rm) => rm.classList.add('is-armed'));

    $$('.number-box, .des-sys-box').forEach((el) => tag(el, 'pop'));
    $$('.brxe-xproslider').forEach((s) => s.closest<HTMLElement>('#brxe-zqhnrc') ? tag(s.closest<HTMLElement>('#brxe-zqhnrc')!, 'frame') : tag(s, 'up'));
    $$('.splide.x-slider').forEach((s) => !s.closest('#brxe-zqhnrc') && tag(s, 'up'));
    $$('.brxe-video').forEach((v) => tag(v, 'up'));
    $$('img.brxe-image').forEach((img) => !inSlider(img) && tag(img, img.classList.contains('web-im') ? 'up' : 'frame'));
  }

  function split(el: HTMLElement, mode: 'words' | 'letters') {
    const label = el.textContent?.replace(/\s+/g, ' ').trim() ?? '';
    let n = 0;
    const walk = (node: Node) => {
      for (const child of [...node.childNodes]) {
        if (child.nodeType === Node.ELEMENT_NODE) {
          walk(child);
        } else if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) return frag.append(' ');
            const word = document.createElement('span');
            word.className = 'zc2-w';
            word.setAttribute('aria-hidden', 'true');
            (mode === 'letters' ? [...part] : [part]).forEach((chunk) => {
              const s = document.createElement('span');
              s.className = 'zc2-wi';
              s.style.setProperty('--i', String(n++));
              s.textContent = chunk;
              word.append(s);
            });
            frag.append(word);
          });
          child.replaceWith(frag);
        }
      }
    };
    walk(el);
    el.setAttribute('aria-label', label);
    el.dataset.split = mode;
  }

  // ---------------------------------------------------------------- numbers
  function countUps(animate: boolean, scope: HTMLElement = root!) {
    $$('.work-box-number', scope).forEach((n) => {
      const text = n.textContent?.trim() ?? '';
      const target = Number(text.replace(/[^\d]/g, ''));
      if (!animate || !target || n.dataset.counted) return;
      n.dataset.counted = '1';
      // keep the final width so the centred number does not wobble while counting
      n.style.minWidth = `${n.getBoundingClientRect().width}px`;
      const t0 = performance.now() + 250;
      const dur = Math.min(2200, 900 + String(target).length * 260);
      n.textContent = '0';
      const tick = (now: number) => {
        const k = Math.min(1, Math.max(0, (now - t0) / dur));
        n.textContent = String(Math.round(target * (1 - Math.pow(1 - k, 4))));
        if (k < 1) requestAnimationFrame(tick);
        else n.textContent = text;
      };
      requestAnimationFrame(tick);
    });
  }

  // ---------------------------------------------------------------- tilt
  function tilt() {
    $$('.number-box, .des-sys-box').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        el.classList.add('is-tilting');
        el.style.setProperty('--ry', `${(x - 0.5) * 10}deg`);
        el.style.setProperty('--rx', `${(0.5 - y) * 10}deg`);
        el.style.setProperty('--mx', `${x * r.width}px`);
        el.style.setProperty('--my', `${y * r.height}px`);
      });
      el.addEventListener('pointerleave', () => {
        el.classList.remove('is-tilting');
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
      });
    });
  }

  // ---------------------------------------------------------------- roadmap
  function roadmap() {
    const list = root!.querySelector<HTMLElement>('.zc-rm__list');
    if (!list) return;
    const rows = $$('.zc-rm__row', list);
    const nodes = rows.map((r) => r.querySelector<HTMLElement>('.zc-rm__node')!);
    let queued = false;
    const update = () => {
      queued = false;
      if (list.offsetParent === null) return; // hidden on phones
      const mid = innerHeight * 0.55;
      const top = list.getBoundingClientRect().top;
      const centers = nodes.map((n) => n.getBoundingClientRect().top + n.offsetHeight / 2);
      const last = centers[centers.length - 1];
      list.style.setProperty('--rm-fill', `${Math.max(0, Math.min(last - top, mid - top))}px`);
      let best = -1;
      let dist = Infinity;
      centers.forEach((c, i) => {
        const d = Math.abs(c - mid);
        if (c - 80 <= mid + innerHeight * 0.25 && d < dist) [best, dist] = [i, d];
      });
      rows.forEach((r, i) => r.classList.toggle('is-active', i === best && centers[0] - 40 < mid));
    };
    const queue = () => !queued && ((queued = true), requestAnimationFrame(update));
    addEventListener('scroll', queue, { passive: true });
    addEventListener('resize', queue);
    update();
  }

  // ---------------------------------------------------------------- progress bar
  function progress() {
    const bar = document.querySelector<HTMLElement>('.zc2-progress');
    if (!bar) return;
    let queued = false;
    const update = () => {
      queued = false;
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.setProperty('--p', String(max > 0 ? Math.min(1, scrollY / max) : 0));
    };
    addEventListener('scroll', () => !queued && ((queued = true), requestAnimationFrame(update)), { passive: true });
    addEventListener('resize', update);
    update();
  }

  // ---------------------------------------------------------------- videos
  function videos() {
    $$<HTMLVideoElement>('video').forEach((v) => {
      v.addEventListener('pause', () => v.classList.toggle('is-paused', !v.ended && v.dataset.userPaused === '1'));
      v.addEventListener('play', () => ((v.dataset.userPaused = ''), v.classList.remove('is-paused')));
      v.addEventListener('click', () => {
        // the page script pauses videos that leave the screen; only a click counts as "user paused"
        if (!v.paused) v.dataset.userPaused = '1';
      });
    });
  }

  // ---------------------------------------------------------------- lightbox
  function lightbox() {
    const dlg = document.createElement('dialog');
    dlg.className = 'zc2-lb';
    dlg.innerHTML = '<div class="zc2-lb__wrap"><img alt=""></div><button class="zc2-lb__x" aria-label="Close">×</button>';
    document.body.append(dlg);
    const big = dlg.querySelector('img')!;
    const close = () => dlg.close();
    dlg.addEventListener('click', close);
    dlg.addEventListener('close', () => (document.documentElement.style.overflow = ''));
    root!.addEventListener('click', (e) => {
      const img = (e.target as HTMLElement).closest<HTMLImageElement>('img.brxe-image');
      if (!img || img.closest('a')) return;
      big.srcset = img.srcset;
      big.sizes = '100vw';
      big.src = img.currentSrc || img.src;
      dlg.classList.toggle('is-tall', img.naturalHeight / img.naturalWidth > 1.8);
      document.documentElement.style.overflow = 'hidden';
      dlg.showModal();
      dlg.scrollTop = 0;
    });
  }
}
