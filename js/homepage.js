// Homepage functionality
// NOTE: AI assistance used for currency formatting fixes and price display standardization
let carouselProducts = [];
let currentSlide = 0;
let carouselInterval;
let allProducts = [];
let displayedProducts = [];
let currentFilter = "all";
let productsPerPage = 12;

document.addEventListener("DOMContentLoaded", function () {
  // Initialize cart display
  API.Cart.updateCartUI();

  // Initialize auth navigation - disabled to prevent link override
  // updateNavigation();

  // Initialize carousel immediately
  initializeCarousel();
  initializeProductFeed();

  // Handle logout button
  document.addEventListener("click", function (e) {
    if (e.target.getAttribute("data-action") === "logout") {
      API.Auth.logout();
      return;
    }
  });

  // Smooth scrolling for internal links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });
});

// Update navigation based on login status
function updateNavigation() {
  const authNav = document.getElementById("authNav");
  if (!authNav) {
    return;
  }

  // Force show login link to test
  authNav.innerHTML = `
    <a href="account/login.html">Login</a>
  `;
}

// Initialize carousel functionality with help form AI
async function initializeCarousel() {
  const carouselTrack = document.getElementById("carouselTrack");

  if (!carouselTrack) {
    console.error("❌ Carousel track element not found!");
    return;
  }

  // Show loading message
  carouselTrack.innerHTML =
    '<div class="carousel-slide active"><div class="slide-content"><h3>Loading products...</h3></div></div>';

  try {
    // Fetch products directly using fetch API
    const response = await fetch("https://v2.api.noroff.dev/online-shop");
    const result = await response.json();

    if (result && result.data && Array.isArray(result.data)) {
      const products = result.data;

      // Get 3 random products for carousel
      const shuffled = [...products].sort(() => 0.5 - Math.random());
      carouselProducts = shuffled.slice(0, 3);

      // Clear existing slides
      carouselTrack.innerHTML = "";

      // Create carousel slides one by one
      carouselProducts.forEach((product, index) => {
        const hasDiscount =
          product.discountedPrice && product.discountedPrice < product.price;
        const displayPrice = hasDiscount
          ? product.discountedPrice
          : product.price;

        const slideHTML = `
          <div class="carousel-slide ${
            index === 0 ? "active" : ""
          }" data-product="${product.title}">
            <div class="slide-image">
              <img src="${
                product.image?.url ||
                product.image ||
                "https://via.placeholder.com/600x400?text=Product+Image"
              }" 
                   alt="${product.title}" 
                   onerror="this.src='https://via.placeholder.com/600x400?text=Product+Image'" />
            </div>
            <div class="slide-content">
              <div class="slide-text">
                <h2>${product.title}</h2>
                <p>${
                  product.description
                    ? product.description.length > 120
                      ? product.description.substring(0, 120) + "..."
                      : product.description
                    : "Discover this amazing product with excellent quality and design."
                }</p>
                <div class="slide-rating">
                  <span class="star-rating" aria-label="${
                    product.rating || 0
                  } out of 5 stars">
                    ${"★".repeat(Math.floor(product.rating || 0))}${"☆".repeat(
          5 - Math.floor(product.rating || 0)
        )}
                  </span>
                  <span class="rating-text">(${product.rating || 0}/5)</span>
                </div>
                <div class="slide-price">
                  ${
                    hasDiscount
                      ? `<span class="discounted-price">${API.UI.formatPrice(
                          displayPrice
                        )}</span>
                     <span class="original-price">${API.UI.formatPrice(
                       product.price
                     )}</span>`
                      : `<span class="price">${API.UI.formatPrice(
                          product.price
                        )}</span>`
                  }
                </div>
                <a href="product.html?id=${product.id}" class="slide-cta">
                  View Product →
                </a>
              </div>
            </div>
          </div>
        `;

        // Create slide element and add to track
        const slideDiv = document.createElement("div");
        slideDiv.innerHTML = slideHTML;
        const slideElement = slideDiv.firstElementChild;
        carouselTrack.appendChild(slideElement);
      });

      // Setup indicators
      const indicators = document.getElementById("carouselIndicators");
      if (indicators) {
        let indicatorsHTML = "";
        carouselProducts.forEach((_, index) => {
          indicatorsHTML += `<button class="carousel-indicator ${
            index === 0 ? "active" : ""
          }" onclick="goToSlide(${index})"></button>`;
        });
        indicators.innerHTML = indicatorsHTML;
      }

      // Setup controls and indicators
      setupCarouselControlsAndIndicators();
    } else {
      console.error(" Invalid API response structure");
      carouselTrack.innerHTML =
        '<div class="carousel-slide active"><div class="slide-content"><h3>No products available</h3></div></div>';
    }
  } catch (error) {
    console.error(" Error loading carousel products:", error);

    // Fallback: Create test carousel with dummy products
    carouselProducts = [
      {
        id: 1,
        title: "Test Product 1",
        price: 199,
        description: "This is a test product",
        image: "https://via.placeholder.com/600x400?text=Product+1",
      },
      {
        id: 2,
        title: "Test Product 2",
        price: 299,
        description: "This is another test product",
        image: "https://via.placeholder.com/600x400?text=Product+2",
      },
      {
        id: 3,
        title: "Test Product 3",
        price: 399,
        description: "This is a third test product",
        image: "https://via.placeholder.com/600x400?text=Product+3",
      },
    ];

    // Clear and create test slides
    carouselTrack.innerHTML = "";

    carouselProducts.forEach((product, index) => {
      const slideElement = document.createElement("div");
      slideElement.className = `carousel-slide ${index === 0 ? "active" : ""}`;
      slideElement.setAttribute("data-product", product.title);
      slideElement.innerHTML = `
        <div class="slide-image">
          <img src="${product.image}" alt="${product.title}" />
        </div>
        <div class="slide-content">
          <div class="slide-text">
            <h2>${product.title}</h2>
            <p>${product.description}</p>
            <div class="slide-price">
              <span class="price">${API.UI.formatPrice(product.price)}</span>
            </div>
            <a href="product.html?id=${product.id}" class="slide-cta">
              View Product →
            </a>
          </div>
        </div>
      `;
      carouselTrack.appendChild(slideElement);
    });

    // Setup controls and indicators
    setupCarouselControlsAndIndicators();
  }
}

