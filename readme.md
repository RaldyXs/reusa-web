# Re-Usa Marketplace

Aplicación web de compraventa de artículos usados desarrollada con React, TypeScript, Express y MySQL.

## Tecnologías

### Frontend

- React
- TypeScript
- Vite
- React Router
- Lucide React

### Backend

- Node.js
- Express
- TypeScript
- MySQL
- JWT
- bcrypt

## Requisitos

- Node.js
- npm
- MySQL Server
- MySQL Workbench

## Instalación

### Base de datos

1. Abrir MySQL Workbench.
2. Importar el archivo `reusa_database.sql`.
3. Confirmar que se haya creado la base de datos `reusa`.
4. Verificar que exista el procedimiento almacenado `sp_buscar_articulos`.

### Backend

```bash
cd backend
npm install