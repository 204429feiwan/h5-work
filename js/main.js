/**
 * 舌尖上的老字号——中华传统美食文化专题
 * 主脚本
 */

function getScrollOffset() {
  var jumpBar = document.querySelector('.page-jump-bar');
  var offset = 12;
  if (jumpBar) {
    offset += jumpBar.offsetHeight;
  }
  return offset;
}

function highlightAnchorTarget(el) {
  document.querySelectorAll('.anchor-highlight').forEach(function (node) {
    node.classList.remove('anchor-highlight');
  });
  if (!el) return;
  el.classList.add('anchor-highlight');
  window.setTimeout(function () {
    el.classList.remove('anchor-highlight');
  }, 3200);
}

function scrollToTarget(el, updateHash) {
  if (!el) return;
  var offset = getScrollOffset();
  var top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
  if (updateHash && el.id) {
    history.replaceState(null, '', '#' + el.id);
  }
  highlightAnchorTarget(el);
}

function closeMobileNav() {
  var navbar = document.getElementById('mainNavbar');
  if (!navbar || !navbar.classList.contains('show') || typeof bootstrap === 'undefined') return;
  var instance = bootstrap.Collapse.getInstance(navbar);
  if (instance) instance.hide();
}

function initPageJumpBar() {
  var bar = document.querySelector('.page-jump-bar');
  if (!bar) return;

  bar.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var hash = link.getAttribute('href');
      if (!hash || hash.length < 2) return;
      var target = document.querySelector(hash);
      if (!target) return;
      e.preventDefault();
      scrollToTarget(target, hash !== '#page-content');
      closeMobileNav();
    });
  });
}

function initAnchorNavigation() {
  function handleHash() {
    var hash = window.location.hash;
    if (!hash || hash.length < 2) return;
    var target = document.querySelector(hash);
    if (!target) return;
    window.setTimeout(function () {
      scrollToTarget(target, false);
    }, 120);
  }

  handleHash();
  window.addEventListener('hashchange', handleHash);

  document.querySelectorAll('a[href*="#"]').forEach(function (link) {
    var href = link.getAttribute('href');
    if (!href || href.charAt(0) === '#') return;
    var hashIndex = href.indexOf('#');
    if (hashIndex === -1) return;

    link.addEventListener('click', function () {
      var hash = href.substring(hashIndex);
      var pagePart = href.substring(0, hashIndex).split('/').pop() || '';
      var currentPage = window.location.pathname.split('/').pop() || 'index.html';
      if (pagePart && pagePart !== currentPage) return;
      window.setTimeout(function () {
        var target = document.querySelector(hash);
        if (target) scrollToTarget(target, false);
      }, 180);
    });
  });
}

function initSectionSpy() {
  var jumpLinks = document.querySelectorAll('.page-jump-link[data-section]');
  if (!jumpLinks.length || !('IntersectionObserver' in window)) return;

  var sections = [];
  jumpLinks.forEach(function (link) {
    var id = link.getAttribute('data-section');
    var section = document.getElementById(id);
    if (section) {
      sections.push({ id: id, el: section, link: link });
    }
  });

  if (!sections.length) return;

  var activeId = null;

  function setActive(id) {
    if (activeId === id) return;
    activeId = id;
    jumpLinks.forEach(function (link) {
      link.classList.toggle('is-active', link.getAttribute('data-section') === id);
    });
  }

  var observer = new IntersectionObserver(function (entries) {
    var visible = entries
      .filter(function (entry) { return entry.isIntersecting; })
      .sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; });
    if (visible.length) {
      setActive(visible[0].target.id);
    }
  }, {
    rootMargin: '-' + getScrollOffset() + 'px 0px -50% 0px',
    threshold: [0, 0.15, 0.35, 0.55]
  });

  sections.forEach(function (item) {
    observer.observe(item.el);
  });
}

function initNavHighlight() {
  var path = window.location.pathname.split('/').pop() || 'index.html';
  if (path === '' || path.indexOf('.html') === -1) {
    path = 'index.html';
  }
  document.querySelectorAll('.site-nav .nav-link').forEach(function (link) {
    var href = link.getAttribute('href');
    if (!href || href.charAt(0) === '#') return;
    var linkPage = href.split('/').pop().split('?')[0];
    if (linkPage === path) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    }
  });
}

