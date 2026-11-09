#!/usr/bin/env python3
"""Import CityU AIMS course/class HTML exports into the portal dataset.

What this script does
---------------------
1. Reads the saved AIMS "Courses Offered" exports in ``tools/htmls/``.
   Each course normally has a ``<CODE>-course.html`` file (sections, times,
   rooms, instructors, quotas, restrictions) and a ``<CODE>-classes.html``
   file (demand/headcount by programme).
2. Fetches the current catalogue page for each course to obtain its English
   title and description ("Course Aims"):
       https://www.cityu.edu.hk/catalogue/ug/current/course/<CODE>.htm
3. Fetches the syllabus PDF and parses the assessment tasks/weights and the
   continuous-assessment/examination split:
       https://www.cityu.edu.hk/catalogue/ug/202627/course/<CODE>.pdf
4. Translates the English title and description into Traditional Chinese with
   Google Translate, caching translations so reruns are cheap.
5. Generates deterministic sample workload/GPA/difficulty values for each
   imported course. They are seeded from the course code, so they are stable
   across runs, but they are still *sample* values, not official statistics.
6. Merges the result into ``portal/assets/js/mock-data.js``:
   - adds/updates records in ``EE4213Data.courses``;
   - gives each imported course a ``comparator`` object containing official
     section times plus derived assessment data, so the Course Comparator can
     include it immediately;
   - stores the complete official export under
     ``EE4213Data.officialOfferings``.

Important notes
---------------
* The default scope is EE courses only (the portal's subject). Use
  ``--scope all`` to import every saved subject (this is slow and produces a
  very large Course Comparator list).
* CityU's catalogue host is sometimes protected by an Incapsula challenge.
  The script first requests the page directly and falls back to the public
  r.jina.ai text reader. You can disable that fallback with ``--no-jina``.
* A translation or network failure does not abort the import by default; the
  script logs the failure and keeps the English/computed data. Use ``--strict``
  if you want missing descriptions/assessments to stop the run.
* This tool is intentionally standalone and uses only the Python standard
  library. ``pdftotext`` (poppler) or ``pypdf`` is optional but preferred for
  parsing downloaded PDFs; otherwise the script uses the Jina text fallback.

Examples
--------
    # Preview the first two EE courses without touching mock-data.js
    python tools/import_course_exports.py --scope ee --limit 2 --dry-run

    # Normal run: enrich/import all EE courses
    python tools/import_course_exports.py --scope ee

    # Skip translation and network fetches (only use cached/downloaded data)
    python tools/import_course_exports.py --scope ee --no-translate --offline

    # Import every subject from tools/htmls
    python tools/import_course_exports.py --scope all
"""

from __future__ import annotations

import argparse
import hashlib
import io
import json
import logging
import os
import random
import re
import shutil
import subprocess
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from typing import Any, Iterable

LOGGER = logging.getLogger("import_course_exports")

DEFAULT_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_HTML_DIR = DEFAULT_ROOT / "tools" / "htmls"
DEFAULT_MOCK_DATA = DEFAULT_ROOT / "portal" / "assets" / "js" / "mock-data.js"
DEFAULT_PREVIEW = DEFAULT_ROOT / "tools" / "official-import-preview.json"

CATALOGUE_TEMPLATE = "https://www.cityu.edu.hk/catalogue/ug/current/course/{code}.htm"
SYLLABUS_TEMPLATES = (
    "https://www.cityu.edu.hk/catalogue/ug/202627/course/{code}.pdf",
    "https://www.cityu.edu.hk/ug/202627/course/{code}.pdf",
)
TRANSLATE_ENDPOINT = "https://translate.googleapis.com/translate_a/single"
JINA_PREFIX = "https://r.jina.ai/"
USER_AGENT = (
    "EE4213-course-import/1.0 "
    "(prototype data importer; contact: project maintainer)"
)

COURSE_FILE_RE = re.compile(r"^(?P<code>[A-Za-z]{2,6}\d{3,4}[A-Za-z]?)-course\.html$")
AS_OF_RE = re.compile(
    r"As of\s+([A-Z][a-z]+ +\d{1,2}, +\d{4} +\d{1,2}:\d{2}\s*[AP]M)"
)
TERM_RE = re.compile(r"Courses Offered in\s+Semester\s+([AB])\s+(\d{4}/\d{2})", re.I)
BLOCK_TAGS = {
    "address", "article", "aside", "blockquote", "br", "dd", "div", "dl", "dt",
    "fieldset", "figcaption", "figure", "footer", "form", "h1", "h2", "h3", "h4",
    "h5", "h6", "header", "hr", "li", "main", "nav", "ol", "p", "pre", "section",
    "table", "tbody", "td", "tfoot", "th", "thead", "tr", "ul",
}


# ---------------------------------------------------------------------------
# Basic text/HTML helpers
# ---------------------------------------------------------------------------


def clean_inline(value: str | None) -> str:
    """Collapse HTML whitespace to a single line."""
    if not value:
        return ""
    return re.sub(r"\s+", " ", value.replace("\xa0", " ")).strip()


def normalize_text(value: str | None) -> str:
    """Normalize whitespace while preserving meaningful line breaks."""
    if not value:
        return ""
    value = value.replace("\xa0", " ")
    lines: list[str] = []
    for line in value.splitlines():
        line = clean_inline(line)
        if line:
            lines.append(line)
    return "\n".join(lines)


