/* Shared profile-based course eligibility for Course Comparator and Degree Audit. */
(() => {
    'use strict';

    const PROFILE_STORAGE_KEY = 'ee4213.registration.profile.v1';
    const AUDIT_STORAGE_KEY = 'cityuEE4213DegreeAuditStatusV2';
    const UNDECLARED_ID = 'UNDECLARED';
    const YEAR_SEMESTERS = {
        1: ['GE', '1A', '1B'],
        2: ['2A', '2B'],
        3: ['3A', '3B'],
        4: ['4A', '4B']
    };
    const ROUTE_CREDITS = {
        'Associate Degree': 96,
        'Higher Diploma': 96,
        'Direct Entry': 120,
        'Department Transfer': 75
    };

    function readProfile() {
        const defaults = {
            major: UNDECLARED_ID,
            transfer: 'Associate Degree',
            year: 'Year 1'
        };
        try {
            const raw = sessionStorage.getItem(PROFILE_STORAGE_KEY);
            const parsed = raw ? JSON.parse(raw) : null;
            if (parsed && typeof parsed === 'object') {
                if (typeof parsed.major === 'string') defaults.major = parsed.major;
                if (typeof parsed.transfer === 'string') defaults.transfer = parsed.transfer;
                if (typeof parsed.year === 'string') defaults.year = parsed.year;
            }
        } catch (error) {
            console.warn('Unable to read Student Profile for the course pool.', error);
        }
        return defaults;
    }

    function readAuditProgress() {
        try {
            const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
            const parsed = raw ? JSON.parse(raw) : null;
            if (parsed && parsed.version === 2 && parsed.byMajor && typeof parsed.byMajor === 'object') {
                return parsed;
            }
        } catch (error) {
            console.warn('Unable to read Degree Audit progress for the course pool.', error);
        }
        return { version: 2, activeMajor: null, byMajor: {} };
    }

    function getMajorCurriculum(major, courseById) {
        return major.curriculum.map(courseId => {
            const course = courseById.get(courseId);
            const curriculum = course?.curriculumByMajor?.[major.majorId];
            if (!course || !curriculum) {
                throw new Error(`Missing ${major.majorId} curriculum data for ${courseId}.`);
            }
            return { ...curriculum, courseId };
        });
    }

    function getCommonCurriculum(majors, curriculumByMajor) {
        if (!majors.length) return [];
        const firstMajorCurriculum = curriculumByMajor.get(majors[0].majorId) || [];
        return firstMajorCurriculum.filter(course =>
            YEAR_SEMESTERS[1].includes(course.semester) &&
            majors.every(major =>
                curriculumByMajor.get(major.majorId)?.some(item => item.courseId === course.courseId)
            )
        );
    }

    function resolve(data, profile = readProfile(), progress = readAuditProgress()) {
        const majors = Array.isArray(data?.majors) ? data.majors : [];
        const majorById = new Map(majors.map(major => [major.majorId, major]));
        const courseById = new Map((Array.isArray(data?.courses) ? data.courses : [])
            .map(course => [course.courseId, course]));
        const curriculumByMajor = new Map(majors.map(major => [
            major.majorId,
            getMajorCurriculum(major, courseById)
        ]));
        const commonCurriculum = getCommonCurriculum(majors, curriculumByMajor);
        const year = Number((typeof profile.year === 'string' ? profile.year : '').match(/\d+/)?.[0]);
        const validYear = YEAR_SEMESTERS[year] ? year : 1;
        const majorId = validYear === 1
            ? 'COMMON'
            : (profile.major !== UNDECLARED_ID && majorById.has(profile.major) ? profile.major : '');
        const curriculum = majorId === 'COMMON'
            ? commonCurriculum
            : (curriculumByMajor.get(majorId) || []);
        const curriculumById = new Map(curriculum.map(course => [course.courseId, course]));
        const commonById = new Map(commonCurriculum.map(course => [course.courseId, course]));
        const semesters = new Set(YEAR_SEMESTERS[validYear]);
        const statuses = {
            ...(progress.byMajor?.COMMON || {}),
            ...(majorId && majorId !== 'COMMON' ? (progress.byMajor?.[majorId] || {}) : {})
        };
        const reasons = {};
        const visiting = new Set();

        function availability(courseId) {
            const curriculumCourse = curriculumById.get(courseId) || commonById.get(courseId);
            if (!curriculumCourse) return 'Course is outside the profile curriculum.';
            const status = statuses[courseId] || 'not-taken';
            if (status === 'completed') return 'Already marked as completed.';
            if (status === 'failed') return 'Marked as failed; plan the retake first.';
            if (visiting.has(courseId)) return '';

            visiting.add(courseId);
            for (const prerequisiteId of curriculumCourse.prerequisiteCourseIds || []) {
                if ((statuses[prerequisiteId] || 'not-taken') === 'completed') continue;
                const nestedReason = availability(prerequisiteId);
                visiting.delete(courseId);
                return nestedReason
                    ? `Prerequisite ${prerequisiteId} is not available: ${nestedReason}`
                    : `Prerequisite ${prerequisiteId} is not marked as completed.`;
            }
            visiting.delete(courseId);
            return '';
        }

        const curriculumCourses = majorId
            ? curriculum.filter(course => semesters.has(course.semester))
                .map(item => ({ curriculum: item, course: courseById.get(item.courseId) }))
                .filter(item => item.course)
            : [];
        const courses = curriculumCourses.filter(item => {
            const reason = availability(item.curriculum.courseId);
            if (reason) reasons[item.curriculum.courseId] = reason;
            return !reason;
        });

        return {
            profile,
            year: validYear,
            majorId,
            routeCreditUnits: ROUTE_CREDITS[profile.transfer] || 96,
            curriculumCourses,
            courses,
            reasons
        };
    }

    function courseInfoHref(courseId) {
        return `../course-info/workload.html?${new URLSearchParams({ course: courseId })}`;
    }

    window.EE4213CoursePool = Object.freeze({
        readProfile,
        readAuditProgress,
        resolve,
        courseInfoHref,
        routeCredits: Object.freeze({ ...ROUTE_CREDITS })
    });
})();
