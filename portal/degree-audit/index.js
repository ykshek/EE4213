/**
 * Degree Audit & Recovery Simulator v6 - Integrated Portal Module
 */

(function () {
    const defaultFailedCourse = 'EE1001';
    const semesters = ['GE', '1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B'];
    const curriculumData = Object.fromEntries(window.EE4213Data.majors.map(major => [
        major.majorId,
        {
            name: major.name.en,
            courses: major.curriculum.map(course => ({
                code: course.courseId,
                name: course.curriculumTitle,
                cu: course.creditUnits,
                defaultSem: course.semester,
                day: course.day,
                slot: course.timeSlot,
                prereq: course.prerequisiteCourseIds?.[0],
                blocks: course.blocksCourseId,
                downstream: course.downstreamCourseId,
                hasNoSlot: course.hasNoTimetableSlot,
                isGe: course.isGeneralEducation,
                isTe: course.isTechnicalElective
            }))
        }
    ]));

    const completedCourses = new Set();
    const plannedTerms = { 1: [], 2: [], 3: [] };
    let activeMajor;
    let courseSemMap = {};

    const timeSlots = [
        { time: "09:00 - 11:50", key: "09:00" },
        { time: "12:00 - 14:50", key: "12:00" },
        { time: "15:00 - 17:50", key: "15:00" },
        { time: "18:00 - 20:50", key: "18:00" }
    ];

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];

    function getSelectedMajor() {
        return document.getElementById('majorSelect').value;
    }

    function getSelectedDegreeRoute() {
        return Number(document.getElementById('degreeRouteSelect').value);
    }

    function getSelectedYear() {
        return Number(document.getElementById('yearSelect').value);
    }

    function getSelectedFailedCourse() {
        return document.getElementById('failedCourseSelect').value;
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
        document.getElementById('flowchartCourse').replaceChildren(...major.courses.map(c =>
            new Option(`${c.code} - ${c.name}`, c.code)));
        document.getElementById('flowchartMoveStatus').textContent = '';
    }

    window.handleGlobalChange = function () {
        const majorKey = getSelectedMajor();
        const major = curriculumData[majorKey];
        const initializing = activeMajor === undefined;

        if (activeMajor !== majorKey) {
            activeMajor = majorKey;
            initCourseSemMap();
            const failedSelect = document.getElementById('failedCourseSelect');
            const currentFailed = failedSelect.value;
            const failCandidates = major.courses.filter(c => !c.isGe);
            failedSelect.replaceChildren(...failCandidates.map(c =>
                new Option(`${c.code} - ${c.name} (${c.cu} CU)`, c.code)));
            failedSelect.value = failCandidates.some(c => c.code === currentFailed) ? currentFailed : defaultFailedCourse;
        }

        if (initializing) {
            resetChecklistToDefault();
            return;
        }
        completedCourses.delete(getSelectedFailedCourse());
        renderChecklist();
        renderFlowchart();
        renderRoadmapAndAudit();
    };

    window.switchTab = function (tabId, btn) {
        document.querySelectorAll('#pageContent[data-page="degree-audit"] .tab-content').forEach(tc => tc.classList.remove('active'));
        document.querySelectorAll('#pageContent[data-page="degree-audit"] .tab-btn').forEach(tab => {
            tab.classList.toggle('active', tab === btn);
            tab.setAttribute('aria-pressed', String(tab === btn));
        });
        document.getElementById(tabId).classList.add('active');
    };

    function renderChecklist() {
        const majorKey = getSelectedMajor();
        const failedCode = getSelectedFailedCourse();
        const major = getActiveCurriculumData()[majorKey] || getActiveCurriculumData()["CDE"];

        const container = document.getElementById('completedChecklistContainer');
        if (!container) return;
        container.innerHTML = '';

        major.courses.forEach(c => {
            container.innerHTML += `
                <div class="course-check-item ${c.isGe ? 'ge-item' : ''}">
                    <label>
                        <input type="checkbox" value="${c.code}" ${completedCourses.has(c.code) ? 'checked' : ''} ${c.code === failedCode ? 'disabled' : ''} onchange="degreeAuditToggleCourse('${c.code}', this.checked)">
                        <span><strong>${c.code}</strong> ${c.name} ${c.isGe ? '(GE)' : '[' + c.defaultSem + ']'}</span>
                    </label>
                    <span>${c.cu} CU</span>
                </div>
            `;
        });

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
        const year = getSelectedYear();
        const failedCode = getSelectedFailedCourse();
        for (const course of curriculumData[getSelectedMajor()].courses) {
            const takenInEarlierYear = course.isGe ? year >= 2 : Number(course.defaultSem[0]) < year;
            if (course.code !== failedCode && !course.isTe && takenInEarlierYear) completedCourses.add(course.code);
        }
        for (const term in plannedTerms) {
            plannedTerms[term] = plannedTerms[term].filter(code => !completedCourses.has(code));
        }
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
            titleEl.innerHTML = `<span class="lang-zh">課程結構流程圖</span><span class="lang-en">Curriculum flowchart</span> — ${major.name} (${majorKey})`;
        }

        const container = document.getElementById('flowchartGridContainer');
        if (!container) return;
        container.innerHTML = '';

        semesters.forEach(semLabel => {
            const semCourses = major.courses.filter(c => courseSemMap[c.code] === semLabel);

            let semCuTotal = 0;
            semCourses.forEach(c => semCuTotal += c.cu);

            let prereqViolations = [];
            semCourses.forEach(c => {
                if (c.prereq) {
                    const isPrereqCompleted = completedCourses.has(c.prereq);
                    if (!isPrereqCompleted) {
                        const prereqSem = courseSemMap[c.prereq];
                        const currentSemIdx = semesters.indexOf(semLabel);
                        const prereqSemIdx = semesters.indexOf(prereqSem);

                        if (prereqSemIdx >= currentSemIdx) {
                            prereqViolations.push(`<span class="lang-zh">${c.code} 須先修讀 ${c.prereq}</span><span class="lang-en">${c.code} requires ${c.prereq} in an earlier semester</span>`);
                        }
                    }
                }
            });

            const isWarningRow = prereqViolations.length > 0;

            let rowHtml = `
                <div class="sem-row ${isWarningRow ? 'sem-warning-border' : ''}">
                    <div class="sem-label-container">
                        <div class="sem-label">${semLabel === "GE" ? '<span class="lang-zh">通識科目</span><span class="lang-en">GE Courses</span>' : semLabel}</div>
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
                        <span>⚠ ${prereqViolations.join(' · ')}</span>
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

        moveCourse(code, targetSem);
    };

    function moveCourse(code, targetSem) {
        if (Object.hasOwn(courseSemMap, code)) {
            courseSemMap[code] = targetSem;
            renderFlowchart();
            document.getElementById('flowchartMoveStatus').innerHTML = `
                <span class="lang-zh">${code} 已移至 ${targetSem}。</span>
                <span class="lang-en">${code} moved to ${targetSem}.</span>`;
        }
    }

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
        document.getElementById(`term${termId}Select`).focus();
    };

    function renderRoadmapAndAudit() {
        const majorKey = getSelectedMajor();
        const major = getActiveCurriculumData()[majorKey] || getActiveCurriculumData()["CDE"];
        const targetReq = getSelectedDegreeRoute();

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
                            <strong><span class="lang-zh">尚欠 ${gap} 學分</span><span class="lang-en">${gap} credits remaining</span></strong>
                            <p style="font-size:0.85rem; margin-top:3px;">
                                <span class="lang-zh">距離 ${targetReq} 學分的模擬要求尚有差額。請在下方規劃餘下科目。</span>
                                <span class="lang-en">Add remaining courses below to work toward the sample ${targetReq}-credit requirement.</span>
                            </p>
                        </div>
                    </div>
                `;
            } else {
                bannerContainer.innerHTML = `
                    <div class="alert alert-success">
                        <div>
                            <strong><span class="lang-zh">已達模擬學分目標</span><span class="lang-en">Sample credit target met</span></strong>
                            <p style="font-size:0.85rem; margin-top:3px;">
                                <span class="lang-zh">已完成及已規劃合共 ${totalProjected} 學分，達到 ${targetReq} 學分目標。</span>
                                <span class="lang-en">Completed and planned credits total ${totalProjected} CU against a target of ${targetReq} CU.</span>
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
                            <button type="button" class="remove-btn" onclick="removeCourseFromTerm(${t}, '${cObj.code}')">
                                <span aria-hidden="true">×</span>
                                <span class="audit-sr-only"><span class="lang-zh">移除 ${cObj.code}</span><span class="lang-en">Remove ${cObj.code}</span></span>
                            </button>
                        </span>
                    `;
                }
            });
            cuEl.textContent = `${termCu} CU`;
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
            container.innerHTML = `<p><span class="lang-zh">沒有可加入課表的其他科目。</span><span class="lang-en">There are no other courses to show.</span></p>`;
            renderTimetable();
            return;
        }

        targetCourses.forEach((c) => {
            const slotLabel = c.hasNoSlot
                ? '<span class="lang-zh">無固定時段</span><span class="lang-en">No fixed time</span>'
                : `(${c.day} ${timeSlots.find(slot => slot.key === c.slot).time})`;

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
        const retakeTime = timeSlots.find(slot => slot.key === retakeSlot.timeKey).time;

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
                            <strong><span class="lang-zh">⚠ 重修時段有衝突</span><span class="lang-en">⚠ Retake section clash</span></strong>
                            <p><span class="lang-zh">${failedCode}（${section}）與 ${clashingCode} 在 ${retakeTime} 重疊。</span><span class="lang-en">${failedCode} (${section}) overlaps with ${clashingCode} at ${retakeTime}.</span></p>
                        </div>
                        ${section === "L01" ? `<button type="button" class="btn-action" onclick="document.getElementById('sectionSelect').value='L02'; document.getElementById('sectionSelect').focus(); renderTimetable();"><span class="lang-zh">試用 L02 時段</span><span class="lang-en">Try section L02</span></button>` : ''}
                    </div>
                `;
            } else {
                alertContainer.innerHTML = `
                    <div class="alert alert-success">
                        <div>
                            <strong><span class="lang-zh">✓ 重修時段無衝突</span><span class="lang-en">✓ No retake section clash</span></strong>
                            <p><span class="lang-zh">${section} 與目前勾選的科目沒有重疊。</span><span class="lang-en">${section} does not overlap with the selected courses.</span></p>
                        </div>
                    </div>
                `;
            }
        }

        const tbody = document.getElementById('timetableBody');
        if (!tbody) return;
        tbody.innerHTML = '';

        timeSlots.forEach(ts => {
            let row = `<tr><th scope="row">${ts.time}</th>`;
            days.forEach(d => {
                let content = "";
                let cellClass = "";

                if (d === retakeSlot.day && ts.key === retakeSlot.timeKey) {
                    content += `<div><span class="lang-zh">重修</span><span class="lang-en">Retake</span> ${failedCode}</div>`;
                    cellClass = "slot-active";
                }

                activeCourses.forEach(c => {
                    if (!c.hasNoSlot && c.day === d && c.slot === ts.key) {
                        if (content !== "") {
                            content += `<div>${c.code}</div>`;
                            cellClass = "slot-clash";
                        } else {
                            content = `<div>${c.code}</div>`;
                            cellClass = "slot-active";
                        }
                    }
                });

                const clashLabel = cellClass === 'slot-clash'
                    ? '<div><span class="lang-zh">時段衝突</span><span class="lang-en">Time clash</span></div>'
                    : '';
                row += `<td class="${cellClass}">${clashLabel}${content}</td>`;
            });
            row += `</tr>`;
            tbody.innerHTML += row;
        });
        document.getElementById('chkNoClash').checked = !isClash;
        renderOverrideTab();
    };

    window.renderOverrideTab = function () {
        const majorKey = getSelectedMajor();
        const failedCode = getSelectedFailedCourse();
        const major = getActiveCurriculumData()[majorKey] || getActiveCurriculumData()["CDE"];
        const failedObj = major.courses.find(c => c.code === failedCode) || major.courses[0];

        const chainContainer = document.getElementById('prereqChainContainer');
        if (chainContainer) {
            chainContainer.innerHTML = `
                <div class="chain-node failed">${failedObj.code} <span class="lang-zh">需重修</span><span class="lang-en">Retake</span></div>
                ${failedObj.blocks ? `<span aria-hidden="true">➔</span><div class="chain-node">${failedObj.blocks} <span class="lang-zh">先修要求未滿足</span><span class="lang-en">Prerequisite unmet</span></div>` : ''}
                ${failedObj.downstream ? `<span aria-hidden="true">➔</span><div class="chain-node">${failedObj.downstream}</div>` : ''}
            `;
        }

        const gpaOk = document.getElementById('chkGpa').checked;
        const noClash = document.getElementById('chkNoClash').checked;
        const banner = document.getElementById('overrideEligibilityBanner');
        if (banner) {
            if (gpaOk && noClash) {
                banner.innerHTML = `
                    <div class="alert alert-success" style="margin-top:10px;">
                        <strong><span class="lang-zh">✓ 符合示範豁免條件</span><span class="lang-en">✓ Sample waiver checks passed</span></strong>
                    </div>
                `;
            } else {
                banner.innerHTML = `
                    <div class="alert alert-danger" style="margin-top:10px;">
                        <strong><span class="lang-zh">⚠ 尚未符合示範豁免條件</span><span class="lang-en">⚠ Sample waiver checks incomplete</span></strong>
                    </div>
                `;
            }
        }
    };

    window.downloadForm = function () {
        const majorKey = getSelectedMajor();
        const failedCode = getSelectedFailedCourse();
        alert(document.body.dataset.lang === 'en'
            ? `Sample waiver application\nMajor: ${majorKey}\nCourse to retake: ${failedCode}`
            : `示範豁免申請\n主修：${majorKey}\n需重修科目：${failedCode}`);
    };

    function translateOptions() {
        const language = document.body.dataset.lang === 'en' ? 'en' : 'zh';
        document.querySelectorAll('#pageContent option[data-en][data-zh]').forEach(option => {
            option.textContent = option.dataset[language];
        });
    }

    document.addEventListener('portal:languagechange', translateOptions);
    document.getElementById('flowchartSemester').replaceChildren(...semesters.map(semester => new Option(semester)));
    document.getElementById('flowchartMoveForm').addEventListener('submit', event => {
        event.preventDefault();
        moveCourse(document.getElementById('flowchartCourse').value, document.getElementById('flowchartSemester').value);
    });
    translateOptions();
    handleGlobalChange();
})();
