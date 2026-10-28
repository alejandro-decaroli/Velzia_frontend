![Logo](https://github.com/user-attachments/assets/29c85e36-fe28-496c-8b20-be96fd504f4f)


# Velzia

Velzia es una herramienta para registrar diversos movimientos financieros y entidades de un negocio pequeño, a fin de: 
1) Auditar los registros y hacer conciliación de cajas.
2) Tener datos con los cuales analizar, extraer información valiosa para el dueño del negocio. 




## Autores

- [@alejandro-decaroli](https://github.com/alejandro-decaroli)
- [@GonzaloZN](https://github.com/GonzaloZN)


## Requisitos para uso local

Es necesario tener instalado [docker](https://www.docker.com/) para levantar la base de datos. Elegir el método de instalación según el sistema operativo que se utiliza.



    
## Ejecutar en local

Clonar el proyecto

```bash
  git clone https://github.com/alejandro-decaroli/Velzia_frontend.git
```

Ir a la raiz del proyecto

```bash
  cd Velzia_frontend
```

Crear un archivo .env y escribir las variables de entorno que se proporcionan debajo.

```bash
  cd src
  touch .env
``` 

### Variables de entorno

```
NODE_ENV=development
VITE_API_URL=http://localhost:3000
```

Ahora desde docker_compose.yaml levantar el frontend.

```
docker-compose -f docker_compose.yaml up frontend
``` 

Otra alternativa a docker es instalar las dependencias.

```bash
  npm install
```

Posteriormente en terminal ejecutar:

```bash
  npm run start:dev
```


## Ejecutar Tests

Los tests automatizados están implementados con **Vitest** en entorno **JSDOM**. Para ejecutarlos:

```bash
# Ejecutar toda la suite de pruebas del frontend
npm test

# Ejecutar únicamente los tests unitarios
npm test -- tests/unit

# Ejecutar únicamente los tests integradores
npm test -- tests/integration
```

### ¿Qué prueban los tests?

* **Tests Unitarios (`tests/unit/`):**
  * **Configuración de Entidades (`entityConfig.test.ts`):** Valida la configuración de entidades (`ventas`, `productos`, `clientes`), comprobando la definición de rutas, tipos de campos y filtros. Además, verifica que `EXCLUDED_TABLE_FIELDS` filtre correctamente los atributos internos o sensibles (`id`, `usuario`, `creadoen`) para no renderizarlos en las tablas.
  * **Cliente de API (`apiFetch.test.ts`):** Evalúa la función `fetchEntity`, verificando el envío de query parameters (`filtro`, `fecha`), la extracción correcta de arrays de entidades y la captura y formateo de mensajes de error HTTP sin romper la aplicación.

* **Tests Integradores (`tests/integration/`):**
  * **Flujo de Autenticación y Store de Usuario (`authFlow.test.ts`):** Comprueba la interacción coordinada entre la API de sesión (`/usuarios/logout`), la reactividad del store de Svelte (`user`) y la navegación con SvelteKit (`goto('/')`).
  * **Operaciones de Venta y Formulario (`ventaOperations.test.ts`):** Comprueba el flujo completo de registro de líneas de venta (`registrarDetalle`) y cobro de venta en caja (`pagarEntity`), validando el envío de payloads al backend, el cierre del formulario modal (`showForm=false`), la recarga de vista y el manejo de conflictos de negocio (como stock insuficiente).


## Documentación

La aplicacion completa se encuentra desplegada en https://render.com/.

El backend: https://velzia-backend.onrender.com/

El frontend: https://velzia-frontend.onrender.com/

Las instancias se encuentran "dormidas" por ende es necesario esperar a que "despierten" para poder utilizar la app, solo entren a los enlaces y esperen a que ambos carguen correctamente.

## Documentación de la API

Puedes consultar la documentación completa de la API [aquí](src/docs/api.md).

## Video demostración

Enlace al video: https://drive.google.com/file/d/1K-A6cGTddqLqrD3fay0Tg4iFZyRbmp0u/view?usp=drive_link
## Tech Stack
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Svelte](https://img.shields.io/badge/svelte-%23f1413d.svg?style=for-the-badge&logo=svelte&logoColor=white)
![Svelte](https://img.shields.io/badge/svelte-%23f1413d.svg?style=for-the-badge&logo=svelte&logoColor=white)
![Render](https://img.shields.io/badge/Render-%46E3B7.svg?style=for-the-badge&logo=render&logoColor=white)
## License

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
