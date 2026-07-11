document.addEventListener('DOMContentLoaded', () => {
    
    // Elements
    const loginScreen = document.getElementById('login-screen');
    const dashboardScreen = document.getElementById('dashboard-screen');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logout-btn');
    
    const submissionsGrid = document.getElementById('submissions-grid');
    const loader = document.getElementById('loader');
    const noResults = document.getElementById('no-results');
    const totalWishesEl = document.getElementById('total-wishes');
    
    const searchInput = document.getElementById('search-input');
    const sideFilter = document.getElementById('side-filter');

    const imageModal = document.getElementById('image-modal');
    const fullImage = document.getElementById('full-image');
    const closeModal = document.querySelector('.close-modal');

    const detailModal = document.getElementById('detail-modal');
    const detailModalContent = document.getElementById('detail-modal-content');
    const closeDetailModal = document.querySelector('.close-detail-modal');

    let allSubmissions = [];

    // Check token on load
    const token = localStorage.getItem('wedding_admin_token');
    if (token) {
        showDashboard();
    }

    // --- LOGIN LOGIC ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const submitBtn = document.getElementById('login-btn');
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';
        loginError.textContent = '';

        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (data.success) {
                localStorage.setItem('wedding_admin_token', data.token);
                showDashboard();
            } else {
                loginError.textContent = data.message || 'Invalid credentials';
            }
        } catch (err) {
            loginError.textContent = 'Server error. Please try again.';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Log In';
        }
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('wedding_admin_token');
        loginScreen.style.display = 'flex';
        dashboardScreen.style.display = 'none';
        submissionsGrid.innerHTML = '';
        allSubmissions = [];
    });

    // --- DASHBOARD LOGIC ---
    async function showDashboard() {
        loginScreen.style.display = 'none';
        dashboardScreen.style.display = 'block';
        
        fetchSubmissions();
    }

    async function fetchSubmissions() {
        loader.style.display = 'block';
        submissionsGrid.innerHTML = '';
        noResults.style.display = 'none';
        
        const token = localStorage.getItem('wedding_admin_token');

        try {
            const res = await fetch('/api/admin/submissions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (data.success) {
                allSubmissions = data.data;
                totalWishesEl.textContent = data.count;
                renderCards(allSubmissions);
            } else {
                // Token invalid
                logoutBtn.click();
            }
        } catch (err) {
            console.error(err);
            loader.innerHTML = '<p>Error loading wishes.</p>';
        } finally {
            loader.style.display = 'none';
        }
    }

    function renderCards(submissions) {
        submissionsGrid.innerHTML = '';
        if (submissions.length === 0) {
            noResults.style.display = 'block';
            return;
        }
        noResults.style.display = 'none';

        submissions.forEach((sub, index) => {
            const card = document.createElement('div');
            card.className = 'submission-card';
            card.style.cursor = 'pointer';
            card.onclick = () => openDetailModal(sub);

            const displayName = sub.isAnonymous ? 'Anonymous Guest' : sub.guestName;
            
            // Stars
            let starsHtml = '';
            for(let i=0; i<sub.blessingMeter; i++) {
                starsHtml += '<i class="fa-solid fa-star"></i>';
            }
            
            let iconsHtml = '';
            if (sub.voiceNoteUrl) iconsHtml += '<i class="fa-solid fa-microphone" style="margin-right:8px; color:var(--sage-green);"></i>';
            if (sub.photoUrls && sub.photoUrls.length > 0) iconsHtml += '<i class="fa-solid fa-image" style="margin-right:8px; color:var(--sage-green);"></i>';

            let shortWish = sub.wishes.length > 80 ? sub.wishes.substring(0, 80) + '...' : sub.wishes;

            card.innerHTML = `
                <div class="card-header">
                    <div class="guest-info">
                        <h2>${sub.isPinned ? '<i class="fa-solid fa-thumbtack" style="color:var(--gold); margin-right:8px; font-size:1rem;"></i>' : ''}${displayName}</h2>
                        <div class="guest-meta">
                            <span class="tag">${sub.side}</span>
                            <span class="tag">${sub.relationship}</span>
                        </div>
                    </div>
                    <div class="blessing-rating">${starsHtml}</div>
                </div>

                <div class="card-section" style="flex-grow: 1;">
                    <p style="font-style: italic; margin-top: 10px;">"${shortWish}"</p>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 15px;">
                    <div>${iconsHtml}</div>
                    <div class="timestamp" style="margin-top: 0;">${new Date(sub.submittedAt).toLocaleDateString()}</div>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px; border-top: 1px solid var(--cream); padding-top: 10px;">
                    <button class="action-btn pin-btn ${sub.isPinned ? 'pinned' : ''}" onclick="event.stopPropagation(); window.togglePin('${sub._id}')" title="Pin to top">
                        <i class="fa-solid fa-thumbtack"></i>
                    </button>
                    <span style="color: var(--sage-green); font-size: 0.9rem; font-weight: bold;">Click to view full details</span>
                    <button class="action-btn delete-btn" onclick="event.stopPropagation(); window.deleteSubmission('${sub._id}')" title="Delete wish">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `;

            submissionsGrid.appendChild(card);
        });
    }

    function openDetailModal(sub) {
        const displayName = sub.isAnonymous ? 'Anonymous Guest' : sub.guestName;
        
        let starsHtml = '';
        for(let i=0; i<sub.blessingMeter; i++) {
            starsHtml += '<i class="fa-solid fa-star"></i>';
        }

        let predictionsHtml = '';
        if (sub.predictions && sub.predictions.length > 0) {
            predictionsHtml = sub.predictions.map(p => `<span class="tag">${p}</span>`).join('');
        }
        if (sub.customPrediction) {
            predictionsHtml += `<span class="tag">${sub.customPrediction}</span>`;
        }

        let mediaHtml = '';
        if (sub.voiceNoteUrl || (sub.photoUrls && sub.photoUrls.length > 0)) {
            mediaHtml += `<div class="media-section" style="margin-top: 20px;">`;
            
            if (sub.voiceNoteUrl) {
                mediaHtml += `<div style="margin-bottom: 15px;">
                                <h3>Voice Note</h3>
                                <audio controls class="audio-player">
                                    <source src="${sub.voiceNoteUrl}">
                                    Your browser does not support the audio element.
                                </audio>
                              </div>`;
            }

            if (sub.photoUrls && sub.photoUrls.length > 0) {
                mediaHtml += `<div>
                                <h3>Photos</h3>
                                <div class="photo-gallery">`;
                sub.photoUrls.forEach(url => {
                    mediaHtml += `<img src="${url}" class="photo-thumb" style="width: 120px; height: 120px;" onclick="event.stopPropagation(); openImageModal('${url}')" alt="Guest Photo">`;
                });
                mediaHtml += `  </div>
                              </div>`;
            }
            
            mediaHtml += `</div>`;
        }

        detailModalContent.innerHTML = `
            <div class="card-header" style="border-bottom: 2px solid rgba(156, 180, 166, 0.3); padding-bottom: 20px; margin-bottom: 20px; padding-right: 40px;">
                <div class="guest-info">
                    <h2 style="font-size: 2rem;">${displayName}</h2>
                    <div class="guest-meta" style="margin-top: 10px;">
                        <span class="tag">${sub.side}</span>
                        <span class="tag">${sub.relationship}</span>
                    </div>
                </div>
                <div class="blessing-rating" style="font-size: 1.5rem;">${starsHtml}</div>
            </div>

            <div class="card-section" style="margin-bottom: 20px;">
                <h3 style="font-size: 1.1rem;">Wishes</h3>
                <p style="font-size: 1.1rem; padding: 15px; background: rgba(156, 180, 166, 0.1); border-radius: 8px;">${sub.wishes}</p>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                <div class="card-section">
                    <h3 style="color: var(--sage-green);">Advice: Do</h3>
                    <p style="padding: 15px; background: var(--cream); border-radius: 8px; height: 100%;">${sub.marriageDos}</p>
                </div>
                <div class="card-section">
                    <h3 style="color: var(--sage-green);">Advice: Don't</h3>
                    <p style="padding: 15px; background: var(--cream); border-radius: 8px; height: 100%;">${sub.marriageDonts}</p>
                </div>
            </div>

            ${sub.favoriteMemory ? `
            <div class="card-section" style="margin-bottom: 20px;">
                <h3>Favorite Memory</h3>
                <p style="padding: 15px; background: var(--cream); border-radius: 8px;">${sub.favoriteMemory}</p>
            </div>` : ''}

            ${predictionsHtml ? `
            <div class="card-section" style="margin-bottom: 20px;">
                <h3>Predictions</h3>
                <div style="padding: 15px; background: rgba(212, 175, 55, 0.1); border-radius: 8px;">${predictionsHtml}</div>
            </div>` : ''}
            
            ${sub.additionalMessage ? `
            <div class="card-section" style="margin-bottom: 20px;">
                <h3>Additional Message</h3>
                <p style="padding: 15px; background: var(--cream); border-radius: 8px;">${sub.additionalMessage}</p>
            </div>` : ''}

            ${mediaHtml}

            <div class="timestamp" style="margin-top: 20px; font-size: 0.9rem;">
                Submitted At: ${new Date(sub.submittedAt).toLocaleString()}
            </div>
        `;

        detailModal.style.display = 'flex';
    }

    // --- FILTERING ---
    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase();
        const sideVal = sideFilter.value;

        const filtered = allSubmissions.filter(sub => {
            const matchesSide = sideVal === 'All' || sub.side === sideVal;
            
            const searchString = `${sub.guestName} ${sub.wishes} ${sub.marriageDos} ${sub.marriageDonts}`.toLowerCase();
            const matchesSearch = searchString.includes(searchTerm);

            return matchesSide && matchesSearch;
        });

        renderCards(filtered);
    }

    searchInput.addEventListener('input', applyFilters);
    sideFilter.addEventListener('change', applyFilters);

    window.openImageModal = (url) => {
        fullImage.src = url;
        imageModal.style.display = 'flex';
    };

    closeModal.addEventListener('click', () => {
        imageModal.style.display = 'none';
    });

    imageModal.addEventListener('click', (e) => {
        if (e.target === imageModal) {
            imageModal.style.display = 'none';
        }
    });

    window.togglePin = async (id) => {
        const token = localStorage.getItem('wedding_admin_token');
        try {
            const res = await fetch(`/api/admin/submissions/${id}/pin`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                fetchSubmissions();
            } else {
                alert('Failed to pin.');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to pin.');
        }
    };

    window.deleteSubmission = async (id) => {
        if (!confirm("Are you sure you want to delete this wish?")) return;
        if (!confirm("Are you ABSOLUTELY sure? This action cannot be undone.")) return;
        
        const token = localStorage.getItem('wedding_admin_token');
        try {
            const res = await fetch(`/api/admin/submissions/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                fetchSubmissions();
            } else {
                alert('Failed to delete.');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to delete.');
        }
    };

    if(closeDetailModal) {
        closeDetailModal.addEventListener('click', () => {
            detailModal.style.display = 'none';
            // Stop audio if playing
            const audio = detailModal.querySelector('audio');
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }
        });
    }

    detailModal.addEventListener('click', (e) => {
        if (e.target === detailModal) {
            closeDetailModal.click();
        }
    });

});
