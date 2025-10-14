// Homepage functionality
let carouselProducts = [];
let currentSlide = 0;
let carouselInterval;
let allProducts = [];
let displayedProducts = [];
let currentFilter = "all";
let productsPerPage = 12;

document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 Homepage DOM loaded");

  // Test carousel container
  const carouselTrack = document.getElementById("carouselTrack");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  console.log("🔍 Element check:");
  console.log("  - Carousel track found:", !!carouselTrack);
  console.log("  - Previous button found:", !!prevBtn);
  console.log("  - Next button found:", !!nextBtn);

  // Initialize cart display
  API.Cart.updateCartUI();

  // Initialize auth navigation - disabled to prevent link override
  // updateNavigation();

  // Initialize carousel immediately
  console.log("🎠 About to initialize carousel...");
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
  console.log("🎠 Starting carousel initialization...");
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
    console.log("📡 Fetching products from API...");
    const response = await fetch("https://v2.api.noroff.dev/online-shop");
    const result = await response.json();

    console.log("📦 API response status:", response.status);
    console.log("📊 API result structure:", {
      hasData: !!result.data,
      dataLength: result.data ? result.data.length : 0,
      isArray: Array.isArray(result.data),
    });

    if (result && result.data && Array.isArray(result.data)) {
      const products = result.data;
      console.log("✅ Found", products.length, "products");

      // Get 3 random products for carousel
      const shuffled = [...products].sort(() => 0.5 - Math.random());
      carouselProducts = shuffled.slice(0, 3);
      console.log(
        "🎲 Selected random products for carousel:",
        carouselProducts.map((p) => p.title)
      );

      // Clear existing slides
      carouselTrack.innerHTML = "";

      // Create carousel slides one by one
      carouselProducts.forEach((product, index) => {
        const hasDiscount =
          product.discountedPrice && product.discountedPrice < product.price;
        const displayPrice = hasDiscount
          ? product.discountedPrice
          : product.price;

        console.log(
          `🏗️ Creating slide ${index + 1} for product: "${product.title}"`
        );

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

      console.log(
        "✅ Carousel slides created:",
        carouselTrack.children.length,
        "slides total"
      );

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

      // Verify slides were created
      const createdSlides = document.querySelectorAll(".carousel-slide");
      console.log("🔍 Slides in DOM:", createdSlides.length);
      createdSlides.forEach((slide, i) => {
        const productName = slide.getAttribute("data-product");
        console.log(
          `📋 Slide ${i}: "${productName}" - ${
            slide.classList.contains("active") ? "ACTIVE" : "inactive"
          }`
        );
      });

      // Setup controls and indicators
      setupCarouselControlsAndIndicators();

      console.log(
        "🎊 Carousel setup complete with",
        carouselProducts.length,
        "products"
      );
    } else {
      console.error("❌ Invalid API response structure");
      carouselTrack.innerHTML =
        '<div class="carousel-slide active"><div class="slide-content"><h3>No products available</h3></div></div>';
    }
  } catch (error) {
    console.error("❌ Error loading carousel products:", error);

    // Fallback: Create test carousel with dummy products
    console.log("🔧 Creating fallback test carousel...");
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

    console.log(
      "✅ Test carousel created with",
      carouselProducts.length,
      "slides"
    );

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

// Old setupCarouselControls function removed - using the new opacity-based version below
// Old goToSlide function also removed - using the unified version below

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
          <!-- Removed discount badge for simpler student code -->
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

// Carousel navigation functions
function nextSlide() {
  console.log(
    "nextSlide called - current:",
    currentSlide,
    "total products:",
    carouselProducts.length
  );

  if (carouselProducts.length === 0) {
    console.log("No products loaded, cannot navigate");
    return;
  }

  currentSlide = (currentSlide + 1) % carouselProducts.length;
  console.log("Moving to slide:", currentSlide);
  updateCarouselDisplay();
}

function prevSlide() {
  console.log(
    "prevSlide called - current:",
    currentSlide,
    "total products:",
    carouselProducts.length
  );

  if (carouselProducts.length === 0) {
    console.log("No products loaded, cannot navigate");
    return;
  }

  currentSlide =
    (currentSlide - 1 + carouselProducts.length) % carouselProducts.length;
  console.log("Moving to slide:", currentSlide);
  updateCarouselDisplay();
}

function goToSlide(index) {
  console.log(
    "goToSlide called with index:",
    index,
    "total products:",
    carouselProducts.length
  );

  if (carouselProducts.length === 0) {
    console.log("No products loaded, cannot navigate");
    return;
  }

  currentSlide = index;
  console.log("Moving to slide:", currentSlide);
  updateCarouselDisplay();
}

function updateCarouselDisplay() {
  console.log("🎠 Updating carousel display for slide:", currentSlide);

  const slides = document.querySelectorAll(".carousel-slide");
  const indicators = document.querySelectorAll(".carousel-indicator");

  console.log(
    "🔍 Found slides:",
    slides.length,
    "indicators:",
    indicators.length
  );

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

    // Get product title for debugging
    const productName = slide.getAttribute("data-product") || "Unknown";

    console.log(
      `🎯 Slide ${index}: ${
        isActive ? "✅ ACTIVE" : "❌ inactive"
      } - "${productName}"`
    );
  });

  indicators.forEach((indicator, index) => {
    const isActive = index === currentSlide;
    indicator.classList.toggle("active", isActive);
  });

  // Show current product info
  const activeSlide = slides[currentSlide];
  if (activeSlide) {
    const productName =
      activeSlide.getAttribute("data-product") || "Unknown Product";
    console.log(`🎊 NOW SHOWING: "${productName}"`);
  } else {
    console.error(`❌ No slide found at index ${currentSlide}`);
  }
}

// Setup carousel controls and indicators
function setupCarouselControlsAndIndicators() {
  console.log("🎛️ Setting up carousel controls and indicators...");

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
    console.log("✅ Created", carouselProducts.length, "indicators");
  }

  // Navigation buttons
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  console.log("🔍 Button check:");
  console.log("  - Prev button found:", !!prevBtn);
  console.log("  - Next button found:", !!nextBtn);
  console.log("  - Carousel products count:", carouselProducts.length);

  if (prevBtn) {
    // Remove any existing listeners
    prevBtn.replaceWith(prevBtn.cloneNode(true));
    const newPrevBtn = document.getElementById("prevBtn");
    newPrevBtn.addEventListener("click", () => {
      console.log("⬅️ Previous button clicked");
      prevSlide();
    });
  }

  if (nextBtn) {
    // Remove any existing listeners
    nextBtn.replaceWith(nextBtn.cloneNode(true));
    const newNextBtn = document.getElementById("nextBtn");
    newNextBtn.addEventListener("click", () => {
      console.log("➡️ Next button clicked");
      nextSlide();
    });
  }

  // Initialize the display
  currentSlide = 0;
  updateCarouselDisplay();

  // Auto-play carousel
  setInterval(() => {
    if (carouselProducts.length > 1) {
      console.log("⏰ Auto-advancing carousel");
      nextSlide();
    }
  }, 5000); // Change slide every 5 seconds

  console.log("✅ Carousel controls and indicators setup complete");
}

// Email validation helper
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