// Render carousel slides
function renderCarousel() {
  const track = document.getElementById("carouselTrack");
  const indicators = document.getElementById("carouselIndicators");

  if (!track || !indicators) return;

  // Create slides
  track.innerHTML = carouselProducts
    .map(
      (product, index) => `
    <div class="carousel-slide ${
      index === 0 ? "active" : ""
    }" data-index="${index}">
      <div class="slide-image">
        ${
          product.image?.url || product.image
            ? `<img src="${product.image?.url || product.image}" alt="${
                product.title
              }" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">`
            : ""
        }
        <div class="carousel-image-placeholder" style="${
          product.image?.url || product.image ? "display:none" : "display:flex"
        }">
          No Image Available
        </div>
      </div>
      <div class="slide-content">
        <div class="slide-text">
          <h2>${product.title}</h2>
          <p>${
            product.description
              ? product.description.substring(0, 120) + "..."
              : "Discover this amazing product"
          }</p>
          <div class="slide-price">
            ${
              product.discountedPrice && product.discountedPrice < product.price
                ? `<span class="discounted-price">${API.UI.formatPrice(
                    product.discountedPrice
                  )}</span>
               <span class="original-price">${API.UI.formatPrice(
                 product.price
               )}</span>`
                : `<span class="price">${API.UI.formatPrice(
                    product.price
                  )}</span>`
            }
          </div>
          <a href="product.html?id=${
            product.id
          }" class="btn btn-primary slide-cta">View Product</a>
        </div>
      </div>
    </div>
  `
    )
    .join("");

  // Create indicators
  indicators.innerHTML = carouselProducts
    .map(
      (_, index) => `
    <button class="carousel-indicator ${index === 0 ? "active" : ""}" 
            data-index="${index}" 
            aria-label="Go to slide ${index + 1}"></button>
  `
    )
    .join("");

  // Add event listeners
  setupCarouselControls();
}

