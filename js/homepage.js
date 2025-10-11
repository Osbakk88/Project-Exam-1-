// Homepage functionality
let carouselProducts = [];
let currentSlide = 0;
let carouselInterval;
let allProducts = [];
let displayedProducts = [];
let currentFilter = "all";
let productsPerPage = 12;

document.addEventListener("DOMContentLoaded", function () {
  console.log("Homepage DOM loaded");

  // Test carousel container
  const carouselTrack = document.getElementById("carouselTrack");
  console.log("Carousel track found:", !!carouselTrack);

  // Test product feed container
  const productFeedGrid = document.getElementById("productFeedGrid");
  console.log("Product feed grid found:", !!productFeedGrid);

  // Initialize cart display
  API.Cart.updateCartUI();

  // Initialize auth navigation
  updateNavigation();

  // Initialize homepage components
  console.log("About to initialize carousel...");

  // Add test content to carousel first
  if (carouselTrack) {
    carouselTrack.innerHTML = `
      <div class="carousel-slide">
        <div class="slide-content">
          <h3>Test Product 1</h3>
          <p>Loading products...</p>
        </div>
      </div>
    `;
  }

  // Add test content to product feed
  if (productFeedGrid) {
    productFeedGrid.innerHTML = `
      <div class="feed-product-card">
        <h4>Test Product</h4>
        <p>Loading products...</p>
      </div>
    `;
  }

  initializeCarousel();
  console.log("About to initialize product feed...");
  initializeProductFeed();

  // Newsletter form handling
  const newsletterForm = document.getElementById("newsletterForm");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", handleNewsletterSubmit);
  }

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
    console.log("authNav element not found");
    return;
  }

  console.log("Updating navigation - authNav found:", authNav);

  // Force show login link to test
  authNav.innerHTML = `
    <a href="login.html">Login</a>
  `;

  console.log("Navigation updated, authNav content:", authNav.innerHTML);

  // Test if API is working
  console.log("Testing API availability:", typeof API, typeof API.Shop);
}

// Initialize carousel functionality
async function initializeCarousel() {
  console.log("Starting carousel initialization...");
  const carouselTrack = document.getElementById("carouselTrack");

  if (!carouselTrack) {
    console.error("Carousel track element not found!");
    return;
  }

  // Show loading message
  carouselTrack.innerHTML =
    '<div class="carousel-slide"><div class="slide-content"><h3>Loading products...</h3></div></div>';

  try {
    // Fetch products directly using fetch API
    console.log("Fetching products from API...");
    const response = await fetch("https://v2.api.noroff.dev/online-shop");
    const result = await response.json();

    console.log("Raw API result:", result);

    if (result && result.data && Array.isArray(result.data)) {
      const products = result.data;
      console.log("Found", products.length, "products");

      // Get 3 random products for carousel
      const shuffled = [...products].sort(() => 0.5 - Math.random());
      carouselProducts = shuffled.slice(0, 3);
      console.log("Selected random products for carousel:", carouselProducts);

      // Create carousel slides manually
      let slidesHTML = "";
      carouselProducts.forEach((product, index) => {
        slidesHTML += `
          <div class="carousel-slide ${index === 0 ? "active" : ""}">
            <div class="slide-content">
              <div class="slide-image">
                <img src="${
                  product.image?.url || "/api/placeholder/400/300"
                }" alt="${product.title}" />
              </div>
              <div class="slide-info">
                <h3>${product.title}</h3>
                <p class="slide-price">$${product.price}</p>
                <button onclick="window.location.href='product.html?id=${
                  product.id
                }'" class="btn btn-primary">View Product</button>
              </div>
            </div>
          </div>
        `;
      });

      // Update carousel track
      carouselTrack.innerHTML = slidesHTML;
      console.log("Carousel slides added successfully!");

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
    } else {
      console.error("Invalid API response structure");
      carouselTrack.innerHTML =
        '<div class="carousel-slide"><div class="slide-content"><h3>No products available</h3></div></div>';
    }
  } catch (error) {
    console.error("Error loading carousel products:", error);
    carouselTrack.innerHTML =
      '<div class="carousel-slide"><div class="slide-content"><h3>Error loading products</h3><p>Please try again later</p></div></div>';
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
        <img src="${
          product.image?.url ||
          product.image ||
          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=="
        }" 
             alt="${product.title}" 
             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='">
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

// Setup carousel controls
function setupCarouselControls() {
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const indicators = document.querySelectorAll(".carousel-indicator");

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      goToSlide(currentSlide - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      goToSlide(currentSlide + 1);
    });
  }

  indicators.forEach((indicator, index) => {
    indicator.addEventListener("click", () => {
      goToSlide(index);
    });
  });
}

// Navigate to specific slide
function goToSlide(slideIndex) {
  const slides = document.querySelectorAll(".carousel-slide");
  const indicators = document.querySelectorAll(".carousel-indicator");

  if (!slides.length) return;

  // Handle looping
  if (slideIndex >= slides.length) {
    slideIndex = 0;
  } else if (slideIndex < 0) {
    slideIndex = slides.length - 1;
  }

  // Update current slide
  currentSlide = slideIndex;

  // Update slides
  slides.forEach((slide, index) => {
    slide.classList.toggle("active", index === currentSlide);
  });

  // Update indicators
  indicators.forEach((indicator, index) => {
    indicator.classList.toggle("active", index === currentSlide);
  });

  // Move track
  const track = document.getElementById("carouselTrack");
  if (track) {
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
  }
}

// Start carousel autoplay
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
  console.log("Initializing product feed...");
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

    console.log("Product feed API result:", result);

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
              <p class="feed-product-price">$${product.price}</p>
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
      console.log(
        "Product feed populated with",
        displayedProducts.length,
        "products"
      );
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
          <img src="${
            product.image?.url ||
            product.image ||
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=="
          }" 
               alt="${product.title}"
               onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='">
          ${
            product.discountedPrice && product.discountedPrice < product.price
              ? `<div class="feed-discount-badge">${Math.round(
                  (1 - product.discountedPrice / product.price) * 100
                )}% OFF</div>`
              : ""
          }
        </div>
        <div class="feed-product-info">
          <h3 class="feed-product-title">${product.title}</h3>
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

// Newsletter form handling
function handleNewsletterSubmit(e) {
  e.preventDefault();

  const emailInput = document.getElementById("emailInput");
  const errorDiv = document.getElementById("email-error");
  const successDiv = document.getElementById("newsletter-success");

  // Clear previous messages
  errorDiv.textContent = "";
  successDiv.textContent = "";

  const email = emailInput.value.trim();

  if (!email) {
    errorDiv.textContent = "Please enter your email address";
    return;
  }

  if (!isValidEmail(email)) {
    errorDiv.textContent = "Please enter a valid email address";
    return;
  }

  // Simulate subscription
  successDiv.textContent =
    "Thank you for subscribing! You'll hear from us soon.";
  emailInput.value = "";
}

// Email validation helper
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
