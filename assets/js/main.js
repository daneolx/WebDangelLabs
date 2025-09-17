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

	// Contact form
	const form = document.getElementById('contactForm');
	const stepper = document.getElementById('stepper');
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
			e.preventDefault();
			const data = new FormData(form);
			console.log('Contacto:', Object.fromEntries(data.entries()));
			alert('¡Gracias! Te contactaremos pronto.');
			form.reset();
			current = 0;
			update();
		});
		update();
	}

	// Portfolio slider
	const slider = document.getElementById('portfolioSlider');
	const prevBtn = document.getElementById('prevBtn');
	const nextBtn = document.getElementById('nextBtn');
	const dotsContainer = document.getElementById('sliderDots');
	
	if (slider && prevBtn && nextBtn && dotsContainer) {
		const items = Array.from(slider.querySelectorAll('.slider-item'));
		const itemsPerView = window.innerWidth >= 768 ? 3 : 1;
		const totalSlides = Math.ceil(items.length / itemsPerView);
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
			const translateX = -currentSlide * (100 / itemsPerView);
			slider.style.transform = `translateX(${translateX}%)`;
			
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
				location.reload(); // Simple solution for demo
			}
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