function isInternalPageLink(href) {
  if (!href || href.charAt(0) === '#' || href.indexOf('javascript:') === 0) return false;
  if (href.indexOf('http://') === 0 || href.indexOf('https://') === 0 || href.indexOf('mailto:') === 0) return false;
  if (href.indexOf('tel:') === 0) return false;
  return true;
}

function initPageLinkTransition() {
  document.querySelectorAll('a[href]').forEach(function (link) {
    var href = link.getAttribute('href');
    if (!isInternalPageLink(href)) return;
    link.addEventListener('click', function () {
      saveBgmState();
      document.body.classList.add('is-page-leaving');
    });
  });
}

function initNavigation() {
  initNavHighlight();
  initPageJumpBar();
  initAnchorNavigation();
  initSectionSpy();
  initPageLinkTransition();
}

function initCarousel() {
  var carouselEl = document.getElementById('bannerCarousel');
  if (!carouselEl || typeof bootstrap === 'undefined') return;

  var carousel = bootstrap.Carousel.getOrCreateInstance(carouselEl, {
    interval: 4000,
    ride: 'carousel',
    wrap: true,
    touch: true
  });

  carouselEl.addEventListener('mouseenter', function () {
    carousel.pause();
  });
  carouselEl.addEventListener('mouseleave', function () {
    carousel.cycle();
  });
}

function initFormValidation() {
  var form = document.getElementById('contactForm');
  if (!form) return;

  var nameInput = document.getElementById('contactName');
  var emailInput = document.getElementById('contactEmail');
  var phoneInput = document.getElementById('contactPhone');
  var messageInput = document.getElementById('contactMessage');

  var emailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  var phoneReg = /^1[3-9]\d{9}$/;

  function setValid(input, valid) {
    if (valid) {
      input.classList.remove('is-invalid');
      input.classList.add('is-valid');
    } else {
      input.classList.remove('is-valid');
      input.classList.add('is-invalid');
    }
    return valid;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var nameOk = setValid(nameInput, nameInput.value.trim() !== '');
    var emailOk = setValid(emailInput, emailReg.test(emailInput.value.trim()));
    var phoneOk = setValid(phoneInput, phoneReg.test(phoneInput.value.trim()));
    var messageOk = setValid(messageInput, messageInput.value.trim().length >= 10);

    if (nameOk && emailOk && phoneOk && messageOk) {
      alert('提交成功！感谢您的留言，我们会认真阅读您的反馈。');
      form.reset();
      [nameInput, emailInput, phoneInput, messageInput].forEach(function (input) {
        input.classList.remove('is-valid', 'is-invalid');
      });
    }
  });
}

function initScrollReveal() {
  var reveals = document.querySelectorAll('.reveal, .immerse-reveal');
  if (!reveals.length) return;

  if (!('IntersectionObserver' in window)) {
    reveals.forEach(function (el) {
      el.classList.add('is-visible');
    });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -30px 0px'
  });

  reveals.forEach(function (el) {
    observer.observe(el);
  });
}

function initImageModal() {
  var modalEl = document.getElementById('imageModal');
  if (!modalEl || typeof bootstrap === 'undefined') return;

  modalEl.addEventListener('show.bs.modal', function (event) {
    var trigger = event.relatedTarget;
    if (!trigger) return;

    var src = trigger.getAttribute('data-img-src');
    var title = trigger.getAttribute('data-img-title') || '图片预览';
    var img = document.getElementById('modalPreviewImg');
    var label = document.getElementById('imageModalLabel');

    if (img && src) {
      img.src = src;
      img.alt = title;
    }
    if (label) {
      label.textContent = title;
    }
  });

  modalEl.addEventListener('hidden.bs.modal', function () {
    var img = document.getElementById('modalPreviewImg');
    if (img) {
      img.src = '';
    }
  });
}

function initBackToTop() {
  var btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', function () {
    if (window.scrollY > 320) {
      btn.classList.add('is-visible');
    } else {
      btn.classList.remove('is-visible');
    }
  }, { passive: true });

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function initHeritageCounters() {
  var nums = document.querySelectorAll('.heritage-stat-num[data-count]');
  if (!nums.length) return;

  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var duration = 1800;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      el.textContent = Math.floor(progress * target);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    }
    requestAnimationFrame(step);
  }

  if (!('IntersectionObserver' in window)) {
    nums.forEach(animateCount);
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  nums.forEach(function (el) {
    observer.observe(el);
  });
}

