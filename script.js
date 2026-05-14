/**
 * Gushwork - Main JavaScript
 * Handles: Sticky header, Image carousel with zoom, Mobile nav, Scroll animations
 */

document.addEventListener('DOMContentLoaded', () => {
  // ===== STICKY HEADER =====
  const stickyHeader = document.getElementById('sticky-header');
  const hero = document.getElementById('hero');
  let lastScrollY = 0;
  let ticking = false;

  /** Show/hide sticky header based on scroll position relative to first fold */
  function handleStickyHeader() {
    const currentScrollY = window.scrollY;
    const heroBottom = hero.offsetTop + hero.offsetHeight;
    const scrollingDown = currentScrollY > lastScrollY;

    if (currentScrollY > heroBottom && scrollingDown) {
      // Past first fold AND scrolling down: show sticky header
      stickyHeader.classList.add('visible');
    } else if (!scrollingDown && currentScrollY > heroBottom) {
      // Past first fold BUT scrolling up: hide sticky header
      stickyHeader.classList.remove('visible');
    } else {
      // Still in first fold: hide sticky header
      stickyHeader.classList.remove('visible');
    }
    lastScrollY = currentScrollY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(handleStickyHeader);
      ticking = true;
    }
  }, { passive: true });

  // ===== MOBILE NAVIGATION =====
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');

  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    hamburger.classList.toggle('active');
    // Animate hamburger icon
    const spans = hamburger.querySelectorAll('span');
    if (navLinks.classList.contains('open')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });

  // Close mobile nav on link click
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('active');
      const spans = hamburger.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    });
  });

  // ===== IMAGE CAROUSEL =====
  const track = document.getElementById('carousel-track');
  const slides = track.querySelectorAll('.carousel-slide');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const dotsContainer = document.getElementById('carousel-dots');
  const zoomPreview = document.getElementById('zoom-preview');
  const zoomImg = document.getElementById('zoom-preview-img');

  let currentIndex = 0;
  let slidesPerView = 3;
  let autoPlayTimer;

  /** Calculate how many slides to show based on viewport */
  function getSlidesPerView() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  /** Get total number of "pages" for dot navigation */
  function getTotalPages() {
    return Math.max(1, slides.length - slidesPerView + 1);
  }

  /** Create dot indicators */
  function createDots() {
    dotsContainer.innerHTML = '';
    const totalPages = getTotalPages();
    for (let i = 0; i < totalPages; i++) {
      const dot = document.createElement('button');
      dot.classList.add('carousel-dot');
      if (i === 0) dot.classList.add('active');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => goToSlide(i));
      dotsContainer.appendChild(dot);
    }
  }

  /** Move carousel to a specific slide index */
  function goToSlide(index) {
    const totalPages = getTotalPages();
    currentIndex = Math.max(0, Math.min(index, totalPages - 1));

    const slideWidth = slides[0].getBoundingClientRect().width;
    const gap = 20;
    const offset = currentIndex * (slideWidth + gap);
    track.style.transform = `translateX(-${offset}px)`;

    // Update dots
    dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  }

  prevBtn.addEventListener('click', () => {
    goToSlide(currentIndex - 1);
    resetAutoPlay();
  });

  nextBtn.addEventListener('click', () => {
    goToSlide(currentIndex + 1);
    resetAutoPlay();
  });

  /** Auto-play carousel */
  function startAutoPlay() {
    autoPlayTimer = setInterval(() => {
      const totalPages = getTotalPages();
      goToSlide(currentIndex >= totalPages - 1 ? 0 : currentIndex + 1);
    }, 4000);
  }

  function resetAutoPlay() {
    clearInterval(autoPlayTimer);
    startAutoPlay();
  }

  // ===== CAROUSEL ZOOM ON HOVER =====
  slides.forEach(slide => {
    const img = slide.querySelector('img');

    slide.addEventListener('mouseenter', () => {
      zoomImg.src = img.src;
      zoomImg.alt = img.alt;
      zoomPreview.classList.add('active');
    });

    slide.addEventListener('mousemove', (e) => {
      // Calculate relative position within the slide for panning effect
      const rect = slide.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      // Apply a subtle transform to create a pan/zoom effect on the preview
      zoomImg.style.transformOrigin = `${x}% ${y}%`;
      zoomImg.style.transform = `scale(1.8)`;
    });

    slide.addEventListener('mouseleave', () => {
      zoomPreview.classList.remove('active');
      zoomImg.style.transform = '';
    });
  });

  // Handle resize: recalculate slides per view
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      slidesPerView = getSlidesPerView();
      createDots();
      goToSlide(Math.min(currentIndex, getTotalPages() - 1));
    }, 200);
  });

  // Initialize carousel
  slidesPerView = getSlidesPerView();
  createDots();
  startAutoPlay();

  // ===== SCROLL REVEAL ANIMATIONS =====
  const revealElements = document.querySelectorAll(
    '.product-card, .process-layout, .cta-card, .section-badge, .section-title'
  );

  revealElements.forEach(el => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  revealElements.forEach(el => revealObserver.observe(el));

  // ===== ACTIVE NAV LINK TRACKING =====
  const sections = document.querySelectorAll('section[id]');
  const navLinksAll = document.querySelectorAll('.nav-link');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinksAll.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(section => sectionObserver.observe(section));

  // ===== FORM HANDLING =====
  const form = document.getElementById('contact-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = document.getElementById('submit-btn');
    btn.textContent = 'Sending...';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = '✓ Request Sent!';
      btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
      setTimeout(() => {
        btn.textContent = 'Submit Request';
        btn.style.background = '';
        btn.disabled = false;
        form.reset();
      }, 2500);
    }, 1200);
  });

  // ===== SMOOTH SCROLL for anchor links =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
});
