(() => {
    'use strict';

    const byId = id => document.getElementById(id);
    const DISCUSSION_STORAGE_KEY = 'ee4213.portal.internships.v1';

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

    function initTabs() {
        const tabBtns = document.querySelectorAll('.career-tab-btn');
        const tabContents = document.querySelectorAll('.career-tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
                tabContents.forEach(c => { c.classList.remove('active'); c.hidden = true; });

                btn.classList.add('active');
                btn.setAttribute('aria-selected', 'true');
                const target = byId('tab-' + btn.dataset.tab);
                if (target) {
                    target.classList.add('active');
                    target.hidden = false;
                }
            });
        });
    }

    function renderInternships() {
        const data = window.EE4213Data;
        const container = byId('internshipGrid');
        if (!container) return;

        if (!data || !Array.isArray(data.internships)) {
            container.textContent = '實習資料暫不可用。 / Internship data unavailable.';
            return;
        }

        const lang = document.documentElement.lang === 'en' ? 'en' : 'zh';
        container.replaceChildren();

        data.internships.forEach(item => {
            const card = element('div', undefined, 'internship-card');

            const title = element('h3');
            bilingual(title, item.title.zh || item.title.en, item.title.en || item.title.zh);

            const desc = element('div', undefined, 'internship-desc');
            bilingual(desc, item.description.zh || item.description.en, item.description.en || item.description.zh);

            // Skills
            const skillsLabel = element('div', undefined, 'internship-section-title');
            bilingual(skillsLabel, '核心技能', 'Key Skills');

            const skillsTags = element('div', undefined, 'internship-tags');
            item.skills.forEach(skill => {
                skillsTags.append(element('span', skill));
            });

            // Companies
            const companiesLabel = element('div', undefined, 'internship-section-title');
            bilingual(companiesLabel, '相關企業 / 實習計畫', 'Companies / Internship Programs');

            const companiesTags = element('div', undefined, 'internship-companies');
            item.companies.forEach(company => {
                companiesTags.append(element('span', company, 'company-tag'));
            });

            // Recommended Courses
            const coursesLabel = element('div', undefined, 'internship-section-title');
            bilingual(coursesLabel, '推薦先修課程', 'Recommended Courses');

            const coursesLinks = element('div', undefined, 'internship-courses');
            item.recommendedCourses.forEach(courseCode => {
                const a = element('a');
                a.href = '../course-info/workload.html?course=' + encodeURIComponent(courseCode);
                a.textContent = courseCode;
                coursesLinks.append(a);
            });

            card.append(title, desc, skillsLabel, skillsTags, companiesLabel, companiesTags, coursesLabel, coursesLinks);
            container.append(card);
        });
    }

    function initDiscussionBoard() {
        const form = byId('experience-form');
        const titleInput = byId('experience-title');
        const contentInput = byId('experience-content');
        const listContainer = byId('experience-list');
        const emptyMsg = byId('empty-experience');

        let discussions = loadDiscussions();

        function loadDiscussions() {
            try {
                const raw = localStorage.getItem(DISCUSSION_STORAGE_KEY);
                return raw ? JSON.parse(raw) : [];
            } catch {
                return [];
            }
        }

        function saveDiscussions() {
            try {
                localStorage.setItem(DISCUSSION_STORAGE_KEY, JSON.stringify(discussions));
            } catch { /* ignore */ }
        }

        function getAuthor() {
            const session = window.Portal.getSession();
            return session && session.userName ? session.userName : 'Student';
        }

        function renderDiscussions() {
            listContainer.replaceChildren();
            if (discussions.length === 0) {
                emptyMsg.hidden = false;
                return;
            }
            emptyMsg.hidden = true;

            const roots = discussions.filter(d => !d.parentId);

            for (const root of roots) {
                const thread = element('div', undefined, 'discussion-thread');

                const header = element('div', undefined, 'discussion-header');
                const h4 = element('h4', root.title);
                const meta = element('div', undefined, 'discussion-meta');
                const timeStr = new Date(root.time).toLocaleString();
                meta.textContent = `${root.author} · ${timeStr}`;
                header.append(h4, meta);

                const content = element('div', undefined, 'discussion-content');
                content.textContent = root.content;

                const footer = element('div', undefined, 'discussion-footer');
                const replyBtn = element('button', undefined, '');
                replyBtn.type = 'button';
                bilingual(replyBtn, '回覆', 'Reply');
                replyBtn.addEventListener('click', () => showReplyForm(root.id, thread));
                footer.append(replyBtn);

                const repliesContainer = element('div', undefined, 'replies-list');

                thread.append(header, content, footer, repliesContainer);
                listContainer.append(thread);

                renderReplies(root.id, repliesContainer);
            }
        }

        function renderReplies(parentId, container) {
            container.replaceChildren();
            const children = discussions.filter(d => d.parentId === parentId).sort((a, b) => a.time - b.time);

            for (const reply of children) {
                const replyEl = element('div', undefined, 'reply-item');

                const replyHeader = element('div', undefined, 'reply-header');
                const meta = element('span');
                const timeStr = new Date(reply.time).toLocaleString();
                meta.textContent = `${reply.author} · ${timeStr}`;
                replyHeader.append(meta);

                const replyContent = element('div', undefined, 'reply-content');
                replyContent.textContent = reply.content;

                const actions = element('div', undefined, 'reply-actions');
                const replyBtn = element('button');
                replyBtn.type = 'button';
                bilingual(replyBtn, '回覆', 'Reply');
                replyBtn.addEventListener('click', () => showReplyForm(reply.id, replyEl));
                actions.append(replyBtn);

                replyEl.append(replyHeader, replyContent, actions);
                container.append(replyEl);

                const subContainer = element('div', undefined, 'replies-list');
                replyEl.append(subContainer);
                renderReplies(reply.id, subContainer);
            }
        }

        function showReplyForm(parentId, container) {
            const existingForm = container.querySelector('.reply-form');
            if (existingForm) existingForm.remove();

            const formEl = element('form', undefined, 'reply-form');
            const input = element('input');
            input.type = 'text';
            input.required = true;
            input.placeholder = '輸入回覆... / Type reply...';

            const btn = element('button', undefined, 'btn-action');
            btn.type = 'submit';
            bilingual(btn, '發送', 'Send');

            formEl.append(input, btn);
            container.append(formEl);
            input.focus();

            formEl.addEventListener('submit', (e) => {
                e.preventDefault();
                const text = input.value.trim();
                if (!text) return;

                const newReply = {
                    id: crypto.randomUUID(),
                    parentId: parentId,
                    author: getAuthor(),
                    content: text,
                    time: Date.now()
                };
                discussions.push(newReply);
                saveDiscussions();
                renderDiscussions();
            });
        }

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = titleInput.value.trim();
            const content = contentInput.value.trim();
            if (!title || !content) return;

            const newDiscussion = {
                id: crypto.randomUUID(),
                parentId: null,
                author: getAuthor(),
                title: title,
                content: content,
                time: Date.now()
            };
            discussions.push(newDiscussion);
            saveDiscussions();
            form.reset();
            renderDiscussions();
        });

        document.addEventListener('portal:languagechange', () => {
            renderInternships();
            renderDiscussions();
        });

        renderDiscussions();
    }

    function init() {
        initTabs();
        renderInternships();
        initDiscussionBoard();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
