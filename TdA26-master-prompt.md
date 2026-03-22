# TdA26 — Master Project Specification

> **Účel dokumentu:** Kompletní technický popis projektu TdA26-BobrLayer — single source of truth. Definuje CO je postaveno, JAK to funguje, a jak jednotlivé části do sebe zapadají. Slouží jako kontext pro AI modely při generování kódu i jako interní dokumentace.

> **Kontext:** Tour de App 2026 + maturitní projekt. Tým Bobr Layer (SPŠE Pardubice): Richard Hývl (backend), Petr Machovec (frontend), Nicolas Weiser (design). Vzdělávací platforma — lektoři tvoří kurzy s moduly, materiály a kvízy, studenti se zapisují a plní obsah. Real-time aktualizace přes SSE.

---

## 1. Stack & architektura

| Vrstva | Technologie |
|---|---|
| Backend | Spring Boot 3.5.7, Java 25, Maven |
| Frontend | React 19.2.3, React Router 7, SASS/SCSS, Lucide React |
| Databáze | PostgreSQL 16 |
| Infrastruktura | Docker Compose, Caddy (reverse proxy) |

**Deployment flow:**
- Caddy na portu 80 — `/api/*` → Spring Boot (8080), `/*` → React (3000)
- DB na portu 5432 s persistent volume `postgres-data`
- Spring používá `jpa.hibernate.ddl-auto: create-drop` (schéma se vždy přegeneruje)

**Spuštění:**
```bash
docker compose up --build
# Aplikace běží na http://localhost
```

**Výchozí uživatelé (seed při startu):**
- `admin / TdA26!` — role ADMIN
- `lecturer / TdA26!` — role LEKTOR
- `student / TdA26!` — role STUDENT

---

## 2. Datový model

### Uživatel (`users`)
```
uuid (PK), username (UNIQUE), password (bcrypt), role (STUDENT|LEKTOR|ADMIN), enabled
```
- Implementuje `UserDetails` pro Spring Security
- Lektor má `courses` (OneToMany)
- Student má `enrolledCourses` (ManyToMany)

### Kurz (`courses`)
```
uuid, name, description, status, scheduled_at, created_at, updated_at, lector_id (FK users)
```
**StatusEnum:** `Draft → Scheduled → Live → Paused → Archived`

### Modul (`moduls` — pozor na překlep v názvu tabulky)
```
uuid, course_id (FK), index (pořadí), is_activated (boolean), name, description
```

### Materiál (`material` + joined inheritance)
```
Typy: FileMaterial (file_path), UrlMaterial (url)
Společné: uuid, dtype, module_id (FK), name, description, count (počet přístupů), created_at
```

### Kvíz (`quizzes`)
```
uuid, module_id (FK), title, attempts_count
```

### Otázka (`question` + joined inheritance)
```
Typy: SingleChoiceQuestion (options[], correct_index), MultipleChoiceQuestion (options[], correct_indices[])
Společné: uuid, dtype, quiz_id (FK), question_index, question
```

### Feed (`course_feed_items`)
```
uuid, course_id (FK), author_id (FK users, nullable), type (SYSTEM|MANUAL), message, edited, created_at, updated_at
```

### Join tabulka
```
course_students: course_id + student_id
```

---

## 3. REST API — přehled endpointů

### Auth (`/api/auth`)
| Metoda | Endpoint | Popis |
|---|---|---|
| POST | `/auth/register` | Registrace studenta |
| POST | `/auth/login` | Přihlášení |
| POST | `/auth/logout` | Odhlášení |
| GET | `/auth/me` | Aktuální uživatel |
| GET | `/auth/me/courses` | Zapsané kurzy studenta |
| PUT | `/auth/profile` | Aktualizace profilu (username/password) |
| PUT | `/auth/reset-password/{uuid}` | Reset hesla |

### Kurzy (`/api/courses`)
| Metoda | Endpoint | Popis |
|---|---|---|
| GET | `/courses` | Seznam kurzů (filtrováno dle role) |
| GET | `/courses/{uuid}` | Detail kurzu |
| POST | `/courses` | Vytvoření kurzu |
| PUT | `/courses/{uuid}` | Úprava kurzu (jen Draft) |
| DELETE | `/courses/{uuid}` | Smazání kurzu |
| PUT | `/courses/{uuid}/schedule` | Naplánování kurzu |
| PUT | `/courses/{uuid}/back-to-draft` | Zpět do Draft |
| PUT | `/courses/{uuid}/start` | Spustit (→ Live) |
| PUT | `/courses/{uuid}/pause` | Pozastavit |
| PUT | `/courses/{uuid}/archive` | Archivovat |
| PUT | `/courses/{uuid}/modules/activate` | Aktivovat další modul |
| PUT | `/courses/{uuid}/modules/deactivate` | Deaktivovat předchozí modul |
| POST | `/courses/{uuid}/enroll` | Student se zapíše |
| DELETE | `/courses/{uuid}/enroll` | Student se odhlásí |
| GET | `/courses/{uuid}/enrolled` | Stav zápisu |
| GET | `/courses/{uuid}/users` | Seznam studentů (ADMIN) |
| GET | `/courses/{uuid}/stream` | SSE stream (text/event-stream) |

