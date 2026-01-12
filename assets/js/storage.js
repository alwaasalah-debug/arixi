const PRODUCTS_TABLE = 'products';
const CART_KEY = 'ghazma_cart';

// --- Product Helpers (Supabase) ---

/**
 * Fetch all products from Supabase
 * @returns {Promise<Array>} Array of product objects
 */
async function getProducts() {
    if (!supabaseClient) {
        console.error('Supabase client not initialized');
        return [];
    }

    try {
        const { data, error } = await supabaseClient
            .from(PRODUCTS_TABLE)
            .select('*');

        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('Error fetching products:', err.message);
        return [];
    }
}

/**
 * Get a single product by ID
 */
async function getProductById(id) {
    if (!supabaseClient) return null;

    try {
        const { data, error } = await supabaseClient
            .from(PRODUCTS_TABLE)
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.warn('Product not found or error:', error.message);
            return null;
        }
        return data;

    } catch (err) {
        console.error('Error fetching product by ID:', err.message);
        return null;
    }
}

/**
 * Add a new product to Supabase
 */
async function addProductToDB(productData) {
    if (!supabaseClient) return { error: 'Client not ready' };

    try {
        const { data, error } = await supabaseClient
            .from(PRODUCTS_TABLE)
            .insert([productData])
            .select();

        if (error) throw error;
        return { data };

    } catch (err) {
        console.error('Error adding product:', err.message);
        return { error: err.message };
    }
}

/**
 * Update an existing product in Supabase
 */
async function updateProductInDB(id, productData) {
    if (!supabaseClient) return { error: 'Client not ready' };

    try {
        const { data, error } = await supabaseClient
            .from(PRODUCTS_TABLE)
            .update(productData)
            .eq('id', id)
            .select();

        if (error) throw error;
        return { data };
    } catch (err) {
        console.error('Error updating product:', err.message);
        return { error: err.message };
    }
}

/**
 * Delete product from Supabase
 */
async function deleteProductFromDB(id) {
    if (!supabaseClient) return { error: 'Client not ready' };

    try {
        const { error } = await supabaseClient
            .from(PRODUCTS_TABLE)
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    } catch (err) {
        return { error: err.message };
    }
}


// --- Cart Helpers (LocalStorage - unchanged logic) ---

function getCart() {
    const cart = sessionStorage.getItem(CART_KEY);
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    sessionStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addToCart(product, quantity = 1, selectedSize, selectedColor) {
    let cart = getCart();

    const existingItemIndex = cart.findIndex(item =>
        item.productId === product.id &&
        item.size === selectedSize &&
        item.color === selectedColor
    );

    const mainImage = (product.images && product.images.length > 0)
        ? product.images[0]
        : (product.image || 'assets/images/placeholder.jpg');

    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += quantity;
    } else {
        cart.push({
            id: Date.now().toString(),
            productId: product.id,
            name: product.name,
            price: product.price,
            image: mainImage,
            quantity: quantity,
            size: selectedSize,
            color: selectedColor
        });
    }
    saveCart(cart);
    updateCartCount();

    if (typeof showToast === 'function') {
        showToast('تمت إضافة المنتج للسلة بنجاح');
    } else {
        alert('تمت إضافة المنتج للسلة');
    }
}

function removeFromCart(cartItemId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== cartItemId);
    saveCart(cart);
    updateCartCount();
    if (typeof showToast === 'function') showToast('تم حذف المنتج من السلة');
}

function clearCart() {
    sessionStorage.removeItem(CART_KEY);
    updateCartCount();
}

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const badge = document.querySelector('.cart-count');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }
}

// Initialize Cart Count on Load
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
});
