# Sistema de Procesamiento de Lotes Financieros (Financial Batch Processing System)

Sistema full-stack para la ingesta, validación, procesamiento eficiente por lotes y gestión de corrección de transacciones bancarias desde archivos CSV de corresponsales bancarios.

---

## 🚀 Arquitectura y Tecnologías

### **Backend**
* **Framework:** ASP.NET Core Web API (.NET 10 / C#)
* **Persistencia:** Entity Framework Core con base de datos MySQL.
* **Procesamiento CSV:** `CsvHelper` con patrón de lectura streaming en 2 pasadas (`IAsyncEnumerable`) para alto rendimiento y bajo consumo de memoria.
* **Validaciones:** Motor de reglas de negocio para unicos (`Cuenta + Fecha + Monto`), cuenta (10 dígitos), monto positivo y fecha válida.

### **Frontend**
* **Framework:** React 19.x + Vite
* **UI & Estilos:** Material UI (MUI v9) + `@mui/icons-material`
* **Enrutamiento:** React Router v7
* **Diseño:** Responsive (card layout para dispositivos móviles, tablas para escritorio), paleta accesible (WCAG AA).

---

## 📋 Reglas de Negocio y Validación

### **Estados de Transacción**
1. **`PROCESADO`**: Cumple todas las reglas:
   - `Cuenta`: Requerida, exactamente 10 dígitos numéricos.
   - `Monto`: Requerido, valor monetario positivo (`Monto > 0`).
   - `Fecha`: Requerida, fecha válida.
   - `Unicidad`: Sin duplicados de la combinación `(Cuenta + Fecha + Monto)` en el lote ni en la base de datos.
2. **`RECHAZADA`**: Asignado si falla cualquiera de las reglas anteriores. Persiste el motivo de rechazo explícito (`MotivoRechazo`).

### **Reprocesamiento / Edición**
* Las transacciones rechazadas **por motivos de monto** (`MontoNoNumerico` o `MontoNoPositivo`) permiten editar su valor y ejecutarse de nuevo en el motor de validación en tiempo real.

---

## 🛠️ Estructura del Proyecto

```text
hackaton/
├── backend/
│   ├── Common/              # Validaciones y utilidades de error
│   ├── Features/            # Slices verticales por dominio
│   │   ├── Files/           # Endpoints, DTOs y CsvFileProcessor
│   │   └── Transactions/    # Endpoints de actualización y DTOs
│   ├── Infrastructure/      # DbContext EF Core, FileSystem scanner, Logging
│   ├── Migrations/          # Migraciones de EF Core
│   └── script.sql           # Script de creación de base de datos MySQL
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes UI (files, transactions, common)
│   │   ├── hooks/           # Custom hooks (useFiles, useTransactions)
│   │   ├── services/        # Cliente API HTTP y Mock API adapter
│   │   └── theme/           # Configuración del tema MUI
│   └── vite.config.js       # Configuración de Vite
└── README.md
```

---

## ⚡ Instalación y Ejecución

### **Requisitos Previos**
- [.NET 10 SDK](https://dotnet.microsoft.com/) (o .NET 8+)
- [Node.js](https://nodejs.org/) v18+ y `npm`
- Servidor de base de datos MySQL local o remoto

---

### **1. Base de Datos (MySQL)**

Ejecuta el script SQL incluido en `backend/script.sql` en tu instancia MySQL para crear la estructura de tablas e índices requeridos:

```bash
mysql -u tu_usuario -p tu_base_de_datos < backend/script.sql
```

O bien aplica la migración con EF Core CLI desde el directorio `backend`:

```bash
cd backend
dotnet ef database update
```

---

### **2. Configuración e Inicio del Backend**

1. Navega a la carpeta `backend`:
   ```bash
   cd backend
   ```
2. Configura tu cadena de conexión MySQL en `appsettings.json` o `appsettings.Development.json`:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=localhost;Database=hackaton_db;User=root;Password=tu_password;"
   },
   "FileScanner": {
     "InputDirectory": "input"
   }
   ```
3. Ejecuta la aplicación:
   ```bash
   dotnet run
   ```
   La API estará escuchando en `http://localhost:5000` (o el puerto configurado).

---

### **3. Configuración e Inicio del Frontend**

1. Navega a la carpeta `frontend`:
   ```bash
   cd frontend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Configura el archivo `.env`:
   ```env
   VITE_USE_MOCK=false
   VITE_API_URL=http://localhost:5000
   ```
4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

---

## 🔌 Especificación de la API REST (Endpoints)

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| **`GET`** | `/files/available` | Lista los archivos CSV no procesados en el directorio `/input` incluyendo tamaño y número de filas. |
| **`POST`** | `/files/process` | Procesa un archivo CSV especificado en dos pasadas streaming y almacena el resultado en BD. |
| **`GET`** | `/files` | Obtiene el historial de lotes procesados con sus estados (`PROCESADO`, `CON_ERRORES`, `FALLIDO`). |
| **`GET`** | `/files/{id}` | Obtiene el detalle de un lote con paginación (por cursor/página) y filtro de estado (`PROCESADO`/`RECHAZADA`). |
| **`POST`** | `/transactions/{id}` | Edita el monto de una transacción rechazada por motivo de monto y re-evalúa su estado. |

---

## 🧪 Verificación y Calidad de Código

### Backend
```bash
cd backend
dotnet build
```

### Frontend
```bash
cd frontend
npx eslint src/
npx vite build
```
