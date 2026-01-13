let currentImages = []; // Not used for Upload mode, but kept for legacy ref

// Check Auth
function checkAdmin() {
    const pass = document.getElementById('admin-pass').value;
    if (pass === 'admin123') {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('admin-content').style.display = 'block';
        renderProductsTable();
    } else {
        alert('كلمة المرور غير صحيحة');
    }
}

function logout() {
    location.reload();
}

// Upload helper
async function uploadImage(file) {
    // Generate clean filename
    const ext = file.name.split('.').pop();
    const fileName = `prop_${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`;

    // Upload
    const { data, error } = await supabaseClient
        .storage
        .from('products')
        .upload(fileName, file);

    if (error) {
        console.error('Upload Error:', error);
        alert('فشل رفع الصورة: ' + error.message);
        return null;
    }

    // Get Public URL
    const { data: publicData } = supabaseClient
        .storage
        .from('products')
        .getPublicUrl(fileName);

    return publicData.publicUrl;
}



// Handle Edit Product
async function handleEdit(id) {
    try {
        // Fetch product data
        const product = await getProductById(id);
        if (!product) {
            alert('لم يتم العثور على المنتج');
            return;
        }

        // Set form title
        const formTitle = document.querySelector('.form-panel h2');
        formTitle.textContent = 'تعديل المنتج';

        // Fill form fields
        document.getElementById('product-id').value = product.id;
        document.getElementById('p-name').value = product.name;
        document.getElementById('p-price').value = product.price;
        document.getElementById('p-old-price').value = product.old_price || '';
        document.getElementById('p-label').value = product.label || '';
        document.getElementById('p-sizes').value = product.sizes ? product.sizes.join(', ') : '';
        document.getElementById('p-colors').value = product.colors ? product.colors.join(', ') : '';
        document.getElementById('p-details').value = product.details || '';

        // Set category
        document.getElementById('p-category').value = product.category || '';

        // Show existing images (optional preview)
        const previewContainer = document.getElementById('images-preview-container');
        previewContainer.innerHTML = '';
        if (product.images && product.images.length > 0) {
            product.images.forEach(imgUrl => {
                const img = document.createElement('img');
                img.src = imgUrl;
                img.style.width = '100px';
                img.style.height = '100px';
                img.style.objectFit = 'cover';
                img.style.borderRadius = '4px';
                img.style.border = '2px solid #4CAF50';
                img.title = 'صورة موجودة';
                previewContainer.appendChild(img);
            });
        }

        // Update submit button text
        const submitBtn = document.querySelector('#add-product-form button[type="submit"]');
        submitBtn.textContent = 'تحديث المنتج';

        // Show cancel button
        const cancelBtn = document.getElementById('cancel-edit-btn');
        if (cancelBtn) cancelBtn.style.display = 'inline-block';

        // Scroll to form
        document.querySelector('.form-panel').scrollIntoView({ behavior: 'smooth' });

    } catch (err) {
        console.error('Error loading product for edit:', err);
        alert('حدث خطأ أثناء تحميل بيانات المنتج');
    }
}

// Reset form to add mode
function resetFormToAddMode() {
    document.getElementById('product-id').value = '';
    document.querySelector('.form-panel h2').textContent = 'إضافة منتج جديد';
    document.querySelector('#add-product-form button[type="submit"]').textContent = 'حفظ المنتج';
    document.getElementById('add-product-form').reset();
    document.getElementById('images-preview-container').innerHTML = '';

    // Hide cancel button
    const cancelBtn = document.getElementById('cancel-edit-btn');
    if (cancelBtn) cancelBtn.style.display = 'none';
}

