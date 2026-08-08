/* ==========================================================================
   DIGITAL WEDDING INVITATION - INTERACTIVE LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // --- GOOGLE APPS SCRIPT CONFIGURATION ---
    // Tempelkan URL Web App dari Google Apps Script di dalam tanda kutip di bawah ini
    const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyG4xIqhHpURJXdWIwQdefMzJcmQd3NECXaNLu9tZdASOrvrKd5oEzm4YSwgwXnPAEHeQ/exec';

    function sendToGoogleSheets(payload) {
        if (!GOOGLE_APPS_SCRIPT_URL) return;
        fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).catch(err => console.log('Apps Script error:', err));
    }

    // --- 1. DOM ELEMENTS ---
    const coverOverlay = document.getElementById('coverOverlay');
    const openInvitationBtn = document.getElementById('openInvitationBtn');
    const guestNameCover = document.getElementById('guestNameCover');
    const wishAuthorInput = document.getElementById('wishAuthorInput');
    const bgMusic = document.getElementById('bgMusic');
    const musicToggle = document.getElementById('musicToggle');
    const rsvpForm = document.getElementById('rsvpForm');
    const giftConfirmForm = document.getElementById('giftConfirmForm');
    const wishesForm = document.getElementById('wishesForm');
    const wishesFeed = document.getElementById('wishesFeed');
    const toastNotification = document.getElementById('toastNotification');
    const toastMessage = document.getElementById('toastMessage');

    let isAudioPlaying = false;
    let currentGalleryIndex = 0;
    const galleryImages = [
        './poto/photo1.jpg',
        './poto/photo2.jpg',
        './poto/photo3.jpg',
        './poto/photo4.jpg',
        './poto/photo5.jpg'
    ];

    // --- 2. URL PARAMETER PARSING FOR GUEST NAME ---
    function parseGuestName() {
        const urlParams = new URLSearchParams(window.location.search);
        let guestName = urlParams.get('to') || urlParams.get('n') || urlParams.get('nama');
        
        if (guestName) {
            guestName = decodeURIComponent(guestName.replace(/\+/g, ' '));
            if (guestNameCover) {
                guestNameCover.textContent = guestName;
            }
            if (wishAuthorInput) {
                wishAuthorInput.value = guestName;
            }
        } else {
            if (guestNameCover) {
                guestNameCover.textContent = '-';
            }
            if (wishAuthorInput) {
                wishAuthorInput.value = '';
            }
        }
    }
    parseGuestName();

    // Prevent body scrolling initially while cover overlay is open
    document.body.classList.add('no-scroll');

    // --- 3. BUKA UNDANGAN BUTTON ---
    if (openInvitationBtn) {
        openInvitationBtn.addEventListener('click', () => {
            if (coverOverlay) {
                coverOverlay.classList.add('hidden');
            }
            document.body.classList.remove('no-scroll');

            // Play background music
            playAudio();

            // Trigger animation for visible sections
            observeScrollAnimations();
        });
    }

    // --- 4. AUDIO PLAYER LOGIC ---
    function playAudio() {
        if (!bgMusic) return;
        bgMusic.play().then(() => {
            isAudioPlaying = true;
            if (musicToggle) musicToggle.classList.add('spinning');
        }).catch((err) => {
            console.log('Autoplay restriction or audio play error:', err);
            isAudioPlaying = false;
            if (musicToggle) musicToggle.classList.remove('spinning');
        });
    }

    function toggleAudio() {
        if (!bgMusic) return;
        if (isAudioPlaying) {
            bgMusic.pause();
            isAudioPlaying = false;
            if (musicToggle) musicToggle.classList.remove('spinning');
        } else {
            bgMusic.play();
            isAudioPlaying = true;
            if (musicToggle) musicToggle.classList.add('spinning');
        }
    }

    if (musicToggle) {
        musicToggle.addEventListener('click', toggleAudio);
    }

    // --- 5. LIVE COUNTDOWN TIMER ---
    const targetDate = new Date('June 7, 2026 08:00:00').getTime();

    function updateCountdown() {
        const now = new Date().getTime();
        const difference = targetDate - now;

        const cdDays = document.getElementById('cdDays');
        const cdHours = document.getElementById('cdHours');
        const cdMinutes = document.getElementById('cdMinutes');
        const cdSeconds = document.getElementById('cdSeconds');

        if (difference > 0) {
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            if (cdDays) cdDays.textContent = String(days);
            if (cdHours) cdHours.textContent = String(hours).padStart(2, '0');
            if (cdMinutes) cdMinutes.textContent = String(minutes).padStart(2, '0');
            if (cdSeconds) cdSeconds.textContent = String(seconds).padStart(2, '0');
        } else {
            if (cdDays) cdDays.textContent = '0';
            if (cdHours) cdHours.textContent = '00';
            if (cdMinutes) cdMinutes.textContent = '00';
            if (cdSeconds) cdSeconds.textContent = '00';
        }
    }

    setInterval(updateCountdown, 1000);
    updateCountdown();

    // --- 6. TOAST UTILITY & COPY TO CLIPBOARD ---
    window.showToast = function(msg) {
        if (!toastNotification || !toastMessage) return;
        toastMessage.textContent = msg;
        toastNotification.classList.add('show');
        setTimeout(() => {
            toastNotification.classList.remove('show');
        }, 3500);
    };

    window.copyText = function(elementId, label) {
        const el = document.getElementById(elementId);
        if (!el) return;

        const textToCopy = el.textContent.trim();
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(textToCopy).then(() => {
                showToast(`${label} (${textToCopy}) berhasil disalin!`);
            }).catch(() => {
                fallbackCopyText(textToCopy, label);
            });
        } else {
            fallbackCopyText(textToCopy, label);
        }
    };

    function fallbackCopyText(text, label) {
        const tempInput = document.createElement('textarea');
        tempInput.value = text;
        tempInput.style.position = 'fixed';
        tempInput.style.opacity = '0';
        document.body.appendChild(tempInput);
        tempInput.focus();
        tempInput.select();
        try {
            document.execCommand('copy');
            showToast(`${label} (${text}) berhasil disalin!`);
        } catch (err) {
            showToast(`Gagal menyalin text.`);
        }
        document.body.removeChild(tempInput);
    }

    // --- 7. GIFT CONFIRMATION FORM ---
    if (giftConfirmForm) {
        giftConfirmForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('giftName').value.trim();
            const bank = document.getElementById('giftBank').value.trim();
            const nominal = document.getElementById('giftNominal').value.trim();
            const wishes = document.getElementById('giftWishes').value.trim();

            sendToGoogleSheets({
                action: 'gift',
                name: name,
                bank: bank,
                nominal: nominal,
                wishes: wishes
            });

            const waMsg = `Halo Adinda & Mumu,%0A%0ASaya telah mengirimkan gift dengan rincian:%0ANama: ${encodeURIComponent(name)}%0ABank: ${encodeURIComponent(bank)}%0ANominal: ${encodeURIComponent(nominal)}%0AUcapan: ${encodeURIComponent(wishes)}%0A%0ATerima kasih!`;
            
            showToast('Membuka WhatsApp untuk mengirimkan konfirmasi...');
            setTimeout(() => {
                window.open(`https://wa.me/6289602908403?text=${waMsg}`, '_blank');
            }, 1000);
        });
    }

    // --- 8. RSVP FORM ---
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('rsvpName').value.trim();
            const attendance = document.getElementById('rsvpAttendance').value;
            const countEl = document.getElementById('rsvpCount');
            const count = countEl ? countEl.value : '1 Orang';

            sendToGoogleSheets({
                action: 'rsvp',
                name: name,
                attendance: attendance,
                count: count
            });

            showToast(`Terima kasih ${name}, konfirmasi (${attendance}) Anda berhasil dikirim!`);
            rsvpForm.reset();
        });
    }

    // --- 9. UCAPAN & DOA (GUESTBOOK) PERSISTENCE ---
    const defaultWishes = [];

    function loadWishes() {
        const stored = localStorage.getItem('wedding_wishes_adinda_mumu_v3');
        let wishes = defaultWishes;

        if (stored) {
            try {
                wishes = JSON.parse(stored);
            } catch (e) {
                wishes = defaultWishes;
            }
        } else {
            localStorage.setItem('wedding_wishes_adinda_mumu_v3', JSON.stringify(defaultWishes));
        }

        renderWishesFeed(wishes);
    }

    function renderWishesFeed(wishes) {
        if (!wishesFeed) return;
        wishesFeed.innerHTML = '';

        wishes.forEach(item => {
            const card = document.createElement('div');
            card.className = 'wish-item';

            let badgeClass = 'hadir';
            if (item.attendance === 'Tidak Hadir') badgeClass = 'tidak-hadir';
            if (item.attendance === 'Masih Ragu') badgeClass = 'masih-ragu';

            card.innerHTML = `
                <div class="wish-header">
                    <span class="wish-author">${escapeHtml(item.name)}</span>
                    <span class="wish-badge ${badgeClass}">${escapeHtml(item.attendance || 'Hadir')}</span>
                </div>
                <div class="wish-body">${escapeHtml(item.message)}</div>
                <div class="wish-footer">
                    <span class="wish-time"><i class="far fa-clock"></i> ${escapeHtml(item.time)}</span>
                    <button class="like-btn" onclick="likeWish(${item.id}, this)">
                        <i class="far fa-heart"></i> <span>${item.likes || 0}</span>
                    </button>
                </div>
            `;
            wishesFeed.appendChild(card);
        });
    }

    window.likeWish = function(id, btn) {
        const stored = localStorage.getItem('wedding_wishes_adinda_mumu_v3');
        let wishes = stored ? JSON.parse(stored) : defaultWishes;
        const target = wishes.find(w => w.id === id);

        if (target) {
            target.likes = (target.likes || 0) + 1;
            localStorage.setItem('wedding_wishes_adinda_mumu_v3', JSON.stringify(wishes));
            const countSpan = btn.querySelector('span');
            const heartIcon = btn.querySelector('i');
            if (countSpan) countSpan.textContent = target.likes;
            if (heartIcon) {
                heartIcon.classList.remove('far');
                heartIcon.classList.add('fas');
            }
            btn.classList.add('liked');
        }
    };

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    if (wishesForm) {
        wishesForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const author = wishAuthorInput ? wishAuthorInput.value.trim() : 'Tamu';
            const textInput = document.getElementById('wishTextInput');
            const message = textInput ? textInput.value.trim() : '';

            if (!author || !message) return;

            const newWish = {
                id: Date.now(),
                name: author,
                attendance: 'Hadir',
                message: message,
                time: 'Baru saja',
                likes: 0
            };

            sendToGoogleSheets({
                action: 'wish',
                name: author,
                attendance: 'Hadir',
                message: message
            });

            const stored = localStorage.getItem('wedding_wishes_adinda_mumu_v3');
            let wishes = stored ? JSON.parse(stored) : defaultWishes;
            wishes.unshift(newWish);
            localStorage.setItem('wedding_wishes_adinda_mumu_v3', JSON.stringify(wishes));

            renderWishesFeed(wishes);
            if (textInput) textInput.value = '';

            showToast('Ucapan & doa Anda berhasil terkirim!');
        });
    }

    loadWishes();

    // --- 10. LIGHTBOX MODAL FOR GALLERY ---
    window.openLightbox = function(index) {
        currentGalleryIndex = index;
        const modal = document.getElementById('lightboxModal');
        const img = document.getElementById('lightboxImg');
        if (modal && img) {
            img.src = galleryImages[index];
            modal.classList.add('show');
        }
    };

    window.closeLightbox = function(event) {
        if (event && event.target && (event.target.id === 'lightboxImg' || event.target.classList.contains('lightbox-nav'))) {
            return;
        }
        const modal = document.getElementById('lightboxModal');
        if (modal) {
            modal.classList.remove('show');
        }
    };

    window.nextLightbox = function(event) {
        if (event) event.stopPropagation();
        currentGalleryIndex = (currentGalleryIndex + 1) % galleryImages.length;
        const img = document.getElementById('lightboxImg');
        if (img) img.src = galleryImages[currentGalleryIndex];
    };

    window.prevLightbox = function(event) {
        if (event) event.stopPropagation();
        currentGalleryIndex = (currentGalleryIndex - 1 + galleryImages.length) % galleryImages.length;
        const img = document.getElementById('lightboxImg');
        if (img) img.src = galleryImages[currentGalleryIndex];
    };

    // --- 11. SCROLL ANIMATIONS (INTERSECTION OBSERVER) ---
    function observeScrollAnimations() {
        const animElements = document.querySelectorAll('.fade-in-up, .auto-popup');
        
        const observerOptions = {
            root: null,           // use viewport
            rootMargin: '0px 0px -40px 0px',
            threshold: 0.05       // trigger when just 5% of element is visible
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    // Stagger delay so multiple cards pop in sequence
                    const delay = entry.target.dataset.delay || (i * 80);
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, Math.min(delay, 400));
                    observer.unobserve(entry.target); // once visible, stop watching
                }
            });
        }, observerOptions);

        animElements.forEach((el, i) => {
            el.dataset.delay = i * 80;
            observer.observe(el);
        });
    }
    observeScrollAnimations();

    // --- 12. ACTIVE BOTTOM NAV TRACKING & AUTO-POPUP TRIGGER ---
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.getAttribute('href');
            if (targetId && targetId.startsWith('#')) {
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    const popElements = targetSection.querySelectorAll('.fade-in-up, .auto-popup, .arch-card');
                    popElements.forEach(el => {
                        el.classList.remove('visible');
                        setTimeout(() => { el.classList.add('visible'); }, 50);
                    });
                }
            }
        });
    });

    window.addEventListener('scroll', () => {
        let currentSectionId = '';
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 150;
            const sectionHeight = section.offsetHeight;
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${currentSectionId}`) {
                item.classList.add('active');
            }
        });
    });

    // --- 13. SAVE THE DATE PHOTO SLIDER LOGIC ---
    const stdTrack = document.getElementById('stdSliderTrack');
    const stdPrevBtn = document.getElementById('stdPrevBtn');
    const stdNextBtn = document.getElementById('stdNextBtn');
    const stdDots = document.querySelectorAll('#stdSliderDots .dot');
    
    if (stdTrack) {
        let currentStdIndex = 0;
        const totalStdSlides = stdTrack.children.length;
        let stdAutoSlideTimer = null;

        function goToStdSlide(index) {
            if (index < 0) index = totalStdSlides - 1;
            if (index >= totalStdSlides) index = 0;

            currentStdIndex = index;
            const slides = stdTrack.querySelectorAll('.slide-item');
            slides.forEach((slide, idx) => {
                if (idx === currentStdIndex) {
                    slide.classList.add('active');
                } else {
                    slide.classList.remove('active');
                }
            });

            stdDots.forEach((dot, idx) => {
                if (idx === currentStdIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }

        function nextStdSlide() {
            goToStdSlide(currentStdIndex + 1);
        }

        function prevStdSlide() {
            goToStdSlide(currentStdIndex - 1);
        }

        function startStdAutoSlide() {
            stopStdAutoSlide();
            stdAutoSlideTimer = setInterval(nextStdSlide, 3500);
        }

        function stopStdAutoSlide() {
            if (stdAutoSlideTimer) clearInterval(stdAutoSlideTimer);
        }

        if (stdNextBtn) {
            stdNextBtn.addEventListener('click', () => {
                nextStdSlide();
                startStdAutoSlide();
            });
        }

        if (stdPrevBtn) {
            stdPrevBtn.addEventListener('click', () => {
                prevStdSlide();
                startStdAutoSlide();
            });
        }

        stdDots.forEach((dot, idx) => {
            dot.addEventListener('click', () => {
                goToStdSlide(idx);
                startStdAutoSlide();
            });
        });

        // Mouse Drag Support for Save The Date Slider
        let isStdMouseDown = false;
        let stdStartX = 0;

        stdTrack.addEventListener('mousedown', (e) => {
            isStdMouseDown = true;
            stdStartX = e.clientX;
            stopStdAutoSlide();
        });

        stdTrack.addEventListener('mouseup', (e) => {
            if (!isStdMouseDown) return;
            isStdMouseDown = false;
            const diff = stdStartX - e.clientX;
            if (Math.abs(diff) > 30) {
                if (diff > 0) nextStdSlide();
                else prevStdSlide();
            }
            startStdAutoSlide();
        });

        stdTrack.addEventListener('mouseleave', () => {
            if (isStdMouseDown) {
                isStdMouseDown = false;
                startStdAutoSlide();
            }
        });

        // Touch Swipe Gestures
        let startX = 0;
        let endX = 0;

        stdTrack.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            stopStdAutoSlide();
        }, { passive: true });

        stdTrack.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            const diff = startX - endX;
            if (Math.abs(diff) > 30) {
                if (diff > 0) nextStdSlide();
                else prevStdSlide();
            }
            startStdAutoSlide();
        }, { passive: true });

        // Start Auto Slide Initial
        startStdAutoSlide();
    }

    // --- 14. OUR GALLERY CONTINUOUS MARQUEE & MOUSE/TOUCH DRAG ---
    const galleryWrapper = document.getElementById('galleryMarqueeWrapper');
    const galleryTrack = document.getElementById('galleryMarqueeTrack');

    if (galleryWrapper && galleryTrack) {
        let isMouseDown = false;
        let startX = 0;
        let scrollLeft = 0;
        let marqueeSpeed = 0.8; // Pixels per frame for smooth continuous walking
        let isHoveredOrDragging = false;

        function autoScrollMarquee() {
            if (!isHoveredOrDragging) {
                galleryWrapper.scrollLeft += marqueeSpeed;

                // Loop seamlessly when half of track (duplicated set) is passed
                const halfWidth = galleryTrack.scrollWidth / 2;
                if (galleryWrapper.scrollLeft >= halfWidth) {
                    galleryWrapper.scrollLeft -= halfWidth;
                } else if (galleryWrapper.scrollLeft <= 0) {
                    galleryWrapper.scrollLeft += halfWidth;
                }
            }
            requestAnimationFrame(autoScrollMarquee);
        }

        // Mouse Drag Controls
        galleryWrapper.addEventListener('mousedown', (e) => {
            isMouseDown = true;
            isHoveredOrDragging = true;
            startX = e.pageX - galleryWrapper.offsetLeft;
            scrollLeft = galleryWrapper.scrollLeft;
        });

        galleryWrapper.addEventListener('mouseleave', () => {
            isMouseDown = false;
            isHoveredOrDragging = false;
        });

        galleryWrapper.addEventListener('mouseup', () => {
            isMouseDown = false;
            setTimeout(() => { isHoveredOrDragging = false; }, 1200);
        });

        galleryWrapper.addEventListener('mousemove', (e) => {
            if (!isMouseDown) return;
            e.preventDefault();
            const x = e.pageX - galleryWrapper.offsetLeft;
            const walk = (x - startX) * 1.5;
            galleryWrapper.scrollLeft = scrollLeft - walk;
        });

        // Touch Drag Controls
        galleryWrapper.addEventListener('touchstart', () => {
            isHoveredOrDragging = true;
        }, { passive: true });

        galleryWrapper.addEventListener('touchend', () => {
            setTimeout(() => { isHoveredOrDragging = false; }, 1200);
        }, { passive: true });

        // Pause auto-walk on mouse hover
        galleryWrapper.addEventListener('mouseenter', () => {
            isHoveredOrDragging = true;
        });

        // Start continuous marquee animation
        autoScrollMarquee();
    }
});
