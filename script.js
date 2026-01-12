let currentLang = 'en';
let idleTimer;
let fishData = [];
let currentFishId = null;

// 1. Fetch data from our "spreadsheet"
async function init() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        fishData = data.fish;
        renderCards();
        startIdleTimer();

        // Update close button to show "X BACK"
        const closeBtn = document.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.innerHTML = '&#10005; BACK';
        }
    } catch (err) {
        console.error("Error loading fish facts:", err);
    }
}

// 2. Build the carousel cards
function renderCards() {
    const container = document.getElementById('carousel');
    container.innerHTML = fishData.map(f => `
        <div class="fish-card" onclick="openDetail('${f.id}')" style="background-image: url('${f.image}')">
            <div class="info-box">
                <h2>${f.names[currentLang]}</h2>
                <p class="tap-hint">Tap to see more</p>
            </div>
        </div>
    `).join('');

    // Add observer to highlight the centered card
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            } else {
                entry.target.classList.remove('active');
            }
        });
    }, { root: container, threshold: 0.7 });

    document.querySelectorAll('.fish-card').forEach(card => observer.observe(card));
    updateProgressBar(); // Initialize bar at 0%
}

// 3. Language Switcher
function changeLang(lang) {
    currentLang = lang;
    renderCards();
    updateDetailView(); // Update text if detail view is open
    resetIdleTimer(); // Touching a button resets the timer
}

// 4. Detail View Logic
function openDetail(id) {
    currentFishId = id;
    updateDetailView();
    document.getElementById('detail-view').style.display = 'block';
    resetIdleTimer();
}

function closeDetail() {
    currentFishId = null;
    document.getElementById('detail-view').style.display = 'none';
    resetIdleTimer();
}

function updateDetailView() {
    if (!currentFishId) return;
    const fish = fishData.find(f => f.id === currentFishId);
    if (fish) {
        const detailView = document.getElementById('detail-view');

        // Ensure Close Button exists, is visible, and is outside the hero image
        let closeBtn = document.querySelector('.close-btn');
        if (!closeBtn) {
            closeBtn = document.createElement('button');
            closeBtn.className = 'close-btn';
            closeBtn.onclick = closeDetail;
            detailView.appendChild(closeBtn);
        } else if (closeBtn.parentElement !== detailView) {
            detailView.appendChild(closeBtn);
        }
        closeBtn.innerHTML = '&#10005; BACK';

        // Set background image for the full-screen hero effect
        const hero = document.getElementById('detail-image');
        hero.style.backgroundImage = `url('${fish.image}')`;
        hero.style.opacity = '1';
        
        // Inject name and short fact into the hero image overlay
        hero.innerHTML = `
            <div class="hero-overlay">
                <h1>${fish.names[currentLang]}</h1>
                <p>${fish.short_facts ? fish.short_facts[currentLang] : ''}</p>
            </div>
        `;
        
        // Hide the original name element as it's now in the hero image
        const nameEl = document.getElementById('detail-name');
        if (nameEl) nameEl.style.display = 'none';

        document.getElementById('detail-fact').innerText = fish.facts[currentLang];
    }
}

// 4. Inactivity Reset (The "Kiosk" mode)
function startIdleTimer() {
    clearTimeout(idleTimer);
    // After 45 seconds of no touching, scroll back to the first fish
    idleTimer = setTimeout(() => {
        closeDetail(); // Close the detail view if open
        const carousel = document.getElementById('carousel');
        carousel.scrollTo({ left: 0, behavior: 'smooth' });
        changeLang('en'); // Also reset to English
    }, 45000); 
}

function resetIdleTimer() {
    startIdleTimer();
}

// 5. Progress Bar Logic
function updateProgressBar() {
    const carousel = document.getElementById('carousel');
    const progressBar = document.getElementById('progress-bar');
    
    const scrollLeft = carousel.scrollLeft;
    const maxScroll = carousel.scrollWidth - carousel.clientWidth;
    
    const percentage = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0;
    progressBar.style.width = `${percentage}%`;
}

// Listen for touches on the carousel to reset the timer
document.getElementById('carousel').addEventListener('scroll', resetIdleTimer);
document.getElementById('carousel').addEventListener('scroll', updateProgressBar);
document.body.addEventListener('touchstart', resetIdleTimer);

// Enable mouse wheel horizontal scrolling (for desktop testing)
document.getElementById('carousel').addEventListener('wheel', (evt) => {
    evt.preventDefault();
    document.getElementById('carousel').scrollLeft += evt.deltaY + evt.deltaX;
});

// Fade effect for Detail View Hero Image
document.getElementById('detail-view').addEventListener('scroll', function() {
    const hero = document.getElementById('detail-image');
    if (hero) {
        const scrollY = this.scrollTop;
        const opacity = 1 - (scrollY / (hero.clientHeight * 0.7));
        hero.style.opacity = Math.max(0, opacity);
    }
});

init();