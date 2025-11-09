// Mobile Navigation Hamburger Menu
document.addEventListener("DOMContentLoaded", function() {
  const hamburgerMenu = document.querySelector('.hamburger-menu');
  const nav = document.querySelector('nav');
  
  if (hamburgerMenu && nav) {
    hamburgerMenu.addEventListener('click', function() {
      // Toggle active class on hamburger for animation
      hamburgerMenu.classList.toggle('active');
      
      // Toggle active class on nav to show/hide menu
      nav.classList.toggle('active');
      
      // Toggle aria-expanded for accessibility
      const isExpanded = hamburgerMenu.getAttribute('aria-expanded') === 'true';
      hamburgerMenu.setAttribute('aria-expanded', !isExpanded);
    });
    
    // Close mobile menu when clicking on a nav link
    const navLinks = nav.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        hamburgerMenu.classList.remove('active');
        nav.classList.remove('active');
        hamburgerMenu.setAttribute('aria-expanded', 'false');
      });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
      if (!hamburgerMenu.contains(event.target) && !nav.contains(event.target)) {
        hamburgerMenu.classList.remove('active');
        nav.classList.remove('active');
        hamburgerMenu.setAttribute('aria-expanded', 'false');
      }
    });
    
    // Close mobile menu on window resize if desktop size
    window.addEventListener('resize', function() {
      if (window.innerWidth > 768) {
        hamburgerMenu.classList.remove('active');
        nav.classList.remove('active');
        hamburgerMenu.setAttribute('aria-expanded', 'false');
      }
    });
  }
});