### Moduly (`/api/courses/{courseUuid}/modules`)
CRUD + `PUT /reorder` pro změnu pořadí. Úpravy jen v Draft stavu.

### Materiály (`/api/courses/{courseUuid}/modules/{moduleUuid}/materials`)
CRUD (JSON pro UrlMaterial, multipart pro FileMaterial) + `POST /{uuid}/track` pro sledování přístupu.

### Kvízy (`/api/courses/{courseUuid}/modules/{moduleUuid}/quizzes`)
CRUD + `POST /{uuid}/submit` pro odevzdání.

### Feed (`/api/courses/{courseId}/feed`)
CRUD pro feed zprávy. Vytvoření/úprava/smazání spustí SSE broadcast.

### Uživatelé (`/api/users`)
| Metoda | Endpoint | Popis |
|---|---|---|
| GET | `/users` | Seznam uživatelů |
| GET | `/users/{uuid}` | Detail uživatele |
| PUT | `/users/{uuid}/role` | Změna role |
| DELETE | `/users/{uuid}` | Smazání uživatele |

---

## 4. Bezpečnost & autentizace

> **DŮLEŽITÉ — požadavek zadání soutěže:** API endpointy **nejsou chráněny autorizací na úrovni Spring Security**. Veškerá logika přístupu se řeší aplikačně (v service vrstvě nebo controlleru), nikoli přes Spring Security filtry nebo `@PreAuthorize` anotace. `SecurityConfig` nastavuje `permitAll()` pro všechny requesty. `@PreAuthorize` a `@EnableMethodSecurity` se **nepoužívají**. Nový kód nesmí přidávat Spring Security ochranu na endpointy.

- **Session-based auth** — `IF_REQUIRED` session policy
- Přihlášení vytvoří HTTP session, frontend posílá `credentials: 'include'`
- CSRF vypnutý, CORS vypnutý (Caddy proxy zajišťuje same-origin)
- Aktuální uživatel je dostupný přes `SecurityContextHolder` / `Authentication` — slouží jen pro identifikaci, ne pro blokování přístupu
- **CourseSecurity** bean existuje, ale **neměl by být používán** pro blokování requestů

---

## 5. Real-time systém (SSE)

**`SseService`** spravuje emittery per-kurz v `ConcurrentHashMap<UUID, List<AuthenticatedSseEmitter>>`.

**Typy SSE eventů:**
| Typ | Trigger | Příjemci |
|---|---|---|
| `CONNECTED` | Připojení k /stream | Subscriber |
| `MODULE_ACTIVATED` | Aktivace modulu | Všichni |
| `MODULE_DEACTIVATED` | Deaktivace modulu | Všichni |
| `MATERIAL_ACCESSED` | Sledování materiálu | Jen autentizovaní |
| `QUIZ_SUBMITTED` | Odevzdání kvízu | Jen autentizovaní |
| `FEED_CREATED/UPDATED/DELETED` | CRUD feed zprávy | Všichni |

**Event flow:**
1. Akce (aktivace modulu, submit kvízu, přístup k materiálu) → Spring ApplicationEvent
2. `@TransactionalEventListener(AFTER_COMMIT)` + `@Async` v `FeedEventListener`
3. Vytvoření feed itemu (pokud relevantní) + SSE broadcast

---

## 6. Frontend — struktura

### Routing (`App.js`)
```
/                          → Homepage
/login, /register          → Auth
/courses, /courses/:uuid   → Veřejné kurzy
/courses/:uuid/modules/:moduleUuid → Obsah modulu
/courses/:uuid/modules/:moduleUuid/quizzes/:quizzUuid → Kvíz
/profile, /my-courses      → Přihlášený uživatel
/dashboard/**              → Lektor (LEKTOR nebo ADMIN)
/dashboard/users           → Admin správa uživatelů
```

### Pages
- `Index.jsx` — homepage s hero sekcí a přehledem kurzů
- `Courses.jsx` — veřejný seznam kurzů, zápis pro studenty
- `Detail.jsx` — detail kurzu, seznam modulů, stav aktivace
- `Module.jsx` — obsah modulu, materiály, kvízy, SSE aktualizace
- `Quiz.jsx` — průchod kvízem, odevzdání, výsledky
- `Dashboard.jsx` + podstránky — správa kurzů lektorem
- `MyCourses.jsx` — kurzy studenta
- `Profile.jsx` — editace profilu
- `Login.jsx`, `Register.jsx` — autentizace
- `AdminUsers.jsx` — správa uživatelů (ADMIN)
- Info stránky: `About.jsx`, `Contact.jsx`, `GDPR.jsx`, `Terms.jsx`

