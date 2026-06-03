// State Management
let sessionUser = JSON.parse(localStorage.getItem('ll_user')) || null;
let issues = JSON.parse(localStorage.getItem('ll_issues')) || [
    { id: 1, title: 'Broken streetlight', category: 'Streetlight', status: 'Pending', location: '4th & Main', icon: '💡', upvotes: 12, img: null }
];
let appMap, userMarker, currentImg = null;

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    updateNav();
    showView('landing');
});

function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    document.getElementById(viewId + '-view').classList.remove('hidden');
    
    if (viewId === 'report') setTimeout(initMap, 200);
    if (viewId === 'feed') renderFeed();
    if (viewId === 'profile') renderProfile();
    
    window.scrollTo(0,0);
}

function updateNav() {
    const nav = document.getElementById('nav-links');
    let html = `<button onclick="showView('landing')"><i class="fas fa-home"></i> Home</button>`;
    
    if(sessionUser) {
        html += `
            <button onclick="showView('feed')">Feed</button>
            <div class="avatar-sm" onclick="showView('profile')">${sessionUser.email[0].toUpperCase()}</div>
        `;
    } else {
        html += `<button class="btn-report" onclick="showView('auth')">Login</button>`;
    }
    nav.innerHTML = html;
}

function initMap() {
    if (appMap) { appMap.invalidateSize(); return; }
    appMap = L.map('map').setView([12.97, 77.59], 13); // Default view
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(appMap);
    
    appMap.on('click', (e) => {
        if (userMarker) userMarker.setLatLng(e.latlng);
        else userMarker = L.marker(e.latlng).addTo(appMap);
        document.getElementById('report-location').value = `${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`;
    });
}

function handleImageUpload(e) {
    const reader = new FileReader();
    reader.onload = () => {
        currentImg = reader.result;
        const prev = document.getElementById('image-preview');
        prev.style.backgroundImage = `url(${currentImg})`;
        prev.classList.remove('hidden');
    }
    reader.readAsDataURL(e.target.files[0]);
}

function submitReport() {
    const title = document.getElementById('report-title').value;
    const loc = document.getElementById('report-location').value;
    
    if(!title || !loc) return alert("Please set a title and click the map for location.");

    const icons = { "Streetlight": "💡", "Pothole": "🕳️", "Garbage": "🗑️", "Water Leak": "💧" };
    
    issues.unshift({
        id: Date.now(),
        title: title,
        location: loc,
        category: document.getElementById('report-category').value,
        status: 'Pending',
        upvotes: 1,
        icon: icons[document.getElementById('report-category').value] || '📍',
        img: currentImg
    });

    localStorage.setItem('ll_issues', JSON.stringify(issues));
    
    // Clear form
    document.getElementById('report-title').value = '';
    document.getElementById('image-preview').classList.add('hidden');
    currentImg = null;
    
    showView('feed');
}

function renderFeed() {
    const container = document.getElementById('feed-container');
    container.innerHTML = issues.map(iss => `
        <div class="issue-card">
            <div class="upvote-section"><i class="fas fa-arrow-up"></i><span>${iss.upvotes}</span></div>
            <div class="issue-img" style="${iss.img ? `background-image:url(${iss.img})` : ''}">
                ${!iss.img ? iss.icon : ''}
            </div>
            <div class="issue-details">
                <div><span class="cat-badge">${iss.category}</span><span class="status-badge">${iss.status}</span></div>
                <h3 style="margin:5px 0">${iss.title}</h3>
                <p style="font-size:0.8rem; color:var(--gray)"><i class="fas fa-map-marker-alt"></i> ${iss.location}</p>
            </div>
        </div>
    `).join('');
}

function login() {
    const email = document.getElementById('user-email').value;
    if(!email.includes('@')) return alert("Enter a valid email");
    sessionUser = { email };
    localStorage.setItem('ll_user', JSON.stringify(sessionUser));
    updateNav();
    showView('landing');
}

function renderProfile() {
    document.getElementById('prof-email').innerText = sessionUser.email;
    document.getElementById('profile-avatar').innerText = sessionUser.email[0].toUpperCase();
}

function logout() {
    sessionUser = null;
    localStorage.removeItem('ll_user');
    updateNav();
    showView('landing');
}
