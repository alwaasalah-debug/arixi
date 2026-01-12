const governorates = {
  // Delta (50)
  'cairo': { name: 'القاهرة', price: 50 },
  'giza': { name: 'الجيزة', price: 50 },
  'alex': { name: 'الإسكندرية', price: 50 },
  'tanta': { name: 'طنطا', price: 50 },
  'mansoura': { name: 'المنصورة', price: 50 },
  // Upper Egypt (100)
  'aswan': { name: 'أسوان', price: 100 },
  'luxor': { name: 'الأقصر', price: 100 },
  'sohag': { name: 'سوهاج', price: 100 },
  'qena': { name: 'قنا', price: 100 },
  'assuit': { name: 'أسيوط', price: 100 },
  // Middle Egypt/Canal (70)
  'suez': { name: 'السويس', price: 70 },
  'ismailia': { name: 'الإسماعيلية', price: 70 },
  'fayoum': { name: 'الفيوم', price: 70 },
  'beni_suef': { name: 'بني سويف', price: 70 },
  'minya': { name: 'المنيا', price: 70 },
  // Others
  'other': { name: 'محافظات أخرى', price: 70 }
};

let shippingCost = 0;
let subtotal = 0;

function renderCartItem(item) {
  return `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div class="item-details" style="flex-grow: 1;">
        <h3>${item.name}</h3>
        <div class="item-meta">
          المقاس: ${item.size} | اللون: ${item.color}
        </div>
        <div class="item-controls">
          <div class="qty-wrapper">
            <button class="qty-btn" onclick="updateQty('${item.id}', ${item.quantity + 1})">+</button>
            <input type="number" min="1" value="${item.quantity}" class="qty-input" readonly>
            <button class="qty-btn" onclick="updateQty('${item.id}', ${item.quantity - 1})">-</button>
          </div>
          <span style="font-weight: 500;">${item.price * item.quantity} ج.م</span>
        </div>
      </div>
      <button class="remove-btn" onclick="removeItem('${item.id}')">حذف</button>
    </div>
  `;
}

function renderCart() {
  const container = document.getElementById('cart-content-wrapper');
  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 50px;">
        <h2>سلة التسوق فارغة</h2>
        <a href="index.html" class="btn mt-2">تسوق الآن</a>
      </div>
    `;
    updateCartCount();
    return;
  }

  // Calculate Subtotal
  subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Generate Options
  let optionsHtml = '<option value="" disabled selected>اختر المحافظة لحساب الشحن</option>';
  for (const [key, data] of Object.entries(governorates)) {
    optionsHtml += `<option value="${key}">${data.name}</option>`;
  }

  const itemsHtml = cart.map(renderCartItem).join('');

  container.innerHTML = `
    <div class="cart-container">
      <div class="cart-items">
        ${itemsHtml}
      </div>
      
      <div class="cart-summary">
        <h3 class="mb-1">بيانات العميل</h3>
        
        <!-- Customer Info Form -->
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 5px; font-size: 0.9rem;">الاسم الكامل *</label>
          <input type="text" id="customer-name" class="form-control" placeholder="أدخل اسمك" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 15px;">
          
          <label style="display: block; margin-bottom: 5px; font-size: 0.9rem;">رقم الهاتف *</label>
          <input type="tel" id="customer-phone" class="form-control" placeholder="01xxxxxxxxx" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 15px;">
          
          <label style="display: block; margin-bottom: 5px; font-size: 0.9rem;">العنوان بالتفصيل</label>
          <textarea id="customer-address" class="form-control" placeholder="الشارع - المنطقة - معلومات إضافية" rows="2" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 15px; resize: vertical;"></textarea>
          
          <label style="display: block; margin-bottom: 5px; font-size: 0.9rem;">المحافظة *</label>
          <select id="gov-select" class="shipping-select" onchange="calculateShipping(this.value)">
            ${optionsHtml}
          </select>
        </div>

        <h3 class="mb-1" style="margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border-color);">ملخص الطلب</h3>
        
        <div class="summary-row">
          <span>مجموع المنتجات</span>
          <span>${subtotal} ج.م</span>
        </div>
        
        <div class="summary-row">
          <span>الشحن</span>
          <span id="shipping-display">--</span>
        </div>
        
        <div class="summary-row summary-total">
          <span>الإجمالي</span>
          <span id="total-display">${subtotal} ج.م</span>
        </div>
        
        <button class="btn" style="width: 100%; margin-top: 15px;" onclick="checkoutWhatsApp()">إتمام الطلب عبر واتساب</button>
        <button class="btn btn-outline" style="width: 100%; margin-top: 10px;" onclick="checkoutCOD()">الدفع عند الاستلام</button>
      </div>
    </div>
  `;
}

function updateQty(itemId, newQty) {
  let cart = getCart();
  const item = cart.find(i => i.id === itemId);
  if (item && newQty >= 1) {
    item.quantity = parseInt(newQty);
    saveCart(cart);
    renderCart(); // Re-render to update totals
    updateCartCount();
  }
}

function removeItem(itemId) {
  if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
    removeFromCart(itemId);
    renderCart();
  }
}

function calculateShipping(govKey) {
  if (governorates[govKey]) {
    shippingCost = governorates[govKey].price;
    document.getElementById('shipping-display').textContent = shippingCost + ' ج.م';
    document.getElementById('total-display').textContent = (subtotal + shippingCost) + ' ج.م';
  }
}

function checkoutWhatsApp() {
  // Get customer data
  const name = document.getElementById('customer-name').value.trim();
  const phone = document.getElementById('customer-phone').value.trim();
  const address = document.getElementById('customer-address').value.trim();
  const govSelect = document.getElementById('gov-select');

  // Validation
  if (!name) {
    showToast('يرجى إدخال الاسم');
    document.getElementById('customer-name').focus();
    return;
  }

  if (!phone) {
    showToast('يرجى إدخال رقم الهاتف');
    document.getElementById('customer-phone').focus();
    return;
  }

  if (!govSelect.value) {
    showToast('يرجى اختيار المحافظة');
    return;
  }

  const cart = getCart();
  let message = `مرحباً، أنا ${name}%0a`;
  message += `رقم الهاتف: ${phone}%0a`;
  if (address) message += `العنوان: ${address}%0a`;
  message += `%0aأرغب في طلب المنتجات التالية:%0a%0a`;

  cart.forEach(item => {
    message += `- ${item.name} (مقاس: ${item.size}, لون: ${item.color}) × ${item.quantity}%0a`;
  });

  message += `%0aالمحافظة: ${governorates[govSelect.value].name}`;
  message += `%0aالشحن: ${shippingCost} ج.م`;
  message += `%0aالإجمالي النهائي: ${subtotal + shippingCost} ج.م`;

  window.open(`https://wa.me/?text=${message}`, '_blank');
}

