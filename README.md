# wikiLoL

Aplicación full stack para consultar perfiles, rangos, maestrías y campeones de
League of Legends.

El navegador nunca contacta directamente con Riot ni conoce la versión de Data
Dragon. El backend compone los datos, valida las respuestas externas y actúa
como proxy de todos los assets.

## Stack

- **Workspace:** pnpm
- **Frontend:** React 19, TypeScript, Vite, TanStack Query, Motion y Tailwind CSS
- **Backend:** Node.js, Express 5, TypeScript y Zod
- **Contratos:** paquete compartido `@wikilol/contracts`
- **Aplicación:** CQRS con `Query` y `Handler` por caso de uso
- **Tests:** Vitest y Supertest

## Estructura

```text
wikiLoL/
├── frontend/                 # SPA React + TypeScript
├── backend/                  # API Express + proxy de Riot
├── packages/
│   └── contracts/            # DTOs, esquemas Zod y tipos compartidos
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

Los contratos compartidos representan exclusivamente la API pública. Las
respuestas internas de Riot y Data Dragon permanecen encapsuladas en el
backend. Las rutas validan la entrada y despachan queries; los handlers
dependen de puertos mínimos y reciben los adaptadores desde un único composition
root.

## Desarrollo

Requisitos:

- Node.js 22 o superior
- pnpm 10
- Una API key de Riot para las rutas de jugadores y clasificación

Instala todas las dependencias desde la raíz:

```bash
pnpm install
```

Crea `backend/.env`:

```dotenv
RIOT_API_KEY=RGAPI-...
PORT=3000
```

Opcionalmente, crea `frontend/.env` si el backend no se encuentra en el mismo
origen:

```dotenv
VITE_BACKEND_URL=http://localhost:3000
```

Inicia frontend y backend:

```bash
pnpm dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

## Comandos

```bash
pnpm typecheck
pnpm test
pnpm build
```

El build se ejecuta en orden: contratos, backend y frontend.

## API

| Ruta | Descripción |
| --- | --- |
| `GET /api/meta` | Parche actual de Data Dragon |
| `GET /api/champions` | Archivo de campeones |
| `GET /api/champions/:id` | Lore y aspectos de un campeón |
| `GET /api/account/profile` | Perfil por Riot ID |
| `GET /api/account/rank` | Rangos por invocador |
| `GET /api/account/mastery` | Mejores maestrías |
| `GET /api/account/most-played` | Campeones de partidas recientes |
| `GET /api/league/challenger` | Clasificación Challenger |
| `GET /api/assets/*` | Proxy cacheable de imágenes |

La versión actual de Data Dragon se descubre y cachea en el backend. Las URLs
públicas de assets son estables y no contienen el parche.

## Aviso legal

League of Legends, sus personajes, imágenes y datos relacionados son propiedad
de Riot Games, Inc. wikiLoL no está afiliado, respaldado ni patrocinado por
Riot Games. Este repositorio es un proyecto personal y educativo sin fines
comerciales.
