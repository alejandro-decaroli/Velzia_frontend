![Logo](https://github.com/user-attachments/assets/29c85e36-fe28-496c-8b20-be96fd504f4f)


# Velzia

Velzia es un mini ERP para pequeñas empresas, diseñado para ser simple y práctico.




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

Ejecutar el siguiente comando:

```
  npm run start:tests
```


## Documentación

La aplicacion completa se encuentra desplegada en https://render.com/.

El backend: https://velzia-backend.onrender.com/

El frontend: https://velzia-frontend.onrender.com/

Las instancias se encuentran "dormidas" por ende es necesario esperar a que "despierten" para poder utilizar la app, solo entren a los enlaces y esperen a que ambos carguen correctamente.

# Documentación de la API

Puedes consultar la documentación completa de la API [aquí](docs/api.md).
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