// Start carousel autoplay
// Reference: Common carousel/slider autoplay implementation pattern
// Pattern: setInterval for automatic slide progression with navigation function
// Source inspiration: Carousel tutorials from web development blogs and JavaScript slider examples
function startCarouselAutoplay() {
  carouselInterval = setInterval(() => {
    goToSlide(currentSlide + 1);
  }, 5000); // Change slide every 5 seconds
}

// Show carousel error
function showCarouselError() {
  const track = document.getElementById("carouselTrack");
  if (track) {
    track.innerHTML = `
      <div class="carousel-slide active error-slide">
        <div class="slide-content">
          <div class="slide-text">
            <h2>Unable to load featured products</h2>
            <p>Please check back later or browse our full collection</p>
            <a href="shop.html" class="btn btn-primary">Browse Products</a>
          </div>
        </div>
      </div>
    `;
  }
}

// Initialize product feed
async function initializeProductFeed() {
  const productGrid = document.getElementById("productFeedGrid");

  if (!productGrid) {
    console.error("Product feed grid not found!");
    return;
  }

  // Show loading
  productGrid.innerHTML = '<div class="loading">Loading products...</div>';

  try {
    // Fetch products directly
    const response = await fetch("https://v2.api.noroff.dev/online-shop");
    const result = await response.json();

    if (result && result.data && Array.isArray(result.data)) {
      const products = result.data;
      allProducts = products;
      displayedProducts = products.slice(0, 12); // Show first 12

      // Create product cards manually
      let productHTML = "";
      displayedProducts.forEach((product) => {
        productHTML += `
          <div class="feed-product-card">
            <div class="feed-product-image">
              <img src="${
                product.image?.url || "/api/placeholder/200/200"
              }" alt="${product.title}" />
            </div>
            <div class="feed-product-info">
              <h4>${product.title}</h4>
              <div class="product-rating">
                <span class="star-rating" aria-label="${
                  product.rating || 0
                } out of 5 stars">
                  ${"★".repeat(Math.floor(product.rating || 0))}${"☆".repeat(
          5 - Math.floor(product.rating || 0)
        )}
                </span>
                <span class="rating-text">(${product.rating || 0}/5)</span>
              </div>
              <p class="feed-product-price">${API.UI.formatPrice(
                product.price
              )}</p>
              <div class="feed-product-actions">
                <button onclick="window.location.href='product.html?id=${
                  product.id
                }'" class="btn btn-primary">View Details</button>
              </div>
            </div>
          </div>
        `;
      });

      productGrid.innerHTML = productHTML;
    } else {
      console.error("Invalid product feed API response");
      productGrid.innerHTML = '<div class="error">No products available</div>';
    }
  } catch (error) {
    console.error("Error loading product feed:", error);
    productGrid.innerHTML = '<div class="error">Error loading products</div>';
  }
}

