// Update Cart Count in Navbar
function updateCartCount() {
    const cart = getCart(); // Assumes storage.js is loaded
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const badge = document.querySelector('.cart-count');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }
}

// Toast Notification
function showToast(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    initDynamicNavbar();
});

// Dynamic Navbar: Fetch categories from DB
async function initDynamicNavbar() {
    const navUl = document.querySelector('.nav-links');
    if (!navUl) return;

    // Use current products if available (optimization) 
    // but better to fetch fresh to ensure nav is correct on all pages
    // We can rely on storage.js getProducts which is cached only if we implemented cache (we didn't yet)
    // For now, simple fetch is fine.

    // We already have Supabase Client initialized
    if (typeof getProducts !== 'function') return;

    const products = await getProducts();
    if (!products.length) return;

    // Extract unique categories
    const categories = [...new Set(products.map(p => p.category))];

    // Build HTML
    // Always keep "Home" and "All Products"
    let html = `
        <li><a href="index.html">الرئيسية</a></li>
        <li><a href="index.html" onclick="filterProducts('all'); return false;">كل المنتجات</a></li>
    `;

    categories.forEach(cat => {
        // Translation map (optional, else show raw)
        const displayMap = {
            'men': 'رجالي',
            'women': 'حريمي',
            'kids': 'أطفال',
            'accessories': 'إكسسوارات'
        };
        const displayName = displayMap[cat] || cat; // Fallback to raw value

        // Check if we are on index page to use onclick filter, else link with param
        const isIndex = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/');

        if (isIndex) {
            html += `<li><a href="#" onclick="filterProducts('${cat}'); return false;">${displayName}</a></li>`;
        } else {
            html += `<li><a href="index.html?category=${cat}">${displayName}</a></li>`;
        }
    });

    navUl.innerHTML = html;
}

// Mobile Menu Toggle
function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    const overlay = document.getElementById('menuOverlay');

    if (navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        overlay.classList.remove('active');
    } else {
        navLinks.classList.add('active');
        overlay.classList.add('active');
    }
}


/* --- Hero Slider Logic --- */
document.addEventListener('DOMContentLoaded', () => {
    initHeroSlider();
});

function initHeroSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    const dotsContainer = document.getElementById('heroSliderDots');
    const prevBtn = document.getElementById('heroPrev');
    const nextBtn = document.getElementById('heroNext');

    if (!slides.length) return;

    let currentSlide = 0;
    const totalSlides = slides.length;
    let autoSlideInterval;

    // Create Dots
    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('slider-dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll('.slider-dot');

    function updateSlides() {
        slides.forEach((slide, index) => {
            slide.classList.remove('active');
            dots[index].classList.remove('active');
            if (index === currentSlide) {
                slide.classList.add('active');
                dots[index].classList.add('active');
            }
        });
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateSlides();
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        updateSlides();
    }

    function goToSlide(index) {
        currentSlide = index;
        updateSlides();
        resetTimer();
    }

    function resetTimer() {
        clearInterval(autoSlideInterval);
        autoSlideInterval = setInterval(nextSlide, 5000);
    }

    // Event Listeners
    if (nextBtn) nextBtn.addEventListener('click', () => {
        nextSlide();
        resetTimer();
    });

    if (prevBtn) prevBtn.addEventListener('click', () => {
        prevSlide();
        resetTimer();
    });

    // Auto Play
    resetTimer();
}