function initHeritageTimeline() {
  var timeline = document.getElementById('heritageTimeline');
  if (!timeline) return;

  if (!('IntersectionObserver' in window)) {
    timeline.classList.add('is-animated');
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-animated');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  observer.observe(timeline);
}

function initHeritageVideo() {
  var video = document.getElementById('heritageVideo');
  var wrap = video ? video.closest('.heritage-video-wrap') : null;
  if (!video || !wrap) return;

  function showEmpty() {
    wrap.classList.remove('has-video');
  }

  function showVideo() {
    wrap.classList.add('has-video');
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        /* 浏览器策略阻止时，用户可通过 controls 手动播放 */
      });
    }
  }

  video.addEventListener('loadeddata', showVideo);
  video.addEventListener('canplay', showVideo);
  video.addEventListener('error', showEmpty);

  if (video.readyState >= 2) {
    showVideo();
  } else {
    showEmpty();
    video.load();
  }
}

var BGM_VOLUME = 0.5;
var SK_BGM_TIME = 'siteBgmTime';
var SK_BGM_PAUSED = 'siteBgmUserPaused';
var SK_BGM_WAS_PLAYING = 'siteBgmWasPlaying';
var siteBgmAudio = null;

function saveBgmState() {
  if (!siteBgmAudio) return;
  try {
    sessionStorage.setItem(SK_BGM_TIME, String(siteBgmAudio.currentTime));
    var playing = !siteBgmAudio.paused && !siteBgmAudio.ended;
    sessionStorage.setItem(SK_BGM_WAS_PLAYING, playing ? 'true' : 'false');
  } catch (err) {
    /* sessionStorage 不可用时忽略 */
  }
}

