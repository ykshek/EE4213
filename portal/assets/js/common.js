/* Shared portal shell and demo session. No server, framework, or real authentication. */
(() => {
    'use strict';

    // Resolve navigation from this shared script, independent of the current page depth.
    // Explicit index.html destinations also work when opening local files directly.
    const PORTAL_ROOT = new URL('../../', document.currentScript.src);

    // Trusted static markup copied from base.html; never interpolate user input here.
    const SHELL_MARKUP = `
<a href="#mainContent" class="skip-link"><span class="lang-zh">跳至主內容</span><span class="lang-en">Skip to main content</span></a>
<header class="topbar" role="banner">
        <div class="topbar-brand">
            <div>
                <h1><a class="brand-home" href="index.html">
                    <span class="lang-zh">CityU EE 學生平台</span>
                    <span class="lang-en">CityU EE Student Portal</span>
                </a></h1>
                <span class="subtitle">
                    <span class="lang-zh">電子工程學系 · 學生學習與規劃支援</span>
                    <span class="lang-en">Department of Electrical Engineering · Student Planning Support</span>
                </span>
            </div>
        </div>

        <div class="topbar-right">
            <div class="lang-switch" role="group" aria-label="Language selection / 語言選擇">
                <button type="button" id="btnLangZh" class="active" data-language="zh" aria-pressed="true">中文</button>
                <button type="button" id="btnLangEn" data-language="en" aria-pressed="false">EN</button>
            </div>

            <!-- Logged-in user chip (hidden by default) -->
            <span class="user-chip" id="userChip" hidden>
                <span class="dot" aria-hidden="true"></span>
                <span id="userChipName">Student</span>
            </span>

            <!-- Not logged in: Login + Register -->
            <button type="button" class="auth-btn auth-btn-login" id="btnLogin" data-auth="login">
                <span class="lang-zh">登入</span><span class="lang-en">Login</span>
            </button>
            <button type="button" class="auth-btn auth-btn-register" id="btnRegisterTop" data-auth="register">
                <span class="lang-zh">註冊</span><span class="lang-en">Register</span>
            </button>

            <!-- Logged in: Logout -->
            <button type="button" class="auth-btn auth-btn-logout" id="btnLogout" data-action="logout" hidden>
                <span class="lang-zh">登出</span><span class="lang-en">Logout</span>
            </button>
        </div>
    </header>
<nav class="sidebar" aria-label="Feature navigation / 功能導覽">
            <div class="sidebar-heading">
                <span class="lang-zh">功能選單</span>
                <span class="lang-en">Features</span>
            </div>
            <ul class="sidebar-nav">
                <li>
                    <a class="nav-item" id="navProfile" href="student-profile/index.html" data-page="profile">
                        <span class="icon" aria-hidden="true">👤</span>
                        <span><span class="label-zh">學生個人檔案</span><span class="label-en">Student Profile</span></span>
                        <span class="lock-icon" aria-hidden="true">🔒</span>
                    </a>
                </li>
                <li>
                    <a class="nav-item" id="navCourseInfo" href="course-info/index.html" data-page="course-info">
                        <span class="icon" aria-hidden="true">📚</span>
                        <span><span class="label-zh">課程資訊</span><span class="label-en">Course Information</span></span>
                    </a>
                </li>
                <li>
                    <a class="nav-item" id="navMajorInfo" href="major-info/index.html" data-page="major-info">
                        <span class="icon" aria-hidden="true">🎓</span>
                        <span><span class="label-zh">主修資訊</span><span class="label-en">Major Information</span></span>
                    </a>
                </li>
                <li>
                    <a class="nav-item" id="navComparator" href="comparator/index.html" data-page="comparator">
                        <span class="icon" aria-hidden="true">⚖️</span>
                        <span><span class="label-zh">課程比較器</span><span class="label-en">Course Comparator</span></span>
                    </a>
                </li>
                <li>
                    <a class="nav-item" id="navDegreeAudit" href="degree-audit/index.html" data-page="degree-audit">
                        <span class="icon" aria-hidden="true">✅</span>
                        <span><span class="label-zh">學位審核輔助</span><span class="label-en">Degree Audit Helper</span></span>
                        <span class="lock-icon" aria-hidden="true">🔒</span>
                    </a>
                </li>
                <li>
                    <a class="nav-item" id="navProgramCareer" href="program-career/index.html" data-page="program-career">
                        <span class="icon" aria-hidden="true">💼</span>
                        <span><span class="label-zh">課程瀏覽與職涯資訊</span><span class="label-en">Program Browser &amp; Career Info</span></span>
                        <span class="lock-icon" aria-hidden="true">🔒</span>
                    </a>
                </li>
            </ul>
        </nav>
<footer class="footer" role="contentinfo">
        <span class="lang-zh">EE4213 學生平台 v3 · 電子工程學系</span>
        <span class="lang-en">EE4213 Student Portal v3 · Department of Electrical Engineering</span>
    </footer>
    <!-- ============ AUTH MODAL (Login / Register) ============ -->
    <div class="modal-overlay" id="authModal" role="dialog" hidden aria-modal="true" aria-labelledby="authModalTitle">
        <div class="modal-box">
            <button type="button" class="modal-close" data-action="close-modal" aria-label="關閉 / Close">×</button>
            <h3 id="authModalTitle">
                <span class="lang-zh" id="authTitleZh">登入</span>
                <span class="lang-en" id="authTitleEn">Login</span>
            </h3>
            <p class="modal-desc" id="authDesc">
                <span class="lang-zh">請輸入你的學生帳號與密碼（示範用，任意輸入即可）。</span>
                <span class="lang-en">Enter your student ID and password (demo only — any input works).</span>
            </p>

            <form class="modal-form" id="authForm" autocomplete="off">
                <div class="form-group">
                    <label for="authUser">
                        <span class="lang-zh">學生編號 / 電子郵件</span>
                        <span class="lang-en">Student ID / Email</span>
                    </label>
                    <input type="text" id="authUser" placeholder="e.g. 51234567 / student@cityu.edu.hk" required>
                </div>
                <div class="form-group">
                    <label for="authPass">
                        <span class="lang-zh">密碼</span>
                        <span class="lang-en">Password</span>
                    </label>
                    <input type="password" id="authPass" placeholder="••••••••" required>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn-secondary" data-action="close-modal">
                        <span class="lang-zh">取消</span><span class="lang-en">Cancel</span>
                    </button>
                    <button type="submit" class="btn-action" id="authSubmitBtn">
                        <span class="lang-zh">登入</span><span class="lang-en">Login</span>
                    </button>
                </div>
            </form>

            <div class="modal-switch">
                <span class="lang-zh">還沒有帳號？</span>
                <span class="lang-en">No account yet?</span>
                <button type="button" id="authSwitchBtn" data-action="toggle-auth">
                    <span class="lang-zh">立即註冊</span>
                    <span class="lang-en">Register now</span>
                </button>
            </div>
        </div>
    </div>

    <!-- ============ LOCKED NOTICE MODAL ============ -->
    <div class="modal-overlay locked-modal" id="lockedModal" role="dialog" hidden aria-modal="true" aria-labelledby="lockedModalTitle">
        <div class="modal-box">
            <button type="button" class="modal-close" data-action="close-modal" aria-label="關閉 / Close">×</button>
            <span class="lock-emoji" aria-hidden="true">🔒</span>
            <h3 id="lockedModalTitle">
                <span class="lang-zh">需要登入</span>
                <span class="lang-en">Login Required</span>
            </h3>
            <p class="modal-desc">
                <span class="lang-zh">請先登入／註冊以使用此功能。</span>
                <span class="lang-en">Please login / register to use this function.</span>
            </p>
            <div class="locked-actions">
                <button type="button" class="btn-action" data-auth="login">
                    <span class="lang-zh">登入</span><span class="lang-en">Login</span>
                </button>
                <button type="button" class="btn-secondary" data-auth="register">
                    <span class="lang-zh">註冊</span><span class="lang-en">Register</span>
                </button>
            </div>
        </div>
    </div>
    `;
    const PAGES = Object.freeze({
        home: { file: 'index.html', public: true, zh: '首頁', en: 'Home' },
        registration: { file: 'registration/index.html', zh: '註冊導航器', en: 'Registration Navigator' },
        profile: { file: 'student-profile/index.html', nav: 'navProfile', zh: '學生個人檔案', en: 'Student Profile' },
        'course-info': { file: 'course-info/index.html', public: true, nav: 'navCourseInfo', zh: '課程資訊', en: 'Course Information' },
        'major-info': { file: 'major-info/index.html', public: true, nav: 'navMajorInfo', zh: '主修資訊', en: 'Major Information' },
        comparator: { file: 'comparator/index.html', public: true, nav: 'navComparator', zh: '課程比較器', en: 'Course Comparator' },
        'degree-audit': { file: 'degree-audit/index.html', nav: 'navDegreeAudit', zh: '學位審核輔助', en: 'Degree Audit Helper' },
        'program-career': { file: 'program-career/index.html', nav: 'navProgramCareer', zh: '課程瀏覽與職涯資訊', en: 'Program Browser & Career Information' }
    });
    const STORAGE_KEY = 'ee4213.portal.session.v1';
    let state = { isLoggedIn: false, hasVisitedNavigator: false, userName: '', language: 'zh' };
    let storageAvailable = true;
    let authMode = 'login';
    let activeModal = null;
    let returnFocus = null;
    const pageId = document.body.dataset.page;
    const page = PAGES[pageId];

    if (!page) throw new Error('Unknown portal data-page: ' + pageId);

    function loadState() {
        state = { isLoggedIn: false, hasVisitedNavigator: false, userName: '', language: 'zh' };
        try {
            const raw = sessionStorage.getItem(STORAGE_KEY);
            if (raw) {
                try {
                    const saved = JSON.parse(raw);
                    if (saved && typeof saved === 'object') {
                        state = {
                            isLoggedIn: saved.isLoggedIn === true,
                            hasVisitedNavigator: saved.hasVisitedNavigator === true,
                            userName: typeof saved.userName === 'string' ? saved.userName : '',
                            language: saved.language === 'en' ? 'en' : 'zh'
                        };
                    }
                } catch { /* Invalid demo data resets to defaults. */ }
            }
            // Probe writes too: some environments allow reads but deny writes.
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch {
            storageAvailable = false;
        }
    }

    function saveState() {
        try {
            if (!storageAvailable) return false;
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            return true;
        } catch {
            storageAvailable = false;
            updateStorageNotice();
            return false;
        }
    }

    function mountShell() {
        const template = document.createElement('template');
        template.innerHTML = SHELL_MARKUP;
        const shell = template.content;
        shell.querySelectorAll('a[href]:not([href^="#"])').forEach(link => {
            link.href = new URL(link.getAttribute('href'), PORTAL_ROOT).href;
        });
        document.body.prepend(shell.querySelector('.skip-link'), shell.querySelector('.topbar'));
        document.querySelector('.layout').prepend(shell.querySelector('.sidebar'));
        document.body.append(shell);
        document.getElementById('mainContent').insertAdjacentHTML('afterbegin', `
            <p id="storageNotice" class="session-notice" role="status" hidden>
                <span class="lang-zh">此瀏覽模式無法保留跨頁登入；開啟功能頁後請再次示範登入。建議使用 Live Server。</span>
                <span class="lang-en">This browser mode cannot retain login between pages. Log in again on each feature page, or use Live Server.</span>
                <a href="${new URL(PAGES.registration.file, PORTAL_ROOT).href}"><span class="lang-zh">前往註冊導航器</span><span class="lang-en">Open Registration Navigator</span></a>
            </p>
            <div id="accessNotice" class="card access-notice" hidden>
                <h2><span class="lang-zh">🔒 需要登入</span><span class="lang-en">🔒 Login Required</span></h2>
                <p><span class="lang-zh">請先登入／註冊以使用此功能（示範）。</span><span class="lang-en">Please login / register to use this demo feature.</span></p>
                <button type="button" class="btn-action" data-auth="login"><span class="lang-zh">登入</span><span class="lang-en">Login</span></button>
                <button type="button" class="btn-secondary" data-auth="register"><span class="lang-zh">註冊</span><span class="lang-en">Register</span></button>
            </div>`);
    }

    function updateStorageNotice() {
        const notice = document.getElementById('storageNotice');
        if (notice) notice.hidden = storageAvailable;
    }

    function applyLanguage() {
        const english = state.language === 'en';
        document.body.dataset.lang = state.language;
        document.documentElement.lang = english ? 'en' : 'zh-HK';
        document.title = (english ? page.en : page.zh) + ' | CityU EE Student Portal';
        for (const lang of ['zh', 'en']) {
            const button = document.getElementById(lang === 'zh' ? 'btnLangZh' : 'btnLangEn');
            button.classList.toggle('active', state.language === lang);
            button.setAttribute('aria-pressed', String(state.language === lang));
        }
    }

    function setLanguage(lang) {
        state.language = lang === 'en' ? 'en' : 'zh';
        saveState();
        applyLanguage();
        document.dispatchEvent(new CustomEvent('portal:languagechange', { detail: { language: state.language } }));
    }

    function applyAuthUI() {
        const homeLink = document.querySelector('.brand-home');
        if (pageId === 'home') homeLink.setAttribute('aria-current', 'page');
        else homeLink.removeAttribute('aria-current');
        document.getElementById('btnLogin').hidden = state.isLoggedIn;
        document.getElementById('btnRegisterTop').hidden = state.isLoggedIn;
        document.getElementById('btnLogout').hidden = !state.isLoggedIn;
        document.getElementById('userChip').hidden = !state.isLoggedIn;
        document.getElementById('userChipName').textContent = state.userName || 'Student';
        // Page content can offer separate guest/member copy without duplicating auth logic.
        document.querySelectorAll('[data-guest-only]').forEach(element => {
            element.hidden = state.isLoggedIn;
        });
        document.querySelectorAll('[data-member-only]').forEach(element => {
            element.hidden = !state.isLoggedIn;
        });
        document.querySelectorAll('.nav-item').forEach(link => {
            const target = PAGES[link.dataset.page];
            const locked = !state.isLoggedIn && !target.public;
            link.classList.toggle('locked', locked);
            link.classList.toggle('active', link.dataset.page === pageId);
            if (link.dataset.page === pageId) link.setAttribute('aria-current', 'page');
            else link.removeAttribute('aria-current');
            const lock = link.querySelector('.lock-icon');
            if (lock) lock.hidden = !locked;
        });
        const locked = !page.public && !state.isLoggedIn;
        const content = document.getElementById('pageContent');
        content.hidden = locked;
        // Future page code must also honour this demo guard when rendering its content.
        content.inert = locked;
        document.getElementById('accessNotice').hidden = !locked;
        updateStorageNotice();
    }

    function updateAuthModalText() {
        const register = authMode === 'register';
        document.getElementById('authTitleZh').textContent = register ? '註冊新帳號' : '登入';
        document.getElementById('authTitleEn').textContent = register ? 'Create Account' : 'Login';
        const setPair = (id, zh, en) => {
            document.querySelector('#' + id + ' .lang-zh').textContent = zh;
            document.querySelector('#' + id + ' .lang-en').textContent = en;
        };
        setPair('authSubmitBtn', register ? '註冊' : '登入', register ? 'Register' : 'Login');
        setPair('authSwitchBtn', register ? '返回登入' : '立即註冊', register ? 'Back to Login' : 'Register now');
        setPair('authDesc', register ? '建立示範帳號（任意輸入即可，請勿使用真實密碼）。' : '請輸入示範學生帳號與密碼（任意輸入即可，請勿使用真實密碼）。',
            register ? 'Create a demo account (any input works; do not use a real password).' : 'Enter a demo student ID and password (any input works; do not use a real password).');
        document.querySelectorAll('.modal-switch > .lang-zh')[0].textContent = register ? '已有帳號？' : '還沒有帳號？';
        document.querySelectorAll('.modal-switch > .lang-en')[0].textContent = register ? 'Already have an account?' : 'No account yet?';
    }

    function closeModal(restoreFocus = true) {
        if (!activeModal) return;
        const wasAuth = activeModal.id === 'authModal';
        activeModal.classList.remove('show');
        activeModal.hidden = true;
        activeModal = null;
        document.querySelectorAll('[data-modal-background]').forEach(element => { element.inert = false; });
        if (wasAuth) document.getElementById('authForm').reset();
        if (restoreFocus && returnFocus && returnFocus.isConnected) returnFocus.focus();
    }

    function openModal(id) {
        // Preserve the original opener when switching from the locked notice to login.
        const opener = activeModal ? returnFocus : document.activeElement;
        closeModal(false);
        returnFocus = opener;
        activeModal = document.getElementById(id);
        activeModal.hidden = false;
        activeModal.classList.add('show');
        document.querySelectorAll('[data-modal-background]').forEach(element => { element.inert = true; });
        const first = id === 'authModal' ? document.getElementById('authUser') : activeModal.querySelector('button');
        first.focus();
    }

    function openAuthModal(mode) {
        authMode = mode === 'register' ? 'register' : 'login';
        updateAuthModalText();
        openModal('authModal');
    }

    function goTo(id) {
        const target = PAGES[id];
        if (!target) return;
        if (!state.isLoggedIn && !target.public) {
            openModal('lockedModal');
            return;
        }
        location.assign(new URL(target.file, PORTAL_ROOT).href);
    }

    function handleAuthSubmit(event) {
        event.preventDefault();
        const form = document.getElementById('authForm');
        if (!form.reportValidity()) return;
        state.userName = document.getElementById('authUser').value.trim() || 'Student';
        state.isLoggedIn = true;
        const landing = authMode === 'register' || !state.hasVisitedNavigator ? 'registration' : 'profile';
        state.hasVisitedNavigator = true;
        const saved = saveState();
        closeModal();
        applyAuthUI();
        if (saved) goTo(landing);
        else document.getElementById('mainContent').focus();
    }

    function logout() {
        state.isLoggedIn = false;
        state.userName = '';
        saveState();
        closeModal(false);
        applyAuthUI();
        goTo('home');
    }

    function bindEvents() {
        document.addEventListener('click', event => {
            const button = event.target.closest('[data-action], [data-auth], [data-language], [data-nav]');
            if (button) {
                if (button.dataset.auth) openAuthModal(button.dataset.auth);
                else if (button.dataset.language) setLanguage(button.dataset.language);
                else if (button.dataset.nav) goTo(button.dataset.nav);
                else if (button.dataset.action === 'logout') logout();
                else if (button.dataset.action === 'close-modal') closeModal();
                else if (button.dataset.action === 'toggle-auth') {
                    authMode = authMode === 'login' ? 'register' : 'login';
                    updateAuthModalText();
                }
                return;
            }
            const link = event.target.closest('.nav-item');
            if (link && !state.isLoggedIn && !PAGES[link.dataset.page].public) {
                event.preventDefault();
                openModal('lockedModal');
            }
            if (event.target === activeModal) closeModal();
        });
        document.getElementById('authForm').addEventListener('submit', handleAuthSubmit);
        document.addEventListener('keydown', event => {
            if (!activeModal) return;
            if (event.key === 'Escape') {
                event.preventDefault();
                closeModal();
            } else if (event.key === 'Tab') {
                const controls = Array.from(activeModal.querySelectorAll('button, input, a[href]')).filter(element => !element.hidden && element.getClientRects().length);
                const first = controls[0];
                const last = controls[controls.length - 1];
                if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
                else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
            }
        });
        const links = Array.from(document.querySelectorAll('.sidebar-nav .nav-item'));
        links.forEach((link, index) => link.addEventListener('keydown', event => {
            let next;
            if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % links.length;
            else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index - 1 + links.length) % links.length;
            else if (event.key === 'Home') next = 0;
            else if (event.key === 'End') next = links.length - 1;
            if (next !== undefined) { event.preventDefault(); links[next].focus(); }
        }));
        // bfcache restores an old DOM: re-check the current session after Back/Forward.
        window.addEventListener('pageshow', event => {
            if (!event.persisted) return;
            closeModal(false);
            loadState();
            applyLanguage();
            applyAuthUI();
        });
    }

    loadState();
    mountShell();
    // Inert only the shared background containers, never the modal containers.
    document.querySelectorAll('.skip-link, .topbar, .layout, .footer').forEach(element => { element.dataset.modalBackground = ''; });
    applyLanguage();
    applyAuthUI();
    bindEvents();

    // Page scripts (loaded after common.js) consume snapshots; storage belongs to this file.
    window.Portal = Object.freeze({
        getSession: () => Object.freeze({ ...state }),
        setLanguage,
        openAuthModal,
        navigate: goTo
    });
    if (!page.public && !state.isLoggedIn) openModal('lockedModal');
})();
