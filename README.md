# TdA26 - Vzdělávací platforma Think different Academy

Projekt pro soutěž **Tour de App 2026** - moderní vzdělávací platforma s kurzy, kvízy a real-time informačním kanálem.

## 🚀 Technologie

- **Backend:** Spring Boot 3.3.5 (Java 21)
- **Frontend:** Thymeleaf + React
- **Databáze:** PostgreSQL 16
- **Deployment:** Docker + Tour de Cloud
- **Reverse Proxy:** Caddy

## 📋 Požadavky

- Java 21+
- Maven 3.9+
- Docker & Docker Compose
- PostgreSQL 16 (nebo Docker)

## 🛠️ Lokální spuštění

### 1. Spusťte PostgreSQL
``
docker-compose up -d
``

### 2. Spusťte Spring Boot aplikaci

``
./mvnw spring-boot:run
``
### 3. Přístup k aplikaci

- **Aplikace:** http://localhost:8080
- **API dokumentace:** http://localhost:8080/swagger-ui.html
- **API spec:** http://localhost:8080/api

### Přihlašovací údaje

- **Username:** lecturer
- **Password:** TdA26!

## 🐳 Docker Build

Build image

``
docker build -t tda26 .
Run container
docker run -p 8080:8080
-e SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5432/tda26
tda26
``


## 📦 Deployment na Tour de App

Push do `main` branch automaticky spustí GitHub Actions a nasadí aplikaci.

## 📁 Struktura projektu

src/main/java/cz/projektantpata/tda26/ <br>
├── config/ # Konfigurace (Security, OpenAPI, ...)<br>
├── course/ # Správa kurzů<br>
├── material/ # Studijní materiály<br>
├── quiz/ # Interaktivní kvízy<br>
├── feed/ # Informační kanál (SSE)<br>
├── auth/ # Autentizace a uživatelé<br>
├── file/ # Upload souborů<br>
└── common/ # Sdílené komponenty

## 🎯 Implementační fáze

- [x] **Fáze 0:** Docker + Git + základní setup
- [ ] **Fáze 1:** Katalog kurzů + CRUD
- [ ] **Fáze 2:** Studijní materiály (soubory, odkazy)
- [ ] **Fáze 3:** Interaktivní kvízy
- [ ] **Fáze 4:** Informační kanál s SSE
- [ ] **Fáze X:** UX/UI + responzivita

## 📅 Termín odevzdání

**16. 1. 2026**

## 👨‍💻 Autor

Richard Hývl - Maturitní projekt 2026