function initSiteBgm() {
  var audio = document.getElementById('siteBgm');
  var btns = document.querySelectorAll('.nav-bgm-btn');
  if (!audio || !btns.length) return;

  siteBgmAudio = audio;
  audio.volume = BGM_VOLUME;
  audio.loop = true;
  audio.muted = false;

  var userPaused = sessionStorage.getItem(SK_BGM_PAUSED) === 'true';
  var wasPlaying = sessionStorage.getItem(SK_BGM_WAS_PLAYING) === 'true';
  var savedTime = parseFloat(sessionStorage.getItem(SK_BGM_TIME) || '0');
  var interactionBound = false;
  var isLoading = false;
  var resumeAttempted = false;

  function setBtnText(text) {
    btns.forEach(function (btn) {
      var label = btn.querySelector('.nav-bgm-text');
      if (label) label.textContent = text;
    });
  }

  function updateBtn() {
    btns.forEach(function (btn) {
      var playing = !audio.paused && !audio.ended;
      var icon = btn.querySelector('.nav-bgm-icon');
      var text = btn.querySelector('.nav-bgm-text');
      btn.setAttribute('aria-pressed', playing ? 'true' : 'false');
      btn.classList.toggle('is-playing', playing);
      btn.classList.toggle('is-loading', isLoading);
      if (isLoading) {
        if (text) text.textContent = '加载中…';
        return;
      }
      if (playing) {
        if (icon) icon.textContent = '♫';
        if (text) text.textContent = '播放中';
      } else if (userPaused) {
        if (icon) icon.textContent = '🔇';
        if (text) text.textContent = '已暂停';
      } else if (wasPlaying) {
        if (icon) icon.textContent = '♫';
        if (text) text.textContent = '点击继续';
      } else {
        if (icon) icon.textContent = '♫';
        if (text) text.textContent = '音乐';
      }
    });
  }

  function markLoadError() {
    isLoading = false;
    btns.forEach(function (btn) {
      btn.classList.remove('is-playing', 'is-loading');
      btn.title = '浏览器无法播放当前音频。请将音乐转为普通 MP3，保存为 audio/bgm.mp3 后刷新';
    });
    if (window.location.protocol === 'file:') {
      setBtnText('请用服务器');
    } else {
      setBtnText('需MP3格式');
    }
  }

  function restoreTime() {
    if (savedTime <= 0 || isNaN(savedTime) || !isFinite(savedTime)) return;
    if (audio.readyState < 1) return;
    try {
      var max = audio.duration && isFinite(audio.duration) ? audio.duration : savedTime;
      audio.currentTime = Math.min(savedTime, max);
    } catch (err) {
      /* 元数据未就绪时忽略 */
    }
  }

  function playSuccess() {
    isLoading = false;
    wasPlaying = true;
    userPaused = false;
    try {
      sessionStorage.setItem(SK_BGM_WAS_PLAYING, 'true');
      sessionStorage.setItem(SK_BGM_PAUSED, 'false');
    } catch (err) {
      /* ignore */
    }
    updateBtn();
  }

  function playFromUserGesture() {
    userPaused = false;
    wasPlaying = true;
    sessionStorage.setItem(SK_BGM_PAUSED, 'false');
    sessionStorage.setItem(SK_BGM_WAS_PLAYING, 'true');
    audio.muted = false;
    audio.volume = BGM_VOLUME;
    restoreTime();
    isLoading = true;
    updateBtn();

    var promise = audio.play();
    if (!promise || typeof promise.then !== 'function') {
      playSuccess();
      return;
    }
    promise.then(playSuccess).catch(function () {
      function onCanPlay() {
        audio.removeEventListener('canplay', onCanPlay);
        audio.removeEventListener('error', onError);
        restoreTime();
        audio.play().then(playSuccess).catch(function () {
          isLoading = false;
          setBtnText('再点播放');
          window.setTimeout(updateBtn, 2500);
        });
      }
      function onError() {
        audio.removeEventListener('canplay', onCanPlay);
        audio.removeEventListener('error', onError);
        markLoadError();
      }
      if (audio.readyState >= 2) {
        audio.play().then(playSuccess).catch(function () {
          isLoading = false;
          setBtnText('再点播放');
          window.setTimeout(updateBtn, 2500);
        });
        return;
      }
      audio.addEventListener('canplay', onCanPlay);
      audio.addEventListener('error', onError);
      audio.load();
    });
  }

  function unbindFirstInteraction(onInteract) {
    document.removeEventListener('pointerdown', onInteract, true);
    document.removeEventListener('keydown', onInteract, true);
  }

  function bindFirstInteraction() {
    if (interactionBound || userPaused) return;
    interactionBound = true;
    function onInteract() {
      if (userPaused) return;
      playFromUserGesture();
      unbindFirstInteraction(onInteract);
    }
    document.addEventListener('pointerdown', onInteract, true);
    document.addEventListener('keydown', onInteract, true);
  }

  function tryAutoPlay() {
    if (userPaused) {
      restoreTime();
      updateBtn();
      return;
    }
    if (!wasPlaying && !(savedTime > 0)) {
      updateBtn();
      bindFirstInteraction();
      return;
    }
    restoreTime();
    isLoading = true;
    updateBtn();
    var promise = audio.play();
    if (promise && typeof promise.then === 'function') {
      promise.then(playSuccess).catch(function () {
        isLoading = false;
        updateBtn();
        bindFirstInteraction();
      });
    } else {
      playSuccess();
    }
  }

  function attemptCrossPageResume() {
    if (userPaused) {
      restoreTime();
      updateBtn();
      return;
    }
    if (!wasPlaying && !(savedTime > 0)) {
      updateBtn();
      bindFirstInteraction();
      return;
    }
    if (resumeAttempted) return;
    resumeAttempted = true;
    restoreTime();
    tryAutoPlay();
  }

  function toggleBgm(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (audio.paused) {
      playFromUserGesture();
    } else {
      userPaused = true;
      wasPlaying = false;
      sessionStorage.setItem(SK_BGM_PAUSED, 'true');
      sessionStorage.setItem(SK_BGM_WAS_PLAYING, 'false');
      audio.pause();
      isLoading = false;
      updateBtn();
    }
  }

  function onAudioSourceError() {
    if (audio.dataset.fallbackApplied === '1') {
      markLoadError();
      return;
    }
    var m4aSource = audio.querySelector('source[type="audio/mp4"]');
    if (m4aSource && m4aSource.getAttribute('src')) {
      audio.dataset.fallbackApplied = '1';
      audio.src = m4aSource.getAttribute('src');
      audio.load();
      return;
    }
    markLoadError();
  }

  audio.addEventListener('loadedmetadata', restoreTime);
  audio.addEventListener('canplay', attemptCrossPageResume);
  audio.addEventListener('play', updateBtn);
  audio.addEventListener('pause', updateBtn);
  audio.addEventListener('error', onAudioSourceError);
  audio.addEventListener('timeupdate', function () {
    if (!audio.paused && audio.currentTime > 0) {
      saveBgmState();
    }
  });

  window.addEventListener('pagehide', saveBgmState);
  window.addEventListener('beforeunload', saveBgmState);
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      updateBtn();
      return;
    }
    if (!userPaused && sessionStorage.getItem(SK_BGM_WAS_PLAYING) === 'true' && audio.paused) {
      wasPlaying = true;
      savedTime = parseFloat(sessionStorage.getItem(SK_BGM_TIME) || '0');
      attemptCrossPageResume();
    }
  });

  document.addEventListener('siteSplashDone', function () {
    if (!userPaused) {
      attemptCrossPageResume();
    }
  });

  btns.forEach(function (btn) {
    btn.addEventListener('click', toggleBgm);
  });

  if (window.location.protocol === 'file:') {
    setBtnText('请用服务器');
    btns.forEach(function (btn) {
      btn.title = '本地双击打开无法播放音乐，请用 python -m http.server 8080 后访问 http://localhost:8080/index.html';
    });
    return;
  }

  /* 直接使用 HTML 内 <source>，避免 HEAD 请求延迟导致跨页续播中断 */
  audio.load();
  if (audio.readyState >= 1) {
    attemptCrossPageResume();
  } else {
    audio.addEventListener('loadedmetadata', attemptCrossPageResume, { once: true });
  }
  updateBtn();
}

