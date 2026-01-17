let currentLang = 'en';
let idleTimer;
let fishData = [];
let currentFishId = null;

// Conservation Status Definitions (Wikipedia Style Colors)
const conservationStatus = {
    "EX": { text: "Extinct", color: "#000000", description: "No known individuals remaining." },
    "EW": { text: "Extinct in the Wild", color: "#000000", description: "Known only to survive in captivity." },
    "CR": { text: "Critically Endangered", color: "#D81E05", description: "Extremely high risk of extinction in the wild." },
    "EN": { text: "Endangered", color: "#FC7F3F", description: "Very high risk of extinction in the wild." },
    "VU": { text: "Vulnerable", color: "#F9E814", description: "High risk of endangerment in the wild." },
    "NT": { text: "Near Threatened", color: "#CCE226", description: "Likely to become endangered in the near future." },
    "LC": { text: "Least Concern", color: "#60C659", description: "Lowest risk. Widespread and abundant." }
};

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
    const detailView = document.getElementById('detail-view');
    detailView.style.display = 'block';
    detailView.scrollTop = 0;
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
        
        // Prepare status badge for hero
        let statusBadge = '';
        if (fish.conservation && conservationStatus[fish.conservation]) {
            const s = conservationStatus[fish.conservation];
            statusBadge = `<div class="hero-status-badge" style="background-color: ${s.color}">${s.text}</div>`;
        }

        // Inject name and short fact into the hero image overlay
        hero.innerHTML = `
            <div class="hero-overlay">
                ${statusBadge}
                <h1>${fish.names[currentLang]}</h1>
                <p>${fish.short_facts ? fish.short_facts[currentLang] : ''}</p>
            </div>
        `;
        
        // --- SECTIONS 2 & 3: Fun Fact & Habitat ---
        // Split the facts into two parts (assuming \n\n separator in JSON)
        const factParts = fish.facts[currentLang].split('\n\n');
        const funFact = factParts[0] || "";
        const habitatFact = factParts.slice(1).join('\n\n') || ""; // Join remaining parts if any

        const detailsContainer = document.querySelector('.fish-details');
        
        // Rebuild the details container with the new 2-column layout
        detailsContainer.innerHTML = `
            <div class="detail-row">
                <div class="detail-text">
                    <h3>Fun Fact</h3>
                    <p>${funFact}</p>
                </div>
                <div class="detail-media illustration-placeholder">
                    <span>Illustration</span>
                </div>
            </div>
            ${habitatFact ? `
            <div class="detail-row">
                <div class="detail-text">
                    <h3>Habitat & Lifestyle</h3>
                    <p>${habitatFact}</p>
                </div>
                <div class="detail-media map-placeholder">
                    <span>Distribution Map</span>
                </div>
            </div>
            ` : ''}
        `;

        // --- NEW: Conservation Status Section ---
        // 1. Remove any existing status box to prevent duplicates
        const oldStatus = document.getElementById('conservation-box');
        if (oldStatus) oldStatus.remove();

        // 2. If fish has a status, create and append the box
        if (fish.conservation && conservationStatus[fish.conservation]) {
            const currentStatus = conservationStatus[fish.conservation];
            
            const statusBox = document.createElement('div');
            statusBox.id = 'conservation-box';
            
            // Generate the scale HTML by looping through all statuses
            let scaleHTML = '<div class="conservation-scale">';
            for (const key in conservationStatus) {
                const s = conservationStatus[key];
                const isActive = (key === fish.conservation) ? 'active' : '';
                scaleHTML += `
                    <div class="status-indicator ${isActive}" style="--bg-color: ${s.color}">
                        <span>${key}</span>
                    </div>
                `;
            }
            scaleHTML += '</div>';

            statusBox.innerHTML = `
                <h3>Conservation Status</h3>
                ${scaleHTML}
                <div class="status-explanation">
                    <strong style="color: ${currentStatus.color}">${currentStatus.text}</strong>
                    <p>${currentStatus.description}</p>
                </div>
            `;
            detailsContainer.appendChild(statusBox);
        }
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