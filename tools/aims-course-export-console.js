/*
 * CityU AIMS course HTML downloader
 *
 * Use: open the official "Courses Offered" list in an authorized browser
 * session, open DevTools Console, paste this whole file, and press Enter.
 * It saves each course page and its linked class-detail page as raw HTML.
 * Requests are sequential; do not run it repeatedly or while the site is busy.
 */
(async () => {
    'use strict';

    const REQUEST_DELAY_MS = 750;
    const PROGRESS_EVERY = 20;
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const normalize = (value) => value.replace(/\s+/g, ' ').trim().toLowerCase();

    if (!/P_CrseSearch/i.test(window.location.href) &&
        !document.querySelector('form[action*="P_CrseSearch"]')) {
        console.error('Open the AIMS "Courses Offered" list page before running this script.');
        return;
    }

    function findCourseTable() {
        for (const table of document.querySelectorAll('table')) {
            for (const row of table.rows) {
                const cells = Array.from(row.cells, (cell) => normalize(cell.textContent));
                const subjectIndex = cells.indexOf('subject');
                const courseIndex = cells.indexOf('course');
                const titleIndex = cells.indexOf('title');
                if (subjectIndex >= 0 && courseIndex >= 0 && titleIndex >= 0) {
                    return { table, headerRow: row, subjectIndex, courseIndex, titleIndex };
                }
            }
        }
        throw new Error('Could not find a course table with Subject, Course, and Title columns.');
    }

    function extractCourses() {
        const { table, headerRow, subjectIndex, courseIndex, titleIndex } = findCourseTable();
        const courses = new Map();

        for (const row of table.rows) {
            if (row === headerRow) continue;
            const cells = Array.from(row.cells);
            const link = row.querySelector('a[href*="P_DispOneSection"]');
            if (!link || cells.length <= Math.max(subjectIndex, courseIndex, titleIndex)) continue;

            const subject = cells[subjectIndex].textContent.trim();
            const courseNumber = cells[courseIndex].textContent.trim();
            const title = cells[titleIndex].textContent.trim();
            if (!subject || !courseNumber || !title) continue;

            const url = new URL(link.href, window.location.href);
            if (url.origin !== window.location.origin) {
                throw new Error(`Refusing a cross-origin course link: ${url.href}`);
            }
            const key = `${url.searchParams.get('term') || ''}|${subject}|${courseNumber}`;
            if (!courses.has(key)) {
                courses.set(key, {
                    subject,
                    courseNumber,
                    courseId: `${subject}${courseNumber}`,
                    title,
                    courseUrl: url.href
                });
            }
        }

        if (!courses.size) throw new Error('No course links were found in the course table.');
        return Array.from(courses.values());
    }

    async function fetchHtml(url) {
        const resolvedUrl = new URL(url, window.location.href);
        if (resolvedUrl.origin !== window.location.origin) {
            throw new Error(`Refusing a cross-origin request: ${resolvedUrl.href}`);
        }
        await sleep(REQUEST_DELAY_MS);
        const response = await fetch(resolvedUrl.href, {
            method: 'GET',
            credentials: 'same-origin',
            headers: { Accept: 'text/html' }
        });
        if (!response.ok) {
            const error = new Error(`HTTP ${response.status} for ${resolvedUrl.pathname}`);
            error.status = response.status;
            throw error;
        }
        const finalUrl = new URL(response.url);
        if (finalUrl.origin !== window.location.origin) {
            throw new Error(`Request redirected outside the current site: ${finalUrl.href}`);
        }
        const html = await response.text();
        if (/name=["']?username|login required|sign in to/i.test(html.slice(0, 5000))) {
            throw new Error(`The response may be a login page for ${resolvedUrl.pathname}; check your authorized session.`);
        }
        return { html, url: finalUrl.href };
    }

    function findClassDetailUrl(html, pageUrl) {
        const parsed = new DOMParser().parseFromString(html, 'text/html');
        for (const link of parsed.querySelectorAll('a[href*="P_DispDemData"]')) {
            const url = new URL(link.getAttribute('href'), pageUrl);
            if (url.origin !== window.location.origin) {
                throw new Error(`Refusing a cross-origin class-detail link: ${url.href}`);
            }
            return url.href;
        }
        return null;
    }

    function makeFilename(courseId, suffix) {
        const safeId = courseId.replace(/[^a-z0-9_-]+/gi, '_');
        return `${safeId}-${suffix}.html`;
    }

    async function createWriter() {
        if (typeof window.showDirectoryPicker === 'function') {
            try {
                const directory = await window.showDirectoryPicker({ mode: 'readwrite' });
                return async (filename, html) => {
                    const file = await directory.getFileHandle(filename, { create: true });
                    const writable = await file.createWritable();
                    await writable.write(html);
                    await writable.close();
                };
            } catch (error) {
                if (error.name === 'AbortError') throw error;
                console.warn('Folder access is unavailable; using individual browser downloads instead.', error);
            }
        }

        return async (filename, html) => {
            const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
            const objectUrl = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = objectUrl;
            anchor.download = filename;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
            await sleep(300);
        };
    }

    const courses = extractCourses();
    const saveHtml = await createWriter();
    let savedPages = 0;
    let failedCourses = 0;
    let stop = false;

    console.info(`Found ${courses.length} unique courses. Saving raw course and class-detail HTML.`);
    for (let i = 0; i < courses.length; i += 1) {
        const course = courses[i];
        try {
            const coursePage = await fetchHtml(course.courseUrl);
            await saveHtml(makeFilename(course.courseId, 'course'), coursePage.html);
            savedPages += 1;

            const classDetailUrl = findClassDetailUrl(coursePage.html, coursePage.url);
            if (classDetailUrl) {
                const classPage = await fetchHtml(classDetailUrl);
                await saveHtml(makeFilename(course.courseId, 'classes'), classPage.html);
                savedPages += 1;
            } else {
                console.warn(`No class-detail link found for ${course.courseId}; saved its course page only.`);
            }
        } catch (error) {
            failedCourses += 1;
            console.error(`Could not save ${course.courseId}: ${error.message}`);
            if (error.status === 429 || error.status === 503) {
                console.error(`Server returned HTTP ${error.status}; stopping to avoid overloading it.`);
                stop = true;
            }
        }

        if ((i + 1) % PROGRESS_EVERY === 0 || i + 1 === courses.length || stop) {
            console.info(`Processed ${i + 1}/${courses.length} courses; ${savedPages} HTML files saved; ${failedCourses} course errors.`);
        }
        if (stop) break;
    }

    console.info('Download run finished. Review the console for any failed courses.');
})().catch((error) => {
    console.error('Course HTML download stopped:', error);
});
