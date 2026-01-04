
# SushiMex Enterprise - Management System

**Gestión Inteligente v27.22**

## Descripción

SushiMex Enterprise es un sistema de gestión de restaurantes de alta gama, diseñado para cadenas y sucursales múltiples. Proporciona una solución integral que abarca desde el Punto de Venta (POS) hasta la gestión de Recursos Humanos, control de inventario con gramaje preciso, protección de auditoría y reportes financieros detallados.

Este proyecto es una demostración _frontend_ completa construida con tecnologías web modernas, mostrando una interfaz de usuario sofisticada, reactiva y rica en funcionalidades.

## Características Principales

-   **Dashboard Analítico:** Visualización de métricas clave en tiempo real: ventas, personal activo, alertas de inventario.
-   **Punto de Venta (POS):** Interfaz táctil optimizada para cajeros y meseros, con gestión de mesas, pedidos para llevar y a domicilio.
-   **Hub de Operaciones:** Módulos KDS (Kitchen Display System) para Cocina y Bar, y un centro de logística para repartidores.
-   **Gestión de Suministros:** Control de inventario por gramaje, seguimiento de stock mínimo y generación de órdenes de compra.
-   **Comando de Flota:** Seguimiento de vehículos de reparto en tiempo real.
-   **Gestión de Personal (RRHH):** Administración de usuarios, roles, permisos y un portal para empleados.
-   **CRM:** Módulo básico de gestión de clientes.
-   **Auditoría y Reportes:** Registro de acciones críticas y reportes financieros.
-   **Alta Personalización:** Múltiples temas de color, modo claro/oscuro y selección de idioma.

## Tech Stack

-   **Framework:** React 19
-   **Lenguaje:** TypeScript
-   **Estilos:** Tailwind CSS
-   **Gráficas:** Recharts
-   **Módulos Nativos:** Utiliza `esm.sh` para importar dependencias directamente en el navegador sin un paso de `build`.

## Cómo Empezar

Este proyecto está configurado para ejecutarse directamente en un entorno de desarrollo compatible con `importmap`. No requiere un proceso de `build`.

1.  Asegúrate de tener un servidor web local. Puedes usar `http-server` de npm o la extensión "Live Server" en VS Code.
2.  Clona el repositorio:
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    ```
3.  Navega a la carpeta del proyecto:
    ```bash
    cd <NOMBRE_CARPETA_PROYECTO>
    ```
4.  Sirve los archivos desde la raíz del proyecto. Si usas `http-server`:
    ```bash
    npx http-server .
    ```
5.  Abre tu navegador y ve a la dirección que te proporcione el servidor (ej. `http://localhost:8080`).

## Credenciales de Acceso para Pruebas

Para acceder al sistema, utiliza los siguientes PINs en la pantalla de inicio de sesión. Cada PIN corresponde a un rol diferente, permitiendo probar las distintas funcionalidades y restricciones.

| Rol                | Nombre de Usuario    | PIN    |
| ------------------ | -------------------- | ------ |
| **ADMIN_IT**       | CHRIS REY            | `1991` |
| **PROPIETARIO**    | PROPIETARIO NEXUS    | `2025` |
| **GERENTE**        | GERENTE SUCURSAL     | `2000` |
| **JEFE_AREA**      | JEFE DE COCINA       | `3000` |
| **CAJERO**         | CAJERO TURNO A       | `1234` |
| **MESERO**         | MESERO TURNO A       | `4000` |
| **COCINERO**       | COCINERO LINEA       | `5000` |
| **REPARTIDOR**     | JUAN PEREZ           | `5555` |
| **REPARTIDOR**     | LUIS GOMEZ           | `6666` |

## Licencia

Este proyecto se distribuye bajo la licencia MIT. Consulta el archivo `LICENSE` para más detalles.

---

_Elaborado por AR Control Inteligente_
