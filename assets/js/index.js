async function renderProducts(filter = 'all') {
    const container = document.getElementById('product-grid');
    if (!container) return; // Guard clause

    // Show loading state
    container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px;"><p>جاري تحميل المنتجات...</p></div>';

    const products = await getProducts();

    container.innerHTML = '';

    const filteredProducts = filter === 'all'
        ? products
        : products.filter(p => p.category === filter);

    if (filteredProducts.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">لا توجد منتجات متاحة حالياً.</p>';
        return;
    }

    filteredProducts.forEach(product => {
        const card = document.createElement('article');
        card.className = 'product-card';
        card.style.backgroundColor = '#fff';
        card.style.borderRadius = '8px';
        card.style.overflow = 'hidden';
        card.style.boxShadow = 'var(--shadow-sm)';
        card.style.transition = 'var(--transition)';
        card.style.cursor = 'pointer';

        // Prepare Image
        const mainImage = (product.images && product.images.length > 0)
            ? product.images[0]
            : (product.image || 'assets/images/placeholder.jpg');

        card.innerHTML = `
      <div style="position: relative; height: 300px; overflow: hidden;">
        <span class="badge" style="
          position: absolute; 
          top: 10px; 
          right: 10px; 
          background: var(--accent-color); 
          color: #fff; 
          padding: 4px 10px; 
          border-radius: 4px; 
          font-size: 0.8rem;">
          ${product.category === 'men' ? 'رجالي' : (product.category === 'women' ? 'حريمي' : product.category)}
        </span>
        <img src="${mainImage}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s;">
      </div>
      <div style="padding: 20px;">
        <h3 style="font-size: 1.1rem; margin-bottom: 10px;">${product.name}</h3>
        <div style="display: flex; align-items: center; gap: 10px;">
           <p style="font-weight: bold; color: var(--accent-color); font-size: 1.2rem;">${product.price} ج.م</p>
           ${product.old_price ? `<p style="text-decoration: line-through; color: #999; font-size: 1rem;">${product.old_price} ج.م</p>` : ''}
        </div>
      </div>
    `;

        // Add click event to navigate
        card.addEventListener('click', () => {
            window.location.href = `product.html?${product.label ? 'label=' + product.label : 'id=' + product.id}`;
        });

        container.appendChild(card);
    });
}

function filterProducts(category) {
    // Update active state in navbar
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
    });

    // Re-render
    renderProducts(category);
}

// Initial Render
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('product-grid');
    if (container) {
        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get('category');

        if (categoryParam) {
            renderProducts(categoryParam);
        } else {
            renderProducts('all');
        }
    }
});
