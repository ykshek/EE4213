(function () {
    'use strict';

    const data = window.EE4213Data;
    if (!data || !Array.isArray(data.courses)) {
        throw new Error('Course Comparator requires EE4213Data to be loaded first.');
    }

    const assessmentLoadRank = { Low: 10, Moderate: 20, High: 30, 'Very High': 45 };
    const courses = data.courses;
    const poolResolver = window.EE4213CoursePool;
    const timetable = window.EE4213Timetable;
    if (!courses.length || !Array.isArray(data.majors) || !data.majors.length || !poolResolver || !timetable) {
        throw new Error('Course Comparator requires the shared course, profile, and timetable modules.');
    }

    const progressStorageKey = 'cityuEE4213DegreeAuditStatusV2';
    const plannerTransferKey = 'ee4213.course-planner.transfer.v1';
    const comparatorStateKey = 'ee4213.comparator.selection.v1';
    let auditProgress = readAuditProgress();
    let coursePool = poolResolver.resolve(data, poolResolver.readProfile(), auditProgress);

    const days = [
        { key: 'M', zh: '星期一', en: 'Monday' },
        { key: 'T', zh: '星期二', en: 'Tuesday' },
        { key: 'W', zh: '星期三', en: 'Wednesday' },
        { key: 'Th', zh: '星期四', en: 'Thursday' },
        { key: 'F', zh: '星期五', en: 'Friday' }
    ];
    const sectionTypeLabels = {
        Class: { zh: '課堂', en: 'Class' },
        Lecture: { zh: '講課', en: 'Lecture' },
        Lab: { zh: '實驗課', en: 'Lab' },
        Tutorial: { zh: '導修課', en: 'Tutorial' },
        Seminar: { zh: '研討課', en: 'Seminar' },
        Retake: { zh: '重修', en: 'Retake' }
    };
    const plannerStatusLabels = {
        planned: { zh: '規劃中', en: 'Planned' },
        completed: { zh: '已完成', en: 'Completed' },
        failed: { zh: '不合格', en: 'Failed' },
        blocked: { zh: '先修受阻', en: 'Blocked' }
    };
    const retakeSectionOptions = {
        L01: { days: 'Tue', time: '09:00 - 11:50' },
        L02: { days: 'Thu', time: '15:00 - 17:50' }
    };
    const messages = {
        zh: {
            conflict: '發現時間衝突',
            conflictCount: count => `有 ${count} 項時間重疊。`,
            conflictFocusHint: '選擇一項衝突，以在時間表及班別選擇中標示相關時段。',
            focusConflictLabel: text => `標示衝突：${text}`,
            nextConflict: '查看下一項衝突',
            conflictFocused: text => `已標示：${text}`,
            clear: '目前顯示的時間沒有重疊',
            clearDetail: '所選上課時間沒有重疊；請以官方時間表核對實際安排。',
            choose: '請選擇課程，以查看時間表。',
            oneCourse: '已選課程的時間沒有重疊；加入其他課程以比較。',
            noSchedule: '所選課程沒有可用的上課時間資料。',
            noWorkloadData: '未有示範負擔資料',
            importedPlanSummary: (total, planned) => `已載入學位審查的 ${total} 項課程；${planned} 項納入時間表。`,
            importedPlanLabel: '學位審查規劃',
            plannerTimetableNote: '時間表及衝突檢查只包括「規劃中」的課程；已完成、不合格或先修受阻的課程只顯示於負擔比較。',
            excludedPlannerItems: count => `另有 ${count} 個未指派的選修／通識要求未載入。`,
            noPlanned: '沒有可排入時間表的規劃課程。',
            noPlannedDetail: '已載入的課程為已完成、不合格或先修受阻，因此只會出現在負擔比較中。',
            emptyComparison: '選擇課程以比較負擔。',
            singleCompareNote: '加入另一項課程以並排比較。',
            plannerStatusRow: '狀態',
            sourceRow: '資料來源',
            provenanceOfficial: 'AIMS 快照',
            provenanceSample: '示範時間表',
            provenanceNone: '沒有資料',
            provenanceOfficialTitle: term => `上課時間及評分比重取自 AIMS／課程目錄${term ? `（${term}）` : ''}；自修時數、難度及 GPA 仍為生成示範值。`,
            provenanceSampleTitle: '示範上課時間及評分比重；負擔指標為生成示範值。',
            provenanceNoneTitle: '沒有可用的上課時間或負擔資料。',
            generatedMetricNote: '生成示範值，並非官方統計。',
            sourceMetricNote: '資料來源見「資料來源」列。',
            importedRetake: (code, section) => `已載入重修科目 ${code}（${section}）。`,
            retakeLabel: '重修科目',
            retakeType: '重修',
            retakeConflict: '重修時段有衝突',
            plannerTransferError: '無法讀取學位審查規劃，請返回學位審查再試一次。',
            missingPlannerCourses: codes => `共享課程資料找不到以下規劃課程，已略過：${codes.join('、')}`,
            noSharedValue: '共享示範資料未提供',
            noCode: '請輸入一個或多個課程編號。',
            notFound: codes => `找不到示範課程編號：${codes.join('、')}`,
            added: count => `已加入 ${count} 項課程。`,
            addedOutsidePool: codes => `另有 ${codes.length} 項課程不在目前課程池，已直接加入比較：${codes.join('、')}。`,
            addedFromCourseInfo: code => `已從課程資訊加入 ${code}。`,
            addFromCourseInfoNotFound: code => `課程資訊要求加入的 ${code} 不存在。`,
            cleared: '已清除課程選擇。可使用「復原清除」還原。',
            restored: '已復原課程選擇。',
            collision: (day, first, second) => {
                const label = event => event.course.courseId === retakeCourseId
                    ? `重修 ${event.course.courseId}`
                    : event.course.courseId;
                return `${day}：${label(first)}（${first.time}）與 ${label(second)}（${second.time}）重疊。`;
            },
            courseName: '課程',
            studyHours: '每週自修時數（示範）',
            assessment: '評估負擔（示範）',
            difficulty: '難度（示範，5 分制）',
            workload: '示範負擔指數（自修時數 + 難度×10 + 評估等級）',
            sampleWorkload: '共享資料中的示範負擔評分',
            sampleGpa: '共享資料中的示範平均 GPA',
            grading: '評分組成',
            assessmentLabel: { Low: '低', Moderate: '中等', High: '高', 'Very High': '非常高' },
            gradingLabels: { assignments: '作業', midterm: '期中考', final: '期末考', project: '專題', other: '其他' },
            time: '時間',
            selectionLabel: (code, title) => `選擇 ${code} ${title}`,
            removeCourseLabel: code => `從比較器移除 ${code}`,
            removedFromComparator: code => `已從比較器移除 ${code}。`,
            searchAvailable: count => `${count} 項可加入課程。`,
            searchMatches: count => `找到 ${count} 項可加入課程。`,
            searchNoMatches: query => `找不到符合「${query}」的可加入課程。`,
            noSearchResults: query => `沒有符合「${query}」的課程；已選課程仍會保留在清單中。`,
            blockedSummary: codes => `以下課程不在目前學生資料的可選課程池中：${codes.join('、')}`,
            profileSummary: (major, year, credits) => `課程池依學生資料設定：${major} · ${year} · ${credits} 學分入學途徑。`,
            noProfileMajor: '請先在學生資料選擇主修，才能查看本學年的可選課程。',
            noAvailableCourses: '目前沒有符合條件的可加入課程。',
            notInPool: codes => `以下課程不在目前學生資料的可選課程池中：${codes.join('、')}`,
            timeSlot: (type, time, place) => [
                type === 'curriculum-sample' ? '課程結構示範' : type === 'Retake' ? '重修' : type,
                time,
                place
            ].filter(Boolean).join(' · ')
        },
        en: {
            conflict: 'Schedule overlap detected',
            conflictCount: count => `${count} overlapping time slot${count === 1 ? '' : 's'} found.`,
            conflictFocusHint: 'Select a conflict to highlight the relevant timetable blocks and section choices.',
            focusConflictLabel: text => `Highlight conflict: ${text}`,
            nextConflict: 'Show next conflict',
            conflictFocused: text => `Highlighted: ${text}`,
            clear: 'No overlap in the displayed timetable',
            clearDetail: 'The selected meeting times do not overlap; confirm actual arrangements against the official timetable.',
            choose: 'Choose courses to see the timetable.',
            oneCourse: 'No overlap in this course’s meeting times. Add another course to compare.',
            noSchedule: 'No meeting-time data is available for the selected courses.',
            noWorkloadData: 'No sample workload data',
            importedPlanSummary: (total, planned) => `Loaded ${total} course${total === 1 ? '' : 's'} from Degree Audit; ${planned} included in the timetable.`,
            importedPlanLabel: 'From Degree Audit plan',
            plannerTimetableNote: 'The timetable and conflict check include planned courses only; completed, failed, or prerequisite-blocked courses appear in the workload comparison.',
            excludedPlannerItems: count => `${count} unassigned elective/GE requirement${count === 1 ? ' was' : 's were'} not loaded.`,
            noPlanned: 'No planned courses are available for the timetable.',
            noPlannedDetail: 'The imported courses are completed, failed, or prerequisite-blocked, so they appear only in the workload comparison.',
            emptyComparison: 'Choose courses to compare workload.',
            singleCompareNote: 'Add another course to compare side by side.',
            plannerStatusRow: 'Status',
            sourceRow: 'Data source',
            provenanceOfficial: 'AIMS snapshot',
            provenanceSample: 'Sample schedule',
            provenanceNone: 'No data',
            provenanceOfficialTitle: term => `Meeting times and grading weights from an AIMS/catalogue snapshot${term ? ` (${term})` : ''}; study hours, difficulty, and GPA remain generated demo values.`,
            provenanceSampleTitle: 'Illustrative meeting times and grading; workload metrics are generated demo values.',
            provenanceNoneTitle: 'No meeting-time or workload data is available.',
            generatedMetricNote: 'Generated demo value, not an official statistic.',
            sourceMetricNote: 'See the Data source row for provenance.',
            importedRetake: (code, section) => `Loaded retake course ${code} (${section}).`,
            retakeLabel: 'Retake course',
            retakeType: 'Retake',
            retakeConflict: 'Retake section clash',
            plannerTransferError: 'Could not read the Degree Audit plan. Return to Degree Audit and try again.',
            missingPlannerCourses: codes => `These planned courses are missing from shared course data and were skipped: ${codes.join(', ')}`,
            noSharedValue: 'Not available in shared sample data',
            noCode: 'Enter one or more course codes.',
            notFound: codes => `Sample course code not found: ${codes.join(', ')}`,
            added: count => `Added ${count} course${count === 1 ? '' : 's'}.`,
            addedOutsidePool: codes => `${codes.length} course${codes.length === 1 ? '' : 's'} outside the current profile pool were added directly: ${codes.join(', ')}.`,
            addedFromCourseInfo: code => `Added ${code} from Course Information.`,
            addFromCourseInfoNotFound: code => `Course Information requested ${code}, but that course was not found.`,
            cleared: 'Course selection cleared. Use Undo clear to restore it.',
            restored: 'Course selection restored.',
            collision: (day, first, second) => {
                const label = event => event.course.courseId === retakeCourseId
                    ? `Retake ${event.course.courseId}`
                    : event.course.courseId;
                return `${day}: ${label(first)} (${first.time}) overlaps ${label(second)} (${second.time}).`;
            },
            courseName: 'Course',
            studyHours: 'Study hours per week (sample)',
            assessment: 'Assessment load (sample)',
            difficulty: 'Difficulty (sample, out of 5)',
            workload: 'Sample workload index (study hours + difficulty × 10 + assessment tier)',
            sampleWorkload: 'Sample workload rating in shared data',
            sampleGpa: 'Sample mean GPA in shared data',
            grading: 'Grading components',
            assessmentLabel: { Low: 'Low', Moderate: 'Moderate', High: 'High', 'Very High': 'Very high' },
            gradingLabels: { assignments: 'Assignments', midterm: 'Midterm', final: 'Final', project: 'Project', other: 'Other' },
            time: 'Time',
            selectionLabel: (code, title) => `Select ${code} ${title}`,
            removeCourseLabel: code => `Remove ${code} from comparator`,
            removedFromComparator: code => `Removed ${code} from the comparator.`,
            searchAvailable: count => `${count} course${count === 1 ? '' : 's'} available to add.`,
            searchMatches: count => `${count} available course${count === 1 ? '' : 's'} found.`,
            searchNoMatches: query => `No available courses match “${query}”.`,
            noSearchResults: query => `No courses match “${query}”. Selected courses remain in the list.`,
            blockedSummary: codes => `These courses are not in the current profile’s available course pool: ${codes.join(', ')}`,
            profileSummary: (major, year, credits) => `Course pool follows Student Profile: ${major} · ${year} · ${credits}-credit entry route.`,
            noProfileMajor: 'Choose a major in Student Profile to see courses available for this year.',
            noAvailableCourses: 'There are no courses available to add for this profile and year.',
            notInPool: codes => `These courses are not in the current profile’s available course pool: ${codes.join(', ')}`,
            timeSlot: (type, time, place) => [
                type === 'curriculum-sample' ? 'Curriculum sample' : type === 'Retake' ? 'Retake' : type,
                time,
                place
            ].filter(Boolean).join(' · ')
        }
    };

    const courseByCode = new Map(courses.map(course => [course.courseId, course]));
    if (courseByCode.size !== courses.length) {
        throw new Error('Course Comparator data contains duplicate course IDs.');
    }
    const elements = {
        courseCodes: document.getElementById('course-codes'),
        courseSearch: document.getElementById('course-search'),
        clearSearch: document.getElementById('clear-course-search'),
        searchStatus: document.getElementById('course-search-status'),
        courseList: document.getElementById('course-list'),
        addCourses: document.getElementById('add-courses'),
        inputMessage: document.getElementById('input-message'),
        reset: document.getElementById('reset-selection'),
        undo: document.getElementById('undo-clear'),
        sort: document.getElementById('sort-key'),
        status: document.getElementById('status-message'),
        conflictFocusStatus: document.getElementById('conflict-focus-status'),
        timetable: document.getElementById('timetable-wrapper'),
        comparison: document.getElementById('comparison-table-wrapper'),
        profileStatus: document.getElementById('profile-pool-status'),
        sectionChoicePanel: document.getElementById('section-choice-panel'),
        sectionChoiceList: document.getElementById('section-choice-list'),
        summary: document.getElementById('comparator-summary'),
        summarySelected: document.getElementById('summary-selected'),
        summaryPlanned: document.getElementById('summary-planned'),
        summaryConflicts: document.getElementById('summary-conflicts'),
        viewTabs: [...document.querySelectorAll('[data-comparator-view]')],
        viewPanels: {
            schedule: document.getElementById('schedule-panel'),
            comparison: document.getElementById('comparison-panel')
        },
        tabConflictCount: document.getElementById('tab-conflict-count')
    };
    function setActiveView(view, moveFocus = false) {
        const activeTab = elements.viewTabs.find(tab => tab.dataset.comparatorView === view);
        if (!activeTab) return;
        elements.viewTabs.forEach(tab => {
            const active = tab === activeTab;
            tab.setAttribute('aria-selected', String(active));
            tab.tabIndex = active ? 0 : -1;
        });
        Object.entries(elements.viewPanels).forEach(([name, panel]) => {
            if (panel) panel.hidden = name !== view;
        });
        if (moveFocus) activeTab.focus();
    }

    function readPlannerTransfer() {
        const empty = { courseIds: [], courses: [], excluded: [], retakeCourseId: '', retakeSection: '', error: '' };
        try {
            const raw = sessionStorage.getItem(plannerTransferKey);
            if (!raw) return empty;
            const transfer = JSON.parse(raw);
            sessionStorage.removeItem(plannerTransferKey);
            if (transfer?.source !== 'degree-audit' ||
                (!Array.isArray(transfer.courseIds) && !Array.isArray(transfer.courses))) {
                return { ...empty, error: copy().plannerTransferError };
            }
            const allowedStatuses = new Set(['planned', 'completed', 'failed', 'blocked']);
            const courses = (Array.isArray(transfer.courses) ? transfer.courses : [])
                .filter(item => item && typeof item.courseId === 'string')
                .map(item => ({
                    courseId: item.courseId,
                    status: allowedStatuses.has(item.status) ? item.status : 'planned',
                    reason: typeof item.reason === 'string' ? item.reason : ''
                }));
            const courseIds = [...new Set([
                ...(Array.isArray(transfer.courseIds)
                    ? transfer.courseIds.filter(code => typeof code === 'string')
                    : []),
                ...courses.map(course => course.courseId)
            ])];
            const excluded = (Array.isArray(transfer.excluded) ? transfer.excluded : [])
                .filter(item => item && typeof item.courseId === 'string')
                .map(item => ({
                    courseId: item.courseId,
                    label: typeof item.label === 'string' ? item.label : item.courseId,
                    reason: typeof item.reason === 'string' ? item.reason : ''
                }));
            return {
                courseIds,
                courses,
                excluded,
                retakeCourseId: typeof transfer.retakeCourseId === 'string' ? transfer.retakeCourseId : '',
                retakeSection: typeof transfer.retakeSection === 'string' ? transfer.retakeSection : '',
                error: ''
            };
        } catch (error) {
            console.warn('Unable to read the Degree Audit plan for Course Comparator.', error);
            return { ...empty, error: copy().plannerTransferError };
        }
    }

    const savedComparatorState = readComparatorState();
    const plannerTransfer = readPlannerTransfer();
    const plannerStatuses = new Map();
    const plannerReasons = new Map();
    const importedPlanCodes = new Set();
    const manualCourseCodes = new Set();
    const retainedEntryCodes = new Set();
    const dismissedCourseCodes = new Set();
    const sectionSelections = new Map();
    let retakeCourseId = '';
    let retakeSection = 'L01';
    let selectedCodes = [];
    let sortKey = 'workloadScore';
    let courseSearchQuery = '';
    let currentConflicts = [];
    let focusedConflictIndex = -1;
    let lastClearedState = null;
    let courseInfoAddNotice = '';
    let courseInfoAddError = false;
    const timetableEventNodes = new Map();

    const transferHasPlan = plannerTransfer.courseIds.length > 0 ||
        plannerTransfer.courses.length > 0 ||
        Boolean(plannerTransfer.retakeCourseId);
    if (transferHasPlan) {
        applyPlannerTransfer(plannerTransfer);
        if (savedComparatorState) {
            sortKey = normalizeSortKey(savedComparatorState.sortKey);
            restoreSectionSelections(savedComparatorState);
        }
    } else if (savedComparatorState) {
        applyComparatorState(savedComparatorState);
    }
    if (retakeCourseId) {
        sectionSelections.set(sectionChoiceKey({ courseId: retakeCourseId }, 'Retake'), retakeSection);
    }
    saveComparatorState();

    function normalizeSortKey(value) {
        const validKeys = new Set(['workloadScore', 'expectedStudyHoursPerWeek', 'assessmentLoad', 'difficulty', 'courseCode']);
        return validKeys.has(value) ? value : 'workloadScore';
    }

    function applyPlannerTransfer(transfer) {
        plannerStatuses.clear();
        plannerReasons.clear();
        importedPlanCodes.clear();
        manualCourseCodes.clear();
        retainedEntryCodes.clear();
        dismissedCourseCodes.clear();
        transfer.courses.forEach(course => {
            if (!courseByCode.has(course.courseId)) return;
            plannerStatuses.set(course.courseId, course.status);
            if (course.reason) plannerReasons.set(course.courseId, course.reason);
        });
        transfer.courseIds.forEach(code => {
            if (!courseByCode.has(code)) return;
            importedPlanCodes.add(code);
            if (!plannerStatuses.has(code)) plannerStatuses.set(code, 'planned');
        });
        retakeCourseId = transfer.retakeCourseId && courseByCode.has(transfer.retakeCourseId)
            ? transfer.retakeCourseId
            : '';
        retakeSection = retakeSectionOptions[transfer.retakeSection] ? transfer.retakeSection : 'L01';
        if (retakeCourseId) importedPlanCodes.add(retakeCourseId);
        selectedCodes = [...importedPlanCodes];
    }

    function restoreSectionSelections(state) {
        sectionSelections.clear();
        (Array.isArray(state.sectionSelections) ? state.sectionSelections : []).forEach(entry => {
            if (Array.isArray(entry) && typeof entry[0] === 'string' && typeof entry[1] === 'string') {
                sectionSelections.set(entry[0], entry[1]);
            }
        });
        if (retakeCourseId) {
            sectionSelections.set(sectionChoiceKey({ courseId: retakeCourseId }, 'Retake'), retakeSection);
        }
    }

    function applyComparatorState(state) {
        plannerStatuses.clear();
        plannerReasons.clear();
        importedPlanCodes.clear();
        manualCourseCodes.clear();
        retainedEntryCodes.clear();
        dismissedCourseCodes.clear();
        (Array.isArray(state.manualCourseCodes) ? state.manualCourseCodes : []).forEach(code => {
            if (courseByCode.has(code)) manualCourseCodes.add(code);
        });
        const allowedStatuses = new Set(['planned', 'completed', 'failed', 'blocked']);
        (Array.isArray(state.importedCourses) ? state.importedCourses : []).forEach(course => {
            if (!course || !courseByCode.has(course.courseId)) return;
            plannerStatuses.set(course.courseId, allowedStatuses.has(course.status) ? course.status : 'planned');
            if (course.reason) plannerReasons.set(course.courseId, course.reason);
        });
        (Array.isArray(state.importedCourseIds) ? state.importedCourseIds : []).forEach(code => {
            if (courseByCode.has(code)) importedPlanCodes.add(code);
        });
        retakeCourseId = state.retakeCourseId && courseByCode.has(state.retakeCourseId)
            ? state.retakeCourseId
            : '';
        retakeSection = retakeSectionOptions[state.retakeSection] ? state.retakeSection : 'L01';
        if (retakeCourseId) importedPlanCodes.add(retakeCourseId);
        selectedCodes = [...new Set((Array.isArray(state.selectedCodes) ? state.selectedCodes : [])
            .filter(code => typeof code === 'string' && courseByCode.has(code)))];
        sortKey = normalizeSortKey(state.sortKey);
        restoreSectionSelections(state);
        selectedCodes = selectedCodes.filter(code => isSelectedCourseAllowed(courseByCode.get(code)));
    }

    function serializeComparatorState() {
        return {
            version: 1,
            selectedCodes: [...selectedCodes],
            sortKey,
            sectionSelections: [...sectionSelections.entries()],
            manualCourseCodes: [...manualCourseCodes],
            importedCourseIds: [...importedPlanCodes].filter(code => code !== retakeCourseId),
            importedCourses: [...plannerStatuses.entries()]
                .filter(([courseId]) => importedPlanCodes.has(courseId))
                .map(([courseId, status]) => ({
                    courseId,
                    status,
                    reason: plannerReasons.get(courseId) || ''
                })),
            retakeCourseId,
            retakeSection
        };
    }

    function readComparatorState() {
        try {
            const raw = sessionStorage.getItem(comparatorStateKey);
            if (!raw) return null;
            const state = JSON.parse(raw);
            return state && typeof state === 'object' ? state : null;
        } catch (error) {
            console.warn('Unable to read the saved Course Comparator selection.', error);
            return null;
        }
    }

    function saveComparatorState() {
        try {
            sessionStorage.setItem(comparatorStateKey, JSON.stringify(serializeComparatorState()));
        } catch (error) {
            console.warn('Unable to save the Course Comparator selection.', error);
        }
    }

    function dismissUndo() {
        lastClearedState = null;
        if (elements.undo) elements.undo.hidden = true;
    }

    function isSelectedCourseAllowed(course) {
        return getCourseAvailability(course).allowed ||
            importedPlanCodes.has(course.courseId) ||
            manualCourseCodes.has(course.courseId);
    }

    function language() {
        return document.body.dataset.lang === 'en' ? 'en' : 'zh';
    }

    function copy() {
        return messages[language()];
    }

    function plannerStatusFor(courseId) {
        return plannerStatuses.get(courseId) || 'planned';
    }

    function createPlannerStatusChip(courseId) {
        const status = plannerStatusFor(courseId);
        const label = plannerStatusLabels[status]?.[language()] || status;
        const chip = document.createElement('span');
        chip.className = `comparator-status-chip is-${status}`;
        chip.textContent = label;
        const reason = plannerReasons.get(courseId);
        if (reason) {
            chip.title = reason;
            chip.setAttribute('aria-label', `${label} (${reason})`);
        }
        return chip;
    }

    function createProvenanceChip(course) {
        const comparator = course.comparator;
        const chip = document.createElement('span');
        chip.className = 'comparator-provenance-chip';
        if (!comparator) {
            chip.classList.add('is-none');
            chip.textContent = copy().provenanceNone;
            chip.title = copy().provenanceNoneTitle;
            chip.setAttribute('aria-label', `${copy().provenanceNone}: ${copy().provenanceNoneTitle}`);
            return chip;
        }
        const source = typeof comparator.source === 'string' ? comparator.source : '';
        const official = /aims|catalogue/i.test(source);
        const label = official ? copy().provenanceOfficial : copy().provenanceSample;
        const title = official
            ? copy().provenanceOfficialTitle(comparator.term || '')
            : copy().provenanceSampleTitle;
        chip.classList.add(official ? 'is-official' : 'is-sample');
        chip.textContent = label;
        chip.title = title;
        chip.setAttribute('aria-label', `${label}: ${title}`);
        return chip;
    }

    function courseTitle(course) {
        return course.titles?.[language()] || course.titles?.en || course.courseId;
    }

    function createCourseInfoLink(courseId, title) {
        const link = document.createElement('a');
        link.className = 'course-info-arrow';
        link.href = poolResolver.courseInfoHref(courseId);
        link.textContent = '↗';
        link.setAttribute('aria-label', language() === 'zh'
            ? `查看 ${courseId} 課程資訊`
            : `View ${courseId} course information`);
        link.title = title;
        return link;
    }

    function readAuditProgress() {
        return poolResolver.readAuditProgress();
    }

    function getCourseAvailability(course) {
        const reason = coursePool.reasons[course.courseId];
        const allowed = coursePool.courses.some(item => item.course.courseId === course.courseId);
        return { allowed, reason: reason || copy().notInPool([course.courseId]), kind: allowed ? 'available' : 'outside-pool' };
    }

    function updateProfileStatus() {
        if (!elements.profileStatus) return;
        if (!coursePool.majorId) {
            elements.profileStatus.textContent = copy().noProfileMajor;
            return;
        }
        const major = data.majors.find(item => item.majorId === coursePool.majorId);
        const localizedMajorNames = {
            CDE: '電子計算機及數據工程學',
            INFE: '資訊工程學',
            ELEL: '電子及電機工程學',
            MEE: '微電子工程學'
        };
        const majorName = coursePool.majorId === 'COMMON'
            ? (language() === 'zh' ? '共同一年級' : 'Common Year 1')
            : (major?.name?.[language()] || (language() === 'zh' && localizedMajorNames[coursePool.majorId]) ||
                major?.name?.en || coursePool.majorId);
        elements.profileStatus.textContent = copy().profileSummary(
            majorName,
            language() === 'zh' ? `第 ${coursePool.year} 年` : `Year ${coursePool.year}`,
            coursePool.routeCreditUnits
        );
    }

    function applyAuditProgress(nextProgress) {
        auditProgress = nextProgress || readAuditProgress();
        coursePool = poolResolver.resolve(data, poolResolver.readProfile(), auditProgress);
        selectedCodes = selectedCodes.filter(code => {
            const course = courseByCode.get(code);
            return course && isSelectedCourseAllowed(course);
        });
        saveComparatorState();
        render();
    }

    function setInputMessage(message, isError = false) {
        elements.inputMessage.textContent = message;
        elements.inputMessage.classList.toggle('is-error', isError);
    }

    function workloadScore(course) {
        const comparison = course.comparator;
        if (!comparison || comparison.expectedStudyHoursPerWeek == null || comparison.difficulty == null || !comparison.assessmentLoad) {
            return null;
        }
        return comparison.expectedStudyHoursPerWeek + comparison.difficulty * 10 + (assessmentLoadRank[comparison.assessmentLoad] || 0);
    }

    function getSortedSelectedCourses() {
        return selectedCodes
            .map(code => courseByCode.get(code))
            .filter(course => course && isSelectedCourseAllowed(course))
            .sort((a, b) => {
                const first = sortValue(a);
                const second = sortValue(b);
                if (first == null) return second == null ? 0 : 1;
                if (second == null) return -1;
                if (typeof first === 'string') return first.localeCompare(second);
                return Number(second) - Number(first);
            });
    }

    function sortValue(course) {
        if (sortKey === 'workloadScore') return workloadScore(course);
        if (sortKey === 'assessmentLoad') return assessmentLoadRank[course.comparator?.assessmentLoad] || 0;
        if (sortKey === 'courseCode') return course.courseId;
        return course.comparator?.[sortKey];
    }

    function setSelectLanguage() {
        const lang = language();
        [elements.sort].filter(Boolean).forEach(select => {
            Array.from(select.options).forEach(option => {
                if (option.dataset[lang]) option.textContent = option.dataset[lang];
            });
        });
        elements.sort.value = sortKey;
        elements.courseCodes.placeholder = lang === 'zh' ? '例如：EE1001, EE2002' : 'e.g. EE1001, EE2002';
        elements.courseSearch.placeholder = lang === 'zh' ? '課程編號或名稱' : 'Course code or title';
    }

    function courseMatchesSearch(course, query) {
        const haystack = [
            course.courseId,
            course.titles?.zh,
            course.titles?.en
        ].filter(Boolean).join(' ').toLowerCase();
        return haystack.includes(query.toLowerCase());
    }

    function removeCourse(courseId) {
        selectedCodes = selectedCodes.filter(code => code !== courseId);
        importedPlanCodes.delete(courseId);
        manualCourseCodes.delete(courseId);
        retainedEntryCodes.delete(courseId);
        dismissedCourseCodes.add(courseId);
        if (courseId === retakeCourseId) retakeCourseId = '';
        [...sectionSelections.keys()]
            .filter(key => key.startsWith(`${courseId}:`))
            .forEach(key => sectionSelections.delete(key));
        dismissUndo();
        saveComparatorState();
        render();
        setInputMessage(copy().removedFromComparator(courseId));
    }

    function createCourseOption(course, index) {
        const option = document.createElement('div');
        option.className = 'comparator-course-option';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = course.courseId;
        checkbox.id = `comparator-course-${index}`;
        checkbox.checked = selectedCodes.includes(course.courseId);
        checkbox.setAttribute('aria-label', copy().selectionLabel(course.courseId, courseTitle(course)));
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                selectedCodes = [...new Set([...selectedCodes, course.courseId])];
                retainedEntryCodes.delete(course.courseId);
                dismissedCourseCodes.delete(course.courseId);
                if (!getCourseAvailability(course).allowed) manualCourseCodes.add(course.courseId);
            } else {
                selectedCodes = selectedCodes.filter(code => code !== course.courseId);
                importedPlanCodes.delete(course.courseId);
                manualCourseCodes.delete(course.courseId);
                retainedEntryCodes.add(course.courseId);
                if (course.courseId === retakeCourseId) retakeCourseId = '';
            }
            dismissUndo();
            saveComparatorState();
            setInputMessage('');
            render();
        });

        const labelContent = document.createElement('label');
        labelContent.htmlFor = checkbox.id;
        const code = document.createElement('strong');
        code.textContent = course.courseId;
        const name = document.createElement('small');
        name.textContent = courseTitle(course);
        labelContent.append(code, name);
        if (importedPlanCodes.has(course.courseId)) {
            const planNote = document.createElement('small');
            planNote.className = 'comparator-course-data-note';
            planNote.textContent = copy().importedPlanLabel;
            labelContent.appendChild(planNote);
            labelContent.appendChild(createPlannerStatusChip(course.courseId));
        }
        if (course.courseId === retakeCourseId) {
            const retakeNote = document.createElement('small');
            retakeNote.className = 'comparator-course-data-note';
            retakeNote.textContent = copy().retakeLabel;
            labelContent.appendChild(retakeNote);
        }
        if (!course.comparator) {
            const dataNote = document.createElement('small');
            dataNote.className = 'comparator-course-data-note';
            dataNote.textContent = copy().noWorkloadData;
            labelContent.appendChild(dataNote);
        }
        option.append(checkbox, labelContent, createCourseInfoLink(course.courseId, courseTitle(course)));

        if (selectedCodes.includes(course.courseId) || retainedEntryCodes.has(course.courseId)) {
            const remove = document.createElement('button');
            remove.type = 'button';
            remove.className = 'comparator-remove-course';
            remove.textContent = '−';
            remove.setAttribute('aria-label', copy().removeCourseLabel(course.courseId));
            remove.title = copy().removeCourseLabel(course.courseId);
            remove.addEventListener('click', event => {
                event.preventDefault();
                event.stopPropagation();
                removeCourse(course.courseId);
            });
            option.appendChild(remove);
        }
        return option;
    }

    function renderCourseList() {
        elements.courseList.replaceChildren();
        const availableCourses = coursePool.courses.map(({ course }) => course);
        const outsidePoolCourses = [...new Set([...importedPlanCodes, ...manualCourseCodes, ...retainedEntryCodes])]
            .map(code => courseByCode.get(code))
            .filter(course => course && !getCourseAvailability(course).allowed);
        const coursesById = new Map();
        [...availableCourses, ...outsidePoolCourses].forEach(course => {
            if (!coursesById.has(course.courseId)) coursesById.set(course.courseId, course);
        });
        const coursesToRender = [...coursesById.values()]
            .filter(course => !dismissedCourseCodes.has(course.courseId));

        if (!coursesToRender.length) {
            const emptyMessage = document.createElement('p');
            emptyMessage.className = 'comparator-course-empty';
            emptyMessage.textContent = coursePool.majorId ? copy().noAvailableCourses : copy().noProfileMajor;
            elements.courseList.appendChild(emptyMessage);
            elements.searchStatus.textContent = '';
            elements.clearSearch.disabled = !courseSearchQuery;
            updateProfileStatus();
            return;
        }

        const selectedCourses = coursesToRender.filter(course => selectedCodes.includes(course.courseId));
        const availableCoursesToShow = coursesToRender.filter(course =>
            !selectedCodes.includes(course.courseId)
        );
        const matchingAvailable = courseSearchQuery
            ? availableCoursesToShow.filter(course => courseMatchesSearch(course, courseSearchQuery))
            : availableCoursesToShow;
        const visibleCourses = [...selectedCourses, ...matchingAvailable]
            .sort((first, second) => first.courseId.localeCompare(second.courseId, undefined, {
                numeric: true,
                sensitivity: 'base'
            }));
        visibleCourses.forEach((course, index) => {
            elements.courseList.appendChild(createCourseOption(course, index));
        });

        if (!matchingAvailable.length && courseSearchQuery) {
            const noMatches = document.createElement('p');
            noMatches.className = 'comparator-course-empty';
            noMatches.textContent = copy().noSearchResults(courseSearchQuery);
            elements.courseList.appendChild(noMatches);
        }

        elements.searchStatus.textContent = courseSearchQuery
            ? (matchingAvailable.length
                ? copy().searchMatches(matchingAvailable.length)
                : copy().searchNoMatches(courseSearchQuery))
            : (availableCoursesToShow.length ? copy().searchAvailable(availableCoursesToShow.length) : '');
        elements.clearSearch.disabled = !courseSearchQuery;
        updateProfileStatus();
    }

    function parseCodes(value) {
        return value
            .split(/[,，;；\n]+/)
            .map(part => part.trim())
            .filter(Boolean)
            .flatMap(part => {
                const upper = part.toUpperCase();
                if (courseByCode.has(upper)) return [upper];
                return upper.split(/\s+/).filter(Boolean);
            });
    }

    function addCourses() {
        const codes = parseCodes(elements.courseCodes.value);
        if (!codes.length) {
            setInputMessage(copy().noCode, true);
            return;
        }
        const known = [...new Set(codes.filter(code => courseByCode.has(code)))];
        const invalid = codes.filter(code => !courseByCode.has(code));
        const outsidePool = known.filter(code => !getCourseAvailability(courseByCode.get(code)).allowed);
        known.forEach(code => {
            retainedEntryCodes.delete(code);
            dismissedCourseCodes.delete(code);
        });
        outsidePool.forEach(code => manualCourseCodes.add(code));
        selectedCodes = [...new Set([...selectedCodes, ...known])];
        elements.courseCodes.value = '';
        dismissUndo();
        saveComparatorState();
        render();
        const parts = [];
        if (known.length) parts.push(copy().added(known.length));
        if (outsidePool.length) parts.push(copy().addedOutsidePool(outsidePool));
        if (invalid.length) parts.push(copy().notFound(invalid));
        setInputMessage(parts.join(' '), invalid.length > 0);
    }

    function timeToMinutes(value) {
        const matches = [...value.matchAll(/(\d{1,2}):(\d{2})\s*(am|pm)?/gi)];
        if (matches.length < 2) return null;
        const toMinutes = match => {
            let hours = Number(match[1]);
            const minutes = Number(match[2]);
            const meridiem = match[3]?.toLowerCase();
            if (meridiem) {
                hours %= 12;
                if (meridiem === 'pm') hours += 12;
            }
            return hours * 60 + minutes;
        };
        const start = toMinutes(matches[0]);
        let end = toMinutes(matches[1]);
        if (end <= start) end += 24 * 60;
        if (start >= 23 * 60 || end <= 8 * 60) return null;
        return { start: Math.max(start, 8 * 60), end: Math.min(end, 23 * 60) };
    }

    function normalizedDays(value) {
        return [...new Set(String(value).split(/[\s,/&]+/).map(timetable.normalizeDay).filter(Boolean))];
    }

    function formatTime(minutes) {
        return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
    }

    function curriculumMeeting(course) {
        const profile = poolResolver.readProfile();
        const preferredMajor = coursePool.majorId === 'COMMON' ? profile.major : coursePool.majorId;
        const curriculumCourses = data.majors
            .filter(major => major.majorId === preferredMajor)
            .flatMap(major => major.curriculum.map(courseId => ({
                ...courseByCode.get(courseId)?.curriculumByMajor?.[major.majorId],
                courseId
            })))
            .concat(data.majors
                .filter(major => major.majorId !== preferredMajor)
                .flatMap(major => major.curriculum.map(courseId => ({
                    ...courseByCode.get(courseId)?.curriculumByMajor?.[major.majorId],
                    courseId
                }))));
        const item = curriculumCourses.find(entry => entry.courseId === course.courseId);
        if (!item || item.hasNoTimetableSlot || !item.day || typeof item.timeSlot !== 'string') return [];
        const match = /^(\d{1,2}):(\d{2})$/.exec(item.timeSlot);
        if (!match) return [];
        const startMinutes = Number(match[1]) * 60 + Number(match[2]);
        const interval = timeToMinutes(`${formatTime(startMinutes)} - ${formatTime(startMinutes + 170)}`);
        if (!interval) return [];
        return [{
            days: item.day,
            time: `${formatTime(interval.start)} - ${formatTime(interval.end)}`,
            type: 'curriculum-sample',
            location: ''
        }];
    }

    function meetingsForCourse(course) {
        if (course.courseId === retakeCourseId) {
            return Object.entries(retakeSectionOptions).map(([section, value]) => ({
                section,
                days: value.days,
                time: value.time,
                type: 'Retake',
                location: ''
            }));
        }
        const meetings = course.comparator?.scheduledMeetingTimes?.length
            ? course.comparator.scheduledMeetingTimes
            : curriculumMeeting(course);
        const deduplicated = new Map();
        meetings.forEach((meeting, index) => {
            const key = meeting.section && meeting.crn
                ? JSON.stringify([
                    meeting.type,
                    meeting.section,
                    meeting.crn,
                    meeting.days,
                    meeting.time,
                    meeting.dateRange
                ])
                : `meeting-${index}`;
            const existing = deduplicated.get(key);
            if (!existing) {
                deduplicated.set(key, { ...meeting });
                return;
            }
            if (meeting.location && meeting.location !== existing.location) {
                existing.location = [existing.location, meeting.location].filter(Boolean).join(' / ');
            }
        });
        return [...deduplicated.values()];
    }

    function getSectionGroups(meetings) {
        const groups = new Map();
        meetings.forEach(meeting => {
            if (!meeting.section) return;
            const type = meeting.type || 'Meeting';
            if (!groups.has(type)) groups.set(type, new Map());
            const sections = groups.get(type);
            if (!sections.has(meeting.section)) sections.set(meeting.section, []);
            sections.get(meeting.section).push(meeting);
        });
        return groups;
    }

    function sectionChoiceKey(course, type) {
        return `${course.courseId}:${type}`;
    }

    function selectedSection(course, type, sections) {
        const key = sectionChoiceKey(course, type);
        let value = sectionSelections.get(key);
        if (!sections.has(value)) {
            value = sections.keys().next().value;
            sectionSelections.set(key, value);
        }
        return value;
    }

    function renderSectionChoices(selected) {
        const container = elements.sectionChoiceList;
        const panel = elements.sectionChoicePanel;
        container.replaceChildren();
        let groupCount = 0;
        selected.forEach(course => {
            const meetings = meetingsForCourse(course);
            getSectionGroups(meetings).forEach((sections, type) => {
                if (sections.size < 2) return;
                groupCount += 1;
                const fieldset = document.createElement('fieldset');
                fieldset.className = 'section-choice-group';
                fieldset.dataset.courseCode = course.courseId;
                fieldset.dataset.sectionType = type;
                const legend = document.createElement('legend');
                const localizedType = sectionTypeLabels[type]?.[language()] ||
                    (language() === 'zh' ? `${type} 班別` : type);
                legend.textContent = `${course.courseId} · ${localizedType}`;
                const select = document.createElement('select');
                select.id = `section-choice-${groupCount}`;
                select.setAttribute('aria-label', language() === 'zh'
                    ? `${course.courseId} ${type} 班別`
                    : `${course.courseId} ${type} section`);
                const current = selectedSection(course, type, sections);
                sections.forEach((sectionMeetings, section) => {
                    const option = document.createElement('option');
                    option.value = section;
                    const summaries = [...new Set(sectionMeetings.map(meeting => {
                        const meetingDays = normalizedDays(meeting.days)
                            .map(day => days.find(item => item.key === day)?.[language()] || day)
                            .join(', ');
                        return [meetingDays, meeting.time].filter(Boolean).join(' ');
                    }))];
                    option.textContent = `${section} · ${summaries.join(' / ')}`;
                    option.selected = section === current;
                    select.appendChild(option);
                });
                select.addEventListener('change', () => {
                    sectionSelections.set(sectionChoiceKey(course, type), select.value);
                    if (type === 'Retake' && course.courseId === retakeCourseId) {
                        retakeSection = select.value;
                        setInputMessage(copy().importedRetake(retakeCourseId, retakeSection));
                    }
                    dismissUndo();
                    saveComparatorState();
                    renderResults(false);
                });
                fieldset.append(legend, select);
                container.appendChild(fieldset);
            });
        });
        panel.hidden = groupCount === 0;
    }

    function allEvents(selected) {
        return selected.flatMap(course => {
            const meetings = meetingsForCourse(course);
            const sectionGroups = getSectionGroups(meetings);
            const chosenMeetings = meetings.filter(meeting => {
                const type = meeting.type || 'Meeting';
                const sections = sectionGroups.get(type);
                if (!meeting.section || sections?.size < 2) return true;
                return meeting.section === selectedSection(course, type, sections);
            });
            return chosenMeetings.flatMap(meeting => {
                const interval = timeToMinutes(meeting.time);
                if (!interval) return [];
                return normalizedDays(meeting.days).map(day => ({
                    ...meeting,
                    ...interval,
                    type: meeting.type || 'Meeting',
                    course,
                    courseCode: course.courseId,
                    day
                }));
            });
        });
    }

    function focusConflict(index) {
        if (!currentConflicts.length) return;
        const normalized = ((index % currentConflicts.length) + currentConflicts.length) % currentConflicts.length;
        focusedConflictIndex = normalized;
        const conflict = currentConflicts[normalized];

        document.querySelectorAll('.timetable-event.is-conflict-focus, .section-choice-group.is-conflict-focus')
            .forEach(element => element.classList.remove('is-conflict-focus'));

        const eventNodes = [conflict.first, conflict.second]
            .map(event => timetableEventNodes.get(event))
            .filter(Boolean);
        eventNodes.forEach(node => node.classList.add('is-conflict-focus'));

        const sectionSelects = [];
        [conflict.first, conflict.second].forEach(event => {
            const group = [...document.querySelectorAll('.section-choice-group')].find(fieldset =>
                fieldset.dataset.courseCode === event.courseCode &&
                fieldset.dataset.sectionType === event.type
            );
            if (!group) return;
            group.classList.add('is-conflict-focus');
            const select = group.querySelector('select');
            if (select) sectionSelects.push(select);
        });

        const collision = copy().collision(conflict.day[language()], conflict.first, conflict.second);
        if (elements.conflictFocusStatus) elements.conflictFocusStatus.textContent = copy().conflictFocused(collision);
        if (eventNodes[0]) {
            eventNodes[0].scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        }
        if (sectionSelects[0]) sectionSelects[0].focus({ preventScroll: true });
        else elements.timetable.focus({ preventScroll: true });
    }

    function appendStatus(selected, events, conflicts, allSelected = selected) {
        elements.status.replaceChildren();
        const status = document.createElement('div');
        status.className = 'schedule-status-card';
        const title = document.createElement('strong');
        const detail = document.createElement('p');
        const lang = copy();

        if (!selected.length) {
            status.classList.add('is-empty');
            if (allSelected.length) {
                title.textContent = lang.noPlanned;
                detail.textContent = lang.noPlannedDetail;
                status.append(title, detail);
            } else {
                title.textContent = lang.choose;
                status.appendChild(title);
            }
        } else if (!events.length) {
            status.classList.add('is-empty');
            title.textContent = lang.noSchedule;
            status.appendChild(title);
        } else if (conflicts.length) {
            status.classList.add('has-conflicts');
            const retakeConflict = retakeCourseId && conflicts.some(conflict =>
                conflict.first.course.courseId === retakeCourseId ||
                conflict.second.course.courseId === retakeCourseId
            );
            title.textContent = retakeConflict ? lang.retakeConflict : lang.conflict;
            detail.textContent = lang.conflictCount(conflicts.length);
            status.append(title, detail);
            const hint = document.createElement('p');
            hint.className = 'conflict-focus-hint';
            hint.textContent = lang.conflictFocusHint;
            status.appendChild(hint);
            const list = document.createElement('ul');
            conflicts.forEach((conflict, index) => {
                const item = document.createElement('li');
                const text = lang.collision(conflict.day[language()], conflict.first, conflict.second);
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'conflict-link';
                button.textContent = text;
                button.setAttribute('aria-label', lang.focusConflictLabel(text));
                button.addEventListener('click', () => focusConflict(index));
                item.appendChild(button);
                list.appendChild(item);
            });
            status.appendChild(list);
            if (conflicts.length > 1) {
                const next = document.createElement('button');
                next.type = 'button';
                next.className = 'btn-secondary conflict-next';
                next.textContent = lang.nextConflict;
                next.addEventListener('click', () => focusConflict(focusedConflictIndex + 1));
                status.appendChild(next);
            }
        } else {
            status.classList.add('is-clear');
            title.textContent = lang.clear;
            detail.textContent = selected.length === 1 ? lang.oneCourse : lang.clearDetail;
            status.append(title, detail);
        }
        elements.status.appendChild(status);
    }

    function assignLanes(events) {
        const sorted = [...events].sort((a, b) => a.start - b.start || a.end - b.end);
        let cluster = [];
        let clusterEnd = -Infinity;

        function flushCluster() {
            if (!cluster.length) return;
            const laneEnds = [];
            cluster.forEach(event => {
                let lane = laneEnds.findIndex(end => end <= event.start);
                if (lane === -1) lane = laneEnds.length;
                laneEnds[lane] = event.end;
                event.lane = lane;
            });
            const laneCount = Math.max(laneEnds.length, 1);
            cluster.forEach(event => {
                event.laneCount = laneCount;
            });
            cluster = [];
        }

        sorted.forEach(event => {
            if (!cluster.length || event.start < clusterEnd) {
                cluster.push(event);
                clusterEnd = Math.max(clusterEnd, event.end);
                return;
            }
            flushCluster();
            cluster = [event];
            clusterEnd = event.end;
        });
        flushCluster();
    }

    function renderTimetable(events, conflicts, selected, allSelected = selected) {
        elements.timetable.replaceChildren();
        timetableEventNodes.clear();
        if (!events.length) {
            const empty = document.createElement('p');
            empty.className = 'timetable-empty';
            empty.textContent = selected.length
                ? copy().noSchedule
                : (allSelected.length ? copy().noPlanned : copy().choose);
            elements.timetable.appendChild(empty);
            return;
        }

        const grid = document.createElement('div');
        grid.className = 'timetable-grid';
        grid.setAttribute('role', 'group');
        grid.setAttribute('aria-label', language() === 'zh' ? '每週示範課程時間表' : 'Weekly sample course timetable');

        const corner = document.createElement('div');
        corner.className = 'timetable-corner';
        corner.textContent = copy().time;
        grid.appendChild(corner);

        days.forEach(day => {
            const header = document.createElement('div');
            header.className = 'timetable-day-header';
            const heading = document.createElement('h4');
            heading.id = `timetable-day-${day.key}`;
            heading.textContent = day[language()];
            header.appendChild(heading);
            grid.appendChild(header);
        });

        const timeAxis = document.createElement('div');
        timeAxis.className = 'timetable-time-axis';
        timeAxis.setAttribute('aria-hidden', 'true');
        for (let hour = 8; hour < 23; hour += 1) {
            const slot = document.createElement('div');
            slot.className = 'timetable-time-slot';
            slot.textContent = `${String(hour).padStart(2, '0')}:00`;
            timeAxis.appendChild(slot);
        }
        grid.appendChild(timeAxis);

        days.forEach(day => {
            const dayColumn = document.createElement('section');
            dayColumn.className = 'timetable-day-column';
            dayColumn.setAttribute('aria-labelledby', `timetable-day-${day.key}`);

            const hourSlots = document.createElement('div');
            hourSlots.className = 'timetable-hour-slots';
            hourSlots.setAttribute('aria-hidden', 'true');
            for (let hour = 0; hour < 15; hour += 1) {
                const slot = document.createElement('div');
                slot.className = 'timetable-hour-slot';
                hourSlots.appendChild(slot);
            }

            const eventLayer = document.createElement('div');
            eventLayer.className = 'timetable-events';
            const dayEvents = events.filter(event => event.day === day.key);
            assignLanes(dayEvents);
            dayEvents.forEach(event => {
                const article = document.createElement('a');
                article.href = poolResolver.courseInfoHref(event.course.courseId);
                const hasConflict = conflicts.some(conflict =>
                    (conflict.first === event || conflict.second === event)
                );
                const isShort = event.end - event.start <= 60;
                article.className = `timetable-event${hasConflict ? ' timetable-event-conflict' : ''}${isShort ? ' timetable-event-short' : ''}`;
                const start = ((event.start - 8 * 60) / (15 * 60)) * 100;
                const height = ((event.end - event.start) / (15 * 60)) * 100;
                article.style.setProperty('--event-top', `${start}%`);
                article.style.setProperty('--event-height', `${height}%`);
                article.style.setProperty('--event-left', `${(event.lane / event.laneCount) * 100}%`);
                article.style.setProperty('--event-width', `${100 / event.laneCount}%`);
                const title = `${event.course.courseId} ${event.type} ${event.time} ${event.location}`;
                article.setAttribute('aria-label', title);
                article.title = title;
                const code = document.createElement('strong');
                code.textContent = event.course.courseId;
                const detail = document.createElement('span');
                detail.className = 'timetable-event-detail';
                detail.textContent = isShort
                    ? event.time
                    : copy().timeSlot(event.type, event.time, event.location);
                article.append(code, detail);
                timetableEventNodes.set(event, article);
                eventLayer.appendChild(article);
            });
            dayColumn.append(hourSlots, eventLayer);
            grid.appendChild(dayColumn);
        });
        elements.timetable.appendChild(grid);
    }

    function appendCell(row, value, isHeader = false) {
        const cell = document.createElement(isHeader ? 'th' : 'td');
        if (isHeader) cell.scope = 'col';
        cell.textContent = value;
        row.appendChild(cell);
    }

    function renderComparison(selected) {
        elements.comparison.replaceChildren();
        if (!selected.length) {
            const empty = document.createElement('p');
            empty.className = 'comparison-empty';
            empty.textContent = copy().emptyComparison;
            elements.comparison.appendChild(empty);
            return;
        }

        const table = document.createElement('table');
        table.className = 'comparison-table';
        const head = document.createElement('thead');
        const headerRow = document.createElement('tr');
        appendCell(headerRow, copy().courseName, true);
        selected.forEach(course => {
            const heading = document.createElement('th');
            heading.scope = 'col';
            heading.append(
                document.createTextNode(`${course.courseId} · ${courseTitle(course)} `),
                createCourseInfoLink(course.courseId, courseTitle(course))
            );
            headerRow.appendChild(heading);
        });
        head.appendChild(headerRow);
        table.appendChild(head);

        const body = document.createElement('tbody');
        const statusRow = document.createElement('tr');
        const statusHeading = document.createElement('th');
        statusHeading.scope = 'row';
        statusHeading.textContent = copy().plannerStatusRow;
        statusRow.appendChild(statusHeading);
        selected.forEach(course => {
            const cell = document.createElement('td');
            cell.appendChild(createPlannerStatusChip(course.courseId));
            statusRow.appendChild(cell);
        });
        body.appendChild(statusRow);

        const sourceRow = document.createElement('tr');
        const sourceHeading = document.createElement('th');
        sourceHeading.scope = 'row';
        sourceHeading.textContent = copy().sourceRow;
        sourceRow.appendChild(sourceHeading);
        selected.forEach(course => {
            const cell = document.createElement('td');
            cell.appendChild(createProvenanceChip(course));
            sourceRow.appendChild(cell);
        });
        body.appendChild(sourceRow);

        const rows = [
            { label: copy().studyHours, title: copy().generatedMetricNote, value: course => course.comparator?.expectedStudyHoursPerWeek == null ? copy().noSharedValue : `${course.comparator.expectedStudyHoursPerWeek} h` },
            { label: copy().assessment, title: copy().generatedMetricNote, value: course => copy().assessmentLabel[course.comparator?.assessmentLoad] || course.comparator?.assessmentLoad || copy().noSharedValue },
            { label: copy().difficulty, title: copy().generatedMetricNote, value: course => course.comparator?.difficulty == null ? copy().noSharedValue : `${course.comparator.difficulty}/5` },
            { label: copy().workload, title: copy().generatedMetricNote, value: course => workloadScore(course) ?? copy().noSharedValue },
            {
                label: copy().grading,
                title: copy().sourceMetricNote,
                render: (cell, course) => {
                    cell.classList.add('comparison-grading-cell');
                    const components = course.gradingComponents || course.comparator?.gradingComponents;
                    cell.appendChild(window.EE4213GradingChart.create(components, {
                        labels: copy().gradingLabels,
                        language: language(),
                        compact: true,
                        noData: copy().noSharedValue
                    }));
                }
            },
            { label: copy().sampleWorkload, title: copy().generatedMetricNote, value: course => course.sampleWorkload ?? copy().noSharedValue },
            { label: copy().sampleGpa, title: copy().generatedMetricNote, value: course => course.sampleGpa ?? course.sampleMeanGpa ?? copy().noSharedValue }
        ];
        rows.forEach(metric => {
            const row = document.createElement('tr');
            const heading = document.createElement('th');
            heading.scope = 'row';
            heading.textContent = metric.label;
            if (metric.title) heading.title = metric.title;
            row.appendChild(heading);
            selected.forEach(course => {
                if (metric.render) {
                    const cell = document.createElement('td');
                    metric.render(cell, course);
                    row.appendChild(cell);
                    return;
                }
                appendCell(row, String(metric.value(course)));
            });
            body.appendChild(row);
        });
        table.appendChild(body);
        elements.comparison.appendChild(table);
        if (selected.length === 1) {
            const note = document.createElement('p');
            note.className = 'comparison-note';
            note.textContent = copy().singleCompareNote;
            elements.comparison.appendChild(note);
        }
    }

    function updateComparisonSummary(selected, scheduled, conflicts) {
        if (!elements.summary) return;
        elements.summarySelected.textContent = String(selected.length);
        elements.summaryPlanned.textContent = String(scheduled.length);
        elements.summaryConflicts.textContent = String(conflicts.length);
        elements.summary.classList.toggle('has-conflicts', conflicts.length > 0);
        elements.summary.classList.toggle('is-clear', selected.length > 0 && scheduled.length > 0 && conflicts.length === 0);
        elements.summary.classList.toggle('is-empty', selected.length === 0);
        if (elements.tabConflictCount) {
            elements.tabConflictCount.textContent = String(conflicts.length);
            elements.tabConflictCount.hidden = conflicts.length === 0;
        }
    }

    function renderResults(refreshSectionChoices = true) {
        const selected = getSortedSelectedCourses();
        const scheduled = selected.filter(course => plannerStatusFor(course.courseId) === 'planned');
        if (refreshSectionChoices) renderSectionChoices(scheduled);
        const events = allEvents(scheduled);
        const conflicts = timetable.findConflicts(events).map(conflict => ({
            ...conflict,
            day: days.find(day => day.key === conflict.day)
        }));
        currentConflicts = conflicts;
        focusedConflictIndex = -1;
        if (elements.conflictFocusStatus) elements.conflictFocusStatus.textContent = '';
        updateComparisonSummary(selected, scheduled, conflicts);
        appendStatus(scheduled, events, conflicts, selected);
        renderTimetable(events, conflicts, scheduled, selected);
        renderComparison(selected);
    }

    function render() {
        setSelectLanguage();
        renderCourseList();
        renderResults();
    }

    elements.viewTabs.forEach((tab, index) => {
        tab.addEventListener('click', () => setActiveView(tab.dataset.comparatorView));
        tab.addEventListener('keydown', event => {
            const last = elements.viewTabs.length - 1;
            let nextIndex = null;
            if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = index === last ? 0 : index + 1;
            else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = index === 0 ? last : index - 1;
            else if (event.key === 'Home') nextIndex = 0;
            else if (event.key === 'End') nextIndex = last;
            if (nextIndex === null) return;
            event.preventDefault();
            setActiveView(elements.viewTabs[nextIndex].dataset.comparatorView, true);
        });
    });

    elements.addCourses.addEventListener('click', addCourses);
    elements.courseCodes.addEventListener('keydown', event => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') addCourses();
    });
    elements.courseSearch.addEventListener('input', () => {
        courseSearchQuery = elements.courseSearch.value.trim();
        renderCourseList();
    });
    elements.courseSearch.addEventListener('keydown', event => {
        if (event.key !== 'Escape' || !courseSearchQuery) return;
        event.preventDefault();
        elements.courseSearch.value = '';
        courseSearchQuery = '';
        renderCourseList();
    });
    elements.clearSearch.addEventListener('click', () => {
        elements.courseSearch.value = '';
        courseSearchQuery = '';
        renderCourseList();
        elements.courseSearch.focus();
    });
    function clearSelection() {
        lastClearedState = serializeComparatorState();
        selectedCodes = [];
        importedPlanCodes.clear();
        manualCourseCodes.clear();
        retainedEntryCodes.clear();
        dismissedCourseCodes.clear();
        plannerStatuses.clear();
        plannerReasons.clear();
        sectionSelections.clear();
        retakeCourseId = '';
        retakeSection = 'L01';
        render();
        saveComparatorState();
        if (elements.undo) elements.undo.hidden = false;
        setInputMessage(copy().cleared);
    }

    function undoClear() {
        if (!lastClearedState) return;
        applyComparatorState(lastClearedState);
        lastClearedState = null;
        if (elements.undo) elements.undo.hidden = true;
        render();
        saveComparatorState();
        setInputMessage(copy().restored);
        elements.reset.focus();
    }

    elements.reset.addEventListener('click', clearSelection);
    elements.undo.addEventListener('click', undoClear);
    elements.sort.addEventListener('change', () => {
        sortKey = elements.sort.value;
        dismissUndo();
        saveComparatorState();
        renderResults();
    });
    window.addEventListener('storage', event => {
        if (event.key !== progressStorageKey) return;
        applyAuditProgress(readAuditProgress());
    });
    window.addEventListener('pageshow', event => {
        if (!event.persisted) return;
        applyAuditProgress(readAuditProgress());
    });
    document.addEventListener('portal:languagechange', () => {
        const notice = getPlannerImportNotice();
        setInputMessage(notice.text, notice.isError);
        render();
    });

    function applyCourseInfoAdd() {
        const params = new URLSearchParams(location.search);
        const raw = params.get('add');
        if (!raw) return;
        params.delete('add');
        try {
            const query = params.toString();
            history.replaceState(null, '', location.pathname + (query ? `?${query}` : '') + location.hash);
        } catch (error) {
            console.warn('Unable to clean the Course Comparator add parameter.', error);
        }
        const code = raw.trim().toUpperCase();
        if (!courseByCode.has(code)) {
            courseInfoAddNotice = copy().addFromCourseInfoNotFound(code);
            courseInfoAddError = true;
            return;
        }
        if (!selectedCodes.includes(code)) selectedCodes.push(code);
        retainedEntryCodes.delete(code);
        dismissedCourseCodes.delete(code);
        if (!getCourseAvailability(courseByCode.get(code)).allowed) manualCourseCodes.add(code);
        saveComparatorState();
        courseInfoAddNotice = copy().addedFromCourseInfo(code);
        courseInfoAddError = false;
    }

    function getPlannerImportNotice() {
        if (plannerTransfer.error) {
            return { text: copy().plannerTransferError, isError: true };
        }
        if (!plannerTransfer.courseIds.length && !retakeCourseId && !plannerTransfer.excluded.length) {
            return { text: '', isError: false };
        }
        const missing = plannerTransfer.courseIds.filter(code => !courseByCode.has(code));
        const importedIds = [...importedPlanCodes].filter(code => code !== retakeCourseId);
        const plannedCount = importedIds.filter(code => plannerStatusFor(code) === 'planned').length;
        const parts = [];
        if (importedIds.length) parts.push(copy().importedPlanSummary(importedIds.length, plannedCount));
        if (importedIds.length > plannedCount) parts.push(copy().plannerTimetableNote);
        if (retakeCourseId) parts.push(copy().importedRetake(retakeCourseId, retakeSection));
        if (plannerTransfer.excluded.length) parts.push(copy().excludedPlannerItems(plannerTransfer.excluded.length));
        if (missing.length) parts.push(copy().missingPlannerCourses(missing));
        return { text: parts.join(' '), isError: missing.length > 0 };
    }

    applyCourseInfoAdd();
    render();
    const plannerImportNotice = getPlannerImportNotice();
    const initialMessage = [courseInfoAddNotice, plannerImportNotice.text].filter(Boolean).join(' ');
    setInputMessage(initialMessage, courseInfoAddError || plannerImportNotice.isError);
})();
