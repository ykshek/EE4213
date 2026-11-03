/**
 * Degree Audit & Recovery Simulator v6 - Integrated Portal Module
 */

(function () {
    // Default profile state fallback (if navbar/global state is omitted)
    const defaultStudentProfile = {
        major: "CDE",
        degreeRoute: 120,
        year: 2,
        failedCourse: "EE1001"
    };

    // Common GE Courses
    const commonGeCourses = [
        { code: "GE1401", name: "University English", cu: 3, defaultSem: "GE", isGe: true, day: "Mon", slot: "09:00" },
        { code: "GE2410", name: "English for Engineering", cu: 3, defaultSem: "GE", isGe: true, day: "Wed", slot: "09:00" },
        { code: "GE1501", name: "Chinese Civilisation", cu: 3, defaultSem: "GE", isGe: true, day: "Fri", slot: "12:00" },
        { code: "GE_AREA1", name: "GE Area 1 - Arts & Humanities", cu: 3, defaultSem: "GE", isGe: true, day: "Tue", slot: "15:00" },
        { code: "GE_AREA2", name: "GE Area 2 - Study of Societies", cu: 3, defaultSem: "GE", isGe: true, day: "Thu", slot: "12:00" },
        { code: "GE_AREA3", name: "GE Area 3 - Science & Technology", cu: 3, defaultSem: "GE", isGe: true, day: "Mon", slot: "15:00" },
        { code: "GE_RANDOM", name: "GE Area (Distributional)", cu: 3, defaultSem: "GE", isGe: true, day: "Wed", slot: "15:00" }
    ];

    // Common Technical Electives
    const commonTechElectives = [
        { code: "TE_ELEC1", name: "Technical Elective 1", cu: 3, defaultSem: "4A", isTe: true, day: "Mon", slot: "18:00" },
        { code: "TE_ELEC2", name: "Technical Elective 2", cu: 3, defaultSem: "4A", isTe: true, day: "Tue", slot: "18:00" },
        { code: "TE_ELEC3", name: "Technical Elective 3", cu: 3, defaultSem: "4A", isTe: true, day: "Wed", slot: "18:00" },
        { code: "TE_ELEC4", name: "Technical Elective 4", cu: 3, defaultSem: "4B", isTe: true, day: "Thu", slot: "18:00" },
        { code: "TE_ELEC5", name: "Technical Elective 5", cu: 3, defaultSem: "4B", isTe: true, day: "Fri", slot: "18:00" }
    ];

    const semOrderMap = {
        "GE": 0, "1A": 1, "1B": 2, "2A": 3, "2B": 4, "3A": 5, "3B": 6, "4A": 7, "4B": 8
    };

    const curriculumData = {
        CDE: {
            name: "Computer and Data Engineering",
            courses: [
                ...commonGeCourses,
                { code: "MA1200", name: "Calculus I", cu: 3, defaultSem: "1A", day: "Mon", slot: "09:00" },
                { code: "MA1201", name: "Calculus II", cu: 3, defaultSem: "1B", day: "Wed", slot: "09:00", prereq: "MA1200" },
                { code: "GE1354", name: "Intro to Electronic Design", cu: 3, defaultSem: "1A", day: "Fri", slot: "09:00" },
                { code: "CS1302", name: "Intro to Computer Programming", cu: 3, defaultSem: "1A", day: "Thu", slot: "09:00" },
                { code: "EE1001", name: "Foundations of Digital Tech", cu: 3, defaultSem: "1A", day: "Mon", slot: "12:00" },
                { code: "EE1002", name: "Principles of Electrical Eng", cu: 3, defaultSem: "1A", day: "Tue", slot: "12:00" },
                { code: "EE1004", name: "Foundations of Info Systems", cu: 3, defaultSem: "1A", day: "Wed", slot: "12:00" },
                { code: "PHY1101", name: "Intro Classical Mechanics", cu: 3, defaultSem: "1B", day: "Fri", slot: "12:00" },
                { code: "MA2001", name: "Multi-variable Calculus", cu: 3, defaultSem: "2A", day: "Mon", slot: "09:00", prereq: "MA1201" },
                { code: "EE3001", name: "Foundations of Data Eng", cu: 3, defaultSem: "2A", day: "Tue", slot: "09:00", prereq: "EE1004", blocks: "EE3211", downstream: "EE4146" },
                { code: "CS2311", name: "Computer Programming", cu: 3, defaultSem: "2A", day: "Wed", slot: "09:00", prereq: "CS1302", blocks: "EE2331", downstream: "CS3103" },
                { code: "EE2000", name: "Logic Circuit Design", cu: 3, defaultSem: "2A", day: "Mon", slot: "12:00", prereq: "EE1001", blocks: "EE2004", downstream: "EE3220" },
                { code: "EE2005", name: "Electronic Devices & Circuits", cu: 3, defaultSem: "2A", day: "Thu", slot: "09:00", prereq: "EE1002" },
                { code: "EE3211", name: "Modelling Techniques", cu: 3, defaultSem: "2B", day: "Fri", slot: "09:00", prereq: "EE3001" },
                { code: "EE2331", name: "Data Structures & Algorithms", cu: 3, defaultSem: "2B", day: "Tue", slot: "12:00", prereq: "CS2311" },
                { code: "EE2004", name: "Microcomputer Systems", cu: 3, defaultSem: "2B", day: "Thu", slot: "12:00", prereq: "EE2000" },
                { code: "EE3009", name: "Data Comms & Networking", cu: 3, defaultSem: "2B", day: "Thu", slot: "09:00" },
                { code: "EE3210", name: "Signals and Systems", cu: 3, defaultSem: "3A", day: "Tue", slot: "09:00", prereq: "MA2001" },
                { code: "EE3206", name: "Java Programming & Apps", cu: 3, defaultSem: "3A", day: "Wed", slot: "12:00" },
                { code: "CS3103", name: "Operating Systems", cu: 3, defaultSem: "3A", day: "Fri", slot: "12:00", prereq: "EE2004" },
                { code: "EE3070", name: "Design Project", cu: 3, defaultSem: "3A", day: "Mon", slot: "09:00" },
                { code: "EE3315", name: "Internet Technology", cu: 3, defaultSem: "3A", day: "Mon", slot: "12:00", prereq: "EE3009" },
                { code: "EE4090", name: "Engineering Training", cu: 0, defaultSem: "3A", hasNoSlot: true },
                { code: "EE4146", name: "Data Eng & Learning Systems", cu: 3, defaultSem: "3B", day: "Wed", slot: "09:00", prereq: "EE3211" },
                { code: "CS3402", name: "Database Systems", cu: 3, defaultSem: "3B", day: "Tue", slot: "12:00" },
                { code: "EE3220", name: "System-On-Chip Design", cu: 3, defaultSem: "3B", day: "Fri", slot: "09:00", prereq: "EE2004" },
                { code: "EE4080 A", name: "Final Year Project (Part A)", cu: 3, defaultSem: "4A", hasNoSlot: true },
                { code: "EE4080 B", name: "Final Year Project (Part B)", cu: 3, defaultSem: "4B", hasNoSlot: true, prereq: "EE4080 A" },
                { code: "EE2066", name: "Engineers in Society", cu: 3, defaultSem: "4A", day: "Thu", slot: "15:00" },
                ...commonTechElectives
            ]
        },
        INFE: {
            name: "Information Engineering",
            courses: [
                ...commonGeCourses,
                { code: "MA1200", name: "Calculus I", cu: 3, defaultSem: "1A", day: "Mon", slot: "09:00" },
                { code: "MA1201", name: "Calculus II", cu: 3, defaultSem: "1B", day: "Wed", slot: "09:00", prereq: "MA1200" },
                { code: "PHY1101", name: "Intro Classical Mechanics", cu: 3, defaultSem: "1B", day: "Fri", slot: "12:00" },
                { code: "EE1001", name: "Foundations Digital Tech", cu: 3, defaultSem: "1A", day: "Mon", slot: "12:00" },
                { code: "CS1302", name: "Intro Computer Programming", cu: 3, defaultSem: "1A", day: "Thu", slot: "09:00" },
                { code: "GE1354", name: "Intro Electronic Design", cu: 3, defaultSem: "1A", day: "Fri", slot: "09:00" },
                { code: "EE1004", name: "Foundations Info Systems", cu: 3, defaultSem: "1A", day: "Wed", slot: "12:00" },
                { code: "EE1002", name: "Principles Electrical Eng", cu: 3, defaultSem: "1A", day: "Tue", slot: "12:00" },
                { code: "MA2001", name: "Multi-variable Calculus", cu: 3, defaultSem: "2A", day: "Mon", slot: "09:00", prereq: "MA1201" },
                { code: "EE2302", name: "Foundations Info Eng & Crypto", cu: 3, defaultSem: "2A", day: "Tue", slot: "09:00", prereq: "EE1001", blocks: "EE3301", downstream: "EE3008" },
                { code: "EE3331", name: "Probability Models INFE", cu: 3, defaultSem: "2B", day: "Wed", slot: "09:00" },
                { code: "EE3009", name: "Data Comms & Networking", cu: 3, defaultSem: "2B", day: "Tue", slot: "09:00" },
                { code: "CS2311", name: "Computer Programming", cu: 3, defaultSem: "2A", day: "Mon", slot: "12:00", prereq: "CS1302" },
                { code: "EE2303", name: "Applied AI Systems INFE", cu: 3, defaultSem: "2B", day: "Fri", slot: "09:00" },
                { code: "EE2000", name: "Logic Circuit Design", cu: 3, defaultSem: "2A", day: "Tue", slot: "12:00", prereq: "EE1001" },
                { code: "EE2004", name: "Microcomputer Systems", cu: 3, defaultSem: "2B", day: "Thu", slot: "12:00", prereq: "EE2000" },
                { code: "EE3210", name: "Signals and Systems", cu: 3, defaultSem: "3A", day: "Thu", slot: "09:00", prereq: "MA2001" },
                { code: "EE3301", name: "Quantitative Methods INFE", cu: 3, defaultSem: "3A", day: "Wed", slot: "12:00", prereq: "EE2302" },
                { code: "CS3402", name: "Database Systems", cu: 3, defaultSem: "3B", day: "Fri", slot: "12:00" },
                { code: "EE2331", name: "Data Structures & Algo", cu: 3, defaultSem: "3A", day: "Mon", slot: "09:00", prereq: "CS2311" },
                { code: "EE3070", name: "Design Project", cu: 3, defaultSem: "3A", day: "Thu", slot: "09:00" },
                { code: "EE4090", name: "Engineering Training", cu: 0, defaultSem: "3A", hasNoSlot: true },
                { code: "EE3008", name: "Principles of Comms", cu: 3, defaultSem: "3B", day: "Wed", slot: "09:00", prereq: "EE3301" },
                { code: "EE3315", name: "Internet Technology", cu: 3, defaultSem: "3B", day: "Tue", slot: "12:00", prereq: "EE3009" },
                { code: "EE3206", name: "Object-Oriented Prog", cu: 3, defaultSem: "3B", day: "Fri", slot: "09:00" },
                { code: "CS3103", name: "Operating Systems", cu: 3, defaultSem: "3A", day: "Mon", slot: "12:00", prereq: "EE2004" },
                { code: "EE4080 A", name: "Final Year Project (Part A)", cu: 3, defaultSem: "4A", hasNoSlot: true },
                { code: "EE4080 B", name: "Final Year Project (Part B)", cu: 3, defaultSem: "4B", hasNoSlot: true, prereq: "EE4080 A" },
                { code: "EE2066", name: "Engineers in Society", cu: 3, defaultSem: "4A", day: "Thu", slot: "15:00" },
                ...commonTechElectives
            ]
        },
        ELEL: {
            name: "Electronic and Electrical Engineering",
            courses: [
                ...commonGeCourses,
                { code: "MA1200", name: "Calculus I", cu: 3, defaultSem: "1A", day: "Mon", slot: "09:00" },
                { code: "MA1201", name: "Calculus II", cu: 3, defaultSem: "1B", day: "Wed", slot: "09:00", prereq: "MA1200" },
                { code: "EE1001", name: "Foundations Digital Tech", cu: 3, defaultSem: "1A", day: "Mon", slot: "12:00" },
                { code: "EE1002", name: "Principles Electrical Eng", cu: 3, defaultSem: "1A", day: "Tue", slot: "12:00" },
                { code: "EE1004", name: "Foundations Info Systems", cu: 3, defaultSem: "1A", day: "Wed", slot: "12:00" },
                { code: "GE1354", name: "Intro Electronic Design", cu: 3, defaultSem: "1A", day: "Fri", slot: "09:00" },
                { code: "PHY1101", name: "Intro Classical Mechanics", cu: 3, defaultSem: "1A", day: "Fri", slot: "12:00" },
                { code: "CS1302", name: "Intro Computer Programming", cu: 3, defaultSem: "1A", day: "Thu", slot: "09:00" },
                { code: "MA2001", name: "Multi-variable Calculus", cu: 3, defaultSem: "2A", day: "Mon", slot: "09:00", prereq: "MA1201" },
                { code: "EE2108", name: "Computational Eng Analysis", cu: 3, defaultSem: "2A", day: "Tue", slot: "09:00" },
                { code: "EE3121", name: "Diff Equations for EE", cu: 3, defaultSem: "2B", day: "Wed", slot: "09:00", prereq: "MA2001" },
                { code: "EE3210", name: "Signals and Systems", cu: 3, defaultSem: "2B", day: "Tue", slot: "09:00", prereq: "EE1002" },
                { code: "EE2104", name: "Intro Electromagnetics", cu: 3, defaultSem: "2B", day: "Fri", slot: "09:00", prereq: "MA1201", blocks: "EE3109", downstream: "EE3114" },
                { code: "EE2005", name: "Electronic Devices & Circuits", cu: 3, defaultSem: "2A", day: "Mon", slot: "12:00", prereq: "EE1002" },
                { code: "CS2311", name: "Computer Programming", cu: 3, defaultSem: "2B", day: "Tue", slot: "12:00", prereq: "CS1302" },
                { code: "EE2000", name: "Logic Circuit Design", cu: 3, defaultSem: "2B", day: "Wed", slot: "12:00", prereq: "EE1001" },
                { code: "EE3114", name: "Systems & Control", cu: 3, defaultSem: "3A", day: "Mon", slot: "09:00", prereq: "EE2104" },
                { code: "EE3008", name: "Principles of Comms", cu: 3, defaultSem: "3A", day: "Tue", slot: "12:00" },
                { code: "EE3123", name: "Intro Electric Power Systems", cu: 3, defaultSem: "3A", day: "Wed", slot: "12:00" },
                { code: "EE2004", name: "Microcomputer Systems", cu: 3, defaultSem: "3A", day: "Thu", slot: "12:00", prereq: "EE2000" },
                { code: "EE4090", name: "Engineering Training", cu: 0, defaultSem: "3A", hasNoSlot: true },
                { code: "EE3109", name: "Applied Electromagnetics", cu: 3, defaultSem: "3B", day: "Fri", slot: "12:00", prereq: "EE2104" },
                { code: "EE3124", name: "Electric Machines & Drives", cu: 3, defaultSem: "3B", day: "Mon", slot: "12:00", prereq: "EE3123" },
                { code: "EE3115", name: "Applied Opto-Electronic", cu: 3, defaultSem: "3B", day: "Tue", slot: "09:00" },
                { code: "EE3122", name: "Analogue Circuit Fund", cu: 3, defaultSem: "3B", day: "Wed", slot: "09:00", prereq: "EE2005" },
                { code: "EE3070", name: "Design Project", cu: 3, defaultSem: "3B", day: "Thu", slot: "09:00" },
                { code: "EE4080 A", name: "Final Year Project (Part A)", cu: 3, defaultSem: "4A", hasNoSlot: true },
                { code: "EE4080 B", name: "Final Year Project (Part B)", cu: 3, defaultSem: "4B", hasNoSlot: true, prereq: "EE4080 A" },
                { code: "EE2066", name: "Engineers in Society", cu: 3, defaultSem: "4A", day: "Thu", slot: "15:00" },
                ...commonTechElectives
            ]
        },
        MEE: {
            name: "Microelectronic Engineering",
            courses: [
                ...commonGeCourses,
                { code: "MA1200", name: "Calculus I", cu: 3, defaultSem: "1A", day: "Mon", slot: "09:00" },
                { code: "MA1201", name: "Calculus II", cu: 3, defaultSem: "1B", day: "Wed", slot: "09:00", prereq: "MA1200" },
                { code: "EE1001", name: "Foundations Digital Tech", cu: 3, defaultSem: "1A", day: "Mon", slot: "12:00" },
                { code: "EE1002", name: "Principles Electrical Eng", cu: 3, defaultSem: "1A", day: "Tue", slot: "12:00" },
                { code: "EE1004", name: "Foundations Info Systems", cu: 3, defaultSem: "1A", day: "Wed", slot: "12:00" },
                { code: "GE1354", name: "Intro Electronic Design", cu: 3, defaultSem: "1A", day: "Fri", slot: "09:00" },
                { code: "PHY1101", name: "Intro Classical Mechanics", cu: 3, defaultSem: "1A", day: "Fri", slot: "12:00" },
                { code: "CS1302", name: "Intro Computer Programming", cu: 3, defaultSem: "1A", day: "Thu", slot: "09:00" },
                { code: "MA2001", name: "Multi-variable Calculus", cu: 3, defaultSem: "2A", day: "Mon", slot: "09:00", prereq: "MA1201" },
                { code: "EE2000", name: "Logic Circuit Design", cu: 3, defaultSem: "2A", day: "Tue", slot: "09:00", prereq: "EE1001" },
                { code: "EE2005", name: "Electronic Devices & Circuits", cu: 3, defaultSem: "2A", day: "Wed", slot: "09:00", prereq: "EE1002" },
                { code: "CS2311", name: "Computer Programming", cu: 3, defaultSem: "2B", day: "Thu", slot: "09:00", prereq: "CS1302" },
                { code: "EE2800", name: "Semiconductor Physics", cu: 3, defaultSem: "2B", day: "Fri", slot: "09:00", prereq: "PHY1101", blocks: "EE3800", downstream: "EE3801" },
                { code: "EE3121", name: "Diff Equations for EE", cu: 3, defaultSem: "2B", day: "Mon", slot: "12:00", prereq: "MA2001" },
                { code: "EE3210", name: "Signals and Systems", cu: 3, defaultSem: "2B", day: "Tue", slot: "12:00" },
                { code: "EE2104", name: "Intro Electromagnetics", cu: 3, defaultSem: "2B", day: "Wed", slot: "12:00", prereq: "MA1201" },
                { code: "EE3800", name: "Semiconductor Materials", cu: 3, defaultSem: "3A", day: "Mon", slot: "09:00", prereq: "EE2800" },
                { code: "EE3008", name: "Principles of Comms", cu: 3, defaultSem: "3A", day: "Tue", slot: "09:00" },
                { code: "EE3801", name: "Microsystems & Nanotech", cu: 3, defaultSem: "3A", day: "Wed", slot: "09:00", prereq: "EE3800" },
                { code: "EE2004", name: "Microcomputer Systems", cu: 3, defaultSem: "3A", day: "Thu", slot: "09:00", prereq: "EE2000" },
                { code: "EE4090", name: "Engineering Training", cu: 0, defaultSem: "3A", hasNoSlot: true },
                { code: "EE3115", name: "Applied Opto-Electronic", cu: 3, defaultSem: "3B", day: "Fri", slot: "12:00" },
                { code: "EE3122", name: "Analogue Circuit Fund", cu: 3, defaultSem: "3B", day: "Mon", slot: "12:00", prereq: "EE2005" },
                { code: "EE3220", name: "System-on-Chip Design", cu: 3, defaultSem: "3B", day: "Tue", slot: "12:00", prereq: "EE2004" },
                { code: "EE3070", name: "Design Project", cu: 3, defaultSem: "3B", day: "Wed", slot: "12:00" },
                { code: "EE4080 A", name: "Final Year Project (Part A)", cu: 3, defaultSem: "4A", hasNoSlot: true },
                { code: "EE4080 B", name: "Final Year Project (Part B)", cu: 3, defaultSem: "4B", hasNoSlot: true, prereq: "EE4080 A" },
                { code: "EE2066", name: "Engineers in Society", cu: 3, defaultSem: "4A", day: "Thu", slot: "15:00" },
                ...commonTechElectives
            ]
        }
    };

    let completedCourses = new Set();
    let plannedTerms = { 1: [], 2: [], 3: [] };
    let courseSemMap = {};

    const timeSlots = [
        { time: "09:00 - 11:50", key: "09:00" },
        { time: "12:00 - 14:50", key: "12:00" },
        { time: "15:00 - 17:50", key: "15:00" },
        { time: "18:00 - 20:50", key: "18:00" }
    ];

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];

    // Helper functions to get global student profile values (or fallback if not rendered)
    function getSelectedMajor() {
        return document.getElementById('majorSelect')?.value || window.globalStudentProfile?.major || defaultStudentProfile.major;
    }

    function getSelectedDegreeRoute() {
        const el = document.getElementById('degreeRouteSelect');
        return el ? parseInt(el.value, 10) : (window.globalStudentProfile?.degreeRoute || defaultStudentProfile.degreeRoute);
    }

    function getSelectedYear() {
        const el = document.getElementById('yearSelect');
        return el ? parseInt(el.value, 10) : (window.globalStudentProfile?.year || defaultStudentProfile.year);
    }

    function getSelectedFailedCourse() {
        return document.getElementById('failedCourseSelect')?.value || window.globalStudentProfile?.failedCourse || defaultStudentProfile.failedCourse;
    }

    function getActiveCurriculumData() {
        return curriculumData;
    }

    function initCourseSemMap() {
        const majorKey = getSelectedMajor();
        const major = getActiveCurriculumData()[majorKey] || getActiveCurriculumData()["CDE"];
        courseSemMap = {};
        major.courses.forEach(c => {
            courseSemMap[c.code] = c.defaultSem;
        });
    }

    window.handleGlobalChange = function () {
        const majorKey = getSelectedMajor();
        const major = getActiveCurriculumData()[majorKey] || getActiveCurriculumData()["CDE"];

        initCourseSemMap();

        const failedSelect = document.getElementById('failedCourseSelect');
        if (failedSelect) {
            const currentFailed = failedSelect.value;
            failedSelect.innerHTML = '';
            const failCandidates = major.courses.filter(c => !c.isGe);
            failCandidates.forEach(c => {
                failedSelect.innerHTML += `<option value="${c.code}">${c.code} - ${c.name} (${c.cu} CU)</option>`;
            });

            if (currentFailed && failCandidates.some(c => c.code === currentFailed)) {
                failedSelect.value = currentFailed;
            }
        }

        renderChecklist();
        renderFlowchart();
        renderRoadmapAndAudit();
        renderTimetable();
        renderOverrideTab();
    };

    window.switchTab = function (tabId, btn) {
        document.querySelectorAll('#pageContent[data-page="degree-audit"] .tab-content').forEach(tc => tc.classList.remove('active'));
        document.querySelectorAll('#pageContent[data-page="degree-audit"] .tab-btn').forEach(tb => tb.classList.remove('active'));
        document.getElementById(tabId).classList.add('active');
        btn.classList.add('active');
    };

    function renderChecklist() {
        const majorKey = getSelectedMajor();
        const failedCode = getSelectedFailedCourse();
        const year = getSelectedYear();
        const major = getActiveCurriculumData()[majorKey] || getActiveCurriculumData()["CDE"];

        const container = document.getElementById('completedChecklistContainer');
        if (!container) return;
        container.innerHTML = '';

        major.courses.forEach(c => {
            let defaultChecked = false;
            if (c.isGe && year >= 2) defaultChecked = true;
            else if (!c.isGe && !c.isTe) {
                const semLevel = parseInt(c.defaultSem.charAt(0)) || 1;
                if (semLevel < year) defaultChecked = true;
            }

            if (c.code === failedCode) defaultChecked = false;

            const isChecked = completedCourses.has(c.code) || (completedCourses.size === 0 && defaultChecked);
            if (isChecked) completedCourses.add(c.code);

            container.innerHTML += `
                <div class="course-check-item ${c.isGe ? 'ge-item' : ''}">
                    <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                        <input type="checkbox" value="${c.code}" ${completedCourses.has(c.code) ? 'checked' : ''} onchange="degreeAuditToggleCourse('${c.code}', this.checked)">
                        <span><strong>${c.code}</strong> ${c.name} ${c.isGe ? '(GE Requirement)' : '[' + c.defaultSem + ']'}</span>
                    </label>
                    <span style="font-weight:bold; color:var(--text-muted);">${c.cu} CU</span>
                </div>
            `;
        });

        updatePlannerDropdowns();
    }

    window.degreeAuditToggleCourse = function (code, isChecked) {
        if (isChecked) {
            completedCourses.add(code);
            for (let t in plannedTerms) {
                plannedTerms[t] = plannedTerms[t].filter(c => c !== code);
            }
        } else {
            completedCourses.delete(code);
        }
        renderFlowchart();
        renderRoadmapAndAudit();
    };

    window.resetChecklistToDefault = function () {
        completedCourses.clear();
        renderChecklist();
        renderFlowchart();
        renderRoadmapAndAudit();
    };

    function renderFlowchart() {
        const majorKey = getSelectedMajor();
        const failedCode = getSelectedFailedCourse();
        const major = getActiveCurriculumData()[majorKey] || getActiveCurriculumData()["CDE"];

        const titleEl = document.getElementById('flowchartTitle');
        if (titleEl) {
            titleEl.innerText = `Curriculum Structure Flowchart — ${major.name} (${majorKey})`;
        }

        const container = document.getElementById('flowchartGridContainer');
        if (!container) return;
        container.innerHTML = '';

        const semGroups = ["GE", "1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B"];

        semGroups.forEach(semLabel => {
            const semCourses = major.courses.filter(c => courseSemMap[c.code] === semLabel);

            let semCuTotal = 0;
            semCourses.forEach(c => semCuTotal += c.cu);

            let prereqViolations = [];
            semCourses.forEach(c => {
                if (c.prereq) {
                    const isPrereqCompleted = completedCourses.has(c.prereq);
                    if (!isPrereqCompleted) {
                        const prereqSem = courseSemMap[c.prereq];
                        const currentSemIdx = semOrderMap[semLabel];
                        const prereqSemIdx = semOrderMap[prereqSem];

                        if (prereqSemIdx >= currentSemIdx) {
                            prereqViolations.push(`${c.code} requires ${c.prereq} in an earlier semester`);
                        }
                    }
                }
            });

            const isWarningRow = prereqViolations.length > 0;

            let rowHtml = `
                <div class="sem-row ${isWarningRow ? 'sem-warning-border' : ''}">
                    <div class="sem-label-container">
                        <div class="sem-label">${semLabel === "GE" ? "GE Courses" : "Sem " + semLabel}</div>
                        <div class="sem-cu-counter">${semCuTotal} CU</div>
                    </div>

                    <div class="sem-courses" 
                         ondragover="degreeAuditAllowDrop(event)" 
                         ondragleave="degreeAuditDragLeave(event)" 
                         ondrop="degreeAuditDropCourse(event, '${semLabel}')">
            `;

            if (isWarningRow) {
                rowHtml += `
                    <div class="prereq-warning-banner">
                        ⚠ Prerequisite Violation: ${prereqViolations.join('; ')}
                    </div>
                `;
            }

            semCourses.forEach(c => {
                const isCompleted = completedCourses.has(c.code);
                const isFailed = (c.code === failedCode);

                let boxClass = "flow-box ";
                if (isFailed) {
                    boxClass += "failed-highlight";
                } else if (isCompleted) {
                    boxClass += "completed";
                } else {
                    boxClass += "incomplete";
                }

                rowHtml += `
                    <div class="${boxClass}" 
                         draggable="true" 
                         ondragstart="degreeAuditDragStart(event, '${c.code}')">
                        <div><strong>${c.code}</strong></div>
                        <div style="font-size:0.7rem;">${c.name}</div>
                        <div style="font-size:0.65rem; margin-top:2px; opacity:0.8;">${c.cu} CU</div>
                    </div>
                `;
            });

            rowHtml += `</div></div>`;
            container.innerHTML += rowHtml;
        });
    }

    window.degreeAuditDragStart = function (ev, code) {
        ev.dataTransfer.setData("text/plain", code);
    };

    window.degreeAuditAllowDrop = function (ev) {
        ev.preventDefault();
        ev.currentTarget.classList.add('drag-over');
    };

    window.degreeAuditDragLeave = function (ev) {
        ev.currentTarget.classList.remove('drag-over');
    };

    window.degreeAuditDropCourse = function (ev, targetSem) {
        ev.preventDefault();
        ev.currentTarget.classList.remove('drag-over');
        const code = ev.dataTransfer.getData("text/plain");

        if (code && courseSemMap[code]) {
            courseSemMap[code] = targetSem;
            renderFlowchart();
        }
    };

    window.resetFlowchartLayout = function () {
        initCourseSemMap();
        renderFlowchart();
    };

    function updatePlannerDropdowns() {
        const majorKey = getSelectedMajor();
        const major = getActiveCurriculumData()[majorKey] || getActiveCurriculumData()["CDE"];

        const uncompleted = major.courses.filter(c => !completedCourses.has(c.code));

        for (let t = 1; t <= 3; t++) {
            const select = document.getElementById(`term${t}Select`);
            if (!select) continue;
            select.innerHTML = '';
            uncompleted.forEach(c => {
                let alreadyPlanned = false;
                for (let p in plannedTerms) {
                    if (plannedTerms[p].includes(c.code)) alreadyPlanned = true;
                }
                if (!alreadyPlanned) {
                    select.innerHTML += `<option value="${c.code}">${c.code} - ${c.name} (${c.cu} CU)</option>`;
                }
            });
        }
    }

    window.addCourseToTerm = function (termId) {
        const select = document.getElementById(`term${termId}Select`);
        if (!select) return;
        const code = select.value;
        if (code) {
            plannedTerms[termId].push(code);
            renderRoadmapAndAudit();
        }
    };

    window.removeCourseFromTerm = function (termId, code) {
        plannedTerms[termId] = plannedTerms[termId].filter(c => c !== code);
        renderRoadmapAndAudit();
    };

    function renderRoadmapAndAudit() {
        const majorKey = getSelectedMajor();
        const major = getActiveCurriculumData()[majorKey] || getActiveCurriculumData()["CDE"];
        const targetReq = getSelectedDegreeRoute();
        const currentYear = getSelectedYear();

        let completedCU = 0;
        major.courses.forEach(c => {
            if (completedCourses.has(c.code)) completedCU += c.cu;
        });

        let plannedCU = 0;
        for (let t in plannedTerms) {
            plannedTerms[t].forEach(code => {
                const cObj = major.courses.find(c => c.code === code);
                if (cObj) plannedCU += cObj.cu;
            });
        }

        const totalProjected = completedCU + plannedCU;
        const gap = targetReq - totalProjected;

        const reqEl = document.getElementById('metricDegreeReq');
        const compEl = document.getElementById('metricCompleted');
        const planEl = document.getElementById('metricPlanned');
        const remEl = document.getElementById('metricRemaining');

        if (reqEl) reqEl.innerText = `${targetReq} CU`;
        if (compEl) compEl.innerText = `${completedCU} CU`;
        if (planEl) planEl.innerText = `${plannedCU} CU`;
        if (remEl) remEl.innerText = `${gap > 0 ? gap : 0} CU`;

        const bannerContainer = document.getElementById('deferralStatusBanner');
        if (bannerContainer) {
            if (gap > 0) {
                bannerContainer.innerHTML = `
                    <div class="alert alert-danger">
                        <div>
                            <strong>⚠ WARNING: Graduation Deferral Risk Detected! / 警告：存在延畢風險！</strong>
                            <p style="font-size:0.85rem; margin-top:3px;">
                                You currently have a deficit of <strong>${gap} Credit Units</strong> to satisfy the ${targetReq} CU requirement. 
                                ${currentYear >= 3 ? "As a Year " + currentYear + " student, failing to plan these remaining credits into upcoming terms will force a semester deferral." : "Add remaining required courses to your upcoming terms below."}
                            </p>
                        </div>
                    </div>
                `;
            } else {
                bannerContainer.innerHTML = `
                    <div class="alert alert-success">
                        <div>
                            <strong>✓ Recovery Plan Verified: On-Time Graduation Track / 復修計劃驗證成功：按時畢業進度</strong>
                            <p style="font-size:0.85rem; margin-top:3px;">
                                Total completed and planned credits (${totalProjected} CU) meet the ${targetReq} CU graduation threshold!
                            </p>
                        </div>
                    </div>
                `;
            }
        }

        for (let t = 1; t <= 3; t++) {
            const listEl = document.getElementById(`term${t}List`);
            const cuEl = document.getElementById(`term${t}Cu`);
            if (!listEl || !cuEl) continue;

            listEl.innerHTML = '';
            let termCu = 0;

            plannedTerms[t].forEach(code => {
                const cObj = major.courses.find(c => c.code === code);
                if (cObj) {
                    termCu += cObj.cu;
                    listEl.innerHTML += `
                        <span class="planned-tag">
                            ${cObj.code} (${cObj.cu} CU)
                            <span class="remove-btn" onclick="removeCourseFromTerm(${t}, '${cObj.code}')">×</span>
                        </span>
                    `;
                }
            });
            cuEl.innerText = `${termCu} CU Planned`;
        }

        updatePlannerDropdowns();
        renderVisualizerCheckboxes();
    }

    function renderVisualizerCheckboxes() {
        const majorKey = getSelectedMajor();
        const major = getActiveCurriculumData()[majorKey] || getActiveCurriculumData()["CDE"];
        const failedCode = getSelectedFailedCourse();

        const container = document.getElementById('visualizerCheckboxes');
        if (!container) return;
        container.innerHTML = '';

        let targetCourses = [];
        if (plannedTerms[1] && plannedTerms[1].length > 0) {
            targetCourses = major.courses.filter(c => plannedTerms[1].includes(c.code) && c.code !== failedCode);
        } else {
            targetCourses = major.courses.filter(c => !completedCourses.has(c.code) && c.code !== failedCode && !c.isGe && !c.isTe).slice(0, 4);
        }

        if (targetCourses.length === 0) {
            container.innerHTML = `<p style="font-size:0.8rem; color:var(--text-muted);">No courses selected in Step 2 Planner yet.</p>`;
            renderTimetable();
            return;
        }

        targetCourses.forEach((c) => {
            let slotLabel = c.hasNoSlot ? "[No Fixed Timeslot / FYP]" : `(${c.day} ${c.slot} - 2h50m)`;

            container.innerHTML += `
                <label style="display:flex; align-items:center; gap:8px; font-size:0.85rem;">
                    <input type="checkbox" value="${c.code}" checked onchange="renderTimetable()">
                    <span><strong>${c.code}</strong> ${slotLabel}</span>
                </label>
            `;
        });

        renderTimetable();
    }

    window.renderTimetable = function () {
        const sectionSelect = document.getElementById('sectionSelect');
        if (!sectionSelect) return;
        const section = sectionSelect.value;
        const majorKey = getSelectedMajor();
        const failedCode = getSelectedFailedCourse();
        const major = getActiveCurriculumData()[majorKey] || getActiveCurriculumData()["CDE"];

        let retakeSlot = (section === "L01") ? { day: "Tue", timeKey: "09:00" } : { day: "Thu", timeKey: "15:00" };

        const selectedCodes = Array.from(document.querySelectorAll('#visualizerCheckboxes input:checked')).map(cb => cb.value);
        const activeCourses = major.courses.filter(c => selectedCodes.includes(c.code));

        let isClash = false;
        let clashingCode = "";

        activeCourses.forEach(c => {
            if (!c.hasNoSlot && c.day === retakeSlot.day && c.slot === retakeSlot.timeKey) {
                isClash = true;
                clashingCode = c.code;
            }
        });

        const alertContainer = document.getElementById('clashAlertContainer');
        if (alertContainer) {
            if (isClash) {
                alertContainer.innerHTML = `
                    <div class="alert alert-danger">
                        <div>
                            <strong>⚠ Timetable Clash Detected! / 檢測到上課時間衝突！</strong>
                            <p style="font-size:0.85rem;">Retake course <strong>${failedCode} (${section})</strong> clashes directly with core course <strong>${clashingCode}</strong> on ${retakeSlot.day} 09:00 - 11:50.</p>
                        </div>
                        <button class="btn-action" onclick="document.getElementById('sectionSelect').value='L02'; renderTimetable();">⚡ Auto-Resolve Clash</button>
                    </div>
                `;
            } else {
                alertContainer.innerHTML = `
                    <div class="alert alert-success">
                        <div>
                            <strong>✓ Conflict-Free Schedule Confirmed / 時間表無衝突確認</strong>
                            <p style="font-size:0.85rem;">Retake slot (${retakeSlot.day} ${retakeSlot.timeKey === "09:00" ? "09:00 - 11:50" : "15:00 - 17:50"}) fits perfectly without overlapping required major courses.</p>
                        </div>
                    </div>
                `;
            }
        }

        const tbody = document.getElementById('timetableBody');
        if (!tbody) return;
        tbody.innerHTML = '';

        timeSlots.forEach(ts => {
            let row = `<tr><td><strong>${ts.time}</strong></td>`;
            days.forEach(d => {
                let content = "";
                let cellClass = "";

                if (d === retakeSlot.day && ts.key === retakeSlot.timeKey) {
                    content += `<div>[RETAKE] ${failedCode}</div>`;
                    cellClass = "slot-active";
                }

                activeCourses.forEach(c => {
                    if (!c.hasNoSlot && c.day === d && c.slot === ts.key) {
                        if (content !== "") {
                            content += `<div>[CORE] ${c.code}</div>`;
                            cellClass = "slot-clash";
                        } else {
                            content = `<div>[CORE] ${c.code}</div>`;
                            cellClass = "slot-active";
                        }
                    }
                });

                row += `<td class="${cellClass}">${content}</td>`;
            });
            row += `</tr>`;
            tbody.innerHTML += row;
        });
    };

    window.renderOverrideTab = function () {
        const majorKey = getSelectedMajor();
        const failedCode = getSelectedFailedCourse();
        const major = getActiveCurriculumData()[majorKey] || getActiveCurriculumData()["CDE"];
        const failedObj = major.courses.find(c => c.code === failedCode) || major.courses[0];

        const chainContainer = document.getElementById('prereqChainContainer');
        if (chainContainer) {
            chainContainer.innerHTML = `
                <div class="chain-node failed">${failedObj.code} (Failed)</div>
                <div>➔ [Prerequisite Lock] ➔</div>
                <div class="chain-node">${failedObj.blocks || "Downstream Core"} (Blocked)</div>
                <div>➔</div>
                <div class="chain-node">${failedObj.downstream || "Elective Path"}</div>
            `;
        }

        const chkGpa = document.getElementById('chkGpa');
        const gpaOk = chkGpa ? chkGpa.checked : true;
        const banner = document.getElementById('overrideEligibilityBanner');
        if (banner) {
            if (gpaOk) {
                banner.innerHTML = `
                    <div class="alert alert-success" style="margin-top:10px;">
                        <strong>✓ ELIGIBLE FOR CONCURRENT OVERRIDE WAIVER / 符合同步修讀豁免資格</strong><br>
                        <span style="font-size:0.85rem">You satisfy EE department criteria to request concurrent waiver for <strong>${failedObj.blocks || 'blocked core course'}</strong>.</span>
                    </div>
                `;
            } else {
                banner.innerHTML = `
                    <div class="alert alert-danger" style="margin-top:10px;">
                        <strong>⚠ OVERRIDE INELIGIBLE / 不符合豁免條件</strong><br>
                        <span style="font-size:0.85rem">A minimum GPA of 1.70 is required to apply for prerequisite overrides.</span>
                    </div>
                `;
            }
        }
    };

    window.downloadForm = function () {
        const majorKey = getSelectedMajor();
        const failedCode = getSelectedFailedCourse();
        alert(`CITY UNIVERSITY OF HONG KONG\nDepartment of Electrical Engineering\n\nPrerequisite Override Request Form\n------------------------------------\nMajor: ${majorKey}\nFailed Prerequisite: ${failedCode}\nStatus: Verified via Recovery Simulator v6\n\n[Pre-filled application exported successfully]`);
    };

    // Auto-init on page mount inside portal
    document.addEventListener("DOMContentLoaded", function () {
        if (document.getElementById('pageContent')?.getAttribute('data-page') === 'degree-audit') {
            handleGlobalChange();
        }
    });

    if (document.readyState === "interactive" || document.readyState === "complete") {
        if (document.getElementById('pageContent')?.getAttribute('data-page') === 'degree-audit') {
            handleGlobalChange();
        }
    }
})();