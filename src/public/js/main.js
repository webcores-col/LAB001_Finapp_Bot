// Finance Bot - Client-side JavaScript
// Minimalista y eficiente

(function() {
  'use strict';

  // Smooth scroll para links internos
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Copiar comando al hacer click
  document.querySelectorAll('.command-syntax, .command-example').forEach(el => {
    el.style.cursor = 'pointer';
    el.title = 'Click para copiar';

    el.addEventListener('click', async function() {
      const text = this.textContent.trim();

      try {
        await navigator.clipboard.writeText(text);

        // Feedback visual
        const original = this.textContent;
        const originalBg = this.style.background;

        this.textContent = '✓ Copiado!';
        this.style.background = 'var(--emerald-100)';

        setTimeout(() => {
          this.textContent = original;
          this.style.background = originalBg;
        }, 1500);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    });
  });

  // Verificar estado del bot
  async function checkBotStatus() {
    try {
      const response = await fetch('/api/status');
      const data = await response.json();

      // Actualizar badge de status
      const statusBadges = document.querySelectorAll('.badge-success');
      statusBadges.forEach(badge => {
        if (data.status === 'healthy') {
          badge.classList.remove('badge-info');
          badge.classList.add('badge-success');
          const statusText = badge.querySelector('span:last-child');
          if (statusText) statusText.textContent = 'Bot activo';
        }
      });
    } catch (err) {
      console.log('Could not check bot status');
    }
  }

  // Verificar estado al cargar
  checkBotStatus();

  // Animación de entrada para cards
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '0';
        entry.target.style.transform = 'translateY(20px)';
        entry.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, 100);

        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observar todas las cards
  document.querySelectorAll('.card').forEach(card => {
    observer.observe(card);
  });

})();
