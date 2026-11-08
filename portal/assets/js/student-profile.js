/* portal/assets/js/student-profile.js
   Student Profile page logic. Relies on:
   - window.Portal (from common.js) for demo session and language events
   - window.EE4213Data (from mock-data.js) for major list
   Reads/writes profile data in sessionStorage under 'ee4213.registration.profile.v1'.
   Does NOT read selected courses (that data belongs to Degree Audit).
   Encoding: UTF-8 without BOM. */

(() => {
    'use strict';

    const PROFILE_STORAGE_KEY = 'ee4213.registration.profile.v1';
    const UNDECLARED_ID = 'UNDECLARED';

    const DEFAULTS = {
        major: UNDECLARED_ID,
        transfer: 'Associate Degree',
        year: 'Year 1',
        goal: '',
        specialization: 'Data Engineering'
    };

    const YEAR_OPTIONS = ['Year 1', 'Year 2', 'Year 3', 'Year 4'];
    const TRANSFER_OPTIONS = ['Associate Degree', 'Higher Diploma', 'Direct Entry', 'Department Transfer'];
    const GOAL_OPTIONS = [
        'IC Design Engineer',
        'Embedded Systems Engineer',
        'RF / Communications Engineer',
        'Power / Energy Engineer',
        'Software Engineer',
        'Data Analyst',
        'Machine Learning Engineer',
        'Network / Security Engineer',
        'Research Engineer',
        'Product / Project Engineer'
    ];
    const SPEC_OPTIONS = [
        'Data Engineering',
        'Artificial Intelligence / Machine Learning',
        'Communications',
        'Microelectronics / IC Design',
        'Embedded Systems',
        'Power and Energy',
        'Networking and Security',
        'Photonics',
        'Control Systems',
        'Software Engineering'
    ];

    let current = { ...DEFAULTS };
    let editDraft = null;

    // ---------- storage ----------
    function loadProfile() {
        let data = { ...DEFAULTS };
        try {
            const raw = sessionStorage.getItem(PROFILE_STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && typeof parsed === 'object') {
                    if (typeof parsed.major === 'string' && parsed.major) data.major = parsed.major;
                    if (typeof parsed.transfer === 'string' && parsed.transfer) data.transfer = parsed.transfer;
                    if (typeof parsed.year === 'string' && parsed.year) data.year = parsed.year;
                    if (typeof parsed.goal === 'string') data.goal = parsed.goal;
                    if (typeof parsed.specialization === 'string' && parsed.specialization) data.specialization = parsed.specialization;
                }
            }
        } catch (err) {
            /* Ignore invalid demo data. */
        }
        return data;
    }

    function saveProfile(profile) {
        try {
            sessionStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
        } catch (err) {
            /* sessionStorage may be unavailable under file:// in some browsers. */
        }
    }

    // ---------- language helpers ----------
    function currentLang() {
        return document.documentElement.lang === 'en' ? 'en' : 'zh';
    }

    function getSessionUserName() {
        try {
            if (window.Portal && typeof window.Portal.getSession === 'function') {
                const s = window.Portal.getSession();
                if (s && typeof s.userName === 'string' && s.userName.trim()) {
                    return s.userName.trim();
                }
            }
        } catch (err) {
            /* fall through */
        }
        return 'Student';
    }

    function getMajorList() {
        const data = window.EE4213Data;
        if (!data || !Array.isArray(data.majors)) return [];
        return data.majors.map((m) => m.majorId);
    }

    const TRANSFER_LABELS = {
        'Associate Degree': { zh: '副學士', en: 'Associate Degree' },
        'Higher Diploma': { zh: '高級文憑', en: 'Higher Diploma' },
        'Direct Entry': { zh: '直接升讀 / 直升', en: 'Direct Entry' },
        'Department Transfer': { zh: '轉系 / 轉主修', en: 'Department Transfer' }
    };

    const YEAR_LABELS = {
        'Year 1': { zh: '一年級', en: 'Year 1' },
        'Year 2': { zh: '二年級', en: 'Year 2' },
        'Year 3': { zh: '三年級', en: 'Year 3' },
        'Year 4': { zh: '四年級', en: 'Year 4' }
    };

    const GOAL_LABELS = {
        'IC Design Engineer': { zh: 'IC 設計工程師', en: 'IC Design Engineer' },
        'Embedded Systems Engineer': { zh: '嵌入式系統工程師', en: 'Embedded Systems Engineer' },
        'RF / Communications Engineer': { zh: '射頻 / 通訊工程師', en: 'RF / Communications Engineer' },
        'Power / Energy Engineer': { zh: '電力 / 能源工程師', en: 'Power / Energy Engineer' },
        'Software Engineer': { zh: '軟體工程師', en: 'Software Engineer' },
        'Data Analyst': { zh: '資料分析師', en: 'Data Analyst' },
        'Machine Learning Engineer': { zh: '機器學習工程師', en: 'Machine Learning Engineer' },
        'Network / Security Engineer': { zh: '網路 / 資安工程師', en: 'Network / Security Engineer' },
        'Research Engineer': { zh: '研究工程師', en: 'Research Engineer' },
        'Product / Project Engineer': { zh: '產品 / 專案工程師', en: 'Product / Project Engineer' }
    };

    const SPEC_LABELS = {
        'Data Engineering': { zh: '資料工程', en: 'Data Engineering' },
        'Artificial Intelligence / Machine Learning': { zh: '人工智慧 / 機器學習', en: 'Artificial Intelligence / Machine Learning' },
        'Communications': { zh: '通訊工程', en: 'Communications' },
        'Microelectronics / IC Design': { zh: '微電子 / IC 設計', en: 'Microelectronics / IC Design' },
        'Embedded Systems': { zh: '嵌入式系統', en: 'Embedded Systems' },
        'Power and Energy': { zh: '電力與能源', en: 'Power and Energy' },
        'Networking and Security': { zh: '網路與資安', en: 'Networking and Security' },
        'Photonics': { zh: '光電工程', en: 'Photonics' },
        'Control Systems': { zh: '控制系統', en: 'Control Systems' },
        'Software Engineering': { zh: '軟體工程', en: 'Software Engineering' }
    };

    function labelFor(map, key, lang) {
        const entry = map[key];
        if (!entry) return key || '—';
        return lang === 'zh' ? (entry.zh || entry.en) : (entry.en || entry.zh);
    }

    // ---------- view rendering ----------
    function renderView() {
        const lang = currentLang();
        setText('viewUserName', getSessionUserName());

        if (current.major === UNDECLARED_ID) {
            setText('viewMajor', lang === 'zh' ? '未選擇主修' : 'Not yet selected');
        } else {
            const data = window.EE4213Data;
            let label = current.major;
            if (data && Array.isArray(data.majors)) {
                const m = data.majors.find((x) => x.majorId === current.major);
                if (m) {
                    const long = (m.name && (lang === 'zh' ? (m.name.zh || m.name.en) : (m.name.en || m.name.zh)));
                    if (long) label = long + ' (' + m.majorId + ')';
                }
            }
            setText('viewMajor', label);
        }

        setText('viewTransfer', labelFor(TRANSFER_LABELS, current.transfer, lang));
        setText('viewYear', labelFor(YEAR_LABELS, current.year, lang));
        setText('viewGoal', current.goal ? labelFor(GOAL_LABELS, current.goal, lang) : (lang === 'zh' ? '未設定' : 'Not set'));
        setText('viewSpec', labelFor(SPEC_LABELS, current.specialization, lang));
    }

    function setText(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    // ---------- edit rendering ----------
    function openEditMode() {
        editDraft = { ...current };
        buildEditMajorChips();
        buildEditTransferChips();
        buildEditYearChips();
        buildEditGoalChips();
        buildEditSpecChips();
        setText('editUserName', getSessionUserName());
        document.getElementById('viewMode').hidden = true;
        document.getElementById('editMode').hidden = false;
    }

    function closeEditMode() {
        editDraft = null;
        document.getElementById('editMode').hidden = true;
        document.getElementById('viewMode').hidden = false;
    }

    function buildChips(containerId, options, currentValue, onSelect, labelMap) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.textContent = '';
        const lang = currentLang();

        options.forEach((value) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = labelMap ? labelFor(labelMap, value, lang) : value;
            if (value === currentValue) btn.classList.add('selected');
            
            btn.addEventListener('click', () => {
                container.querySelectorAll('button').forEach((b) => b.classList.remove('selected'));
                btn.classList.add('selected');
                onSelect(value);
            });
            container.appendChild(btn);
        });
    }

    function buildEditMajorChips() {
        const majors = [UNDECLARED_ID, ...getMajorList()];
        buildChips('editMajorChips', majors, editDraft.major, (v) => { editDraft.major = v; });
    }

    function buildEditTransferChips() {
        buildChips('editTransferChips', TRANSFER_OPTIONS, editDraft.transfer, (v) => { editDraft.transfer = v; }, TRANSFER_LABELS);
    }

    function buildEditYearChips() {
        buildChips('editYearChips', YEAR_OPTIONS, editDraft.year, (v) => { editDraft.year = v; }, YEAR_LABELS);
    }

    function buildEditGoalChips() {
        buildChips('editGoalChips', GOAL_OPTIONS, editDraft.goal, (v) => { editDraft.goal = v; }, GOAL_LABELS);
    }

    function buildEditSpecChips() {
        buildChips('editSpecChips', SPEC_OPTIONS, editDraft.specialization, (v) => { editDraft.specialization = v; }, SPEC_LABELS);
    }

    function bindEditControls() {
        const editBtn = document.getElementById('editBtn');
        if (editBtn) editBtn.addEventListener('click', openEditMode);

        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) cancelBtn.addEventListener('click', closeEditMode);

        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                if (!editDraft) return;
                current = {
                    major: editDraft.major || UNDECLARED_ID,
                    transfer: TRANSFER_OPTIONS.includes(editDraft.transfer) ? editDraft.transfer : DEFAULTS.transfer,
                    year: YEAR_OPTIONS.includes(editDraft.year) ? editDraft.year : DEFAULTS.year,
                    goal: GOAL_OPTIONS.includes(editDraft.goal) ? editDraft.goal : '',
                    specialization: SPEC_OPTIONS.includes(editDraft.specialization) ? editDraft.specialization : DEFAULTS.specialization
                };
                saveProfile(current);
                closeEditMode();
                renderView();
            });
        }
    }

    // ---------- language change ----------
    function bindLanguageChange() {
        document.addEventListener('portal:languagechange', () => {
            renderView();
            if (editDraft) {
                buildEditMajorChips();
                buildEditTransferChips();
                buildEditYearChips();
                buildEditGoalChips();
                buildEditSpecChips();
            }
        });
    }

    // ---------- Init ----------
    function init() {
        current = loadProfile();
        renderView();
        bindEditControls();
        bindLanguageChange();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();