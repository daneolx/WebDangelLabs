(function () {
	// Mobile menu
	const burger = document.getElementById('burger');
	const mobileMenu = document.getElementById('mobileMenu');
	if (burger && mobileMenu) {
		burger.addEventListener('click', () => {
			const isOpen = mobileMenu.style.display === 'block';
			mobileMenu.style.display = isOpen ? 'none' : 'block';
			burger.setAttribute('aria-expanded', (!isOpen).toString());
		});
		mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
			mobileMenu.style.display = 'none';
			burger.setAttribute('aria-expanded', 'false');
		}));
	}

	// Contact form: timestamp para anti-spam (mínimo tiempo en formulario)
	const contactFormTs = document.getElementById('contactFormTs');
	if (contactFormTs && !contactFormTs.value) {
		contactFormTs.value = Math.floor(Date.now() / 1000);
	}

	// Contact form
	const form = document.getElementById('contactForm');
	const stepper = document.getElementById('stepper');
	const contactAlert = document.getElementById('contactAlert');
	if (form && stepper) {
		const steps = Array.from(form.querySelectorAll('.step'));
		let current = 0;
		function update() {
			steps.forEach((s, i) => s.classList.toggle('active', i === current));
			const dots = Array.from(stepper.querySelectorAll('.dot'));
			dots.forEach((d, i) => d.classList.toggle('active', i <= current));
		}
		form.addEventListener('click', (e) => {
			const target = e.target;
			if (!(target instanceof HTMLElement)) return;
			if (target.hasAttribute('data-next')) {
				if (current < steps.length - 1) current++;
				update();
			}
			if (target.hasAttribute('data-prev')) {
				if (current > 0) current--;
				update();
			}
		});
		form.addEventListener('submit', (e) => {
			// Si hay action (integración FormSubmit u otro backend), permitir envío real
			if (form.getAttribute('action')) {
				return; // dejar que el navegador envíe el formulario
			}
			// Modo demo (sin action): prevenir y mostrar alerta
			e.preventDefault();
			const data = new FormData(form);
			console.log('Contacto:', Object.fromEntries(data.entries()));
			// Mostrar alerta profesional de éxito
			showContactAlert(
				'success',
				'¡Mensaje enviado correctamente!',
				'Te contactaremos pronto. También puedes escribirnos por WhatsApp si lo prefieres.'
			);
			form.reset();
			current = 0;
			update();
		});
		update();
	}

	// Mostrar mensajes según query param contact_status (y asegurar ancla #contacto)
	if (contactAlert) {
		const params = new URLSearchParams(window.location.search);
		const status = params.get('contact_status');
		if (status === 'ok') {
			showContactAlert('success', '¡Mensaje enviado correctamente!', 'Te contactaremos pronto. Gracias por confiar en nosotros.');
		} else if (status === 'error') {
			showContactAlert('error', 'Error al enviar el mensaje', 'Por favor, inténtalo de nuevo o contáctanos por WhatsApp.');
		}

		// Forzar mantener #contacto en la URL si no está
		if (status && !window.location.hash) {
			window.location.hash = '#contacto';
		}
	}
	
	// Función para mostrar alertas de contacto profesionales
	function showContactAlert(type, title, message) {
		const alert = document.getElementById('contactAlert');
		if (!alert) return;
		
		// Configurar clase y contenido
		alert.className = `contact-alert ${type}`;
		alert.querySelector('.contact-alert__title').textContent = title;
		alert.querySelector('.contact-alert__message').textContent = message;
		
		// Mostrar icono correspondiente
		const successIcon = alert.querySelector('.success-icon');
		const errorIcon = alert.querySelector('.error-icon');
		if (type === 'success') {
			successIcon.style.display = 'block';
			errorIcon.style.display = 'none';
		} else {
			successIcon.style.display = 'none';
			errorIcon.style.display = 'block';
		}
		
		// Mostrar alerta (soporta variante fija o inline)
		alert.style.display = 'block';
		setTimeout(() => alert.classList.add('show'), 50);
		
		// Auto-ocultar después de 6 segundos
		setTimeout(() => {
			alert.classList.remove('show');
			setTimeout(() => {
				alert.style.display = 'none';
				// Limpiar URL (conservando el hash #contacto si existe)
				const url = new URL(window.location);
				url.searchParams.delete('contact_status');
				window.history.replaceState({}, '', url);
			}, 400);
		}, 6000);
	}

	// Portfolio slider
	const slider = document.getElementById('portfolioSlider');
	const prevBtn = document.getElementById('prevBtn');
	const nextBtn = document.getElementById('nextBtn');
	const dotsContainer = document.getElementById('sliderDots');
	
	if (slider && prevBtn && nextBtn && dotsContainer) {
		const items = Array.from(slider.querySelectorAll('.slider-item'));
		let itemsPerView = window.innerWidth >= 768 ? 3 : 1;
		let totalSlides = Math.ceil(items.length / itemsPerView);
		let currentSlide = 0;
		let autoplayInterval;

		// Create dots
		function createDots() {
			dotsContainer.innerHTML = '';
			for (let i = 0; i < totalSlides; i++) {
				const dot = document.createElement('button');
				dot.className = 'slider-dot';
				if (i === 0) dot.classList.add('active');
				dot.addEventListener('click', () => goToSlide(i));
				dotsContainer.appendChild(dot);
			}
		}

		// Update slider position
		function updateSlider() {
			const styles = getComputedStyle(slider);
			const gapPx = parseFloat(styles.gap) || 0;
			const itemWidth = items[0] ? items[0].getBoundingClientRect().width : 0;
			const pageWidth = itemWidth * itemsPerView + gapPx * (itemsPerView - 1);
			const translateX = -currentSlide * pageWidth;
			slider.style.transform = `translateX(${translateX}px)`;
			
			// Update dots
			const dots = Array.from(dotsContainer.querySelectorAll('.slider-dot'));
			dots.forEach((dot, i) => {
				dot.classList.toggle('active', i === currentSlide);
			});

			// Update button states
			prevBtn.disabled = currentSlide === 0;
			nextBtn.disabled = currentSlide === totalSlides - 1;
		}

		// Go to specific slide
		function goToSlide(slideIndex) {
			currentSlide = Math.max(0, Math.min(slideIndex, totalSlides - 1));
			updateSlider();
		}

		// Next slide
		function nextSlide() {
			if (currentSlide < totalSlides - 1) {
				currentSlide++;
				updateSlider();
			}
		}

		// Previous slide
		function prevSlide() {
			if (currentSlide > 0) {
				currentSlide--;
				updateSlider();
			}
		}

		// Autoplay
		function startAutoplay() {
			autoplayInterval = setInterval(() => {
				if (currentSlide < totalSlides - 1) {
					nextSlide();
				} else {
					currentSlide = 0;
					updateSlider();
				}
			}, 4000);
		}

		function stopAutoplay() {
			if (autoplayInterval) {
				clearInterval(autoplayInterval);
			}
		}

		// Event listeners
		nextBtn.addEventListener('click', () => {
			nextSlide();
			stopAutoplay();
			startAutoplay();
		});

		prevBtn.addEventListener('click', () => {
			prevSlide();
			stopAutoplay();
			startAutoplay();
		});

		// Pause autoplay on hover
		slider.addEventListener('mouseenter', stopAutoplay);
		slider.addEventListener('mouseleave', startAutoplay);

		// Touch/swipe support
		let startX = 0;
		let isDragging = false;

		slider.addEventListener('touchstart', (e) => {
			startX = e.touches[0].clientX;
			isDragging = true;
			stopAutoplay();
		});

		slider.addEventListener('touchmove', (e) => {
			if (!isDragging) return;
			e.preventDefault();
		});

		slider.addEventListener('touchend', (e) => {
			if (!isDragging) return;
			isDragging = false;
			
			const endX = e.changedTouches[0].clientX;
			const diff = startX - endX;
			
			if (Math.abs(diff) > 50) {
				if (diff > 0) {
					nextSlide();
				} else {
					prevSlide();
				}
			}
			
			startAutoplay();
		});

		// Initialize
		createDots();
		updateSlider();
		startAutoplay();

		// Handle resize
		window.addEventListener('resize', () => {
			const newItemsPerView = window.innerWidth >= 768 ? 3 : 1;
			if (newItemsPerView !== itemsPerView) {
				itemsPerView = newItemsPerView;
				totalSlides = Math.ceil(items.length / itemsPerView);
				if (currentSlide > totalSlides - 1) currentSlide = Math.max(0, totalSlides - 1);
				createDots();
				updateSlider();
			}
			// Recalcular posición aunque no cambie itemsPerView (por cambios de ancho)
			updateSlider();
		});
	}

	// Scroll to top button
	const scrollToTopBtn = document.getElementById('scrollToTop');
	
	if (scrollToTopBtn) {
		// Show/hide button based on scroll position
		window.addEventListener('scroll', () => {
			if (window.pageYOffset > 300) {
				scrollToTopBtn.classList.add('visible');
			} else {
				scrollToTopBtn.classList.remove('visible');
			}
		});

		// Smooth scroll to top when clicked
		scrollToTopBtn.addEventListener('click', () => {
			window.scrollTo({
				top: 0,
				behavior: 'smooth'
			});
		});
	}
})();
