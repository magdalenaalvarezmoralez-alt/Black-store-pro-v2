const phoneNumber = "573245097798";
const makeWhatsAppLink = (message) =>
  `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

const productCards = [...document.querySelectorAll(".product-card")];
const filters = [...document.querySelectorAll(".filter")];
const searchInput = document.querySelector("#productSearch");
const emptyState = document.querySelector("#emptyState");
let activeFilter = "Todos";

const normalize = (text) =>
  text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

function applyCatalogFilter() {
  const query = normalize(searchInput?.value || "");
  let visible = 0;

  productCards.forEach((card) => {
    const category = card.dataset.category || "";
    const name = card.querySelector("h3")?.textContent || "";
    const categoryMatches =
      activeFilter === "Todos" ||
      category === activeFilter ||
      (activeFilter === "Cabello" && category === "Cuidado Afro");
    const searchMatches = normalize(`${name} ${category}`).includes(query);
    const show = categoryMatches && searchMatches;
    card.classList.toggle("is-hidden", !show);
    if (show) visible++;
  });

  if (emptyState) emptyState.hidden = visible !== 0;
}

filters.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filters.forEach((b) => b.classList.toggle("active", b === button));
    applyCatalogFilter();
  });
});
searchInput?.addEventListener("input", applyCatalogFilter);

document.querySelectorAll("[data-filter-link]").forEach((link) => {
  link.addEventListener("click", () => {
    const wanted = link.dataset.filterLink;
    const filterButton = filters.find((b) => b.dataset.filter === wanted);
    if (filterButton) {
      setTimeout(() => filterButton.click(), 50);
    }
  });
});

/* Favoritos */
document.querySelectorAll(".heart-button").forEach((button) => {
  button.addEventListener("click", () => {
    const active = button.getAttribute("aria-pressed") === "true";
    button.setAttribute("aria-pressed", String(!active));
    button.textContent = active ? "♡" : "♥";
  });
});

/* Carrito */
const cartDrawer = document.querySelector("#cartDrawer");
const cartOverlay = document.querySelector("#cartOverlay");
const cartOpen = document.querySelector("#cartOpen");
const cartClose = document.querySelector("#cartClose");
const cartItems = document.querySelector("#cartItems");
const cartCount = document.querySelector("#cartCount");
const cartTotal = document.querySelector("#cartTotal");
const checkoutButton = document.querySelector("#checkoutButton");
const clearCart = document.querySelector("#clearCart");

let cart = JSON.parse(localStorage.getItem("blackStoreCart") || "[]");

function priceToNumber(value) {
  return Number((value || "").replace(/\D/g, "")) || 0;
}
function formatCOP(value) {
  return "$" + new Intl.NumberFormat("es-CO").format(value) + " COP";
}
function saveCart() {
  localStorage.setItem("blackStoreCart", JSON.stringify(cart));
}
function renderCart() {
  if (!cartItems) return;
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  if (cartCount) cartCount.textContent = count;
  if (cartTotal) cartTotal.textContent = formatCOP(total);

  if (!cart.length) {
    cartItems.innerHTML = '<p class="cart-empty">Tu carrito está vacío.<br><small>Agrega productos de la colección.</small></p>';
    return;
  }

  cartItems.innerHTML = cart.map((item, index) => `
    <div class="cart-row">
      <img src="${item.image}" alt="${item.name}">
      <div>
        <h3>${item.name}</h3>
        <p>${formatCOP(item.price)} · ${item.category}</p>
        <div class="qty-controls">
          <button type="button" data-action="minus" data-index="${index}" aria-label="Restar">−</button>
          <span>${item.qty}</span>
          <button type="button" data-action="plus" data-index="${index}" aria-label="Sumar">+</button>
        </div>
        <button class="remove-item" type="button" data-action="remove" data-index="${index}">Eliminar</button>
      </div>
      <strong>${formatCOP(item.price * item.qty)}</strong>
    </div>
  `).join("");
}
function openCart() {
  cartDrawer?.classList.add("open");
  cartOverlay?.classList.add("open");
  cartDrawer?.setAttribute("aria-hidden", "false");
}
function closeCart() {
  cartDrawer?.classList.remove("open");
  cartOverlay?.classList.remove("open");
  cartDrawer?.setAttribute("aria-hidden", "true");
}
function addToCart(button) {
  const card = button.closest(".product-card");
  const name = button.dataset.product;
  const price = priceToNumber(button.dataset.price);
  const image = card?.querySelector("img")?.getAttribute("src") || "";
  const category = card?.dataset.category || "";
  const found = cart.find((item) => item.name === name);
  if (found) found.qty++;
  else cart.push({ name, price, image, category, qty: 1 });
  saveCart();
  renderCart();
  openCart();
}
document.querySelectorAll(".buy-button").forEach((button) => {
  button.addEventListener("click", () => addToCart(button));
});

cartItems?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const index = Number(button.dataset.index);
  const action = button.dataset.action;
  if (!cart[index]) return;
  if (action === "plus") cart[index].qty++;
  if (action === "minus") cart[index].qty--;
  if (action === "remove" || cart[index].qty <= 0) cart.splice(index, 1);
  saveCart();
  renderCart();
});

cartOpen?.addEventListener("click", openCart);
cartClose?.addEventListener("click", closeCart);
cartOverlay?.addEventListener("click", closeCart);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeCart();
});

clearCart?.addEventListener("click", () => {
  cart = [];
  saveCart();
  renderCart();
});

checkoutButton?.addEventListener("click", () => {
  if (!cart.length) {
    alert("Agrega al menos un producto al carrito.");
    return;
  }
  const lines = cart.map((item) => `• ${item.name} x${item.qty} — ${formatCOP(item.price * item.qty)}`);
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const message = `Hola Black Store 👋\nQuiero hacer este pedido:\n\n${lines.join("\n")}\n\nTotal estimado: ${formatCOP(total)}\n\nQuisiera confirmar disponibilidad, tallas y envío.`;
  window.open(makeWhatsAppLink(message), "_blank", "noopener,noreferrer");
});

/* WhatsApp general */
const contactMessage = "Hola Black Store, quiero recibir atención personalizada.";
document.querySelectorAll(".whatsapp-contact, .footer-whatsapp, .floating-whatsapp").forEach((link) => {
  link.href = makeWhatsAppLink(contactMessage);
});

/* Menú móvil */
const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");
if (menuButton && nav) {
  menuButton.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(open));
  });
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
    });
  });
}

/* Animaciones */
const revealItems = document.querySelectorAll(".category-card, .product-card, .benefit, .about-image");
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealItems.forEach((item) => {
  item.style.opacity = "0";
  item.style.transform = "translateY(18px)";
  item.style.transition = "opacity .6s ease, transform .6s ease";
  observer.observe(item);
});

renderCart();
