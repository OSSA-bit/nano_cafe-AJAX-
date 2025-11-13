// Cart System - works on all pages
const initCartSystem = () => {
  const cartState = {
    items: JSON.parse(localStorage.getItem('cartItems')) || [],
    deliveryFee: parseFloat(localStorage.getItem('deliveryFee')) || 0,
    location: localStorage.getItem('selectedLocation') || '0'
  };

  const elements = {
    cart: document.querySelector('.cart'),
    overlay: document.getElementById('cartOverlay'),
    backArrow: document.getElementById('close-cart'),
    cartList: document.querySelector(".cart-items"),
    cartTotal: document.querySelector(".cart-total"),
    deliveryFee: document.querySelector(".delivery-fee"),
    grandTotal: document.querySelector(".cart-grand-total"),
    location: document.getElementById("location"),
    orderBtn: document.querySelector(".submit-btn"),
    receipts: document.getElementById("receipts")
  };

  // If no cart elements on this page, exit
  if (!elements.cart || !elements.overlay) return;

  // Initialize from localStorage
  if (elements.location && cartState.location) {
    elements.location.value = cartState.location;
  }

  // Cart toggle functionality
  const setupCartToggle = () => {
    elements.cart.addEventListener('click', (e) => {
      e.stopPropagation();
      elements.cart.classList.toggle('active');
      elements.overlay.classList.toggle('active');
    });

    elements.backArrow.addEventListener('click', () => {
      elements.overlay.classList.remove('active');
      elements.cart.classList.remove('active');
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!elements.overlay.contains(e.target) && !elements.cart.contains(e.target)) {
        elements.overlay.classList.remove('active');
        elements.cart.classList.remove('active');
      }
    });
  };

  // Listen for add-to-cart messages
  const setupMessageListener = () => {
    window.addEventListener("message", (event) => {
      // Accept from any origin for now (you can restrict later)
      if (!event.data?.type || event.data.type !== "add-to-cart") return;

      const { name, price } = event.data.item;
      const priceValue = parseFloat(price.replace(/[^\d.]/g, ""));
      const existingItem = cartState.items.find(i => i.name === name);

      if (existingItem) {
        existingItem.qty++;
      } else {
        cartState.items.push({ name, priceValue, qty: 1 });
      }

      saveAndRenderCart();

      // Visual feedback
      elements.cart.style.transform = 'scale(1.1)';
      setTimeout(() => elements.cart.style.transform = '', 200);
    });
  };

  // Delivery location handler
  const setupLocationHandler = () => {
    elements.location.addEventListener("change", (e) => {
      cartState.deliveryFee = parseFloat(e.target.value) || 0;
      cartState.location = e.target.value;
      localStorage.setItem('deliveryFee', cartState.deliveryFee);
      localStorage.setItem('selectedLocation', cartState.location);
      renderCart();
    });
  };

  // Render cart items
  const renderCart = () => {
    elements.cartList.innerHTML = "";

    if (cartState.items.length === 0) {
      elements.cartList.innerHTML = '<li class="empty-cart">Your cart is empty</li>';
    } else {
      cartState.items.forEach((item) => {
        const li = document.createElement("li");
        li.classList.add("cart-item");
        li.innerHTML = `
          <span>${item.name}</span>
          <div class="qty-section">
            <button class="qty-btn" data-action="minus" data-name="${item.name}">-</button>
            <span class="qty">${item.qty}</span>
            <button class="qty-btn" data-action="plus" data-name="${item.name}">+</button>
            <span class="price">₱${(item.priceValue * item.qty).toFixed(2)}</span>
          </div>`;
        elements.cartList.appendChild(li);
      });
    }

    updateTotals();
  };

  // Update totals
  const updateTotals = () => {
    const total = cartState.items.reduce((sum, item) => sum + item.priceValue * item.qty, 0);
    const grandTotal = total + cartState.deliveryFee;

    if (elements.cartTotal) {
      elements.cartTotal.innerHTML = `<hr><p>Total: ₱${total.toFixed(2)}</p>`;
    }
    if (elements.deliveryFee) {
      elements.deliveryFee.textContent = `Delivery Fee: ₱${cartState.deliveryFee.toFixed(2)}`;
    }
    if (elements.grandTotal) {
      elements.grandTotal.textContent = `GRAND TOTAL: ₱${grandTotal.toFixed(2)}`;
    }
  };

  // Quantity handlers
  const setupQuantityHandlers = () => {
    elements.cartList.addEventListener('click', (e) => {
      if (!e.target.classList.contains('qty-btn')) return;

      const name = e.target.dataset.name;
      const item = cartState.items.find(i => i.name === name);
      if (!item) return;

      if (e.target.dataset.action === 'plus') {
        item.qty++;
      } else if (e.target.dataset.action === 'minus' && item.qty > 1) {
        item.qty--;
      } else if (e.target.dataset.action === 'minus' && item.qty === 1) {
        // Remove item if quantity becomes 0
        cartState.items = cartState.items.filter(i => i.name !== name);
      }

      saveAndRenderCart();
    });
  };

  // Save and render
  const saveAndRenderCart = () => {
    localStorage.setItem('cartItems', JSON.stringify(cartState.items));
    renderCart();
  };

  // Order handler
  const setupOrderHandler = () => {
    elements.orderBtn.addEventListener("click", () => {
      if (cartState.items.length === 0) {
        alert("Your cart is empty!");
        return;
      }
      if (elements.location.value === "0") {
        alert("Please select a delivery location!");
        return;
      }

      createReceipt();
      clearCart();
    });
  };

  // Create receipt
  const createReceipt = () => {
    const timestamp = new Date().toLocaleString();
    const locationText = elements.location.options[elements.location.selectedIndex].text;
    const total = cartState.items.reduce((sum, item) => sum + item.priceValue * item.qty, 0);
    const grandTotal = total + cartState.deliveryFee;

    const receipt = document.createElement("div");
    receipt.classList.add("receipt-entry");
    receipt.innerHTML = `
      <div class="receipt-head">
        <strong>${timestamp}</strong>
        <button class="toggle-details">Show Details</button>
      </div>
      <div class="receipt-details" style="display:none;">
        <ul>
          ${cartState.items.map(i => `<li>${i.name} x${i.qty} — ₱${(i.priceValue * i.qty).toFixed(2)}</li>`).join("")}
        </ul>
        <div class="receipt-totals">
          <div>Subtotal: ₱${total.toFixed(2)}</div>
          <div class="receipt-location-line">
            <span>${locationText}</span>
            <span>Delivery Fee: ₱${cartState.deliveryFee.toFixed(2)}</span>
          </div>
          <div class="receipt-grand-total"><strong>GRAND TOTAL: ₱${grandTotal.toFixed(2)}</strong></div>
        </div>
      </div>
    `;

    elements.receipts.prepend(receipt);

    // Toggle functionality
    const toggleBtn = receipt.querySelector(".toggle-details");
    const details = receipt.querySelector(".receipt-details");
    toggleBtn.addEventListener("click", () => {
      const hidden = details.style.display === "none";
      details.style.display = hidden ? "block" : "none";
      toggleBtn.textContent = hidden ? "Hide Details" : "Show Details";
    });
  };

  // Clear cart after order
  const clearCart = () => {
    cartState.items = [];
    cartState.deliveryFee = 0;
    cartState.location = '0';
    elements.location.value = '0';

    localStorage.removeItem('cartItems');
    localStorage.removeItem('deliveryFee');
    localStorage.removeItem('selectedLocation');

    saveAndRenderCart();
    elements.overlay.classList.remove('active');
    elements.cart.classList.remove('active');

    alert('Order placed successfully!');
  };

  // Initialize everything
  setupCartToggle();
  setupMessageListener();
  setupLocationHandler();
  setupQuantityHandlers();
  setupOrderHandler();
  renderCart();
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initCartSystem);