class ExportHTMLParser(HTMLParser):
    """Small standard-library parser for AIMS-style tables and bold labels."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.tables: list[list[list[str]]] = []
        self.b_texts: list[str] = []
        self.text_parts: list[str] = []
        self._table_depth = 0
        self._table: list[list[str]] | None = None
        self._row: list[str] | None = None
        self._cell: list[str] | None = None
        self._b_depth = 0
        self._b_buffer: list[str] = []
        self._skip_depth = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        tag = tag.lower()
        if tag in {"script", "style"}:
            self._skip_depth += 1
            return
        if self._skip_depth:
            return

        if tag == "table":
            if self._table_depth == 0:
                self._table = []
            self._table_depth += 1
        elif self._table_depth == 1 and tag == "tr":
            self._row = []
        elif self._table_depth == 1 and tag in {"td", "th"}:
            self._cell = []
        elif tag == "b":
            self._b_depth += 1
            if self._b_depth == 1:
                self._b_buffer = []
        if tag in BLOCK_TAGS:
            self.text_parts.append("\n")

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        if tag in {"script", "style"}:
            if self._skip_depth:
                self._skip_depth -= 1
            return
        if self._skip_depth:
            return

        if tag == "b" and self._b_depth:
            self._b_depth -= 1
            if self._b_depth == 0:
                text = clean_inline("".join(self._b_buffer))
                if text:
                    self.b_texts.append(text)
                self._b_buffer = []
        elif tag in {"td", "th"} and self._cell is not None:
            if self._row is not None:
                self._row.append(clean_inline("".join(self._cell)))
            self._cell = None
        elif tag == "tr" and self._table_depth == 1:
            if self._table is not None and self._row:
                self._table.append(self._row)
            self._row = None
        elif tag == "table":
            if self._table_depth:
                self._table_depth -= 1
            if self._table_depth == 0 and self._table is not None:
                self.tables.append(self._table)
                self._table = None
        if tag in BLOCK_TAGS:
            self.text_parts.append("\n")

    def handle_data(self, data: str) -> None:
        if self._skip_depth:
            return
        self.text_parts.append(data)
        if self._b_depth:
            self._b_buffer.append(data)
        if self._cell is not None:
            self._cell.append(data)

    @property
    def text(self) -> str:
        return normalize_text("".join(self.text_parts))


def parse_html(raw: str) -> ExportHTMLParser:
    parser = ExportHTMLParser()
    parser.feed(raw)
    parser.close()
    return parser


# ---------------------------------------------------------------------------
# Network/cache helpers
# ---------------------------------------------------------------------------


class FetchError(RuntimeError):
    pass


def _request(url: str, *, headers: dict[str, str] | None = None, timeout: int = 45) -> bytes:
    request_headers = {"User-Agent": USER_AGENT, "Accept": "*/*"}
    if headers:
        request_headers.update(headers)
    request = urllib.request.Request(url, headers=request_headers)
    with urllib.request.urlopen(request, timeout=timeout) as response:
        return response.read(12 * 1024 * 1024)


def _is_incapsula_block(payload: bytes) -> bool:
    if len(payload) > 4096:
        return False
    lowered = payload.lower()
    return b"incapsula_resource" in lowered or b"noindex,nofollow" in lowered


def fetch_bytes(url: str, *, retries: int = 3, delay: float = 0.8) -> bytes:
    last_error: Exception | None = None
    for attempt in range(1, retries + 1):
        try:
            payload = _request(url)
            if _is_incapsula_block(payload):
                raise FetchError("blocked by the CityU Incapsula challenge")
            return payload
        except urllib.error.HTTPError as exc:
            last_error = exc
            if exc.code == 404:
                break
            if attempt < retries:
                time.sleep(delay * attempt)
        except Exception as exc:  # urllib raises several unrelated types
            last_error = exc
            if attempt < retries:
                time.sleep(delay * attempt)
    raise FetchError(f"could not fetch {url}: {last_error}")


def fetch_jina_text(url: str, *, retries: int = 3, delay: float = 1.0) -> str:
    headers = {"X-Return-Format": "text", "Accept": "text/plain"}
    api_key = os.environ.get("JINA_API_KEY")
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"
    last_error: Exception | None = None
    for attempt in range(1, retries + 1):
        try:
            payload = _request(
                JINA_PREFIX + url,
                headers=headers,
                timeout=90,
            )
            text = payload.decode("utf-8", errors="replace").strip()
            if not text or "rate limit" in text.lower() and len(text) < 500:
                raise FetchError(f"Jina returned an empty/limited response for {url}")
            return text
        except Exception as exc:
            last_error = exc
            if attempt < retries:
                time.sleep(delay * attempt)
    raise FetchError(f"Jina reader failed for {url}: {last_error}")


@dataclass
class Cache:
    directory: Path
    refresh: bool = False

    def path(self, kind: str, code: str, suffix: str = ".txt") -> Path:
        target = self.directory / kind
        target.mkdir(parents=True, exist_ok=True)
        return target / f"{code}{suffix}"

    def read(self, kind: str, code: str, suffix: str = ".txt") -> str | None:
        if self.refresh:
            return None
        target = self.path(kind, code, suffix)
        if target.exists() and target.stat().st_size:
            return target.read_text(encoding="utf-8", errors="replace")
        return None

    def write(self, kind: str, code: str, value: str, suffix: str = ".txt") -> None:
        target = self.path(kind, code, suffix)
        target.write_text(value, encoding="utf-8")


def fetch_catalogue_text(
    code: str,
    cache: Cache,
    *,
    use_jina: bool,
    delay: float,
) -> tuple[str, str]:
    cached = cache.read("catalogue", code)
    if cached is not None:
        return cached, "cache"

    url = CATALOGUE_TEMPLATE.format(code=code)
    try:
        payload = fetch_bytes(url)
        text = payload.decode("utf-8", errors="replace")
        if "<html" in text.lower() and "<title" in text.lower():
            text = parse_html(text).text
        if "Course Aims" not in text and use_jina:
            raise FetchError("page did not contain a catalogue Course Aims section")
        if "Course Aims" not in text:
            raise FetchError("page did not contain a catalogue Course Aims section")
        cache.write("catalogue", code, text)
        return text, "direct"
    except Exception as exc:
        if not use_jina:
            raise
        LOGGER.debug("%s: direct catalogue fetch failed (%s); trying Jina", code, exc)

    time.sleep(delay)
    text = fetch_jina_text(url)
    cache.write("catalogue", code, text)
    return text, "jina"


def _extract_pdf_with_command(path: Path) -> str | None:
    executable = shutil.which("pdftotext")
    if not executable:
        return None
    try:
        result = subprocess.run(
            [executable, "-layout", str(path), "-"],
            capture_output=True,
            text=True,
            timeout=90,
            check=False,
        )
    except Exception as exc:
        LOGGER.debug("pdftotext failed: %s", exc)
        return None
    if result.returncode != 0 or not result.stdout.strip():
        return None
    return result.stdout


def _extract_pdf_with_pypdf(payload: bytes) -> str | None:
    try:
        from pypdf import PdfReader  # type: ignore
    except Exception:
        try:
            from PyPDF2 import PdfReader  # type: ignore
        except Exception:
            return None
    try:
        reader = PdfReader(io.BytesIO(payload))
        pages = [(page.extract_text() or "") for page in reader.pages]
        return "\n".join(pages).strip() or None
    except Exception as exc:
        LOGGER.debug("pypdf extraction failed: %s", exc)
        return None


def fetch_syllabus_text(
    code: str,
    cache: Cache,
    *,
    use_jina: bool,
    delay: float,
) -> tuple[str, str, str | None]:
    cached = cache.read("syllabus", code)
    if cached is not None:
        return cached, "cache", SYLLABUS_TEMPLATES[0].format(code=code)

    last_error: Exception | None = None
    for template in SYLLABUS_TEMPLATES:
        url = template.format(code=code)
        try:
            payload = fetch_bytes(url)
            if not payload.startswith(b"%PDF"):
                raise FetchError("response was not a PDF")
            text = None
            with tempfile.NamedTemporaryFile(
                prefix=f"{code}-", suffix=".pdf", delete=False
            ) as handle:
                handle.write(payload)
                handle.flush()
                temporary_pdf = Path(handle.name)
            try:
                text = _extract_pdf_with_command(temporary_pdf)
            finally:
                temporary_pdf.unlink(missing_ok=True)
            if not text:
                text = _extract_pdf_with_pypdf(payload)
            if not text:
                raise FetchError("no local PDF text extractor available")
            cache.write("syllabus", code, text)
            return text, "direct-pdf", url
        except Exception as exc:
            last_error = exc
            LOGGER.debug("%s: direct syllabus fetch failed for %s (%s)", code, url, exc)

    if not use_jina:
        raise FetchError(f"could not fetch syllabus PDF for {code}: {last_error}")

    time.sleep(delay)
    for template in SYLLABUS_TEMPLATES:
        url = template.format(code=code)
        try:
            text = fetch_jina_text(url)
            cache.write("syllabus", code, text)
            return text, "jina-pdf", url
        except Exception as exc:
            last_error = exc
            LOGGER.debug("%s: Jina syllabus fetch failed for %s (%s)", code, url, exc)
    raise FetchError(f"could not fetch syllabus text for {code}: {last_error}")


# ---------------------------------------------------------------------------
# Translation
# ---------------------------------------------------------------------------


class Translator:
    def __init__(
        self,
        cache_path: Path,
        *,
        target: str = "zh-TW",
        enabled: bool = True,
        delay: float = 0.35,
        offline: bool = False,
    ) -> None:
        self.cache_path = cache_path
        self.target = target
        self.enabled = enabled
        self.delay = delay
        self.offline = offline
        self._cache: dict[str, str] = {}
        self._dirty = False
        if cache_path.exists():
            try:
                raw = json.loads(cache_path.read_text(encoding="utf-8"))
                if isinstance(raw, dict):
                    self._cache = {str(k): str(v) for k, v in raw.items()}
            except Exception as exc:
                LOGGER.warning("Could not read translation cache %s: %s", cache_path, exc)

    @staticmethod
    def _key(text: str, target: str) -> str:
        return hashlib.sha256(f"{target}\0{text}".encode("utf-8")).hexdigest()

    def translate(self, text: str) -> str | None:
        text = clean_inline(text)
        if not text:
            return ""
        if not self.enabled:
            return None
        key = self._key(text, self.target)
        if key in self._cache:
            return self._cache[key]
        if self.offline:
            return None

        chunks = self._split(text, 4000)
        translated_chunks: list[str] = []
        for chunk in chunks:
            translated = self._request(chunk)
            if translated is None:
                return None
            translated_chunks.append(translated)
            time.sleep(self.delay)
        result = clean_inline(" ".join(translated_chunks))
        self._cache[key] = result
        self._dirty = True
        return result

    @staticmethod
    def _split(text: str, limit: int) -> list[str]:
        if len(text) <= limit:
            return [text]
        sentences = re.split(r"(?<=[.!?])\s+", text)
        chunks: list[str] = []
        current: list[str] = []
        size = 0
        for sentence in sentences:
            if len(sentence) > limit:
                if current:
                    chunks.append(" ".join(current))
                    current, size = [], 0
                chunks.extend(sentence[i : i + limit] for i in range(0, len(sentence), limit))
                continue
            if size + len(sentence) + 1 > limit and current:
                chunks.append(" ".join(current))
                current, size = [], 0
            current.append(sentence)
            size += len(sentence) + 1
        if current:
            chunks.append(" ".join(current))
        return chunks

    def _request(self, text: str) -> str | None:
        params = urllib.parse.urlencode(
            {
                "client": "gtx",
                "sl": "en",
                "tl": self.target,
                "dt": "t",
                "q": text,
            }
        )
        url = f"{TRANSLATE_ENDPOINT}?{params}"
        for attempt in range(1, 4):
            try:
                payload = _request(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=30)
                data = json.loads(payload.decode("utf-8"))
                segments = data[0] if data and isinstance(data[0], list) else []
                translated = "".join(
                    segment[0]
                    for segment in segments
                    if isinstance(segment, list) and segment and segment[0]
                )
                if translated:
                    return translated
            except Exception as exc:
                LOGGER.debug("Translation attempt %s failed: %s", attempt, exc)
                time.sleep(1.0 * attempt)
        return None

    def save(self) -> None:
        if not self._dirty:
            return
        self.cache_path.parent.mkdir(parents=True, exist_ok=True)
        self.cache_path.write_text(
            json.dumps(self._cache, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )


# ---------------------------------------------------------------------------
# Parsing AIMS exports
# ---------------------------------------------------------------------------


@dataclass
class Meeting:
    date_range: str = ""
    day: str = ""
    time: str = ""
    building: str = ""
    room: str = ""

    def as_dict(self) -> dict[str, str]:
        return {
            "dateRange": self.date_range,
            "day": self.day,
            "time": self.time,
            "building": self.building,
            "room": self.room,
        }


@dataclass
class Section:
    crn: str
    section: str
    credit_units: str = ""
    campus: str = ""
    web: str = ""
    level: str = ""
    available: str = ""
    capacity: str = ""
    waitlist_available: str = ""
    instructor: str = ""
    medium_of_instruction: str = ""
    meetings: list[Meeting] = field(default_factory=list)
    programmes: list[str] = field(default_factory=list)
    majors: list[str] = field(default_factory=list)

    @property
    def section_type(self) -> str:
        code = self.section.strip().upper()
        if code.startswith("C"):
            return "Class"
        if code.startswith("L"):
            return "Lab"
        if code.startswith("T"):
            return "Tutorial"
        if code.startswith("P"):
            return "Project"
        if code.startswith("S"):
            return "Seminar"
        return "Class"

    def as_dict(self) -> dict[str, Any]:
        return {
            "crn": self.crn,
            "section": self.section,
            "creditUnits": self.credit_units,
            "campus": self.campus,
            "web": self.web,
            "level": self.level,
            "available": self.available,
            "capacity": self.capacity,
            "waitlistAvailable": self.waitlist_available,
            "instructor": self.instructor,
            "mediumOfInstruction": self.medium_of_instruction,
            "meetings": [meeting.as_dict() for meeting in self.meetings],
            "restrictions": {
                "programmes": self.programmes,
                "majors": self.majors,
            },
        }


@dataclass
class CourseExport:
    code: str
    title: str
    term: str
    as_of: str
    offering_unit: str
    prerequisites: str
    exclusive_courses: str
    sections: list[Section]
    demand_rows: list[dict[str, str]]
    total_registration: int | None

    @property
    def credit_units(self) -> int | float | None:
        values: list[float] = []
        for section in self.sections:
            try:
                values.append(float(section.credit_units))
            except (TypeError, ValueError):
                continue
        nonzero = [value for value in values if value > 0]
        if nonzero:
            value = max(nonzero)
            return int(value) if value.is_integer() else value
        return None

    @property
    def has_lab(self) -> bool:
        return any(section.section.upper().startswith("L") for section in self.sections)


def parse_course_export(path: Path) -> CourseExport:
    parser = parse_html(path.read_text(encoding="utf-8", errors="replace"))
    text = parser.text
    code = path.name[: -len("-course.html")]

    title = ""
    for bold in parser.b_texts:
        match = re.match(
            r"Course\s*:\s*([A-Za-z]{2,6}\d{3,4}[A-Za-z]?)\s+(.*)", bold
        )
        if match:
            code = match.group(1).upper()
            title = clean_inline(match.group(2))
            break

    offering_unit = ""
    prerequisites = ""
    exclusive_courses = ""
    for index, bold in enumerate(parser.b_texts):
        next_text = parser.b_texts[index + 1] if index + 1 < len(parser.b_texts) else ""
        if bold.startswith("Offering Academic Unit:"):
            offering_unit = clean_inline(bold.split(":", 1)[1])
        elif bold.startswith("Pre-requisites"):
            prerequisites = clean_inline(next_text)
        elif bold.startswith("Exclusive Course"):
            exclusive_courses = clean_inline(next_text)

    term_match = TERM_RE.search(text)
    term = (
        f"Semester {term_match.group(1).upper()} {term_match.group(2)}"
        if term_match
        else ""
    )
    as_of_match = AS_OF_RE.search(text)
    as_of = clean_inline(as_of_match.group(1)) if as_of_match else ""

    schedule_table: list[list[str]] | None = None
    for table in parser.tables:
        for row in table[:3]:
            if any(clean_inline(cell).upper() == "CRN" for cell in row):
                schedule_table = table
                break
        if schedule_table is not None:
            break

    sections: list[Section] = []
    current: Section | None = None
    if schedule_table:
        for row in schedule_table:
            cells = [clean_inline(cell) for cell in row]
            if not cells:
                continue
            joined = " ".join(cells)
            if "only for Programme:" in joined or "only for Major:" in joined:
                if current is None:
                    continue
                programme_match = re.search(r"only for Programme:\s*(.*)", joined, re.I)
                major_match = re.search(r"only for Major:\s*(.*)", joined, re.I)
                if programme_match:
                    for value in re.split(r"[,;]", programme_match.group(1)):
                        value = value.strip()
                        if value and value not in current.programmes:
                            current.programmes.append(value)
                if major_match:
                    for value in re.split(r"[,;]", major_match.group(1)):
                        value = value.strip()
                        if value and value not in current.majors:
                            current.majors.append(value)
                continue

            if len(cells) >= 16:
                crn, section_code = cells[0], cells[1]
                if crn and section_code and crn.upper() != "CRN":
                    current = Section(
                        crn=crn,
                        section=section_code,
                        credit_units=cells[2],
                        campus=cells[3],
                        web=cells[4],
                        level=cells[5],
                        available=_clean_availability(cells[6]),
                        capacity=cells[7],
                        waitlist_available=cells[8],
                        instructor=cells[14],
                        medium_of_instruction=cells[15],
                    )
                    sections.append(current)
                    _append_meeting(current, cells)
                elif current is not None:
                    _append_meeting(current, cells)

    demand_rows: list[dict[str, str]] = []
    total_registration: int | None = None
    classes_path = path.with_name(f"{code}-classes.html")
    if classes_path.exists():
        classes = parse_classes_export(classes_path)
        demand_rows = classes["rows"]
        total_registration = classes["total"]

    return CourseExport(
        code=code,
        title=title,
        term=term,
        as_of=as_of,
        offering_unit=offering_unit,
        prerequisites=prerequisites or "Nil",
        exclusive_courses=exclusive_courses or "Nil",
        sections=sections,
        demand_rows=demand_rows,
        total_registration=total_registration,
    )


def _clean_availability(value: str) -> str:
    value = clean_inline(value).lstrip(": ").strip()
    if re.search(r"full", value, re.I) or value.lower().startswith("ful"):
        return "Full"
    return value


def _append_meeting(section: Section, cells: list[str]) -> None:
    meeting = Meeting(
        date_range=cells[9] if len(cells) > 9 else "",
        day=cells[10] if len(cells) > 10 else "",
        time=cells[11] if len(cells) > 11 else "",
        building=cells[12] if len(cells) > 12 else "",
        room=cells[13] if len(cells) > 13 else "",
    )
    if any(
        [meeting.date_range, meeting.day, meeting.time, meeting.building, meeting.room]
    ):
        section.meetings.append(meeting)


def parse_classes_export(path: Path) -> dict[str, Any]:
    parser = parse_html(path.read_text(encoding="utf-8", errors="replace"))
    text = parser.text
    total_match = re.search(r"Total Registration in Course\s*:\s*(\d+)", text, re.I)
    total = int(total_match.group(1)) if total_match else None
    rows: list[dict[str, str]] = []
    for table in parser.tables:
        for row in table:
            if len(row) < 4:
                continue
            cells = [clean_inline(cell) for cell in row]
            if cells[0].lower() == "programme":
                continue
            if not any(cells[:4]):
                continue
            if not re.fullmatch(r"\d+", cells[3] or ""):
                continue
            rows.append(
                {
                    "programme": cells[0],
                    "major": cells[1],
                    "cohort": cells[2],
                    "headcount": cells[3],
                }
            )
        if rows:
            break
    return {"total": total, "rows": rows}


# ---------------------------------------------------------------------------
# Parsing catalogue pages and syllabus PDFs
# ---------------------------------------------------------------------------


@dataclass
class CatalogueInfo:
    title: str = ""
    description: str = ""
    offering_term: str = ""
    credit_units: int | float | None = None
    continuous_assessment: int | None = None
    examination: int | None = None
    examination_duration_hours: float | None = None


@dataclass
class AssessmentInfo:
    continuous_assessment: int | None = None
    examination: int | None = None
    examination_duration_hours: float | None = None
    tasks: list[dict[str, Any]] = field(default_factory=list)
    source: str = ""
    abstract: str = ""


def parse_catalogue_text(text: str, code: str) -> CatalogueInfo:
    text = normalize_text(text)
    info = CatalogueInfo()

    title_match = re.search(
        rf"(?m)^\s*{re.escape(code)}\s*-\s*(.+?)\s*$", text, re.I
    )
    if title_match:
        info.title = clean_inline(title_match.group(1))

    aims_match = re.search(
        r"Course Aims\s*(.*?)\s*Assessment\s*\(Indicative", text, re.S | re.I
    )
    if aims_match:
        info.description = clean_inline(
            re.sub(r"\*{2,}", " ", aims_match.group(1))
        )

    term_match = re.search(
        r"Course Offering Term\*?:?\s*(.+?)(?:\n|$)", text, re.I
    )
    if term_match:
        info.offering_term = clean_inline(term_match.group(1))

    credit_match = re.search(r"Credit Units\s+(\d+(?:\.\d+)?)", text, re.I)
    if credit_match:
        info.credit_units = _to_number(credit_match.group(1))

    ca_match = re.search(r"Continuous Assessment:\s*(\d{1,3})%", text, re.I)
    if ca_match:
        info.continuous_assessment = int(ca_match.group(1))
    exam_match = re.search(r"Examination:\s*(\d{1,3})%", text, re.I)
    if exam_match:
        info.examination = int(exam_match.group(1))
    duration_match = re.search(
        r"Examination Duration:\s*(\d+(?:\.\d+)?)\s*hours?", text, re.I
    )
    if duration_match:
        info.examination_duration_hours = _to_number(duration_match.group(1))

    return info


def parse_syllabus_text(text: str, code: str) -> AssessmentInfo:
    text = normalize_text(text)
    info = AssessmentInfo()

    abstract_match = re.search(
        r"\bAbstract\s*(.*?)\s*Course Intended Learning Outcomes",
        text,
        re.S | re.I,
    )
    if abstract_match:
        # Kept only in the official record; the caller may use it as a
        # description fallback. PDF extraction sometimes merges the running
        # page header into the "Abstract" line.
        abstract = abstract_match.group(1)
        abstract = re.sub(
            rf"^\s*\d{{1,3}}\s+{re.escape(code)}\b[^\n]*\n?",
            "",
            abstract,
            count=1,
            flags=re.I,
        )
        info.abstract = clean_inline(abstract)

    ca_match = re.search(r"Continuous Assessment \(%\)\s*(\d{1,3})", text, re.I)
    if ca_match:
        info.continuous_assessment = int(ca_match.group(1))
    exam_match = re.search(r"Examination \(%\)\s*(\d{1,3})", text, re.I)
    if exam_match:
        info.examination = int(exam_match.group(1))
    duration_match = re.search(
        r"Examination Duration \(Hours\)\s*(\d+(?:\.\d+)?)", text, re.I
    )
    if duration_match:
        info.examination_duration_hours = _to_number(duration_match.group(1))

    start_match = re.search(
        r"Assessment Tasks / Activities \(ATs\)", text, re.I
    )
    end_match = re.search(r"Continuous Assessment \(%\)", text, re.I)
    if start_match and end_match and end_match.start() > start_match.end():
        block = text[start_match.end() : end_match.start()]
        info.tasks = _parse_assessment_tasks(block)
    info.source = "syllabus-pdf" if info.tasks or ca_match else ""
    return info


def _parse_assessment_tasks(block: str) -> list[dict[str, Any]]:
    lines = [clean_inline(line) for line in block.splitlines() if clean_inline(line)]
    # Drop the table header, including the wrapped "Allow Use of / GenAI?" cell.
    start_index = 0
    for index, line in enumerate(lines):
        if "GenAI" in line:
            start_index = index + 1
    lines = lines[start_index:]

    tasks: list[dict[str, Any]] = []
    current: list[str] = []

    def flush() -> None:
        nonlocal current
        if not current:
            return
        value = clean_inline(" ".join(current))
        current = []
        # Remove a page footer that got appended to the row.
        value = re.sub(r"\d{1,3}\s+[A-Z]{2,6}\d{3,4}[A-Z]?\b.*$", "", value).strip()
        # Drop the trailing "Remarks" / "Allow Use of GenAI?" columns.
        value = re.sub(r"\s+-\s*(?:Yes|No)\s*$", "", value, flags=re.I).strip()
        value = re.sub(r"\s+(?:Yes|No)\s*$", "", value, flags=re.I).strip()
        value = re.sub(r"\s+-\s*$", "", value).strip()
        value = re.sub(r"^\d{1,2}\s+", "", value).strip()
        if not value:
            return
        match = re.match(
            r"^(.*?)\s+((?:\d{1,2}\s*,\s*)*\d{1,2})\s+(\d{1,3})$", value
        )
        if match:
            label, cilos, weight = match.groups()
        else:
            match = re.match(r"^(.*?)\s+(\d{1,3})$", value)
            if not match:
                return
            label, cilos, weight = match.group(1), "", match.group(2)
        weight_value = int(weight)
        if weight_value > 100:
            return
        label = clean_inline(label)
        if not label:
            return
        tasks.append(
            {
                "label": label,
                "cilos": clean_inline(cilos),
                "weight": weight_value,
                "component": _assessment_component(label),
            }
        )

    for line in lines:
        if re.match(r"^\d{1,3}\s+[A-Z]{2,6}\d{3,4}[A-Z]?\b", line):
            # Page footer written as its own line, e.g. "3 EE4216: ...".
            continue
        if re.match(r"^\d{1,2}\s+(?![,\d])", line):
            flush()
            current = [line]
        elif current:
            # Wrapped label/CILO/weight lines belong to the current task.
            current.append(line)
    flush()
    return [task for task in tasks if task.get("weight") is not None]


def _assessment_component(label: str) -> str:
    lowered = label.lower()
    if "exam" in lowered:
        return "final"
    if "test" in lowered or "quiz" in lowered or "midterm" in lowered:
        return "midterm"
    if "project" in lowered or "mini-project" in lowered:
        return "project"
    if "assignment" in lowered or "homework" in lowered or "report" in lowered:
        return "assignments"
    return "other"


def _to_number(value: str) -> int | float | None:
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    return int(number) if number.is_integer() else number


# ---------------------------------------------------------------------------
# Comparator derivation
# ---------------------------------------------------------------------------


def normalize_day(value: str) -> str | None:
    token = re.sub(r"[^A-Za-z]", "", value or "").upper()
    mapping = {
        "M": "M", "MO": "M", "MON": "M", "MONDAY": "M",
        "T": "T", "TU": "T", "TUE": "T", "TUES": "T", "TUESDAY": "T",
        "W": "W", "WE": "W", "WED": "W", "WEDNESDAY": "W",
        "TH": "Th", "THU": "Th", "THUR": "Th", "THURS": "Th", "THURSDAY": "Th",
        "F": "F", "FR": "F", "FRI": "F", "FRIDAY": "F",
        "S": "S", "SA": "S", "SAT": "S", "SATURDAY": "S",
        "SU": "SU", "SUN": "SU", "SUNDAY": "SU",
    }
    return mapping.get(token)


def comparator_meetings(sections: Iterable[Section]) -> list[dict[str, Any]]:
    seen: set[tuple[str, str, str, str]] = set()
    meetings: list[dict[str, Any]] = []
    for section in sections:
        for meeting in section.meetings:
            day = normalize_day(meeting.day)
            if not day or not re.search(r"\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}", meeting.time):
                continue
            location = clean_inline(
                " ".join(part for part in (meeting.building, meeting.room) if part)
            ) or "TBA"
            key = (section.section_type, day, meeting.time, location)
            if key in seen:
                continue
            seen.add(key)
            meetings.append(
                {
                    "type": section.section_type,
                    "time": meeting.time,
                    "days": [day],
                    "location": location,
                    # Extra fields are ignored by the comparator but useful for
                    # auditing the imported data.
                    "crn": section.crn,
                    "section": section.section,
                    "dateRange": meeting.date_range,
                    "instructor": section.instructor,
                }
            )
    return meetings


def grading_components(info: AssessmentInfo) -> dict[str, int]:
    totals: dict[str, int] = defaultdict(int)
    for task in info.tasks:
        component = task.get("component") or "other"
        totals[component] += int(task.get("weight") or 0)
    # The ATs table lists the continuous-assessment components; the separate
    # "Examination (%)" row is normally not repeated inside the table.
    if info.examination and "final" not in totals:
        totals["final"] += int(info.examination)
    if not totals:
        if info.continuous_assessment is not None:
            totals["assignments"] += int(info.continuous_assessment)
        if info.examination is not None:
            totals["final"] += int(info.examination)
    return {key: value for key, value in totals.items() if value}


def assessment_load(info: AssessmentInfo) -> str:
    ca = info.continuous_assessment or 0
    exam = info.examination or 0
    tasks = len(info.tasks)
    if not ca and tasks:
        ca = sum(int(task.get("weight") or 0) for task in info.tasks)
    if exam >= 60 or ca >= 70 or tasks >= 5:
        return "Very High"
    if ca >= 50 or tasks >= 3 or exam >= 50:
        return "High"
    if ca >= 30:
        return "Moderate"
    return "Low"


def generated_sample_scores(code: str) -> dict[str, Any]:
    seed = int(hashlib.sha256(f"EE4213:{code}".encode("utf-8")).hexdigest()[:16], 16)
    rng = random.Random(seed)
    workload = round(rng.uniform(2.6, 4.9), 1)
    gpa = round(rng.uniform(2.0, 4.0), 2)
    difficulty = rng.randint(2, 5)
    study_hours = max(4, min(18, round(workload * 3 + rng.uniform(-1.5, 1.5))))
    return {
        "sampleWorkload": workload,
        "sampleMeanGpa": gpa,
        "difficulty": difficulty,
        "expectedStudyHoursPerWeek": int(study_hours),
    }


def sanitize_assessment_percentages(
    assessment: AssessmentInfo, catalogue: CatalogueInfo
) -> None:
    """Keep PDF totals only when they are plausible percentages.

    PDF text extraction occasionally fuses the total with the running page
    number (for example ``65`` + ``3`` becomes ``653``).  In that case the
    catalogue page's candidate totals are used instead.
    """

    def valid(value: int | None) -> bool:
        return value is not None and 0 <= value <= 100

    if not valid(assessment.continuous_assessment):
        assessment.continuous_assessment = catalogue.continuous_assessment
    if not valid(assessment.examination):
        assessment.examination = catalogue.examination
    if assessment.continuous_assessment is None:
        assessment.continuous_assessment = catalogue.continuous_assessment
    if assessment.examination is None:
        assessment.examination = catalogue.examination
    if assessment.examination_duration_hours is None:
        assessment.examination_duration_hours = catalogue.examination_duration_hours
    if assessment.continuous_assessment is None and assessment.tasks:
        assessment.continuous_assessment = sum(
            int(task.get("weight") or 0) for task in assessment.tasks
        )


def build_official_record(
    export: CourseExport,
    catalogue: CatalogueInfo,
    assessment: AssessmentInfo,
    *,
    catalogue_url: str,
    syllabus_url: str | None,
) -> dict[str, Any]:
    description = catalogue.description
    if not description:
        description = clean_inline(getattr(assessment, "abstract", ""))
    return {
        "courseId": export.code,
        "title": catalogue.title or export.title,
        "offeringUnit": export.offering_unit,
        "term": export.term,
        "asOf": export.as_of,
        "prerequisites": export.prerequisites,
        "exclusiveCourses": export.exclusive_courses,
        "catalogueUrl": catalogue_url,
        "syllabusUrl": syllabus_url,
        "catalogue": {
            "title": catalogue.title,
            "description": description,
            "offeringTerm": catalogue.offering_term,
            "creditUnits": catalogue.credit_units,
            "continuousAssessment": catalogue.continuous_assessment,
            "examination": catalogue.examination,
            "examinationDurationHours": catalogue.examination_duration_hours,
        },
        "assessment": {
            "continuousAssessment": assessment.continuous_assessment,
            "examination": assessment.examination,
            "examinationDurationHours": assessment.examination_duration_hours,
            "tasks": assessment.tasks,
            "source": assessment.source or "catalogue",
        },
        "sections": [section.as_dict() for section in export.sections],
        "demand": {
            "totalRegistration": export.total_registration,
            "rows": export.demand_rows,
        },
    }


# ---------------------------------------------------------------------------
# Merging into mock-data.js
# ---------------------------------------------------------------------------


def load_mock_data(path: Path) -> tuple[dict[str, Any], str, str]:
    text = path.read_text(encoding="utf-8")
    marker = "const data = "
    marker_index = text.find(marker)
    if marker_index == -1:
        raise ValueError(f"Could not find '{marker}' in {path}")
    start = text.find("{", marker_index + len(marker))
    if start == -1:
        raise ValueError(f"Could not find the data object in {path}")
    end = _find_matching_brace(text, start)
    payload = json.loads(text[start : end + 1])
    if not isinstance(payload, dict) or not isinstance(payload.get("courses"), list):
        raise ValueError(f"{path} does not contain an EE4213Data-compatible object")
    return payload, text[:start], text[end + 1 :]


def _find_matching_brace(text: str, start: int) -> int:
    depth = 0
    in_string = False
    escaped = False
    for index in range(start, len(text)):
        char = text[index]
        if in_string:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == '"':
                in_string = False
            continue
        if char == '"':
            in_string = True
        elif char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                return index
    raise ValueError("Unbalanced braces in mock-data.js")


def save_mock_data(
    path: Path,
    data: dict[str, Any],
    prefix: str,
    suffix: str,
    *,
    backup: bool = True,
) -> None:
    if backup and path.exists():
        backup_path = path.with_suffix(path.suffix + ".bak")
        if not backup_path.exists():
            shutil.copy2(path, backup_path)
            LOGGER.info("Backup written to %s", backup_path)
        else:
            LOGGER.info("Keeping existing backup at %s", backup_path)
    payload = json.dumps(data, ensure_ascii=False, indent=4)
    temporary = path.with_name(path.name + ".tmp")
    temporary.write_text(prefix + payload + suffix, encoding="utf-8")
    temporary.replace(path)


def merge_into_dataset(
    data: dict[str, Any],
    records: dict[str, dict[str, Any]],
    *,
    term: str,
    as_of: str,
    translator: Translator,
    translate_enabled: bool,
) -> list[str]:
    courses = data.setdefault("courses", [])
    by_id = {course.get("courseId"): course for course in courses if course.get("courseId")}
    imported_codes: list[str] = []

    for code, record in records.items():
        catalogue = record["catalogue"]
        assessment = record["assessment"]
        scores = generated_sample_scores(code)
        existing = by_id.get(code)

        title_en = clean_inline(catalogue.get("title") or record.get("title") or code)
        description_en = clean_inline(catalogue.get("description") or "")

        existing_titles = existing.get("titles", {}) if existing else {}
        existing_descriptions = existing.get("descriptions", {}) if existing else {}
        title_changed = existing_titles.get("en") != title_en
        description_changed = existing_descriptions.get("en") != description_en

        # Keep curated Chinese text when the English source has not changed;
        # translate only new/changed content.  This avoids replacing an
        # existing HK-style translation with a machine variant just because
        # the English title was unchanged.
        title_zh = None
        description_zh = None
        if existing_titles.get("zh") and not title_changed:
            title_zh = existing_titles["zh"]
        elif translate_enabled:
            title_zh = translator.translate(title_en)

        if description_en:
            if existing_descriptions.get("zh") and not description_changed:
                description_zh = existing_descriptions["zh"]
            elif translate_enabled:
                description_zh = translator.translate(description_en)

        if not title_zh and not title_changed and existing_titles.get("zh"):
            title_zh = existing_titles["zh"]
        if not description_zh and not description_changed and existing_descriptions.get("zh"):
            description_zh = existing_descriptions["zh"]
        title_zh = title_zh or title_en
        description_zh = description_zh or description_en

        if existing is None:
            existing = {
                "courseId": code,
                "category": "official-offering",
            }
            courses.append(existing)
            by_id[code] = existing

        existing["titles"] = {"en": title_en, "zh": title_zh}
        if description_en:
            existing["descriptions"] = {
                "en": description_en,
                "zh": description_zh,
            }

        credit_units = catalogue.get("creditUnits") or record.get("creditUnits")
        if credit_units is None:
            try:
                credit_units = _to_number(
                    next(
                        section["creditUnits"]
                        for section in record.get("sections", [])
                        if section.get("creditUnits")
                    )
                )
            except StopIteration:
                credit_units = None
        if credit_units is not None:
            existing["creditUnits"] = credit_units

        existing["hasLab"] = any(
            str(section.get("section", "")).upper().startswith("L")
            for section in record.get("sections", [])
        )
        existing["sampleWorkload"] = scores["sampleWorkload"]
        existing["sampleMeanGpa"] = scores["sampleMeanGpa"]
        existing["category"] = existing.get("category") or "official-offering"
        existing["comparator"] = build_comparator_from_record(record, scores)

        imported_codes.append(code)

    metadata = data.setdefault("metadata", {})
    sources = metadata.setdefault("sources", [])
    for source in (
        "tools/htmls (CityU AIMS course/class exports)",
        "CityU Undergraduate Catalogue course pages",
        "CityU course syllabus PDFs",
    ):
        if source not in sources:
            sources.append(source)
    metadata["containsOfficialData"] = True
    metadata["description"] = (
        "Static prototype data with official CityU AIMS/catalogue data imported "
        "by tools/import_course_exports.py; workload, GPA and difficulty "
        "values remain generated sample values."
    )
    metadata["officialImport"] = {
        "term": term,
        "asOf": as_of,
        "importedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "courseCount": len(imported_codes),
        "catalogueUrlTemplate": CATALOGUE_TEMPLATE,
        "syllabusUrlTemplates": list(SYLLABUS_TEMPLATES),
        "translation": "Google Translate (zh-TW)" if translate_enabled else "disabled",
        "sampleScores": (
            "Deterministically generated from the course code. "
            "Not official workload or GPA statistics."
        ),
    }

    official = {
        "term": term,
        "asOf": as_of,
        "source": "tools/htmls + CityU catalogue + CityU syllabus PDFs",
        "courses": records,
    }
    # Keep the key in a predictable place after courses.
    rebuilt: dict[str, Any] = {}
    for key, value in data.items():
        if key == "officialOfferings":
            continue
        rebuilt[key] = value
        if key == "courses":
            rebuilt["officialOfferings"] = official
    if "officialOfferings" not in rebuilt:
        rebuilt["officialOfferings"] = official
    data.clear()
    data.update(rebuilt)

    _validate_dataset(data)
    return imported_codes


def build_comparator_from_record(
    record: dict[str, Any], scores: dict[str, Any]
) -> dict[str, Any]:
    assessment = record.get("assessment", {})
    tasks = assessment.get("tasks") or []
    info = AssessmentInfo(
        continuous_assessment=assessment.get("continuousAssessment"),
        examination=assessment.get("examination"),
        examination_duration_hours=assessment.get("examinationDurationHours"),
        tasks=tasks,
        source=assessment.get("source", ""),
    )
    # Rebuild lightweight Section objects so the comparator helper can be
    # reused without keeping parsed dataclasses around.
    sections: list[Section] = []
    for section_data in record.get("sections", []):
        section = Section(
            crn=section_data.get("crn", ""),
            section=section_data.get("section", ""),
            instructor=section_data.get("instructor", ""),
        )
        for meeting_data in section_data.get("meetings", []):
            section.meetings.append(
                Meeting(
                    date_range=meeting_data.get("dateRange", ""),
                    day=meeting_data.get("day", ""),
                    time=meeting_data.get("time", ""),
                    building=meeting_data.get("building", ""),
                    room=meeting_data.get("room", ""),
                )
            )
        sections.append(section)

    return {
        "expectedStudyHoursPerWeek": scores["expectedStudyHoursPerWeek"],
        "assessmentLoad": assessment_load(info),
        "difficulty": scores["difficulty"],
        "gradingComponents": grading_components(info),
        "scheduledMeetingTimes": comparator_meetings(sections),
        "source": "cityu-aims-export+cityu-catalogue",
        "term": record.get("term", ""),
        "note": (
            "Section times and assessment weights come from the CityU AIMS "
            "export/catalogue; study hours, difficulty and sample GPA are "
            "deterministically generated demo values."
        ),
    }


def _validate_dataset(data: dict[str, Any]) -> None:
    courses = data.get("courses", [])
    ids = [course.get("courseId") for course in courses]
    duplicates = [value for value, count in Counter(ids).items() if count > 1]
    if duplicates:
        raise ValueError(f"Duplicate course IDs after merge: {duplicates}")

    valid_ids = set(ids)
    for semester, course_ids in (data.get("comparatorSemesterPresets") or {}).items():
        missing = [code for code in course_ids if code not in valid_ids]
        if missing:
            LOGGER.warning(
                "Comparator preset %s still references missing courses: %s",
                semester,
                missing,
            )

    for course in courses:
        comparator = course.get("comparator")
        if not comparator:
            continue
        if not comparator.get("assessmentLoad"):
            LOGGER.warning("%s has a comparator without assessmentLoad", course.get("courseId"))
        for key, value in (comparator.get("gradingComponents") or {}).items():
            if not isinstance(value, (int, float)):
                raise ValueError(
                    f"{course.get('courseId')} grading component {key} is not numeric"
                )


# ---------------------------------------------------------------------------
# Orchestration
# ---------------------------------------------------------------------------


def discover_course_files(html_dir: Path, scope: str, existing_ids: set[str], subjects: set[str] | None) -> list[Path]:
    files: list[Path] = []
    for path in sorted(html_dir.glob("*-course.html")):
        match = COURSE_FILE_RE.match(path.name)
        if not match:
            continue
        code = match.group("code").upper()
        if subjects:
            # --subjects is a direct override of --scope.
            if not any(code.startswith(subject) for subject in subjects):
                continue
        elif scope == "ee" and not code.startswith("EE"):
            continue
        elif scope == "existing" and code not in existing_ids:
            continue
        files.append(path)
    return files


def import_courses(args: argparse.Namespace) -> tuple[dict[str, dict[str, Any]], list[str]]:
    html_dir = Path(args.html_dir).resolve()
    mock_path = Path(args.output).resolve()
    data, _prefix, _suffix = load_mock_data(mock_path)
    existing_ids = {
        str(course.get("courseId")).upper()
        for course in data.get("courses", [])
        if course.get("courseId")
    }
    subjects = None
    if args.subjects:
        subjects = {part.strip().upper() for part in args.subjects.split(",") if part.strip()}

    files = discover_course_files(html_dir, args.scope, existing_ids, subjects)
    if args.limit:
        files = files[: args.limit]
    if not files:
        raise SystemExit("No matching *-course.html files found.")

    cache = Cache(
        Path(args.cache_dir).resolve() if args.cache_dir else html_dir / ".cache" / "official-import",
        refresh=args.refresh_cache,
    )
    translator = Translator(
        cache.directory / "translations-zh-TW.json",
        target="zh-TW",
        enabled=not args.no_translate,
        delay=args.translate_delay,
        offline=args.offline,
    )

    records: dict[str, dict[str, Any]] = {}
    term_counter: Counter[str] = Counter()
    as_of_counter: Counter[str] = Counter()
    failures = 0

    for index, path in enumerate(files, start=1):
        code = path.name[: -len("-course.html")].upper()
        LOGGER.info("[%s/%s] %s", index, len(files), code)
        try:
            export = parse_course_export(path)
        except Exception as exc:
            failures += 1
            LOGGER.error("%s: could not parse course export: %s", code, exc)
            if args.strict:
                raise
            continue

        catalogue = CatalogueInfo()
        catalogue_url = CATALOGUE_TEMPLATE.format(code=code)
        if not args.offline:
            try:
                raw_catalogue, source = fetch_catalogue_text(
                    code,
                    cache,
                    use_jina=not args.no_jina,
                    delay=args.fetch_delay,
                )
                LOGGER.debug("%s: catalogue from %s", code, source)
                catalogue = parse_catalogue_text(raw_catalogue, code)
            except Exception as exc:
                failures += 1
                LOGGER.warning("%s: catalogue unavailable: %s", code, exc)
                if args.strict:
                    raise
        else:
            cached = cache.read("catalogue", code)
            if cached:
                catalogue = parse_catalogue_text(cached, code)

        assessment = AssessmentInfo()
        syllabus_url: str | None = None
        if not args.offline:
            try:
                raw_syllabus, source, syllabus_url = fetch_syllabus_text(
                    code,
                    cache,
                    use_jina=not args.no_jina,
                    delay=args.fetch_delay,
                )
                LOGGER.debug("%s: syllabus from %s", code, source)
                assessment = parse_syllabus_text(raw_syllabus, code)
            except Exception as exc:
                failures += 1
                LOGGER.warning("%s: syllabus unavailable: %s", code, exc)
                if args.strict:
                    raise
        else:
            cached = cache.read("syllabus", code)
            if cached:
                assessment = parse_syllabus_text(cached, code)

        sanitize_assessment_percentages(assessment, catalogue)
        if not assessment.source and (
            assessment.continuous_assessment is not None
            or assessment.examination is not None
        ):
            assessment.source = "catalogue-indicative"

        record = build_official_record(
            export,
            catalogue,
            assessment,
            catalogue_url=catalogue_url,
            syllabus_url=syllabus_url,
        )
        if not record["catalogue"].get("description"):
            abstract = getattr(assessment, "abstract", "")
            if abstract:
                record["catalogue"]["description"] = clean_inline(abstract)
        if not record["catalogue"].get("title"):
            record["catalogue"]["title"] = export.title
        if record["catalogue"].get("creditUnits") is None:
            record["catalogue"]["creditUnits"] = export.credit_units

        records[code] = record
        term_counter[export.term] += 1
        as_of_counter[export.as_of] += 1
        time.sleep(args.fetch_delay if not args.offline else 0)

    if not records:
        raise SystemExit("No courses could be imported.")

    term = term_counter.most_common(1)[0][0]
    as_of = as_of_counter.most_common(1)[0][0]
    imported = merge_into_dataset(
        data,
        records,
        term=term,
        as_of=as_of,
        translator=translator,
        translate_enabled=not args.no_translate,
    )
    translator.save()

    if args.dry_run:
        preview_path = Path(args.preview_output).resolve()
        preview_path.parent.mkdir(parents=True, exist_ok=True)
        preview_path.write_text(
            json.dumps(
                {
                    "officialOfferings": data.get("officialOfferings", {}),
                    "importedCourses": imported,
                    "catalogue": "mock-data.js was not modified (--dry-run)",
                },
                ensure_ascii=False,
                indent=2,
            ),
            encoding="utf-8",
        )
        LOGGER.info("Dry run preview written to %s", preview_path)
    else:
        save_mock_data(
            mock_path,
            data,
            _prefix,
            _suffix,
            backup=not args.no_backup,
        )
        LOGGER.info("Updated %s", mock_path)

    LOGGER.info(
        "Imported %s course(s); term=%s, asOf=%s, failures=%s",
        len(imported),
        term,
        as_of,
        failures,
    )
    return records, imported


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Import CityU AIMS course/class HTML exports into EE4213Data.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "Examples:\n"
            "  python tools/import_course_exports.py --scope ee --limit 2 --dry-run\n"
            "  python tools/import_course_exports.py --scope ee\n"
            "  python tools/import_course_exports.py --scope all --no-translate\n"
        ),
    )
    parser.add_argument("--html-dir", default=str(DEFAULT_HTML_DIR), help="Directory containing *-course.html/*-classes.html")
    parser.add_argument("--output", default=str(DEFAULT_MOCK_DATA), help="mock-data.js to update")
    parser.add_argument("--scope", choices=("ee", "all", "existing"), default="ee", help="Which exports to import (default: ee)")
    parser.add_argument("--subjects", help="Comma-separated subject prefixes, e.g. EE,CS,MA (overrides --scope filtering)")
    parser.add_argument("--limit", type=int, help="Only process the first N matching course files (useful for testing)")
    parser.add_argument("--cache-dir", help="Cache directory (default: <html-dir>/.cache/official-import)")
    parser.add_argument("--refresh-cache", action="store_true", help="Ignore cached catalogue/PDF text")
    parser.add_argument("--offline", action="store_true", help="Do not perform network requests; use cached catalogue/PDF text only")
    parser.add_argument("--no-jina", action="store_true", help="Do not use the r.jina.ai fallback when CityU blocks direct requests")
    parser.add_argument("--no-translate", action="store_true", help="Do not call Google Translate; keep existing Chinese text or fall back to English")
    parser.add_argument("--translate-delay", type=float, default=0.35, help="Seconds between translation requests")
    parser.add_argument("--fetch-delay", type=float, default=0.5, help="Seconds between network requests")
    parser.add_argument("--dry-run", action="store_true", help="Build the data but write only a JSON preview, not mock-data.js")
    parser.add_argument("--preview-output", default=str(DEFAULT_PREVIEW), help="Path used by --dry-run")
    parser.add_argument("--no-backup", action="store_true", help="Do not create mock-data.js.bak")
    parser.add_argument("--strict", action="store_true", help="Stop when a catalogue/PDF fetch or parse fails")
    parser.add_argument("-v", "--verbose", action="store_true", help="Enable debug logging")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="%(levelname)s: %(message)s",
    )

    if args.no_translate:
        LOGGER.info("Translation disabled; Chinese titles/descriptions will fall back to English.")
    if args.offline:
        LOGGER.info("Offline mode: only cached catalogue/PDF text will be used.")

    try:
        import_courses(args)
    except KeyboardInterrupt:
        LOGGER.error("Interrupted.")
        return 130
    except Exception as exc:
        LOGGER.error("%s", exc)
        if args.verbose:
            raise
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
