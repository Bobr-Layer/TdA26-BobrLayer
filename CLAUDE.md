# TdA26 — Master Project Specification (BobrLayer)

> **Kontext:** Tour de App 2026 + maturitní projekt. Tým Bobr Layer (SPŠE Pardubice): Richard Hývl (backend), Petr Machovec (frontend), Nicolas Weiser (design). Vzdělávací platforma — lektoři tvoří kurzy s moduly, materiály a kvízy, studenti se zapisují a plní obsah. Real-time aktualizace přes SSE.

---

## 0. Nominační kolo — zadání fází

Projekt je rozdělen do **6 fází** — prvních 5 (0–4) podléhá automatickému testování, fáze X se hodnotí manuálně. Termín odevzdání: **16. 1. 2026**.

> **Důležité:** Implementace bonusových nebo nadstandardních funkcionalit, které nejsou uvedeny v zadání, **není předmětem hodnocení**.

### Fáze 0 — Docker, Git a základní nasazení
- Repozitář pojmenován `TdA26-NazevTymu`, soukromý, s pozvaným účtem `Tour-de-App-user`
- GitHub secret `TDC_TOKEN` pro deployment přes GitHub Actions
- Aplikace musí mít: indexovou stránku na `/` s textem `"Hello TdA"` a API na `/api` vracející JSON s organizací
- Text na `/` **nesmí být vykreslen přes canvas**
- Docker Compose pro kontejnerizaci

### Fáze 1 — Katalog kurzů a správa lektora
- Veřejný seznam kurzů na `/courses` (prohlížení bez přihlášení), vyhledávání podle názvu
- Detail kurzu na `/courses/:uuid`
- Dashboard `/dashboard` — přístupný pouze přihlášeným lektorům, nepřihlášení přesměrováni na `/login`
- Lektor: `lecturer / TdA26!`, CRUD kurzů (přidávání, úpravy, mazání)
- Databáze s seedingem pro automatické naplnění při startu

### Fáze 2 — Materiály ke kurzům
- Materiály se zobrazují v pořadí **od nejnovějšího po nejstarší**
- **Soubor:** název, popis, nahraný soubor (PDF, DOCX, TXT, PNG, JPG, JPEG, GIF, MP4, MP3), max **30 MB**, student vidí tlačítko pro stažení
- **URL odkaz:** název, URL adresa, popis, automaticky se načte favicon cílové stránky
- Studenti vidí materiály na stránce kurzu pod hlavními informacemi
- Lektor spravuje v `/dashboard` → detail kurzu (přidat, upravit, smazat)
- Každý materiál má unikátní UUID; nepodporované formáty nebo příliš velké soubory → 400 Bad Request

### Fáze 3 — Kvízy
- Kvízy jsou součástí konkrétního kurzu, spuštění kliknutím na tlačítko na stránce kurzu
- Typy otázek: **výběr jedné** správné odpovědi / **výběr více** správných odpovědí
- Po vyplnění: uživatel vidí finální skóre a správné odpovědi
- Veřejně se zobrazuje **počet vyplnění**, výsledky jsou **anonymní**
- Lektor vidí výsledky všech uživatelů v dashboardu
- Kvízy se zobrazují **od nejnovějšího po nejstarší**
- Lektor: přidávání, úprava, mazání kvízů a otázek; každý kvíz i otázka mají unikátní UUID

### Fáze 4 — Informační kanál (feed) + SSE
- Kurz má vlastní feed (informační kanál) — zobrazuje novinky a události
- **Příspěvky lektora:** textové zprávy, editovatelné (viditelná indikace úpravy), mazatelné
- **Automaticky generované události:** přidání materiálu, přidání kvízu/aktivity — vše s timestampem
- **Real-time přes SSE:** prohlížeč udržuje persistent spojení, lektor přidá zprávu → server uloží → okamžitě odešle všem připojeným uživatelům (bez refreshe stránky)
- Každý příspěvek má unikátní UUID, vše uloženo v databázi

### Fáze X — Manuální testování
- Hodnocení vzhledu, dodržení **brand manuálu** (barvy, font Dosis, logo)
- Ověření **responzivity** na různých zařízeních (testování v Chrome na počítačích)
- README musí obsahovat: jméno týmu, seznam členů a role, použité technologie, instrukce ke spuštění, čas nasazení
- Finální verzi nahrát **nejméně 8 hodin před uzávěrkou**

---

## 0b. Soutěžní kolo — rozšířená specifikace

Soutěžní kolo rozšiřuje nominační fáze o komplexnější systém modulů, stavů kurzů a rolí. Toto je **závazná specifikace** pro logiku celé aplikace.

### Životní cyklus kurzu (stavy)

Kurz prochází pevně danými stavy, které určují viditelnost pro studenty i možnosti úprav lektorem:

| Stav        | Editovatelný | Viditelný studentům | Zápis studentů | Poznámka |
|-------------|:---:|:---:|:---:|---|
| **Draft**       | ✅ ano | ❌ ne | ❌ ne | Lektor edituje vše — kurz, moduly, materiály, kvízy |
| **Scheduled**   | ❌ ne | ✅ ano (jako „chystá se") | ❌ ne | Zamčeno, zpřístupní se v `scheduled_at` |
| **Live**        | ❌ ne | ✅ ano | ✅ ano | Aktivní výuka; studenti přistupují k aktivovaným modulům |
| **Paused**      | ❌ ne | ✅ ano (náhled) | ❌ noví ne | Přerušen; stávající studenti vidí obsah, noví se nemohou zapsat |
| **Archived**    | ❌ ne | ❌ ne | ❌ ne | Definitivně uzavřen pro všechny |

**Přechody stavů:**
```
Draft → Scheduled (PUT /schedule)
Scheduled → Draft (PUT /back-to-draft)
Draft / Scheduled → Live (PUT /start)
Live → Paused (PUT /pause)
Paused → Live (PUT /start)
Live / Paused → Archived (PUT /archive)
```

### Moduly — systém sekvenční aktivace

- Kurz je strukturován do **modulů** (tematické bloky, lekce, týdny)
- Každý modul má `index` (pořadí) a `is_activated` (boolean)
- Moduly se aktivují **sekvenčně** — vždy jen jeden další
- `PUT /courses/{uuid}/modules/activate` aktivuje *next* modul (inkrementuje index)
- `PUT /courses/{uuid}/modules/deactivate` deaktivuje *předchozí* modul
- Každá aktivace/deaktivace: vytvoří feed item + SSE broadcast `MODULE_ACTIVATED`/`MODULE_DEACTIVATED`
- Student vidí **pouze aktivované moduly**
- Moduly lze vytvářet, editovat, mazat, řadit — **pouze v Draft stavu**
- Přidání modulu do Archived kurzu je **zakázáno**

### Co je v modulech

Každý modul obsahuje:
- **Materiály** (FileMaterial nebo UrlMaterial) — zobrazeny od nejnovějšího
- **Kvízy** — zobrazeny od nejnovějšího

Materiály ani kvízy **nejsou přímo na kurzu** — vždy jsou pod konkrétním modulem.

### Pravidla editace dle stavu

- **Draft**: vše editovatelné (kurz, moduly, materiály, kvízy)
- **Scheduled / Live / Paused / Archived**: žádné úpravy obsahu; pokusy vrací `400 InvalidResourceStateException`
- **Feed** lze spravovat v **Live** a **Paused** (lektor komunikuje se studenty)

### Role a oprávnění (aplikačně řešeno, ne Spring Security)

**Lektor:**
- CRUD vlastních kurzů, modulů, materiálů, kvízů
- Řídí životní cyklus kurzu (mění stavy)
- Publikuje příspěvky na feed
- Spravuje zapsané studenty (přehled)
- Vidí statistiky kvízů a výsledky všech uživatelů v dashboardu

**Admin:**
- Přístup k `/dashboard/users`
- Globální správa uživatelských účtů (seznam, detail, změna role, smazání)
- Reset hesla libovolného uživatele (`PUT /auth/reset-password/{uuid}`)

> Oprávnění se **neřeší přes Spring Security** — veškerá logika je v service/controller vrstvě.

---

## 0c. Grandfinále — zadání

> Detailní příprava v [`grandfinale.md`](./grandfinale.md)

Zadání budou doplněny po schůzce s project manažerem (28.3.2026).

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

**LOCAL** (výchozí, aktivní):
```
:80 {
  route /api* { reverse_proxy 127.0.0.1:8080 { flush_interval -1 } }
  route /*    { reverse_proxy 127.0.0.1:3000 }
}
```

**SERVER** (produkce, zakomentovaná):
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
Host: db:5432 / DB: tda_app / User: postgres / Password: TenBobr69!
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

## 10. Konvence & pravidla pro vývoj

- **Tabulka modulů se jmenuje `moduls`** (ne `modules`) — překlep v entitě, nevytvářet migraci
- `jpa.ddl-auto: create-drop` — schéma se vždy přegeneruje, seed data z `DataInitializer`
- Frontend volá API vždy s `credentials: 'include'`
- SSE endpoint musí být routován přes Caddy s `flush_interval -1`
- Role LEKTOR a ADMIN mají přístup k `/dashboard`
- Backend package: `cz.projektant_pata.tda26`
- API endpointy jsou na `/api/` (ne `/api/v1/`)
- Aktuální branch: `maturita` (main branch: `main`)

---

## 11. Vizuální identita (brand guidelines)

Při jakékoli frontend práci dodržuj tyto brand guidelines.

### Barvy

**Základní:**
| Název  | HEX       | Použití                      |
|--------|-----------|------------------------------|
| Zelená | `#91F5AD` | Primární akcent – rozvoj     |
| Modrá  | `#0070BB` | Primární akcent – vzdělávání |

**Doplňkové:**
| HEX       | Poznámka      |
|-----------|---------------|
| `#0257A5` | Tmavá modrá   |
| `#FFFFFF` | Bílá          |
| `#1A1A1A` | Černá / text  |
| `#6DD4B1` | Světlá zelená |
| `#49B3B4` | Tyrkysová     |
| `#2592B8` | Světlá modrá  |

### Typografie
- **Font:** Dosis (hravé zaoblené bezpatkové písmo), váhy 400–700
- Fallback: `sans-serif`

### Logo
- Skládá se z erbu s ikonou žárovky (maskot **„Táda"**) + název „Think different Academy"
- Variace: horizontální nebo vertikální
- Na tmavém pozadí: bílá verze
- Logo **nesmí být deformované** — zákaz natahování, zkosení, rotace části
- Ochranná zóna: min. **1/3 rozměrů loga** na každé straně

### Ikony
- Maskot „Táda" lze použít jako ikonu v UI
- Soubory v `brand-manual/TdA _ Icons/`