// Handle Add/Edit Product
async function handleAddProduct(e) {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'جاري الحفظ والرفع...';
    submitBtn.disabled = true;

    try {
        const id = document.getElementById('product-id').value; // If editing
        const name = document.getElementById('p-name').value;
        const price = Number(document.getElementById('p-price').value);
        const oldPrice = document.getElementById('p-old-price').value ? Number(document.getElementById('p-old-price').value) : null;

        // Get Category from text input
        const category = document.getElementById('p-category').value.trim();
        if (!category) {
            alert('يرجى إدخال التصنيف');
            throw new Error('No category');
        }

        const label = document.getElementById('p-label').value;
        const sizes = document.getElementById('p-sizes').value.split(',').map(s => s.trim());
        const colors = document.getElementById('p-colors').value.split(',').map(c => c.trim());
        const details = document.getElementById('p-details').value;

        const imageInput = document.getElementById('p-images');
        let imageUrls = [];

        // 1. Upload Images (if new images selected)
        if (imageInput.files && imageInput.files.length > 0) {
            for (let i = 0; i < imageInput.files.length; i++) {
                const file = imageInput.files[i];
                if (file.size > 1 * 1024 * 1024) {
                    alert(`الصورة ${file.name} أكبر من 1 ميجا، لن يتم رفعها.`);
                    continue;
                }
                const url = await uploadImage(file);
                if (url) imageUrls.push(url);
            }
        }

        // Build product data
        const productData = {
            name,
            price,
            old_price: oldPrice,
            category,
            label: label || null,
            sizes,
            colors,
            details,
        };

        // Add images only if new ones were uploaded
        if (imageUrls.length > 0) {
            productData.images = imageUrls;
        }

        if (id) {
            // Edit Mode
            // If no new images, we keep the old ones (don't update images field)
            if (imageUrls.length === 0) {
                // Fetch existing product to preserve images
                const existingProduct = await getProductById(id);
                if (existingProduct && existingProduct.images) {
                    productData.images = existingProduct.images;
                }
            }

            const { error } = await updateProductInDB(id, productData);
            if (error) throw new Error(error);

            alert('تم تحديث المنتج بنجاح!');
            resetFormToAddMode();
            renderProductsTable();
        } else {
            // Create Mode
            if (imageUrls.length === 0) {
                alert('يرجى اختيار صورة للمنتج');
                throw new Error('No image');
            }

            const { error } = await addProductToDB(productData);
            if (error) throw new Error(error.message);

            alert('تم إضافة المنتج بنجاح!');
            e.target.reset();
            document.getElementById('images-preview-container').innerHTML = '';
            renderProductsTable();
        }

    } catch (err) {
        console.error(err);
        // Alert handled or logs
    } finally {
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
    }
}

// Render Table (Async)
async function renderProductsTable() {
    const tbody = document.getElementById('products-table-body');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">جاري تحميل البيانات...</td></tr>';

    const products = await getProducts();
    tbody.innerHTML = '';

    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">لا توجد منتجات</td></tr>';
        return;
    }

    products.forEach(p => {
        const img = (p.images && p.images[0]) ? p.images[0] : (p.image || '');
        const row = `
            <tr>
                <td><img src="${img}" class="admin-img-thumb" alt="img"></td>
                <td>${p.name}</td>
                <td>${p.price}</td>
                <td>${p.category}</td>
                <td>
                    <button class="btn btn-sm" onclick="handleEdit('${p.id}')" style="transform: scale(0.8); background: #4CAF50;">تعديل</button>
                    <button class="btn btn-sm" onclick="handleDelete('${p.id}')" style="background:red; transform: scale(0.8)">حذف</button>
                </td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', row);
    });
}

async function handleDelete(id) {
    if (confirm('هل أنت متأكد من الحذف؟')) {
        const { error } = await deleteProductFromDB(id);
        if (error) {
            alert('حدث خطأ: ' + error);
        } else {
            renderProductsTable();
        }
    }
}

// Preview Images (Frontend only)
function previewImages(input) {
    const container = document.getElementById('images-preview-container');
    container.innerHTML = '';

    if (input.files) {
        Array.from(input.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = function (e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.style.width = '100px';
                img.style.height = '100px';
                img.style.objectFit = 'cover';
                img.style.borderRadius = '4px';
                container.appendChild(img);
            }
            reader.readAsDataURL(file);
        });
    }
}
