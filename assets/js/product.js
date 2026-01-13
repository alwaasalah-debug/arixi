// Helper to get params
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');
const productLabel = urlParams.get('label');

let currentProduct = null;
let selectedSize = null;
let selectedColor = null;
let currentImageIndex = 0;

async function renderProductDetails() {
  const container = document.getElementById('product-content');
  if (!container) return;

  container.innerHTML = '<div style="text-align: center; width: 100%; padding: 50px;">جاري التحميل...</div>';

  if (!productId && !productLabel) {
    window.location.href = 'index.html';
    return;
  }

  // Optimize: Try fetching single product first if ID exists
  if (productId) {
    currentProduct = await getProductById(productId);
  }
  // Fallback or Label search
  else {
    const products = await getProducts();
    currentProduct = products.find(p => p.label === productLabel);
  }

  if (!currentProduct) {
    container.innerHTML = '<h2>المنتج غير موجود</h2>';
    return;
  }

  // Ensure images array & Fallbacks
  const images = (currentProduct.images && currentProduct.images.length > 0)
    ? currentProduct.images
    : (currentProduct.image ? [currentProduct.image] : ['assets/images/placeholder.jpg']);

  // Preload images
  preloadImages(images);

  // Generates S/C HTML (assuming sizes/colors defined)
  const sizes = currentProduct.sizes || [];
  const sizesHtml = sizes.map(size =>
    `<div class="option-btn size-opt" onclick="selectSize(this, '${size}')">${size}</div>`
  ).join('');

  const colors = currentProduct.colors || [];
  const colorsHtml = colors.map(color =>
    `<div class="option-btn color-opt" onclick="selectColor(this, '${color}')">${color}</div>`
  ).join('');

  const imageHtml = `
  <div class="slider-container">
    <img id="main-product-img" src="${images[0]}" alt="${currentProduct.name}" class="slider-img">
      ${images.length > 1 ? `
        <div class="slider-controls">
            <button class="slider-btn prev-btn" onclick="nextImage()">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
            
            <button class="slider-btn next-btn" onclick="prevImage()">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        </div>
        ` : ''}
  </div>`;

  container.innerHTML = `
    <div class="product-image">
      ${imageHtml}
    </div>
    <div class="product-info">
      <div class="product-header">
          <h1>${currentProduct.name}</h1>
          <button class="share-btn" onclick="shareProduct('${currentProduct.name}', '${window.location.href}')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                  <polyline points="16 6 12 2 8 6"></polyline>
                  <line x1="12" y1="2" x2="12" y2="15"></line>
              </svg>
              مشاركة
          </button>
      </div>

      <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
        <span class="product-price">${currentProduct.price} ج.م</span>
        ${currentProduct.old_price ? `<span style="text-decoration: line-through; color: #999; font-size: 1.2rem;">${currentProduct.old_price} ج.م</span>` : ''}
      </div>
      
      <div class="option-group">
        <span class="option-title">المقاس:</span>
        <div class="options-container" id="sizes-container">
          ${sizesHtml}
        </div>
      </div>

      <div class="option-group">
        <span class="option-title">اللون:</span>
        <div class="options-container" id="colors-container">
          ${colorsHtml}
        </div>
      </div>

      ${currentProduct.details ? `
      <div class="product-description-section">
          <span class="product-description-title">تفاصيل المنتج:</span>
          <p class="product-description-text">${currentProduct.details}</p>
      </div>
      ` : ''}

      <button onclick="handleAddToCart()" class="btn add-to-cart-btn">إضافة إلى السلة</button>
    </div>
  `;
}

function nextImage() {
  const images = (currentProduct.images && currentProduct.images.length > 0) ? currentProduct.images : [currentProduct.image];
  currentImageIndex = (currentImageIndex + 1) % images.length;
  updateSliderImage();
}

function prevImage() {
  const images = (currentProduct.images && currentProduct.images.length > 0) ? currentProduct.images : [currentProduct.image];
  currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
  updateSliderImage();
}

function updateSliderImage() {
  const img = document.getElementById('main-product-img');
  const images = (currentProduct.images && currentProduct.images.length > 0) ? currentProduct.images : [currentProduct.image];

  // Smooth CSS transition
  img.style.opacity = '0.5';

  // Short delay to trigger the transition effect
  setTimeout(() => {
    img.src = images[currentImageIndex];
    img.style.opacity = '1';
  }, 100);
}

function preloadImages(imageUrls) {
  imageUrls.forEach(url => {
    const img = new Image();
    img.src = url;
  });
}

function selectSize(element, size) {
  selectedSize = size;
  document.querySelectorAll('.size-opt').forEach(el => el.classList.remove('selected'));
  element.classList.add('selected');
}

function selectColor(element, color) {
  selectedColor = color;
  document.querySelectorAll('.color-opt').forEach(el => el.classList.remove('selected'));
  element.classList.add('selected');
}

function handleAddToCart() {
  if (!selectedSize || !selectedColor) {
    showToast('يرجى اختيار المقاس واللون أولاً');
    return;
  }
  addToCart(currentProduct, 1, selectedSize, selectedColor);
}

function shareProduct(title, url) {
  if (navigator.share) {
    navigator.share({
      title: title,
      url: url
    }).catch(err => {
      console.log('Error sharing:', err);
      // Fallback
      copyToClipboard(url);
    });
  } else {
    // Fallback
    copyToClipboard(url);
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('تم نسخ الرابط!');
  }).catch(err => {
    alert('تم نسخ الرابط: ' + text);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderProductDetails();
});