// Override logic: Use fetch for smoother UX
async function checkoutCOD() {
  // Get customer data from form
  const name = document.getElementById('customer-name').value.trim();
  const phone = document.getElementById('customer-phone').value.trim();
  const address = document.getElementById('customer-address').value.trim();
  const govSelect = document.getElementById('gov-select');

  // Validation
  if (!name) {
    showToast('يرجى إدخال الاسم');
    document.getElementById('customer-name').focus();
    return;
  }

  if (!phone) {
    showToast('يرجى إدخال رقم الهاتف');
    document.getElementById('customer-phone').focus();
    return;
  }

  if (!govSelect.value) {
    showToast('يرجى اختيار المحافظة');
    return;
  }

  if (!address) {
    showToast('يرجى إدخال العنوان للدفع عند الاستلام');
    document.getElementById('customer-address').focus();
    return;
  }

  // Prepare Data
  const cart = getCart();
  let orderDetails = "--- تفاصيل الطلب ---\n";
  cart.forEach(item => {
    orderDetails += `- ${item.name} (x${item.quantity}) [${item.size}, ${item.color}] = ${item.price * item.quantity} ج.م\n`;
  });

  const shipping = governorates[govSelect.value].price;
  const total = subtotal + shipping;

  orderDetails += `\nالشحن: ${shipping} ج.م\nالإجمالي: ${total} ج.م`;

  const customerData = `اسم العميل: ${name}\nرقم الهاتف: ${phone}\nالعنوان: ${address}\nالمحافظة: ${governorates[govSelect.value].name}`;

  const btn = document.querySelector('button[onclick="checkoutCOD()"]');
  const originalText = btn.textContent;
  btn.textContent = 'جاري إرسال الطلب...';
  btn.disabled = true;

  try {
    // Send to FormSubmit via AJAX
    const formAction = document.getElementById('email-form').action;

    await fetch(formAction, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        _subject: `طلب جديد من: ${name}`,
        _captcha: "false",
        _template: "table",
        "بيانات العميل": customerData,
        "تفاصيل الطلب": orderDetails
      })
    });

    // Success
    clearCart();
    alert('تم استلام طلبك بنجاح! شكراً لثقتك بنا.');
    window.location.href = 'index.html';

  } catch (err) {
    alert('حدث خطأ في الإرسال، يرجى المحاولة عبر واتساب.');
    console.error(err);
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderCart();
});
