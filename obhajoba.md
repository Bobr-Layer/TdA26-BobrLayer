# Obhajoba — Think different Academy (Bobr Layer)
**TdA 2026 Grandfinále — 28. 3. 2026**

---

## Úvod (30 s)

> „Dnes jsme se zaměřili na tři věci: reálnou hodnotu pro lektora, lepší zážitek pro studenta a lepší správu celé platformy. Každá z nich přispívá k tomu, aby akademie fungovala nejen hezky, ale i prakticky."

---

## Co jsme dnes implementovali

### 1. Otevřené otázky v kvízech
**Business value:** Lektor může klást otázky, na které nelze odpovědět zaškrtnutím — eseje, popis postupu, reflexe. Tím platforma přestává být jen testovací nástrojem a stává se skutečným vzdělávacím prostředím.

**Jak to funguje:**
- Student vyplní textovou odpověď přímo v kvízu
- Po odeslání vidí u otevřených otázek žlutou indikaci „čeká na opravu" místo okamžitého výsledku
- Lektor vidí v dashboardu přehled pokusů — červeně označené nehodnocené, žlutě otevřené otázky čekající na bodování
- Lektor otázky ručně ohodnotí a student dostane výsledek

**Rozhodnutí:** Zvolili jsme ruční hodnocení lektorem (ne AI), protože odpovědi jsou kontextové a záleží na kurzu. Automatické hodnocení by bylo nespolehlivé a mohlo poškodit studenty.

---

### 2. Systém podpory (Support Tickets)
**Business value:** Studenti mají přímý kanál, jak nahlásit problém nebo položit otázku mimo kurz. Lektor nebo admin to vyřeší centrálně — bez externích nástrojů.

**Jak to funguje:**
- Formulář dostupný na stránce Kontakt i přímo z aplikace
- Backend ukládá tikety do databáze s timestampem a stavem
- Admin má přehled tiketů v dashboardu

**Rozhodnutí:** Jednoduchý formulář bez registrace nutnosti — snižuje bariéru pro studenty, kteří mají problém ještě před přihlášením.

---

### 3. Správa poboček (Branch Management)
**Business value:** TdA je síť škol a kurzů — každá pobočka má svého správce. Tato funkce umožňuje oddělení zodpovědností: SUPER_ADMIN vidí vše, ADMIN spravuje svoji pobočku.

**Jak to funguje:**
- Nová entita `Branch` — pobočka sdružuje uživatele (lektory, adminy)
- SUPER_ADMIN: vytváří pobočky, přiděluje adminy, vidí vše
- ADMIN: spravuje svou pobočku, vytváří lektory v rámci ní
- Detail pobočky: editovatelné informace + seznam uživatelů s akcemi

**Rozhodnutí:** Dvouúrovňová hierarchie (ADMIN / SUPER_ADMIN) je nejjednodušší model, který pokryje reálné potřeby sítě akademií bez zbytečné komplexity.

---

### 4. Import a export kurzů
**Business value:** Lektor si může vzít svůj kurz s sebou — nebo sdílet obsah s kolegy. Snižuje duplicitní práci a umožňuje opakované použití materiálů.

**Jak to funguje:**
- Export kurzu jako JSON soubor z dashboardu jedním kliknutím
- Import JSON souboru zpět do platformy vytvoří kurz s celou strukturou

**Rozhodnutí:** JSON formát místo proprietárního — je čitelný, snadno auditovatelný a přenositelný.

---

### 5. UX vylepšení pro studenty a konzistentní admin UI

**Student UX:**
- Detail kurzu přepracován pro přehlednost — stav zápisu, moduly a feedaktivity na jednom místě
- Kvíz: průběžné indikátory stavu odpovědí (zodpovězeno / čeká)

**Admin UI:**
- Stránky `AdminBranches` a `AdminUsers` přepsány do jednotného vizuálního stylu s dashboardem (stejné layouty, tlačítka, hover efekty)
- Sidenav ikony nahrazeny čistými stroke ikonami — konzistentní s ostatními sekcemi
- Oprava chyby: chevron animace se přestala aplikovat na všechny SVG elementy

---

## Rozhodnutí a kompromisy

| Otázka | Rozhodnutí | Důvod |
|--------|------------|-------|
| Automatické vs. ruční hodnocení otevřených otázek | Ruční | Kvalita > rychlost; eseje jsou kontextové |
| Jak modelovat pobočky | Flat 2 úrovně (ADMIN/SUPER_ADMIN) | Postačuje pro reálný use-case, snáze udržitelné |
| Import/export formát | JSON | Čitelný, bez závislostí, přenositelný |
| Support tickets bez auth | Ano | Student musí mít přístup dříve, než se přihlásí |

---

## Tech stack (pro dotazy poroty)

| Vrstva | Technologie | Proč |
|--------|-------------|------|
| Backend | Spring Boot 3.5.7, Java 25 | Enterprise standard, silná ekosystémová podpora, výborně testovatelný |
| Frontend | React 19, React Router 7, SCSS | Komponentový model, snadná správa stavu, módní styly bez zbytečných závislostí |
| DB | PostgreSQL 16 | Robustní, relační data (kurzy/moduly/uživatelé jsou přirozeně relační) |
| Real-time | SSE (Server-Sent Events) | Jednosměrný stream z backendu na klienta — jednodušší než WebSockets, dostačuje pro naše use-case |
| Proxy | Caddy | Automatický routing `/api/*` → Spring, `/*` → React; kritické `flush_interval -1` pro SSE |
| Kontejnerizace | Docker Compose | Jedno `docker compose up --build` a vše běží — ideální pro demo i produkci |

---

## Závěr (30 s)

> „Naším cílem bylo posunout platformu od jednoduchého testovacího nástroje k reálnému vzdělávacímu prostředí — s otevřenými otázkami, správou organizace a přímou komunikací. Věříme, že každá dnešní funkce přináší konkrétní hodnotu pro lektora, studenta i správce sítě, a rádi bychom na tomto projektu spolupracovali dál."
