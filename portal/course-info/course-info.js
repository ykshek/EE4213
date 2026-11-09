(() => {
    'use strict';

    const byId = id => document.getElementById(id);
    const weekNumbers = Array.from({ length: 13 }, (_, index) => index + 1);
    const storagePrefix = 'ee4213.portal.experiences.v1:';
    const gradePoints = {
        'A+': 4.3, A: 4.0, 'A-': 3.7, 'B+': 3.3, B: 3.0, 'B-': 2.7,
        'C+': 2.3, C: 2.0, 'C-': 1.7, D: 1.0, F: 0.0
    };
    const gradeGroups = [
        ['A', ['A 段', 'A range']], ['B', ['B 段', 'B range']],
        ['C', ['C 段', 'C range']], ['D', ['D／F', 'D / F']]
    ];
    const semesters = { A: ['A 學期', 'Semester A'], B: ['B 學期', 'Semester B'], Summer: ['暑期', 'Summer Term'] };
    const unknownTerm = ['未填寫學期', 'Study term not provided'];
    const assessment = {
        EE4213: {
            term: '2026/27 A',
            source: 'https://www.cityu.edu.hk/catalogue/ug/202627/course/EE4213.pdf',
            prerequisite: ['先修要求：CS2311 或同等科目', 'Prerequisite: CS2311 or equivalent'],
            weights: [
                [['專題', 'Projects'], 49],
                [['測驗', 'Tests'], 21],
                [['考試', 'Examination'], 30]
            ],
            passing: ['持續評核及考試均須各達 30%。', 'At least 30% is required in each of continuous assessment and the examination.']
        }
    };
    const labels = {
        hours: ['每週課外時數', 'Weekly study hours'],
        project: ['專題負擔', 'Project workload'],
        assignment: ['作業負擔', 'Assignment workload'],
        labs: ['實驗頻率', 'Lab frequency'],
        pressure: ['限期壓力', 'Deadline pressure'],
        weeks: ['最忙週次', 'Busiest weeks']
    };
    const levels = { Low: ['低', 'Low'], Medium: ['中', 'Medium'], High: ['高', 'High'] };
    const choices = {
        project: levels,
        assignment: levels,
        labs: {
            None: ['沒有', 'None'],
            Monthly: ['每月一次', 'Monthly'],
            'Every 2 weeks': ['每兩週一次', 'Every 2 weeks'],
            Weekly: ['每週一次', 'Weekly'],
            'More than weekly': ['每週多於一次', 'More than weekly']
        },
        pressure: levels
    };
    const courses = window.EE4213Data.courses.filter(course =>
        /^EE\d{4}(?: ?[A-Z])?(?: \/ EE\d{4})?$/.test(course.courseId) &&
        (course.category !== 'comparator-sample' || course.courseId === 'EE4213')
    ).sort((first, second) => first.courseId.localeCompare(second.courseId));

    function element(tag, text, className) {
        const node = document.createElement(tag);
        if (text !== undefined) node.textContent = text;
        if (className) node.className = className;
        return node;
    }

    function bilingual(target, zh, en) {
        const chinese = element('span', zh, 'lang-zh');
        const english = element('span', en, 'lang-en');
        english.lang = 'en';
        target.replaceChildren(chinese, english);
    }

    function fieldText(node, field) {
        bilingual(node, field?.zh || field?.en || '', field?.en || field?.zh || '');
        if (!field?.zh && field?.en) node.firstElementChild.lang = 'en';
    }

    function hoursText(node, hours) {
        bilingual(node, hours + ' 小時／週', hours + ' h/week');
    }

    function creditsText(node, units) {
        bilingual(node, units + ' 學分', units + (units === 1 ? ' credit unit' : ' credit units'));
    }

    function isStudyTerm(value) {
        if (typeof value !== 'string') return false;
        const match = /^(\d{4})\/(\d{2}) (A|B|Summer)$/.exec(value);
        return Boolean(match && (Number(match[1]) + 1) % 100 === Number(match[2]));
    }

    function termText(term) {
        if (!isStudyTerm(term)) return unknownTerm;
        const [year, semester] = term.split(' ');
        return semesters[semester].map(label => year + ' ' + label);
    }

    function initList() {
        const search = byId('course-search');
        const list = byId('course-list');
        const columns = document.querySelector('.course-directory-columns');
        const url = new URL(location.href);
        search.value = url.searchParams.get('q') || '';
        const rows = courses.map(course => {
            const row = element('li');
            const link = element('a', undefined, 'course-link course-directory-link');
            const name = element('span', undefined, 'course-directory-name');
            const title = element('span', undefined, 'course-directory-title');
            fieldText(title, course.titles || { en: course.courseId });
            name.append(title);
            const credits = element('span', undefined, 'course-directory-credits');
            if (course.creditUnits != null) {
                creditsText(credits, course.creditUnits);
            }
            if (assessment[course.courseId]) {
                const badge = element('span', undefined, 'course-assessment-badge');
                bilingual(badge, '已核實評核', 'Verified assessment');
                name.append(badge);
            }
            const arrow = element('span', '→', 'course-directory-arrow');
            arrow.setAttribute('aria-hidden', 'true');
            link.append(element('span', course.courseId, 'course-directory-code'), name, credits, arrow);
            row.append(link);
            const searchable = [course.courseId, course.titles?.en, course.titles?.zh].join(' ').toLowerCase();
            return { row, link, courseId: course.courseId, searchable, code: course.courseId.replace(/\s/g, '').toLowerCase() };
        });
        list.replaceChildren(...rows.map(item => item.row));

        function filter() {
            const originalQuery = search.value.trim();
            const query = originalQuery.toLowerCase();
            const compactQuery = query.replace(/\s/g, '');
            let count = 0;
            for (const { row, link, courseId, searchable, code } of rows) {
                row.hidden = !searchable.includes(query) && !code.includes(compactQuery);
                if (row.hidden) continue;
                count += 1;
                const params = new URLSearchParams({ course: courseId });
                if (originalQuery) params.set('q', originalQuery);
                link.href = 'workload.html?' + params;
            }
            columns.hidden = count === 0;
            if (count) {
                bilingual(byId('course-count'), '找到 ' + count + ' 門課程', count + (count === 1 ? ' course found' : ' courses found'));
            } else {
                bilingual(byId('course-count'), '找不到課程。請更改關鍵字或清除搜尋。', 'No courses found. Try another search or clear the search.');
            }
        }

        function updateQuery() {
            if (search.value.trim()) url.searchParams.set('q', search.value.trim());
            else url.searchParams.delete('q');
            // Direct file browsing also works when history updates are restricted.
            try { history.replaceState(null, '', url); } catch { /* Links still carry the search term. */ }
            filter();
        }

        search.addEventListener('input', updateQuery);
        byId('clear-search').addEventListener('click', () => {
            search.value = '';
            updateQuery();
            search.focus();
        });
        window.addEventListener('pageshow', filter);
        filter();
    }

    function addMetric(list, label, renderValue) {
        const metric = element('div');
        const term = element('dt');
        const value = element('dd');
        bilingual(term, ...label);
        renderValue(value);
        metric.append(term, value);
        list.append(metric);
    }

    function renderMetrics(list, values) {
        list.replaceChildren();
        addMetric(list, ['平均每週課外時數', 'Average weekly study hours'], node => hoursText(node, values.hours));
        for (const [name, options] of Object.entries(choices)) {
            addMetric(list, labels[name], node => bilingual(node, ...options[values[name]]));
        }
    }

    function renderAssessment(courseId) {
        const outline = assessment[courseId];
        if (!outline) return;
        const [zhTerm, enTerm] = termText(outline.term);
        bilingual(byId('outline-term'), zhTerm + ' · 城大官方課綱', enTerm + ' · Official CityU syllabus');
        bilingual(byId('course-prerequisite'), ...outline.prerequisite);
        for (const [label, weight] of outline.weights) {
            addMetric(byId('assessment-weights'), label, node => { node.textContent = weight + '%'; });
        }
        bilingual(byId('assessment-passing'), ...outline.passing);
        byId('outline-source').href = outline.source;
        byId('official-assessment').hidden = false;
    }

    function renderGradeBars(list, counts) {
        const total = counts.reduce((sum, count) => sum + count, 0);
        list.replaceChildren(...gradeGroups.map(([, label], index) => {
            const row = element('li');
            const heading = element('strong');
            const track = element('span', undefined, 'grade-track');
            const bar = element('span');
            const count = element('span');
            bilingual(heading, ...label);
            bilingual(count, counts[index] + ' 筆', counts[index] + (counts[index] === 1 ? ' entry' : ' entries'));
            track.setAttribute('aria-hidden', 'true');
            bar.style.width = (counts[index] / total * 100) + '%';
            track.append(bar);
            row.append(heading, track, count);
            return row;
        }));
    }

    function renderGrades(responses) {
        const grades = responses.map(response => response.grade)
            .filter(grade => typeof grade === 'string' && Object.hasOwn(gradePoints, grade));
        const status = byId('grade-status');
        const average = (grades.reduce((sum, grade) => sum + gradePoints[grade], 0) / grades.length).toFixed(2);
        bilingual(status, '平均績點 ' + average + '／4.30 · ' + grades.length + ' 則成績',
            'Average grade point ' + average + '/4.30 · ' + grades.length + ' grades');
        const groups = grades.map(grade => grade === 'F' ? 'D' : grade[0]);
        renderGradeBars(byId('course-grades'), gradeGroups.map(([key]) => groups.filter(group => group === key).length));
    }

    function isHours(value) {
        return Number.isInteger(value) && value >= 0 && value <= 30;
    }

    function isResponse(entry) {
        return entry && Number.isFinite(entry.time) && isHours(entry.hours) &&
            Object.entries(choices).every(([name, options]) => Object.hasOwn(options, entry[name])) &&
            Array.isArray(entry.weeks) && entry.weeks.length > 0 &&
            entry.weeks.every(week => weekNumbers.includes(week)) &&
            typeof entry.comment === 'string' && entry.comment.length <= 400;
    }

    function loadResponses(prefix) {
        const results = [];
        try {
            const storage = localStorage;
            for (let index = 0; index < storage.length; index += 1) {
                const key = storage.key(index);
                if (!key?.startsWith(prefix)) continue;
                try {
                    const entry = JSON.parse(storage.getItem(key));
                    if (isResponse(entry)) results.push(entry);
                } catch { /* Skip malformed entries individually. */ }
            }
        } catch { /* A blocked browser can still accept a response for this page. */ }
        return results;
    }

    function summarize(responses) {
        const average = responses.reduce((total, response) => total + response.hours, 0) / responses.length;
        const levelNames = Object.keys(levels);
        const result = { hours: Math.round(average * 10) / 10 };
        for (const name of ['project', 'assignment', 'pressure']) {
            const sum = responses.reduce((total, response) => total + levelNames.indexOf(response[name]), 0);
            result[name] = levelNames[Math.round(sum / responses.length)];
        }
        const frequencies = new Map();
        for (const { labs } of responses) frequencies.set(labs, (frequencies.get(labs) || 0) + 1);
        result.labs = [...frequencies].sort((first, second) => second[1] - first[1])[0][0];
        return result;
    }

    function initTimeline() {
        let selected = null;
        let counts = weekNumbers.map(() => 0);
        const weeks = weekNumbers.map(week => {
            const item = element('li');
            const button = element('button', undefined, 'timeline-week');
            button.type = 'button';
            const label = element('span', 'W' + week);
            const meter = element('span', undefined, 'week-meter');
            const bar = element('span');
            const number = element('span');
            for (const visual of [label, meter, number]) visual.setAttribute('aria-hidden', 'true');
            meter.append(bar);
            button.append(label, meter, number);
            button.addEventListener('click', () => {
                selected = week;
                renderSelection();
            });
            item.append(button);
            byId('workload-timeline').append(item);
            return { button, bar, number };
        });

        function renderSelection() {
            const active = selected ?? counts.indexOf(Math.max(...counts)) + 1;
            weeks.forEach(({ button }, index) => button.setAttribute('aria-pressed', String(index + 1 === active)));
            const count = counts[active - 1];
            bilingual(byId('week-detail'),
                '第 ' + active + ' 週 — ' + count + ' 則回覆選為最忙週次。',
                'Week ' + active + ' — ' + count + (count === 1 ? ' response marked this week as busy.' : ' responses marked this week as busy.'));
        }

        function labelButtons() {
            const english = window.Portal.getSession().language === 'en';
            weeks.forEach(({ button }, index) => {
                const count = counts[index];
                button.setAttribute('aria-label', english
                    ? 'Week ' + (index + 1) + ', ' + count + (count === 1 ? ' busy-week report' : ' busy-week reports')
                    : '第 ' + (index + 1) + ' 週，' + count + ' 則忙碌週回覆');
            });
        }

        document.addEventListener('portal:languagechange', labelButtons);
        return weekCounts => {
            counts = weekCounts;
            const max = Math.max(...counts);
            weeks.forEach(({ bar, number }, index) => {
                const count = counts[index];
                bar.hidden = count === 0;
                bar.style.height = (max ? count / max * 100 : 0) + '%';
                number.textContent = count;
            });
            labelButtons();
            renderSelection();
        };
    }

    function localizeSelect(select, options) {
        const languageIndex = window.Portal.getSession().language === 'en' ? 1 : 0;
        for (const option of select.options) option.text = options[option.value][languageIndex];
    }

    function setFormOptions(select, options) {
        for (const value of Object.keys(options)) select.add(new Option('', value));
        const localize = () => localizeSelect(select, options);
        localize();
        document.addEventListener('portal:languagechange', localize);
    }

    function makeField(name, label, input, hint) {
        const field = element('div', undefined, 'experience-field');
        const title = element('label');
        title.htmlFor = 'experience-' + name;
        bilingual(title, ...label);
        input.id = title.htmlFor;
        input.name = name;
        field.append(title, input);
        if (hint) {
            const description = element('p', undefined, 'course-hint');
            description.id = name + '-hint';
            bilingual(description, ...hint);
            field.append(description);
        }
        byId('experience-fields').append(field);
        return field;
    }

    function initForm(courseId, save) {
        const form = byId('experience-form');
        const panel = byId('experience-panel');
        const open = byId('open-experience');
        const hours = element('input');
        Object.assign(hours, { type: 'number', min: '0', max: '30', step: '1', required: true });
        makeField('hours', labels.hours, hours, ['輸入 0 至 30 的整數，不包括上課時間。', 'Enter a whole number from 0 to 30, excluding scheduled classes.']);

        for (const [name, options] of Object.entries(choices)) {
            const select = element('select');
            select.required = true;
            setFormOptions(select, { '': ['請選擇', 'Choose an option'], ...options });
            makeField(name, labels[name], select);
        }

        const weeks = element('fieldset', undefined, 'experience-field experience-field-wide');
        const legend = element('legend');
        bilingual(legend, ...labels.weeks);
        const weekHint = element('p', undefined, 'course-hint');
        weekHint.id = 'weeks-hint';
        bilingual(weekHint, '請選擇至少一週，可選多於一週。', 'Select at least one week. You can select more than one.');
        const picker = element('div', undefined, 'week-picker');
        for (const week of weekNumbers) {
            const label = element('label', undefined, 'week-option');
            const input = element('input');
            Object.assign(input, { type: 'checkbox', name: 'weeks', value: String(week) });
            const name = element('span');
            bilingual(name, '第 ' + week + ' 週', 'Week ' + week);
            label.append(input, name);
            picker.append(label);
        }
        weeks.append(legend, weekHint, picker);
        byId('experience-fields').append(weeks);

        const year = element('input');
        Object.assign(year, { type: 'text', maxLength: 7, placeholder: '2026/27' });
        makeField('year', ['修讀學年（選填）', 'Study year (optional)'], year,
            ['例如 2026/27。填寫學年時亦請選擇學期。', 'For example, 2026/27. If you enter a year, also select a semester.']);
        const semester = element('select');
        setFormOptions(semester, { '': ['不填寫', 'Leave blank'], ...semesters });
        makeField('semester', ['修讀學期（選填）', 'Study semester (optional)'], semester);
        const grade = element('select');
        const gradeOptions = Object.fromEntries(Object.entries(gradePoints).map(([letter, point]) => [
            letter, [letter + '（' + point.toFixed(1) + '）', letter + ' (' + point.toFixed(1) + ')']
        ]));
        setFormOptions(grade, { '': ['不填寫', 'Leave blank'], ...gradeOptions });
        makeField('grade', ['本課成績／績點（選填）', 'Course grade / grade point (optional)'], grade,
            ['請選擇這門課的最終成績。績點會納入成績統計。', 'Select your final grade for this course. It will be included in the grade distribution.'])
            .classList.add('experience-field-wide');

        const comment = element('textarea');
        Object.assign(comment, { maxLength: 400, rows: 3 });
        const commentField = makeField('comment', ['留言（選填）', 'Comment (optional)'], comment,
            ['最多 400 字，可分享最花時間的課業。', 'Up to 400 characters. You can describe what took the most time.']);
        commentField.classList.add('experience-field-wide');
        bilingual(byId('experience-course'), '課程編號 — ' + courseId, 'Course code — ' + courseId);

        const errors = new Map();
        const messages = {
            hours: ['請輸入 0 至 30 的整數。', 'Enter a whole number from 0 to 30.'],
            choice: ['請選擇一個選項。', 'Choose an option.'],
            weeks: ['請選擇至少一個最忙週次。', 'Select at least one busy week.'],
            year: ['請輸入有效的修讀學年，例如 2026/27。', 'Enter a valid study year, such as 2026/27.'],
            semester: ['請選擇該學年的修讀學期。', 'Select the semester in that study year.'],
            grade: ['請選擇有效成績，或留空。', 'Select a valid grade or leave the field blank.'],
            comment: ['請將留言縮短至 400 字或以下。', 'Shorten your comment to 400 characters or fewer.']
        };
        for (const field of form.querySelectorAll('.experience-field')) {
            const inputs = [...field.querySelectorAll('input, select, textarea')];
            const name = inputs[0].name;
            const error = element('p', undefined, 'field-error');
            error.id = name + '-error';
            error.hidden = true;
            bilingual(error, ...(messages[name] || messages.choice));
            field.append(error);
            const description = field.querySelector('.course-hint');
            for (const input of inputs) {
                const ids = description ? [description.id, error.id] : [error.id];
                input.setAttribute('aria-describedby', ids.join(' '));
            }
            errors.set(name, { error, inputs });
        }

        function markError(name, invalid) {
            const { error, inputs } = errors.get(name);
            error.hidden = !invalid;
            for (const input of inputs) {
                if (invalid) input.setAttribute('aria-invalid', 'true');
                else input.removeAttribute('aria-invalid');
            }
        }

        function toggleForm(expanded) {
            panel.hidden = !expanded;
            open.setAttribute('aria-expanded', String(expanded));
        }

        open.addEventListener('click', () => {
            const expanded = panel.hidden;
            toggleForm(expanded);
            if (expanded) byId('experience-heading').focus();
        });
        byId('close-experience').addEventListener('click', () => {
            toggleForm(false);
            open.focus();
        });
        form.addEventListener('input', event => markError(event.target.name, false));
        form.addEventListener('submit', event => {
            event.preventDefault();
            const data = new FormData(form);
            const invalid = [];
            if (!hours.value || !isHours(Number(hours.value))) invalid.push('hours');
            for (const [name, options] of Object.entries(choices)) {
                if (!Object.hasOwn(options, data.get(name))) invalid.push(name);
            }
            const selectedWeeks = data.getAll('weeks').map(Number).filter(week => weekNumbers.includes(week));
            if (!selectedWeeks.length) invalid.push('weeks');
            const studyYear = year.value.trim();
            const studyTerm = studyYear + ' ' + semester.value;
            if (studyYear || semester.value) {
                if (!isStudyTerm(studyYear + ' A')) invalid.push('year');
                if (!Object.hasOwn(semesters, semester.value)) invalid.push('semester');
            }
            if (grade.value && !Object.hasOwn(gradePoints, grade.value)) invalid.push('grade');
            if (comment.value.length > 400) invalid.push('comment');
            for (const name of errors.keys()) markError(name, invalid.includes(name));
            if (invalid.length) {
                errors.get(invalid[0]).inputs[0].focus();
                return;
            }
            save({
                time: Date.now(),
                hours: Number(hours.value),
                project: data.get('project'),
                assignment: data.get('assignment'),
                labs: data.get('labs'),
                pressure: data.get('pressure'),
                weeks: selectedWeeks,
                ...(studyYear && { term: studyTerm }),
                ...(grade.value && { grade: grade.value }),
                comment: comment.value.trim()
            });
            form.reset();
            toggleForm(false);
            byId('submission-status').focus();
        });
    }

    function renderReview(response) {
        const item = element('li');
        const hours = element('strong');
        hoursText(hours, response.hours);
        const term = element('p', undefined, 'course-hint');
        bilingual(term, ...termText(response.term));
        const weeks = element('p', undefined, 'course-hint');
        const list = [...new Set(response.weeks)].sort((first, second) => first - second).join(', ');
        bilingual(weeks, '最忙週次 — 第 ' + list + ' 週', 'Busiest weeks — ' + list);
        const comment = element('p', undefined, 'review-comment');
        if (!response.comment) bilingual(comment, '已分享課業負擔，未有附上留言。', 'Shared workload details without a written comment.');
        else if (typeof response.comment === 'string') comment.textContent = response.comment;
        else fieldText(comment, response.comment);
        item.append(hours, term, weeks, comment);
        return item;
    }

    function initReviews() {
        const filter = byId('review-term');
        const list = byId('course-reviews');
        const empty = byId('empty-reviews');
        const semesterOrder = ['A', 'B', 'Summer'];
        let responses = [];
        let options = {};

        function render() {
            const items = responses.filter(response => {
                const term = isStudyTerm(response.term) ? response.term : 'unknown';
                return !filter.value || term === filter.value;
            });
            empty.hidden = items.length > 0;
            list.replaceChildren(...items.map(renderReview));
        }

        filter.addEventListener('change', render);
        document.addEventListener('portal:languagechange', () => localizeSelect(filter, options));
        return entries => {
            responses = [...entries].reverse();
            const knownTerms = new Set(responses.map(response => response.term).filter(isStudyTerm));
            const sortedTerms = [...knownTerms].sort((first, second) =>
                second.slice(0, 4).localeCompare(first.slice(0, 4)) ||
                semesterOrder.indexOf(second.split(' ')[1]) - semesterOrder.indexOf(first.split(' ')[1])
            );
            options = { '': ['所有學期', 'All study terms'] };
            for (const term of sortedTerms) options[term] = termText(term);
            if (responses.some(response => !isStudyTerm(response.term))) options.unknown = unknownTerm;
            const selected = filter.value;
            filter.replaceChildren(...Object.keys(options).map(value => new Option('', value)));
            localizeSelect(filter, options);
            filter.value = Object.hasOwn(options, selected) ? selected : '';
            byId('review-filter').hidden = responses.length === 0;
            render();
        };
    }

    function initDetail() {
        const params = new URLSearchParams(location.search);
        const id = params.get('course')?.trim().toUpperCase();
        const query = params.get('q');
        if (query) byId('back-to-courses').href = 'index.html?' + new URLSearchParams({ q: query });
        const course = courses.find(item => item.courseId === id);
        if (!course) {
            bilingual(byId('pageTitle'), '找不到課程', 'Course not found');
            bilingual(byId('course-description'), '請返回課程清單並選擇一門課程。', 'Return to the course list and select a course.');
            return;
        }
        const { courseId, titles, descriptions, creditUnits } = course;
        const readOnly = courseId.includes('/');
        byId('detail-code').textContent = courseId;
        byId('detail-code').hidden = false;
        fieldText(byId('pageTitle'), titles || { en: courseId });
        fieldText(byId('course-description'), descriptions || { zh: '暫未有課程簡介。', en: 'A course description is currently unavailable.' });
        if (creditUnits != null) {
            creditsText(byId('course-credits'), creditUnits);
            byId('course-credits').hidden = false;
        }
        renderAssessment(courseId);
        byId('course-detail').hidden = false;
        byId('readonly-course').hidden = !readOnly;
        byId('open-experience').hidden = readOnly;
        const renderTimeline = initTimeline();
        const renderReviews = initReviews();
        const prefix = storagePrefix + courseId + ':';
        const seeded = window.EE4213SeedReviews(course);
        const temporary = [];

        function renderResponses() {
            const submitted = readOnly ? [] : [...loadResponses(prefix), ...temporary];
            const responses = [...seeded, ...submitted]
                .sort((first, second) => first.time - second.time);
            const count = responses.length;
            bilingual(byId('response-count'), count + ' 則評價', count + ' reviews');
            renderMetrics(byId('workload-metrics'), summarize(responses));
            const counts = weekNumbers.map(week => responses.filter(response => response.weeks.includes(week)).length);
            const max = Math.max(...counts);
            const busiest = weekNumbers.filter(week => counts[week - 1] === max);
            const zhWeeks = busiest.join('、');
            const enWeeks = busiest.join(', ');
            bilingual(byId('peak-weeks'), '最多人選為最忙：第 ' + zhWeeks + ' 週（每週 ' + max + ' 則回覆）',
                'Most reported as busy: ' + (busiest.length === 1 ? 'week ' : 'weeks ') + enWeeks +
                ' (' + max + (max === 1 ? ' response' : ' responses') + (busiest.length > 1 ? ' each)' : ')'));
            renderTimeline(counts);
            renderReviews(responses.filter(response => response.comment !== null));
            renderGrades(responses);
        }

        if (!readOnly) {
            initForm(courseId, response => {
                let persisted = false;
                try {
                    // Separate keys allow two tabs to add responses without replacing each other's data.
                    const unique = crypto.getRandomValues(new Uint32Array(4)).join('-');
                    localStorage.setItem(prefix + unique, JSON.stringify(response));
                    persisted = true;
                } catch {
                    temporary.push(response);
                }
                byId('review-term').value = '';
                renderResponses();
                const status = byId('submission-status');
                status.classList.toggle('is-temporary', !persisted);
                if (persisted) {
                    bilingual(status, '評價已提交。', 'Your review has been submitted.');
                } else {
                    bilingual(status, '評價已加入此頁。瀏覽器無法儲存，重新整理後此回覆會消失。',
                        'Your experience was added to this page. Browser storage is unavailable, so this response will disappear on reload.');
                }
            });
            window.addEventListener('storage', event => {
                if (event.key === null || event.key.startsWith(prefix)) renderResponses();
            });
            window.addEventListener('pageshow', event => {
                if (event.persisted) renderResponses();
            });
        }
        renderResponses();
    }

    if (byId('course-search')) initList();
    else initDetail();
})();
