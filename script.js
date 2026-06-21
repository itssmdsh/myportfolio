/* =========================================================================
   Mohammad's Premium Developer Portfolio - Interactive Logic
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. THEME SWITCHER LOGIC ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    const themeIcon = themeToggleBtn.querySelector('i');
    
    // Check local storage or system preference
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    } else {
        const defaultTheme = 'dark';
        htmlElement.setAttribute('data-theme', defaultTheme);
        updateThemeIcon(defaultTheme);
    }
    
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
    
    function updateThemeIcon(theme) {
        if (theme === 'dark') {
            themeIcon.className = 'fa-solid fa-sun';
        } else {
            themeIcon.className = 'fa-solid fa-moon';
        }
    }

    // --- 2. SCROLL PROGRESS & NAVBAR STICKINESS ---
    const scrollProgress = document.getElementById('scroll-progress');
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');
    
    window.addEventListener('scroll', () => {
        // Scroll Progress Bar
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = (scrollTop / docHeight) * 100;
        if (scrollProgress) {
            scrollProgress.style.width = scrolled + '%';
        }
        
        // Sticky Navbar styling
        if (scrollTop > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Active Link Tracker
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            if (scrollTop >= sectionTop && scrollTop < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });

    // --- 3. MOBILE MENU TOGGLE ---
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        navMenu.classList.toggle('open');
    });
    
    // Close menu when clicking links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('open');
            navMenu.classList.remove('open');
        });
    });

    // --- 4. GLOWING CARD EFFECT ---
    const glassCards = document.querySelectorAll('.glass');
    
    glassCards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.setProperty('--x', `${x}px`);
            card.style.setProperty('--y', `${y}px`);
        });
    });

    // --- 5. DOUBLE INFINITE SCROLL CAROUSEL SETUP ---
    const carouselTrackA = document.getElementById('carousel-track-a');
    if (carouselTrackA) {
        const slides = Array.from(carouselTrackA.children);
        slides.forEach(slide => {
            const clone = slide.cloneNode(true);
            carouselTrackA.appendChild(clone);
        });
    }

    const carouselTrackB = document.getElementById('carousel-track-b');
    if (carouselTrackB) {
        const slides = Array.from(carouselTrackB.children);
        slides.forEach(slide => {
            const clone = slide.cloneNode(true);
            carouselTrackB.appendChild(clone);
        });
    }

    const carouselTrackC = document.getElementById('carousel-track-c');
    if (carouselTrackC) {
        const slides = Array.from(carouselTrackC.children);
        slides.forEach(slide => {
            const clone = slide.cloneNode(true);
            carouselTrackC.appendChild(clone);
        });
    }

    // --- 5B. LIVE LEETCODE API FETCH ---
    fetch('https://alfa-leetcode-api.onrender.com/its_mdsh/solved')
        .then(response => {
            if (!response.ok) throw new Error('API request failed');
            return response.json();
        })
        .then(data => {
            if (data && data.solvedProblem !== undefined) {
                const total = data.solvedProblem;
                const easy = data.easySolved || 0;
                const medium = data.mediumSolved || 0;
                const hard = data.hardSolved || 0;
                
                const totalEl = document.getElementById('leetcode-total');
                const easyEl = document.getElementById('leetcode-easy');
                const mediumEl = document.getElementById('leetcode-medium');
                const hardEl = document.getElementById('leetcode-hard');
                
                if (totalEl) totalEl.textContent = total;
                if (easyEl) easyEl.textContent = easy;
                if (mediumEl) mediumEl.textContent = medium;
                if (hardEl) hardEl.textContent = hard;
                
                // Update circle ring
                const leetcodeBar = document.querySelector('.leetcode-bar');
                if (leetcodeBar) {
                    const target = 500;
                    const circumference = 251.2;
                    const offset = circumference - (circumference * Math.min(total, target) / target);
                    leetcodeBar.style.strokeDashoffset = offset;
                }
            }
        })
        .catch(err => {
            console.warn('Could not load live LeetCode stats, using fallback.', err);
        });

    // --- 5B. LIVE GITHUB API FETCH & STREAK CALCULATIONS ---
    fetch('https://github-contributions-api.jogruber.de/v4/itssmdsh')
        .then(response => {
            if (!response.ok) throw new Error('GitHub contributions API request failed');
            return response.json();
        })
        .then(data => {
            if (data && data.contributions) {
                const contributionsList = data.contributions;
                
                // Map contributions for calendar renderer
                const githubContribsMap = {};
                contributionsList.forEach(c => {
                    githubContribsMap[c.date] = { count: c.count, level: c.level };
                });
                
                renderContributionCalendar('github-heatmap', 'github-months', githubContribsMap, 'github');
                
                // Calculate streaks and totals
                const streaks = calculateGitHubStreaks(contributionsList);
                
                const totalEl = document.getElementById('github-total-contribs');
                const currStreakEl = document.getElementById('github-curr-streak');
                const longestStreakEl = document.getElementById('github-longest-streak');
                
                // Sum the last 365 days of contributions
                const today = new Date();
                const oneYearAgo = new Date();
                oneYearAgo.setDate(today.getDate() - 365);
                const oneYearAgoStr = oneYearAgo.getFullYear() + '-' + 
                                     String(oneYearAgo.getMonth() + 1).padStart(2, '0') + '-' + 
                                     String(oneYearAgo.getDate()).padStart(2, '0');
                
                let sumContributions = 0;
                contributionsList.forEach(c => {
                    if (c.date >= oneYearAgoStr && c.date <= today.toISOString().split('T')[0]) {
                        sumContributions += c.count;
                    }
                });
                
                if (totalEl) totalEl.textContent = sumContributions.toLocaleString();
                if (currStreakEl) currStreakEl.textContent = streaks.currentStreak;
                if (longestStreakEl) longestStreakEl.textContent = streaks.longestStreak;
            }
        })
        .catch(err => {
            console.warn('Could not load live GitHub contributions, using fallback.', err);
            // Fallback mock contributions
            const mockContributions = generateMockGitHubContributions();
            renderContributionCalendar('github-heatmap', 'github-months', mockContributions.map, 'github');
            
            const totalEl = document.getElementById('github-total-contribs');
            const currStreakEl = document.getElementById('github-curr-streak');
            const longestStreakEl = document.getElementById('github-longest-streak');
            
            if (totalEl) totalEl.textContent = mockContributions.total.toLocaleString();
            if (currStreakEl) currStreakEl.textContent = mockContributions.currStreak;
            if (longestStreakEl) longestStreakEl.textContent = mockContributions.longestStreak;
        });

    // Helper to calculate GitHub streaks
    function calculateGitHubStreaks(contributions) {
        const sorted = [...contributions].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        const today = new Date();
        const todayStr = today.getFullYear() + '-' + 
                         String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                         String(today.getDate()).padStart(2, '0');
        
        const pastAndPresent = sorted.filter(c => c.date <= todayStr);
        
        let longestStreak = 0;
        let tempStreak = 0;
        
        pastAndPresent.forEach(c => {
            if (c.count > 0) {
                tempStreak++;
                if (tempStreak > longestStreak) {
                    longestStreak = tempStreak;
                }
            } else {
                tempStreak = 0;
            }
        });
        
        // Current streak (backwards from today or yesterday)
        let currentStreak = 0;
        const activeDates = new Set(pastAndPresent.filter(c => c.count > 0).map(c => c.date));
        
        let checkDate = new Date();
        let checkDateStr = checkDate.getFullYear() + '-' + 
                           String(checkDate.getMonth() + 1).padStart(2, '0') + '-' + 
                           String(checkDate.getDate()).padStart(2, '0');
        
        if (!activeDates.has(checkDateStr)) {
            checkDate.setDate(checkDate.getDate() - 1);
            checkDateStr = checkDate.getFullYear() + '-' + 
                           String(checkDate.getMonth() + 1).padStart(2, '0') + '-' + 
                           String(checkDate.getDate()).padStart(2, '0');
        }
        
        while (activeDates.has(checkDateStr)) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
            checkDateStr = checkDate.getFullYear() + '-' + 
                           String(checkDate.getMonth() + 1).padStart(2, '0') + '-' + 
                           String(checkDate.getDate()).padStart(2, '0');
        }
        
        return {
            currentStreak: currentStreak,
            longestStreak: longestStreak
        };
    }

    // Generator for mock GitHub data if offline
    function generateMockGitHubContributions() {
        const map = {};
        const today = new Date();
        let tempStreak = 0;
        let longestStreak = 0;
        let total = 0;
        
        const dates = [];
        for (let i = 365; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dStr = d.getFullYear() + '-' + 
                         String(d.getMonth() + 1).padStart(2, '0') + '-' + 
                         String(d.getDate()).padStart(2, '0');
            dates.push(dStr);
        }
        
        dates.forEach(dStr => {
            const contributed = Math.random() < 0.40;
            const count = contributed ? Math.floor(Math.random() * 5) + 1 : 0;
            let level = 0;
            if (count > 0 && count <= 1) level = 1;
            else if (count > 1 && count <= 2) level = 2;
            else if (count > 2 && count <= 4) level = 3;
            else if (count > 4) level = 4;
            
            map[dStr] = { count, level };
            total += count;
            
            if (count > 0) {
                tempStreak++;
                if (tempStreak > longestStreak) longestStreak = tempStreak;
            } else {
                tempStreak = 0;
            }
        });
        
        let currentStreak = tempStreak;
        if (currentStreak === 0 && Math.random() < 0.8) {
            currentStreak = Math.floor(Math.random() * 8) + 3;
            for (let i = 0; i < currentStreak; i++) {
                const d = new Date();
                d.setDate(today.getDate() - i);
                const dStr = d.getFullYear() + '-' + 
                             String(d.getMonth() + 1).padStart(2, '0') + '-' + 
                             String(d.getDate()).padStart(2, '0');
                map[dStr] = { count: Math.floor(Math.random() * 2) + 1, level: 1 };
            }
            if (currentStreak > longestStreak) longestStreak = currentStreak;
        }
        
        return { map, total, currStreak: currentStreak, longestStreak };
    }


    // --- 5C. LIVE LEETCODE API FETCH ---
    // Fetch calendar for streak and active days
    fetch('https://alfa-leetcode-api.onrender.com/its_mdsh/calendar')
        .then(response => {
            if (!response.ok) throw new Error('Calendar API request failed');
            return response.json();
        })
        .then(data => {
            if (data) {
                const streak = data.streak || 0;
                const activeDays = data.totalActiveDays || 0;
                
                const streakEl = document.getElementById('leetcode-curr-streak');
                const activeDaysEl = document.getElementById('leetcode-active-days');
                
                if (streakEl) streakEl.textContent = streak;
                if (activeDaysEl) activeDaysEl.textContent = activeDays;
                
                if (data.submissionCalendar) {
                    const leetcodeContribs = parseLeetCodeSubmissionCalendar(data.submissionCalendar);
                    renderContributionCalendar('leetcode-heatmap', 'leetcode-months', leetcodeContribs, 'leetcode');
                }
            }
        })
        .catch(err => {
            console.warn('Could not load live LeetCode calendar stats, using fallback.', err);
            // Fallback mock submissions
            const mockSubmissionCalendar = {};
            const now = Math.floor(Date.now() / 1000);
            for (let i = 0; i < 365; i += Math.floor(Math.random() * 3) + 1) {
                const ts = now - (i * 86400);
                mockSubmissionCalendar[ts] = Math.floor(Math.random() * 5) + 1;
            }
            
            const leetcodeContribs = parseLeetCodeSubmissionCalendar(mockSubmissionCalendar);
            renderContributionCalendar('leetcode-heatmap', 'leetcode-months', leetcodeContribs, 'leetcode');
            
            const streakEl = document.getElementById('leetcode-curr-streak');
            const activeDaysEl = document.getElementById('leetcode-active-days');
            if (streakEl) streakEl.textContent = 21;
            if (activeDaysEl) activeDaysEl.textContent = 67;
        });

    // Parse LeetCode submissions into the calendar matrix levels
    function parseLeetCodeSubmissionCalendar(submissionCalendar) {
        const contributions = {};
        try {
            const calendarObj = typeof submissionCalendar === 'string' ? JSON.parse(submissionCalendar) : submissionCalendar;
            for (const timestampStr in calendarObj) {
                const timestamp = parseInt(timestampStr) * 1000;
                const date = new Date(timestamp);
                const dateStr = date.getFullYear() + '-' + 
                                String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                                String(date.getDate()).padStart(2, '0');
                
                const count = calendarObj[timestampStr];
                let level = 0;
                if (count > 0 && count <= 2) level = 1;
                else if (count > 2 && count <= 5) level = 2;
                else if (count > 5 && count <= 8) level = 3;
                else if (count > 8) level = 4;
                
                contributions[dateStr] = { count: count, level: level };
            }
        } catch (e) {
            console.error("Failed to parse LeetCode calendar:", e);
        }
        return contributions;
    }

    // Fetch user details for global ranking
    fetch('https://alfa-leetcode-api.onrender.com/its_mdsh')
        .then(response => {
            if (!response.ok) throw new Error('Profile API request failed');
            return response.json();
        })
        .then(data => {
            if (data && data.ranking !== undefined) {
                const rankingEl = document.getElementById('leetcode-ranking-val');
                if (rankingEl) {
                    rankingEl.textContent = data.ranking.toLocaleString();
                }
            }
        })
        .catch(err => {
            console.warn('Could not load live LeetCode ranking, using fallback.', err);
            const rankingEl = document.getElementById('leetcode-ranking-val');
            if (rankingEl) rankingEl.textContent = "539,658";
        });

    // --- 6. ACHIEVEMENTS FILTER LOGIC ---
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.filter-item');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active classes
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filterValue = btn.getAttribute('data-filter');
            
            galleryItems.forEach(item => {
                if (filterValue === 'all' || item.classList.contains(filterValue)) {
                    item.classList.remove('hide');
                    item.style.opacity = '0';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.97)';
                    setTimeout(() => {
                        item.classList.add('hide');
                    }, 300);
                }
            });
        });
    });

    // --- 7. LIGHTBOX MODAL FOR CERTIFICATES & GALLERY PHOTOS ---
    const modal = document.getElementById('gallery-modal');
    const modalClose = document.getElementById('modal-close');
    const modalImage = document.getElementById('modal-image');
    const modalFallback = document.getElementById('modal-media-fallback');
    const modalTitle = document.getElementById('modal-title');
    const modalIssuer = document.getElementById('modal-issuer');
    const modalDate = document.getElementById('modal-date');
    const modalCredId = document.getElementById('modal-cred-id');
    const modalDesc = document.getElementById('modal-description');
    const modalVerifyBtn = document.getElementById('modal-verify-btn');
    
    // Add error handler for modal image loading
    if (modalImage) {
        modalImage.addEventListener('error', () => {
            modalImage.style.display = 'none';
            modalFallback.style.display = 'flex';
        });
    }
    
    // Bind click events to both static gallery cards and rolling carousel slides
    function bindLightboxTrigger(element) {
        element.addEventListener('click', (e) => {
            // If the element clicked is a link, let the link action run normally (don't modal trigger)
            if (e.target.tagName.toLowerCase() === 'a' && !e.target.classList.contains('rank-item-interactive')) {
                return;
            }
            e.preventDefault();
            
            const title = element.getAttribute('data-title');
            const issuer = element.getAttribute('data-issuer');
            const date = element.getAttribute('data-date');
            const link = element.getAttribute('data-link') || '#';
            const imgPath = element.getAttribute('data-image');
            const id = element.getAttribute('data-id');
            const desc = element.getAttribute('data-desc');
            
            // Populate Modal Content
            modalTitle.textContent = title;
            modalIssuer.textContent = issuer;
            modalDate.textContent = date;
            modalDesc.textContent = desc || 'Credential validation detail showing official program achievements and technical capabilities.';
            modalVerifyBtn.href = link;
            
            // Hide verify link if it is empty/has dummy character
            if (link === '#' || link === '') {
                modalVerifyBtn.style.display = 'none';
            } else {
                modalVerifyBtn.style.display = 'inline-flex';
            }
            
            if (id) {
                modalCredId.style.display = 'block';
                modalCredId.querySelector('span').textContent = id;
            } else {
                modalCredId.style.display = 'none';
            }
            
            // Image handling (load local image if present, fallback otherwise)
            if (imgPath) {
                modalImage.src = imgPath;
                modalImage.style.display = 'block';
                modalFallback.style.display = 'none';
            } else {
                modalImage.src = '';
                modalImage.style.display = 'none';
                modalFallback.style.display = 'flex';
            }
            
            // Open modal
            modal.classList.add('open');
            document.body.style.overflow = 'hidden'; // Lock scroll background
        });
    }

    // Bind all original gallery cards
    galleryItems.forEach(item => bindLightboxTrigger(item));
    
    // Bind all slides (including newly duplicated cloned ones)
    const allSlides = document.querySelectorAll('.carousel-slide');
    allSlides.forEach(slide => bindLightboxTrigger(slide));
    
    // Bind all scorecard rows & project banner views
    const interactiveItems = document.querySelectorAll('.rank-item-interactive');
    interactiveItems.forEach(item => bindLightboxTrigger(item));
    
    function closeModal() {
        modal.classList.remove('open');
        document.body.style.overflow = ''; // Unlock scroll
        setTimeout(() => {
            modalImage.src = '';
        }, 300);
    }
    
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
            closeModal();
        }
    });

    // --- 8. CONTACT FORM SIMULATION ---
    const contactForm = document.getElementById('contact-form');
    const formFeedback = document.getElementById('form-feedback');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;

            const name    = document.getElementById('name').value.trim();
            const email   = document.getElementById('email').value.trim();
            const subject = document.getElementById('subject').value.trim();
            const message = document.getElementById('message').value.trim();

            // Loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Sending <i class="fa-solid fa-spinner fa-spin"></i>';
            formFeedback.className = 'form-feedback';
            formFeedback.textContent = '';

            try {
                const response = await fetch('/api/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, subject, message }),
                });

                const data = await response.json();

                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;

                if (response.ok && data.success) {
                    formFeedback.classList.add('success');
                    formFeedback.textContent = '✅ Message sent! I\'ll get back to you soon. Thanks for reaching out!';
                    contactForm.reset();
                } else {
                    formFeedback.classList.add('error');
                    formFeedback.textContent = `❌ ${data.error || 'Something went wrong. Please try again.'}`;
                }
            } catch (err) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                formFeedback.classList.add('error');
                formFeedback.textContent = '❌ Network error. Please check your connection and try again.';
            }

            // Auto-clear feedback after 8 seconds
            setTimeout(() => {
                formFeedback.style.opacity = '0';
                setTimeout(() => {
                    formFeedback.textContent = '';
                    formFeedback.style.opacity = '1';
                    formFeedback.className = 'form-feedback';
                }, 500);
            }, 8000);
        });
    }

    // Dynamic Contribution Calendar Generator (Matching GitHub green/orange matrix layout)
    function renderContributionCalendar(containerId, monthsHeaderId, contributionsMap, type) {
        const gridContainer = document.getElementById(containerId);
        const monthsHeader = document.getElementById(monthsHeaderId);
        if (!gridContainer || !monthsHeader) return;
        
        gridContainer.innerHTML = '';
        monthsHeader.innerHTML = '';
        
        const today = new Date();
        const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        const startDate = new Date(endDate);
        // Limit rendering to the last 60 days (approx. 2 months)
        startDate.setDate(startDate.getDate() - 60);
        
        // Find nearest preceding Sunday
        while (startDate.getDay() !== 0) {
            startDate.setDate(startDate.getDate() - 1);
        }
        
        // Group weeks
        const weeks = [];
        let currentWeek = [];
        let tempDate = new Date(startDate);
        
        while (tempDate <= endDate) {
            currentWeek.push(new Date(tempDate));
            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
            tempDate.setDate(tempDate.getDate() + 1);
        }
        if (currentWeek.length > 0) {
            while (currentWeek.length < 7) {
                currentWeek.push(null);
            }
            weeks.push(currentWeek);
        }
        
        // Set columns count CSS variable dynamically
        gridContainer.style.setProperty('--columns', weeks.length);
        monthsHeader.style.setProperty('--columns', weeks.length);
        
        // Month names header
        let lastMonth = -1;
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        weeks.forEach((week, weekIndex) => {
            const firstDay = week.find(d => d !== null);
            if (firstDay) {
                const currentMonth = firstDay.getMonth();
                if (currentMonth !== lastMonth) {
                    if (weekIndex < weeks.length - 1) {
                        const monthLabel = document.createElement('span');
                        monthLabel.textContent = monthNames[currentMonth];
                        monthLabel.style.gridColumnStart = weekIndex + 1;
                        monthsHeader.appendChild(monthLabel);
                        lastMonth = currentMonth;
                    }
                }
            }
        });
        
        // Cells grid
        let totalCount = 0;
        
        weeks.forEach(week => {
            week.forEach(day => {
                const cell = document.createElement('div');
                cell.className = 'heatmap-cell';
                
                if (day === null) {
                    cell.classList.add('empty-cell');
                } else {
                    const dateStr = day.getFullYear() + '-' + 
                                    String(day.getMonth() + 1).padStart(2, '0') + '-' + 
                                    String(day.getDate()).padStart(2, '0');
                    
                    const dayData = contributionsMap[dateStr] || { count: 0, level: 0 };
                    const count = dayData.count;
                    const level = dayData.level;
                    
                    totalCount += count;
                    
                    if (level > 0) {
                        cell.classList.add(`level-${level}`);
                    }
                    
                    const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
                    const formattedDate = day.toLocaleDateString('en-US', options);
                    cell.title = `${count} contribution${count !== 1 ? 's' : ''} on ${formattedDate}`;
                    cell.setAttribute('data-date', dateStr);
                }
                gridContainer.appendChild(cell);
            });
        });
        
        // Update total sum labels
        const totalLabel = document.getElementById(`${type}-contrib-count`);
        if (totalLabel) {
            if (type === 'github') {
                totalLabel.textContent = `${totalCount.toLocaleString()} contributions in the last 2 months`;
            } else {
                totalLabel.textContent = `${totalCount.toLocaleString()} submissions in the last 2 months`;
            }
        }
    }

    // --- 11. CREATIVE CORNER WRITING SLIDER ---
    const slides = document.querySelectorAll('.writing-slide');
    const dots = document.querySelectorAll('.slider-dots .dot');
    const prevBtn = document.getElementById('writing-prev');
    const nextBtn = document.getElementById('writing-next');
    let currentSlideIndex = 0;
    let slideInterval;

    function showSlide(index) {
        if (slides.length === 0) return;
        slides.forEach(slide => {
            slide.classList.remove('active');
        });
        dots.forEach(dot => {
            dot.classList.remove('active');
        });

        currentSlideIndex = (index + slides.length) % slides.length;
        slides[currentSlideIndex].classList.add('active');
        if (dots[currentSlideIndex]) {
            dots[currentSlideIndex].classList.add('active');
        }
    }

    function nextSlide() {
        showSlide(currentSlideIndex + 1);
    }

    function prevSlide() {
        showSlide(currentSlideIndex - 1);
    }

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            resetSlideInterval();
        });

        nextBtn.addEventListener('click', () => {
            nextSlide();
            resetSlideInterval();
        });
    }

    dots.forEach(dot => {
        dot.addEventListener('click', (e) => {
            const index = parseInt(e.target.getAttribute('data-index'));
            showSlide(index);
            resetSlideInterval();
        });
    });

    function startSlideInterval() {
        slideInterval = setInterval(nextSlide, 6000); // Change slide every 6 seconds
    }

    function resetSlideInterval() {
        clearInterval(slideInterval);
        startSlideInterval();
    }

    if (slides.length > 0) {
        startSlideInterval();
    }

    // --- 12. CORE BALANCES INTERACTIVE SCALE ---
    const controlCards = document.querySelectorAll('.control-card');
    const beamGroup = document.querySelector('.scale-beam-group');
    const panLeftGroup = document.querySelector('.scale-pan-left-group');
    const panRightGroup = document.querySelector('.scale-pan-right-group');
    const cardLeft = document.getElementById('scale-card-left');
    const cardRight = document.getElementById('scale-card-right');
    const weightLeft = document.getElementById('scale-weight-left');
    const weightRight = document.getElementById('scale-weight-right');
    const expTitle = document.getElementById('balance-exp-title');
    const expDesc = document.getElementById('balance-exp-desc');
    const expIcon = document.querySelector('.explanation-icon-wrapper i');

    const balancePairsData = {
        'chaos-stability': {
            leftText: 'Chaos',
            leftIcon: 'fa-tornado',
            rightText: 'Stability',
            rightIcon: 'fa-anchor',
            heavier: 'right',
            tilt: 10,
            expTitle: 'Stability Secures Legacy',
            expDesc: 'Chaos can spark ideas, but only stability builds legacy. I value structured, predictable systems and a calm, clear mind over erratic bursts.'
        },
        'innovation-reliability': {
            leftText: 'Innovation',
            leftIcon: 'fa-rocket',
            rightText: 'Reliability',
            rightIcon: 'fa-shield-halved',
            heavier: 'right',
            tilt: 10,
            expTitle: 'Reliability is the Foundation',
            expDesc: 'Novelty is exciting, but uptime is critical. I build systems where reliability is the core feature, not an afterthought.'
        },
        'exploration-optimization': {
            leftText: 'Exploration',
            leftIcon: 'fa-compass',
            rightText: 'Optimization',
            rightIcon: 'fa-gauge-high',
            heavier: 'right',
            tilt: 10,
            expTitle: 'Optimization Drives Impact',
            expDesc: 'While exploring new tech is fun, mastering and optimizing what works brings true engineering value. I focus on squeeze-every-millisecond performance.'
        },
        'ethics-profit': {
            leftText: 'Ethics',
            leftIcon: 'fa-scale-balanced',
            rightText: 'Profit',
            rightIcon: 'fa-sack-dollar',
            heavier: 'left',
            tilt: -10,
            expTitle: 'Ethics Guides Code',
            expDesc: 'Code is a tool to improve human lives. Ethical responsibility and social impact must always outweigh short-term monetary gains.'
        },
        'freedom-responsibility': {
            leftText: 'Freedom',
            leftIcon: 'fa-dove',
            rightText: 'Responsibility',
            rightIcon: 'fa-user-shield',
            heavier: 'right',
            tilt: 10,
            expTitle: 'Responsibility Earns Autonomy',
            expDesc: 'With autonomy comes accountability. I believe true freedom is earned through holding ourselves responsible for our code, our teams, and our commitments.'
        }
    };

    controlCards.forEach(card => {
        card.addEventListener('click', () => {
            const pairKey = card.getAttribute('data-pair');
            const data = balancePairsData[pairKey];
            if (!data) return;

            // Remove active class from all control cards
            controlCards.forEach(c => c.classList.remove('active'));
            // Add active class to clicked card
            card.classList.add('active');

            // Apply tilt rotation to SVG beam and counter-rotation to pans
            if (beamGroup) beamGroup.style.transform = `rotate(${data.tilt}deg)`;
            if (panLeftGroup) panLeftGroup.style.transform = `rotate(${-data.tilt}deg)`;
            if (panRightGroup) panRightGroup.style.transform = `rotate(${-data.tilt}deg)`;

            // Update text on left and right pans
            if (cardLeft) {
                cardLeft.innerHTML = `<i class="fa-solid ${data.leftIcon} scale-card-icon"></i> <span class="scale-card-text">${data.leftText}</span>`;
                if (data.heavier === 'left') {
                    cardLeft.classList.add('active', 'cyan-theme');
                } else {
                    cardLeft.classList.remove('active', 'cyan-theme');
                }
            }

            if (cardRight) {
                cardRight.innerHTML = `<i class="fa-solid ${data.rightIcon} scale-card-icon"></i> <span class="scale-card-text">${data.rightText}</span>`;
                if (data.heavier === 'right') {
                    cardRight.classList.add('active');
                } else {
                    cardRight.classList.remove('active');
                }
            }

            // Update weight visibility
            if (weightLeft) {
                if (data.heavier === 'left') {
                    weightLeft.classList.add('active');
                } else {
                    weightLeft.classList.remove('active');
                }
            }

            if (weightRight) {
                if (data.heavier === 'right') {
                    weightRight.classList.add('active');
                } else {
                    weightRight.classList.remove('active');
                }
            }

            // Fade and update explanation card
            const expElements = [expTitle, expDesc, expIcon];
            expElements.forEach(el => {
                if (el) el.classList.add('balance-fade-out');
            });

            setTimeout(() => {
                if (expTitle) expTitle.textContent = data.expTitle;
                if (expDesc) expDesc.textContent = data.expDesc;
                if (expIcon) {
                    if (data.heavier === 'left') {
                        expIcon.className = `fa-solid ${data.leftIcon}`;
                        expIcon.style.color = 'var(--accent-cyan)';
                    } else {
                        expIcon.className = `fa-solid ${data.rightIcon}`;
                        expIcon.style.color = 'var(--accent-purple)';
                    }
                }

                expElements.forEach(el => {
                    if (el) {
                        el.classList.remove('balance-fade-out');
                        el.classList.add('balance-fade-in');
                        setTimeout(() => el.classList.remove('balance-fade-in'), 400);
                    }
                });
            }, 250);
        });
    });

    // Hover effect for mouse glow
    controlCards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
});
