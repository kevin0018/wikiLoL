# wikiLOL

## Créditos y aviso legal

- **League of Legends**, sus personajes, imágenes y datos relacionados son propiedad de **Riot Games, Inc.**
- **wikiLoL** no está afiliado, respaldado ni patrocinado por Riot Games, Inc.
- Todos los assets (iconos, imágenes de campeones, skins, rangos, etc.) y datos utilizados en este proyecto son propiedad de Riot Games, Inc. y se usan bajo los términos y condiciones de la [Riot Games Developer Portal](https://developer.riotgames.com/).
- Esta aplicación es un proyecto personal, educativo y de portfolio, sin fines comerciales ni monetización de ningún tipo.
- Si eres parte del equipo de Riot y necesitas que algún contenido sea retirado, por favor contáctame y lo haré de inmediato.

---

## Credits and Legal Notice

- **League of Legends**, its characters, images, and related data are the property of **Riot Games, Inc.**
- **wikiLoL** is not affiliated with, endorsed, or sponsored by Riot Games, Inc.
- All assets (icons, champion images, skins, ranks, etc.) and data used in this project are the property of Riot Games, Inc., and are used under the terms and conditions of the [Riot Games Developer Portal](https://developer.riotgames.com/).
- This app is a personal, educational, and portfolio project, with no commercial purposes or monetization of any kind.
- If you are part of the Riot team and need any content removed, please contact me and I will do so immediately.

---

Proyecto fullstack para consultar y visualizar perfiles, rangos, campeones y datos de jugadores de League of Legends, construido siguiendo buenas prácticas, arquitectura limpia y un enfoque mobileFirst.

---

## Índice

- [Descripción](#descripción)
- [Características principales](#características-principales)
- [Tecnologías y herramientas](#tecnologías-y-herramientas)
- [Metodologías y arquitectura](#metodologías-y-arquitectura)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Testing](#testing)
- [Licencia](#licencia)

---

## Descripción

**wikiLoL** permite consultar información sobre cuentas de jugadores de League of Legends (perfil, rango, estadísticas, iconos, etc.) y también explorar el listado completo de campeones, su lore y sus skins, usando una arquitectura robusta y desacoplada.  
El frontend es rápido, accesible y 100% mobileFirst.

---

## Características principales

- Consulta y visualización de perfiles de usuario y rangos, incluyendo iconos y estadísticas.
- Listado completo de campeones: nombre, lore, estadísticas y aspecto visual.
- Consulta de todas las skins de cada campeón.
- Proxy backend para servir imágenes de Riot Games de forma segura y eficiente.
- Separación clara de responsabilidades entre frontend y backend.
- Código limpio, modular y fácil de mantener.
- Enfoque mobileFirst para todos los componentes y vistas.

---

## Tecnologías y herramientas

### Frontend

- **HTML5**
- **Tailwind CSS v4+** (mobileFirst, utilitario)
- **Flowbite** (componentes UI modernos y accesibles)
- **JavaScript ES2023**
- **Vite** (bundler ultra-rápido)

### Backend

- **Node.js (ESM)**
- **Express**
- **node-fetch** (peticiones externas/proxy)

---

## Metodologías y arquitectura

- **Arquitectura Hexagonal (Ports & Adapters):**  
  El dominio está desacoplado de frameworks e infraestructura.
- **CQRS:**  
  Comandos y Queries completamente separados para claridad y escalabilidad.
- **SOLID:**  
  Principios de diseño para un código robusto y fácil de ampliar.
- **TDD (Test Driven Development):**  
  Desarrollo guiado por pruebas automatizadas en el backend.
- **Proxy backend:**  
  Todas las imágenes (iconos, rangos, campeones, skins, etc.) se sirven mediante un proxy propio.
- **MobileFirst:**  
  Todo el frontend está pensado primero para móvil.

---

## Instalación y ejecución

### 1. Clona el repositorio

```sh
git clone https://github.com/kevin0018/wikiLoL.git
cd wikiLoL
```

### 2. Instala las dependencias

#### Frontend

```sh
cd frontend
npm install
```

#### Backend

```sh
cd ../backend
npm install
```

### 3. Variables de entorno

Edita el archivo `.env` en cada carpeta para configurar las variables necesarias (ejemplo: API keys de Riot, puertos, etc).

### 4. Ejecuta el proyecto

#### Backend

```sh
npm run dev
```
> El backend estará disponible en `http://localhost:3001` (o el puerto configurado).

#### Frontend

```sh
npm run dev
```
> El frontend estará disponible en `http://localhost:5173` (o el puerto configurado).

---

## Estructura del proyecto

```
wikiLoL/
│
├── backend/
│   ├── src/
│   │   ├── account/
│   │   │   ├── app/                # CQRS: queries, handlers, services
│   │   │   ├── domain/             # Entidades y lógica de dominio puro
│   │   │   ├── infra/              # Repositorios y adaptadores Riot
│   │   │   └── presentation/       # Controladores
│   │   ├── champion/
│   │   │   ├── app/
│   │   │   ├── domain/
│   │   │   ├── infra/
│   │   │   └── presentation/
│   │   ├── proxy/                  # Proxy de assets (RiotAssetsProxy.js)
│   │   ├── interfaces/             # Routers (ej: routes.js)
│   │   └── test/                   # Pruebas (TDD)
│   └── .env                        # Variables de entorno backend
│
├── frontend/
│   ├── public/
│   │   └── pages/                  # HTMLs principales
│   ├── src/
│   │   ├── assets/
│   │   │   ├── js/                 # Lógica y renders frontend
│   │   │   ├── images/
│   │   ├── components/
│   │   ├── services/               # Llamadas API
│   │   ├── styles/                 # Tailwind + estilos propios
│   │   └── ...
│   └── .env                        # Variables de entorno frontend
│
└── README.md
```

---

## Testing

- El backend sigue TDD: las pruebas unitarias e integración están en `backend/src/test`.
- El frontend por ahora no tiene tests automatizados.

---

## Licencia

Sin licencia explícita.

---

> Proyecto desarrollado con ❤️ por kevin0018.