### Services
```
AuthService.jsx    — login, register, logout, getCurrentUser, updateProfile, getMyEnrolledCourses
CourseService.jsx  — CRUD kurzů, status přechody, enroll/unenroll, aktivace modulů
UserService.jsx    — správa uživatelů (admin)
Api.js             — base URL konfigurace
```

### Sdílené komponenty (`/shared`)
```
layout/header, footer, sidenav
courses/feed-card
lectors/lector-card
button, form, message (toast notifikace)
```

---

## 7. Byznys logika — klíčová pravidla

### Životní cyklus kurzu
- **Draft**: Lektor edituje vše (kurz, moduly, materiály, kvízy). Studenti nevidí obsah.
- **Scheduled**: Kurz je naplánován. Editace zakázána. Studenti vidí jako "chystá se".
- **Live**: Aktivní kurz. Studenti se zapisují a přistupují k aktivovaným modulům.
- **Paused**: Dočasně pozastaven. Noví studenti se nemohou zapsat.
- **Archived**: Ukončen. Pouze pro čtení.

### Aktivace modulů
- Moduly jsou aktivovány sekvenčně (podle `index`)
- Při startu DataInitializeru je první modul aktivní
- `PUT /courses/{uuid}/modules/activate` aktivuje další, `deactivate` deaktivuje předchozí
- Každá aktivace vytvoří feed item + SSE broadcast

### Hodnocení kvízu
- `POST /quizzes/{uuid}/submit` přijme `List<SubmitAnswerDTO>`
- Server vyhodnotí: SingleChoice = jeden správný index, MultipleChoice = všechny indexy musí souhlasit
- Vrátí `SubmitQuizResultDTO` (score, maxScore, totalAttempts, correctPerQuestion)
- Inkrementuje `quiz.attemptsCount`

### Sledování materiálů
- `POST /materials/{uuid}/track` inkrementuje `material.count`
- Spustí SSE event `MATERIAL_ACCESSED` pro autentizované uživatele

---

## 8. Infrastruktura

### Docker Compose (`compose.yml`)
```yaml
Services:
  db:      PostgreSQL 16, healthcheck: pg_isready, volume: postgres-data
  spring:  závisí na db (healthy), port 8080
  react:   závisí na spring, port 3000
  caddy:   závisí na spring+react, port 80
```

### Caddy (`caddy/Caddyfile`)

`flush_interval -1` je kritické pro SSE streaming.

Soubor obsahuje **dvě konfigurace** — aktivní je vždy jen jedna (druhá je zakomentovaná):

**LOCAL** (výchozí, aktivní) — Caddy běží přímo na hostu, Spring a React jsou na `127.0.0.1`:
```
:80 {
  route /api* { reverse_proxy 127.0.0.1:8080 { flush_interval -1 } }
  route /*    { reverse_proxy 127.0.0.1:3000 }
}
```

**SERVER** (produkce, zakomentovaná) — Caddy běží jako Docker kontejner, Spring a React jsou dostupné přes Docker interní síť pomocí service names:
```
:80 {
  route /api* { reverse_proxy spring:8080 { flush_interval -1 } }
  route /*    { reverse_proxy react:3000 }
}
```

> Při nasazení na server: odkomentovat serverovou konfiguraci a zakomentovat lokální.

### Soubory (file upload)
- Max velikost: 30 MB
- Uložení: `./uploads/` (volume mount)
- Spring staticky servíruje `file:./uploads/`

### DB heslo
```
Host: db:5432
DB: tda_app
User: postgres
Password: TenBobr69!
```

---

## 9. Výjimky & error handling

**Custom exceptions:**
- `ResourceNotFoundException` → 404
- `InvalidResourceStateException` → 400 (např. editace Live kurzu)
- `ResourceAlreadyExistsException` → 409
- `FileStorageException`, `FileValidationException` → 400/500

**`GlobalExceptionHandler`** vrací `ErrorResponseDTO { message, status }`.

---

## 10. Konvence & poznámky pro vývoj

- **Tabulka modulů se jmenuje `moduls`** (ne `modules`) — překlep v entitě, nevytvářet migraci
- `jpa.ddl-auto: create-drop` — schéma se vždy přegeneruje, seed data z `DataInitializer`
- Frontend volá API vždy s `credentials: 'include'`
- SSE endpoint musí být routován přes Caddy s `flush_interval -1`
- Role LEKTOR a ADMIN mají přístup k `/dashboard`
- Backend package: `cz.projektant_pata.tda26`
- Aktuální branch: `maturita` (main branch: `main`)
