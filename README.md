# Exam 2 - Online Shop - Modehub

My second exam attempt. Building a full-featured e-commerce website with JavaScript and the Noroff API. I initially misunderstood the exam requirements and had to restart the project.

## What This Project Does

This is my online shop website for the FED1 exam. It's basically an e-commerce site where people can:

- Browse products in a carousel and see 12+ products on the homepage
- Click on any product to see more details, ratings, and reviews
- Make an account and log in (you need a @stud.noroff.no email)
- Add things to a shopping cart and change how many you want
- Go through checkout with different payment options and delivery address
- Use it on your phone or computer - it works on both
- Everything connects to the Noroff API to get real product data

## Files in This Project

### HTML Pages

- `index.html` - The main homepage with carousel and product feed
- `shop.html` - Browse all products with filtering and search
- `cart.html` - Shopping cart page with quantity management
- `checkout.html` - Checkout form with payment and delivery options
- `product.html` - Individual product details page
- `success.html` - Order confirmation page
- `account/login.html` - User login form
- `account/register.html` - User registration form

### CSS Files

- `css/base.css` - Basic styles and fonts that are used everywhere
- `css/components.css` - Styles for buttons, forms, and cards I use a lot
- `css/homepage.css` - Styles just for the homepage carousel and product grid
- `css/shop.css` - Makes the shop page look good with the product grid
- `css/cart.css` - Shopping cart page styling
- `css/checkout.css` - Checkout form styling
- `css/product.css` - Individual product page styling
- `css/login.css` - Login and register page styling
- `css/success.css` - Success page styling

### JavaScript Files

- `js/api.js` - Handles all the API calls to get data and login stuff
- `js/homepage.js` - Makes the homepage carousel work and loads products
- `js/shop.js` - Shop page with product browsing and search
- `js/cart.js` - Shopping cart that remembers what you added
- `js/checkout.js` - Makes the checkout form work
- `js/product.js` - Individual product page functionality
- `js/login.js` - Login form (using teacher's exact code)
- `js/register.js` - Register form (teacher's code)
- `js/login-register.js` - Combined login/register functionality
- `js/success.js` - Success page stuff

### Project Files

- `PROJECT_PLANNING.md` - Detailed project planning and task breakdown
- `README.md` - This documentation file
- `images/` - Logo and product images

## How to Use

1. Start at `index.html` to see the main page with product carousel
2. Go to `shop.html` to browse all products (you can search too)
3. Click any product to see more details on `product.html`
4. Make an account at `account/register.html` (need @stud.noroff.no email)
5. Log in at `account/login.html` (or use demo: owner@stud.noroff.no / owner123)
6. Add stuff to your cart and check it at `cart.html`
7. Go through checkout at `checkout.html` with payment and address info
8. See your order confirmation at `success.html`

### Demo Account

- **Email**: johnny@stud.noroff.no
- **Password**: Eplekake

## Project Requirements Fulfilled

**Product Feed Page** - Interactive carousel + 12+ product grid  
 **Product Details Page** - Full product info, ratings, share functionality  
 **User Authentication** - Login/register with validation  
 **Shopping Cart** - Add/remove products, quantity management  
 **Checkout Process** - Payment methods, delivery forms  
 **Success Page** - Order confirmation  
 **Responsive Design** - Mobile, tablet, and desktop optimized  
 **API Integration** - Real-time Noroff API data  
 **Form Validation** - Client-side validation with helpful error messages  
 **Loading States** - User feedback during API calls

## What I Used to Build This

- **HTML** - For the page structure and content
- **CSS** - For styling (used Flexbox and Grid to make it responsive)
- **JavaScript** - To make it interactive and connect to the API
- **Noroff API** - To get product data and handle user accounts
- **Local Storage** - So the shopping cart remembers what you added
- **Google Fonts** - For the typography (Inter, Poppins, JetBrains Mono)
- **Git & GitHub** - To save my work and keep track of changes

## Help I Got

- **Cart Design**: Used ideas from a Designmodo tutorial (https://designmodo.com/shopping-cart-ui/)
- **API Setup**: Followed my teacher's guide for connecting to the Noroff API. Got some help from co-pilot to make sure it works and problem solving.
- **Planning**: Got help organizing my project with proper documentation and some suggestions from AI
- **Teacher's Guidance**: Help with the API setup and authentication standards

## What I Learned

- How to connect to APIs with JavaScript
- Creating a carousel
- Making forms for login and registration
- Storing user data in the browser
- Creating a shopping cart that remembers items
- Making websites work on phones and computers
- Not to blindly trust that AI has all the right answers
- How to make use of a README.md file and what it should include.

## How This Project Went

This is my second try at this exam. I misunderstood what we were supposed to do at first, so I had to start over. Once I figured out the requirements properly, I worked really hard to get everything done right. I wish I had caught it before so I could have had more time on design. I also have created a Terms & Conditions page and an About us page. But unsure I will have time to code them. But the design in Figma is present. And I have also created links for them in the footer. When it comes to Project board and Roadmap I'm a bit "bad" and not as driven there as I would like to be. Hopefully I have managed to use it correctly but I fear I have not.

### What I Learned

- How to work with JavaScript APIs and handle async functions
- Making responsive websites that work on phones and computers
- Organizing my code better with separate files for different things
- Setting up user login and keeping people logged in
- Making forms that actually help users when they make mistakes
- Using local storage so the shopping cart remembers what you added
- Building image carousels and loading content dynamically
- Writing proper HTML that makes sense and is accessible

### About AI Help

I did all the main coding and design myself. I got some help with:

- Figuring out how to organize my files better
- Debugging when the API login stuff wasn't working
- Learning better ways to handle errors

This whole thing taught me that AI can help you learn, but you still need to understand what you're doing and write the code yourself.

---

**Student**: Christina Anett Osbakk  
**Course**: FED1JANPT Front end developer
**Year**: 2025
