# Mock data completeness audit

This is the source-backed data alignment record for `portal/assets/js/mock-data.js`.
It is an audit note, not a feature page or runtime data source.

Audit date: 2026-11-17

## Scope

- **167 total course records**
- **68 EE course IDs** (including combined and alpha-suffixed records)
- **61 Course Information directory entries**
- **43 EE records with comparator data**
- **23 additional course-level grading records** (66 with grading-chart data)
- **82 imported offering records** in `officialOfferings.courses` (GE-focused import)

## Source-backed changes applied

### Course facts from the current CityU catalogue

| Course | Alignment |
| --- | --- |
| `EE3001` | Full official title and English description |
| `EE2302` | Full official title and English description |
| `EE3301` | Full official title and English description |
| `EE3800` | Full official title and English description |
| `EE3801` | Full official title and English description |
| `EE3101` | Corrected title to **Communication Engineering**, added description and 3 credit units |
| `EE4213` | Corrected title to **Human-Computer Interaction**, added description and 3 credit units |

`EE4213` grading components remain aligned to its official syllabus weights:
project **49%**, midterm **21%**, final **30%**.

### Objective grading-total fixes

These records had grading components that did not total 100%. The catalogue's
continuous-assessment/examination split was used to complete them:

| Course | Before | After |
| --- | --- | --- |
| `EE2004` | Final 50 | Assignments 50, Final 50 |
| `EE2005` | Midterm 30, Assignments 10, Final 50 (total 90) | Midterm 30, Assignments 10, Final 50, Other 10 |
| `EE2066` | Final 30 | Assignments 70, Final 30 |
| `EE3122` | Final 50 | Assignments 50, Final 50 |
| `EE4803` | Final 40 | Assignments 60, Final 40 |

All five grading breakdowns now total **100%**.

## Removed records

The following 22 records had no usable grading components. They were removed from
`mock-data.js` after confirming that no major curriculum, prerequisite chain, or
official-offerings key referenced them:

`EE5410`, `EE5430`, `EE5437`, `EE5608`, `EE5811`, `EE5815`, `EE6427`, `EE6435`,
`EE6611`, `EE6619`, `EE6620`, `EE6621`, `EE6622`, `EE6627`, `EE6680`,
`EE6680D`, `EE6691`, `EE8001`, `EE8402`, `EE8404`, `EE8461`, `EE8462`.

All remaining comparator records now have non-empty grading components totaling
100%.

### Course-level grading fallback

A course-level `gradingComponents` field was added for 23 records that have no
`comparator` but do have a current catalogue continuous-assessment/examination
split. The charts read this field before falling back to the comparator value:

`EE2108`, `EE3114`, `EE3123`, `EE4090`, `EE4015 / EE5410`, `EE4016 / EE5438`,
`EE4017`, `EE4035`, `EE4045`, `EE4105`, `EE4107`, `EE4115`, `EE4142`, `EE4147`,
`EE4148`, `EE4149`, `EE4221`, `EE4316`, `EE3001`, `EE2302`, `EE3301`,
`EE3800`, `EE3801`.

For these records, continuous assessment is represented as **Assignments** and
the examination component as **Final**. No timetable or workload data was
invented; `EE2302` therefore shows a 30% / 70% grading chart without appearing
in the timetable.

## Remaining incomplete records

These gaps were **not** filled because the current catalogue does not provide the
missing values, the record is a deliberate curriculum/sample placeholder, or the
field is generated-demo-only. Do not treat these as verified complete records.

### Missing comparator data (25)

`EE2108`, `EE3114`, `EE3123`, `EE4090`, `EE4015 / EE5410`, `EE4016 / EE5438`,
`EE4017`, `EE4035`, `EE4045`, `EE4105`, `EE4107`, `EE4115`, `EE4142`, `EE4147`,
`EE4148`, `EE4149`, `EE4221`, `EE4316`, `EE3001`, `EE4080 A`, `EE4080 B`,
`EE2302`, `EE3301`, `EE3800`, `EE3801`.

### Missing grading-chart data (2)

`EE4080 A`, `EE4080 B` — split curriculum records of the six-credit `EE4080`
project; they do not have independent catalogue assessment pages.

### Missing description (8)

`EE4080 A`, `EE4080 B`, `EE2002`, `EE3201`, `EE4301`, `EE2201`, `EE3302`,
`EE4402`.

### Missing credit units (6)

`EE2002`, `EE3201`, `EE4301`, `EE2201`, `EE3302`, `EE4402`.

### Missing Chinese title (15)

`EE3001`, `EE4080 A`, `EE4080 B`, `EE2302`, `EE3301`, `EE3800`, `EE3801`,
`EE2002`, `EE3101`, `EE3201`, `EE4213`, `EE4301`, `EE2201`, `EE3302`,
`EE4402`.

### Missing sample workload and GPA (15)

`EE3001`, `EE4080 A`, `EE4080 B`, `EE2302`, `EE3301`, `EE3800`, `EE3801`,
`EE2002`, `EE3101`, `EE3201`, `EE4213`, `EE4301`, `EE2201`, `EE3302`,
`EE4402`.

### Missing meeting times (30)

All 25 records without comparator data, plus `EE3008`, `EE3210`, `EE4080`,
`EE4086`, `EE4087`.

### Missing `hasLab` flag (10)

`EE4080 A`, `EE4080 B`, `EE3801`, `EE2002`, `EE3101`, `EE3201`, `EE4301`,
`EE2201`, `EE3302`, `EE4402`.

### No major-curriculum placement (31)

These are mostly standalone or imported elective/official-offering records, not
curriculum-flowchart entries. They are not necessarily incomplete for the pages
that use them.

## Notes

- `EE4080 A` and `EE4080 B` are split curriculum records of the six-credit
  `EE4080` project; they intentionally do not have independent catalogue pages.
- The removed grading-empty records had no major-curriculum references. Their
  removal does not introduce dangling course IDs in Degree Audit.
- Remaining courses such as `EE2002`, `EE3201`, and `EE4402` return **Page Not
  Found** in the current undergraduate catalogue used for this audit; no
  description or assessment data was invented.
- Comparator meeting times, sample workload, sample GPA, difficulty, and
  assessment-load values are generated/demo data. Missing values were left blank
  rather than invented.
- Chinese titles were left blank where no authoritative Chinese source was
  available.
