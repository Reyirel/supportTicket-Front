# Sistema de Gestión de Tickets y Reportes

Este proyecto es una aplicación web desarrollada con **React** y **Vite**. Proporciona un entorno para gestionar y dar seguimiento a tickets de soporte, solicitudes y reportes técnicos. La interfaz está construida con React, utiliza **React Router** para la navegación y **Framer Motion** para animaciones fluidas. Además, implementa validaciones y servicios de autenticación para gestionar sesiones de usuario.

---

## Características

- **Interfaz React y Vite:** Configuración moderna con HMR para un desarrollo ágil.
- **Enrutamiento Dinámico:** Navegación con React Router y gestión de rutas en el directorio `my-react-router-app/`.
- **Gestión de Tickets:** Permite a los usuarios ver, asignar y actualizar tickets (ver [`AdminTickets`](src/components/AdminTickets.jsx) y [`AllTickets`](src/components/AllTickets.jsx)).
- **Autenticación:** Formularios de inicio de sesión y registro con validaciones (ver [`LoginRegisterForm`](src/pages/LoginRegisterForm.jsx) y servicios en [`authService`](src/services/authService.js)).
- **Estilo y Animación:** Estilos con **TailwindCSS** y animaciones con **Framer Motion**.
- **Utilidades:** Funciones para manejar cookies, validaciones y más (ver [`cookieUtils`](src/utils/cookieUtils.js) y [`validation`](src/utils/validation.js)).

---

## Estructura del Proyecto

- **`/src`:** Código fuente de la aplicación.
  - **`components`:** Componentes React reutilizables (Tickets, Perfil, etc.).
  - **`pages`:** Vistas principales como Dashboard, Login/Register y Reportes.
  - **`services`:** Lógica para consumir API y gestionar autenticación.
  - **`hooks`:** Hooks personalizados para lógica de dashboard y otros comportamientos.
  - **`utils`:** Utilidades generales como validaciones y manejo de cookies.
- **`/my-react-router-app`:** Configuración y código para el servidor o integración con React Router en entornos de producción.
- **`/public` y otros archivos de configuración:** Archivos de recursos estáticos, configuración de ESLint, Tailwind y Vite.

---

## Instalación

1. Instala las dependencias:
    ```sh
    npm install
    ```
2. Inicia el servidor de desarrollo:
    ```sh
    npm run dev
    ```
   La aplicación estará disponible en `http://localhost:5173`.

---

## Construcción para Producción

Para crear una versión optimizada de la aplicación:
```sh
npm run build
```

---

## Despliegue

El proyecto incluye configuraciones para despliegue en contenedores **Docker**. Con Docker instalado, puedes construir y ejecutar el contenedor:

1. Construye la imagen:
    ```sh
    docker build -t my-app .
    ```
2. Ejecuta el contenedor:
    ```sh
    docker run -p 3000:3000 my-app
    ```

Consulta el README de `my-react-router-app` para más detalles sobre opciones de despliegue.

---

## Recursos y Documentación

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [React Router](https://reactrouter.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)

---

## Contribución

Las mejoras y nuevas funcionalidades son bienvenidas. Para colaborar, por favor revisa las guías de contribución y abre un **pull request**.

---