// Render product feed grid
function renderProductFeed() {
  const grid = document.getElementById("productFeedGrid");
  if (!grid) return;

  if (displayedProducts.length === 0) {
    grid.innerHTML = `
      <div class="feed-empty">
        <h3>No products found</h3>
        <p>Try adjusting your filter or check back later</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = displayedProducts
    .map(
      (product, index) => `
    <div class="feed-product-card" style="animation-delay: ${index * 0.1}s">
      <a href="product.html?id=${product.id}" class="product-link">
        <div class="feed-product-image">
          ${
            product.image?.url || product.image
              ? `<img src="${product.image?.url || product.image}" alt="${
                  product.title
                }">`
              : `<div class="feed-product-placeholder">No Image Available</div>`
          }
        </div>
        <div class="feed-product-info">
          <h3 class="feed-product-title">${product.title}</h3>
          <div class="product-rating">
            ${API.UI.createStarRatingHTML(
              product.rating,
              product.reviews ? product.reviews.length : null
            )}
          </div>
          <div class="feed-product-price">
            ${
              product.discountedPrice && product.discountedPrice < product.price
                ? `<span class="feed-discounted-price">${API.UI.formatPrice(
                    product.discountedPrice
                  )}</span>
               <span class="feed-original-price">${API.UI.formatPrice(
                 product.price
               )}</span>`
                : `<span class="feed-price">${API.UI.formatPrice(
                    product.price
                  )}</span>`
            }
          </div>
        </div>
      </a>
    </div>
  `
    )
    .join("");

  // Update load more button visibility
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  if (loadMoreBtn) {
    loadMoreBtn.style.display =
      displayedProducts.length < allProducts.length ? "inline-flex" : "none";
  }
}

// Setup feed filters
function setupFeedFilters() {
  const filterTabs = document.querySelectorAll(".filter-tab");

  filterTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      const filter = this.dataset.filter;

      // Update active tab
      filterTabs.forEach((t) => t.classList.remove("active"));
      this.classList.add("active");

      // Apply filter
      currentFilter = filter;
      applyFilter();
    });
  });
}

// Apply filter to products
function applyFilter() {
  let filteredProducts = [...allProducts];

  switch (currentFilter) {
    case "latest":
      // Show only first products (newest)
      filteredProducts = allProducts.slice(0, Math.min(allProducts.length, 20));
      break;
    case "featured":
      // Show products with discounts or random selection
      filteredProducts = allProducts
        .filter((p) => p.discountedPrice && p.discountedPrice < p.price)
        .slice(0, 12);
      if (filteredProducts.length === 0) {
        filteredProducts = allProducts.slice(0, 12);
      }
      break;
    default:
      // Show all products
      break;
  }

  displayedProducts = filteredProducts.slice(0, productsPerPage);
  renderProductFeed();
}

// Setup load more functionality
function setupLoadMore() {
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", loadMoreProducts);
  }
}

// Load more products
function loadMoreProducts() {
  const currentLength = displayedProducts.length;
  const nextBatch = allProducts.slice(
    currentLength,
    currentLength + productsPerPage
  );

  displayedProducts = [...displayedProducts, ...nextBatch];
  renderProductFeed();
}

// Show feed error
function showFeedError() {
  const grid = document.getElementById("productFeedGrid");
  if (grid) {
    grid.innerHTML = `
      <div class="feed-error">
        <h3>Unable to load products</h3>
        <p>Please check your connection and try again</p>
        <button onclick="initializeProductFeed()" class="btn btn-primary">Retry</button>
      </div>
    `;
  }
}

// Carousel navigation functions
function nextSlide() {
  if (carouselProducts.length === 0) {
    return;
  }

  currentSlide = (currentSlide + 1) % carouselProducts.length;
  updateCarouselDisplay();
}

function prevSlide() {
  if (carouselProducts.length === 0) {
    return;
  }

  currentSlide =
    (currentSlide - 1 + carouselProducts.length) % carouselProducts.length;
  updateCarouselDisplay();
}

function goToSlide(index) {
  if (carouselProducts.length === 0) {
    return;
  }

  currentSlide = index;
  updateCarouselDisplay();
}

function updateCarouselDisplay() {
  const slides = document.querySelectorAll(".carousel-slide");
  const indicators = document.querySelectorAll(".carousel-indicator");

  if (slides.length === 0) {
    console.error("❌ No carousel slides found in DOM!");
    return;
  }

  slides.forEach((slide, index) => {
    const isActive = index === currentSlide;

    // Remove all active classes first
    slide.classList.remove("active");

    // Add active class to current slide
    if (isActive) {
      slide.classList.add("active");
    }
  });

  indicators.forEach((indicator, index) => {
    const isActive = index === currentSlide;
    indicator.classList.toggle("active", isActive);
  });
}

// Setup carousel controls and indicators
function setupCarouselControlsAndIndicators() {
  // Setup indicators first
  const indicators = document.getElementById("carouselIndicators");
  if (indicators) {
    indicators.innerHTML = "";
    carouselProducts.forEach((_, index) => {
      const indicator = document.createElement("button");
      indicator.className = `carousel-indicator ${index === 0 ? "active" : ""}`;
      indicator.setAttribute("data-index", index);
      indicator.addEventListener("click", () => goToSlide(index));
      indicators.appendChild(indicator);
    });
  }

  // Navigation buttons
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  if (prevBtn) {
    // Remove any existing listeners
    prevBtn.replaceWith(prevBtn.cloneNode(true));
    const newPrevBtn = document.getElementById("prevBtn");
    newPrevBtn.addEventListener("click", () => {
      prevSlide();
    });
  }

  if (nextBtn) {
    // Remove any existing listeners
    nextBtn.replaceWith(nextBtn.cloneNode(true));
    const newNextBtn = document.getElementById("nextBtn");
    newNextBtn.addEventListener("click", () => {
      nextSlide();
    });
  }

  // Add touch/swipe functionality for mobile
  setupTouchControls();

  // Initialize the display
  currentSlide = 0;
  updateCarouselDisplay();

  // Auto-play carousel with pause on interaction
  setupAutoplay();
}

// Touch/Swipe controls for mobile devices
function setupTouchControls() {
  const carouselTrack = document.getElementById("carouselTrack");
  if (!carouselTrack) return;

  let startX = 0;
  let startY = 0;
  let startTime = 0;
  let isDragging = false;
  const minSwipeDistance = 50;
  const maxSwipeTime = 300;

  // Touch events
  carouselTrack.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    startTime = Date.now();
    isDragging = true;
    pauseAutoplay();
  });

  carouselTrack.addEventListener("touchmove", (e) => {
    if (!isDragging) return;

    // Prevent scrolling while swiping horizontally
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = Math.abs(currentX - startX);
    const deltaY = Math.abs(currentY - startY);

    if (deltaX > deltaY) {
      e.preventDefault();
    }
  });

  carouselTrack.addEventListener("touchend", (e) => {
    if (!isDragging) return;

    const endX = e.changedTouches[0].clientX;
    const endTime = Date.now();
    const deltaX = endX - startX;
    const deltaTime = endTime - startTime;

    isDragging = false;

    // Check if it's a valid swipe
    if (Math.abs(deltaX) >= minSwipeDistance && deltaTime <= maxSwipeTime) {
      if (deltaX > 0) {
        prevSlide(); // Swipe right - go to previous
      } else {
        nextSlide(); // Swipe left - go to next
      }
    }

    resumeAutoplay();
  });

  // Mouse events for desktop (optional)
  let isMouseDown = false;

  carouselTrack.addEventListener("mousedown", (e) => {
    startX = e.clientX;
    startTime = Date.now();
    isMouseDown = true;
    pauseAutoplay();
    carouselTrack.style.cursor = "grabbing";
  });

  carouselTrack.addEventListener("mousemove", (e) => {
    if (!isMouseDown) return;
    e.preventDefault();
  });

  carouselTrack.addEventListener("mouseup", (e) => {
    if (!isMouseDown) return;

    const endX = e.clientX;
    const endTime = Date.now();
    const deltaX = endX - startX;
    const deltaTime = endTime - startTime;

    isMouseDown = false;
    carouselTrack.style.cursor = "grab";

    if (Math.abs(deltaX) >= minSwipeDistance && deltaTime <= maxSwipeTime) {
      if (deltaX > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
    }

    resumeAutoplay();
  });

  carouselTrack.addEventListener("mouseleave", () => {
    isMouseDown = false;
    carouselTrack.style.cursor = "grab";
    resumeAutoplay();
  });

  // Set cursor style
  carouselTrack.style.cursor = "grab";
}

// Enhanced autoplay with pause/resume functionality
function setupAutoplay() {
  startCarouselAutoplay();

  // Pause on hover (desktop)
  const carouselContainer = document.querySelector(".banner-carousel-section");
  if (carouselContainer) {
    carouselContainer.addEventListener("mouseenter", pauseAutoplay);
    carouselContainer.addEventListener("mouseleave", resumeAutoplay);
  }
}

function pauseAutoplay() {
  if (carouselInterval) {
    clearInterval(carouselInterval);
    carouselInterval = null;
  }
}

function resumeAutoplay() {
  if (!carouselInterval && carouselProducts.length > 1) {
    carouselInterval = setInterval(() => {
      nextSlide();
    }, 5000);
  }
}