function revealHomeHeroPhoto() {
  if (!document.body.classList.contains('page-home')) return;
  document.body.classList.add('hero-photo-ready');
}

function initSiteSplash() {
  var splash = document.getElementById('siteSplash');
  if (!splash) {
    revealHomeHeroPhoto();
    return;
  }

  function finishSplash() {
    document.body.classList.remove('is-splash-active');
    revealHomeHeroPhoto();
    document.dispatchEvent(new CustomEvent('siteSplashDone'));
  }

  if (sessionStorage.getItem('siteSplashShown') === 'true') {
    splash.parentNode.removeChild(splash);
    finishSplash();
    return;
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    splash.parentNode.removeChild(splash);
    sessionStorage.setItem('siteSplashShown', 'true');
    finishSplash();
    return;
  }

  document.body.classList.add('is-splash-active');
  sessionStorage.setItem('siteSplashShown', 'true');

  window.setTimeout(function () {
    splash.classList.add('is-fading');
    window.setTimeout(function () {
      if (splash.parentNode) splash.parentNode.removeChild(splash);
      finishSplash();
    }, 650);
  }, 1500);
}

function initNorthBrandHub() {
  var hub = document.querySelector('.north-brand-hub');
  if (!hub) return;

  var picks = hub.querySelectorAll('.north-brand-pick[data-brand]');
  var panels = hub.querySelectorAll('.north-brand-detail[data-brand]');
  var stage = hub.querySelector('.north-brand-stage');
  if (!picks.length || !panels.length) return;

  var activeBrand = 'quanjude';

  function setActiveBrand(brand, options) {
    options = options || {};
    if (!brand || brand === activeBrand) return;
    activeBrand = brand;

    picks.forEach(function (pick) {
      var isActive = pick.getAttribute('data-brand') === brand;
      pick.classList.toggle('is-active', isActive);
      pick.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    panels.forEach(function (panel) {
      var isActive = panel.getAttribute('data-brand') === brand;
      panel.classList.toggle('is-active', isActive);
      panel.hidden = !isActive;
    });

    document.querySelectorAll('.page-jump-link[data-brand]').forEach(function (link) {
      link.classList.toggle('is-active', link.getAttribute('data-brand') === brand);
    });

    if (options.scroll && stage) {
      window.setTimeout(function () {
        scrollToTarget(stage, false);
      }, 60);
    }
  }

  picks.forEach(function (pick) {
    var brand = pick.getAttribute('data-brand');

    pick.addEventListener('mouseenter', function () {
      setActiveBrand(brand);
    });

    pick.addEventListener('focus', function () {
      setActiveBrand(brand);
    });

    pick.addEventListener('click', function () {
      setActiveBrand(brand, { scroll: true });
    });
  });

  document.querySelectorAll('.page-jump-link[data-brand]').forEach(function (link) {
    link.addEventListener('click', function () {
      var brand = link.getAttribute('data-brand');
      if (brand) {
        window.setTimeout(function () {
          setActiveBrand(brand);
        }, 80);
      }
    });
  });

  var hash = window.location.hash.replace('#', '');
  if (hash && hub.querySelector('#' + hash)) {
    var matched = hub.querySelector('.north-brand-detail#' + hash);
    if (matched) {
      setActiveBrand(matched.getAttribute('data-brand'));
    }
  }
}

function initHomeHeroReveal() {
  var hero = document.getElementById('home-hero');
  var target = document.getElementById('home-start');
  if (!hero || !target) return;

  var hitarea = hero.querySelector('.home-immersive-hitarea');
  var scrollLink = hero.querySelector('.home-immersive-scroll');
  var revealing = false;
  var revealed = false;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var REVEAL_MS = 1280;
  var SCROLL_DELAY = 360;
  var SCROLL_MS = 1100;

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function smoothScrollTo(targetY, duration, delay) {
    window.setTimeout(function () {
      var startY = window.scrollY;
      var distance = targetY - startY;
      if (Math.abs(distance) < 2) return;
      var startTime = null;

      function step(now) {
        if (startTime === null) startTime = now;
        var progress = Math.min((now - startTime) / duration, 1);
        var eased = easeInOutCubic(progress);
        window.scrollTo(0, startY + distance * eased);
        if (progress < 1) {
          requestAnimationFrame(step);
        }
      }

      requestAnimationFrame(step);
    }, delay);
  }

  function scrollToContent() {
    if (reduceMotion) {
      window.scrollTo(0, 0);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (history.replaceState) {
      history.replaceState(null, '', '#home-start');
    }
  }

  function finishReveal() {
    hero.classList.remove('is-revealing');
    hero.classList.add('is-revealed');
    document.body.classList.remove('is-entering', 'home-hero-fullscreen');
    document.body.classList.add('home-has-entered');
    document.body.style.overflow = '';
    revealed = true;
    revealing = false;
  }

  function startReveal() {
    if (revealing || revealed) return;
    revealing = true;
    document.body.classList.remove('home-hero-fullscreen');
    document.body.classList.add('is-entering');

    if (reduceMotion) {
      hero.classList.add('is-revealing', 'is-revealed');
      document.body.classList.remove('home-hero-fullscreen');
      document.body.classList.add('home-has-entered');
      document.body.style.overflow = '';
      scrollToContent();
      revealed = true;
      revealing = false;
      return;
    }

    hero.classList.add('is-revealing');
    scrollToContent();
    window.setTimeout(finishReveal, REVEAL_MS);
  }

  if (hitarea) {
    hitarea.addEventListener('click', function (e) {
      e.preventDefault();
      startReveal();
    });
  }

  if (scrollLink) {
    scrollLink.addEventListener('click', function (e) {
      if (revealed) return;
      e.preventDefault();
      startReveal();
    });
  }

  if (window.location.hash === '#home-start') {
    document.body.classList.add('home-has-entered', 'hero-photo-ready');
    document.body.style.overflow = '';
    hero.classList.add('is-revealed');
    revealed = true;
  } else {
    document.body.classList.add('home-hero-fullscreen');
    if (document.body.classList.contains('is-splash-active')) {
      document.addEventListener('siteSplashDone', function () {
        if (!revealed) document.body.style.overflow = 'hidden';
      }, { once: true });
    } else {
      document.body.style.overflow = 'hidden';
    }
  }
}

function initHomeParallax() {
  var photo = document.getElementById('homeParallaxPhoto');
  if (!photo) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var ticking = false;

  function updateParallax() {
    if (!document.body.classList.contains('home-has-entered')) {
      photo.style.transform = 'translate3d(0, 0, 0) scale(1.06)';
      ticking = false;
      return;
    }
    var offset = window.scrollY * 0.35;
    photo.style.transform = 'translate3d(0, ' + (-offset) + 'px, 0) scale(1.06)';
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });

  updateParallax();
}

function initHomeNavScroll() {
  var nav = document.getElementById('homeGlassNav');
  if (!nav) return;

  var threshold = 150;

  function onScroll() {
    nav.classList.toggle('is-scrolled', window.scrollY > threshold);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function initDecorativeSearch() {
  document.querySelectorAll('.nav-search-input').forEach(function (input) {
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', function () {
  initSiteSplash();
  initSiteBgm();
  initDecorativeSearch();
  initNavigation();
  initCarousel();
  initFormValidation();
  initScrollReveal();
  initImageModal();
  initBackToTop();
  initHeritageCounters();
  initHeritageTimeline();
  initHeritageVideo();
  initNorthBrandHub();
  initHomeHeroReveal();
  initHomeParallax();
  initHomeNavScroll();
});
