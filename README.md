# Plataforma de Gestión de Eventos y Tickets — Entrega Final

Proyecto desarrollado en **Node.js**, **Express** y **MongoDB** con arquitectura en capas (DAO, Repository, DTO, Services y Controllers) para la gestión de usuarios, publicación de eventos y reserva/cancelación de tickets en tiempo real.

## 🚀 Características Principales

* **Autenticación y Autorización:** Manejo de sesiones mediante JWT / Cookies con control de roles (`user`, `organizer`, `admin`).
* **Arquitectura Profesional en Capas:**
  * **Controllers & Services:** Lógica de negocio desfasada de la capa de presentación.
  * **Repositories & DAOs:** Abstracción completa del acceso a datos con Mongoose.
  * **DTOs:** Filtrado de datos sensibles (ocultamiento de contraseñas y sanitización de respuestas).
* **Gestión de Eventos y Capacidad:**
  * Creación y actualización con restricciones según rol (solo creador o `admin`).
  * Descuento automático de cupos al inscribirse y restitución de vacantes al cancelar.
  * Validación de reglas de negocio: control de duplicados (`409 Conflict`), eventos vencidos o no publicados, y cupos agotados.
* **Notificaciones por Correo:** Envío automático de email de confirmación con código de reserva dinámico (`EVT-XXXXXX`) utilizando Nodemailer.
* **Paginación y Filtros:** Endpoint para consulta paginada de eventos por estado.

---

## 🛠️ Tecnologías Utilizadas

* **Node.js** (v22+)
* **Express.js**
* **MongoDB & Mongoose**
* **JSON Web Tokens (JWT) & Cookie Parser**
* **Bcrypt** (Encriptación de contraseñas)
* **Nodemailer** (Envío de correos)
* **Dotenv** (Manejo de variables de entorno)

---

## 📂 Estructura del Proyecto

```text
src/
├── config/           # Configuración de base de datos y entorno
├── controllers/      # Controladores de solicitudes HTTP
├── daos/             # Data Access Objects (Mongoose Queries)
├── dtos/             # Data Transfer Objects
├── middleware/       # Autenticación, validación de roles y errores
├── models/           # Esquemas de Mongoose
├── repositories/     # Capa de repositorios
├── routes/           # Definición de rutas del sistema
├── services/         # Lógica de negocio principal
├── utils/            # Helper de correo (Nodemailer) y hash
└── server.js         # Punto de entrada de la aplicación