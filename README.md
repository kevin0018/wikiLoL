# wikiLOL

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
cd wikiLOL
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

Edita el archivo `.env` en cada carpeta para configurar las variables necesarias.

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
wikiLOL/
│
├── backend/
│   ├── src/
│   │   ├── api/                # Routers y proxys externos (ej: assetsProxy.js)
│   │   ├── app/                # Lógica de aplicación (CQRS: queries, handlers, DTOs)
│   │   │   └── query/
│   │   ├── domain/             # Entidades y lógica de dominio puro
│   │   ├── infra/              # Implementaciones de repositorios y otros adaptadores
│   │   │   └── repositories/
│   │   ├── interfaces/         # Interfaces de entrada/salida (si aplica)
│   │   └── tests/              # Pruebas automatizadas (TDD)
│   └── .env                    # Variables de entorno backend
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── styles/             # Tailwind + estilos propios
│   │   └── ...
│   └── .env                    # Variables de entorno frontend
│
└── README.md
```

---

## Testing

- El backend sigue TDD: las pruebas unitarias e integración están en `backend/src/tests`.
- No hay tests en el frontend actualmente.

---

## Licencia

Sin licencia explícita.

---

> Proyecto desarrollado con ❤️ por kevin0018.