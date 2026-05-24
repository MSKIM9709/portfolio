document.addEventListener('DOMContentLoaded', () => {
    // 1. Scroll Progress Bar & Navbar Styling
    const scrollIndicator = document.getElementById('scrollIndicator');
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        // Calculate scroll percentage
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        if (scrollIndicator) {
            scrollIndicator.style.width = scrolled + '%';
        }

        // Toggle scrolled class on navbar
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 2. Smooth Scroll for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                const navbarHeight = navbar.offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 3. Reveal Elements on Scroll & Animate Skill Bars
    const revealElements = document.querySelectorAll('.reveal');
    const skillBars = document.querySelectorAll('.vis-bar-fill');
    
    // Set initially empty width for skill bars to trigger animation on scroll
    skillBars.forEach(bar => {
        const finalWidth = bar.style.width;
        bar.style.width = '0%';
        bar.dataset.finalWidth = finalWidth;
    });

    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                
                // If it's the capability section or contains skill bars, animate them
                if (entry.target.id === 'analytics') {
                    animateSkillBars();
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    function animateSkillBars() {
        skillBars.forEach(bar => {
            const width = bar.dataset.finalWidth;
            setTimeout(() => {
                bar.style.width = width;
            }, 100);
        });
    }

    // 4. Clipboard Copy with Toast Feedback for Email
    const emailBox = document.getElementById('emailBox');
    const toastMsg = document.getElementById('toastMsg');

    if (emailBox && toastMsg) {
        emailBox.addEventListener('click', () => {
            const emailAddress = emailBox.querySelector('.email-address').textContent;
            
            // Clipboard API
            navigator.clipboard.writeText(emailAddress).then(() => {
                // Show toast
                toastMsg.classList.add('show');
                
                // Hide toast after 2 seconds
                setTimeout(() => {
                    toastMsg.classList.remove('show');
                }, 2000);
            }).catch(err => {
                console.error('Could not copy text: ', err);
            });
        });
    }
});

// 5. Project Tab Switching Function (Global scope for onclick bindings)
function openProjectTab(event, tabId) {
    // Hide all project tab contents
    const tabContents = document.querySelectorAll('.project-tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });

    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
    });

    // Show current tab content and add active class to button
    const activeContent = document.getElementById(tabId);
    if (activeContent) {
        activeContent.classList.add('active');
    }
    
    event.currentTarget.classList.add('active');
}
