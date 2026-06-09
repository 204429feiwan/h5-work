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

function initNavigation() {
  initPageJumpBar();
  initAnchorNavigation();
  initSectionSpy();
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
  var reveals = document.querySelectorAll('.reveal');
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

document.addEventListener('DOMContentLoaded', function () {
  initNavigation();
  initCarousel();
  initFormValidation();
  initScrollReveal();
  initImageModal();
  initBackToTop();
  initHeritageCounters();
  initHeritageTimeline();
  initHeritageVideo();
});
