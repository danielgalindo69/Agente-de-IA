# 🚀 Guía de Inicio Rápido - Asistente de Recursos Humanos con IA (MCP + Mirascope)

¡Hola! He configurado con éxito los entornos virtuales de Python y las dependencias para tu proyecto en tu sistema **Windows 11** (usando Python 3.12). 

Para garantizar la máxima compatibilidad y evitar fallos de rutas entre Windows y Linux, he actualizado el código en `client/agent.py` para que detecte de manera automática el sistema operativo y utilice el ejecutable de Python correspondiente del entorno virtual del servidor.

---

## 📁 Estructura del Proyecto y Entornos

Hemos creado y configurado dos entornos virtuales independientes para mantener el proyecto limpio y modular:

1. **Servidor MCP (`server/`)**: Contiene las herramientas de negocio (`get_salary_info` y `apply_deductions`).
   - **Ruta del entorno virtual**: `server/venv`
   - **Dependencias instaladas**: `mcp`, `pydantic`
2. **Cliente/Frontend (`client/`)**: Contiene el API de Flask y el agente de IA que orquesta las llamadas al modelo de lenguaje y ejecuta herramientas MCP.
   - **Ruta del entorno virtual**: `client/venv`
   - **Dependencias instaladas**: `Flask`, `Flask-Cors`, `pydantic`, `python-dotenv`, `mirascope[google]`, `mcp`

---

## 🔑 Paso 1: Configurar tu API Key de Google Gemini

El agente utiliza el modelo de lenguaje de Google Gemini (`google/gemini-flash-latest`). Para que pueda responder, necesitas configurar tu clave de API:

1. Abre el archivo [client/.env](file:///c:/Users/jonns/OneDrive/Escritorio/Agente%20de%20ia/agente_mirascope_mcp_interno_stdio%20%28copia%29/client/.env).
2. Modifica la línea para añadir tu clave de API obtenida de [Google AI Studio](https://aistudio.google.com/):
   ```env
   GOOGLE_API_KEY=tu_clave_api_aqui
   ```
3. Guarda el archivo.

---

## 🏃‍♂️ Paso 2: Levantar el Servidor Backend (Flask)

El backend de Flask expone un punto de acceso (`http://127.0.0.1:5000/chat`) y levanta de forma automática el servidor MCP como un subproceso STDIO cada vez que el agente requiere usar sus herramientas.

Abre una terminal de **PowerShell** en Windows y ejecuta:

```powershell
# 1. Navegar a la carpeta del cliente
cd "c:\Users\jonns\OneDrive\Escritorio\Agente de ia\agente_mirascope_mcp_interno_stdio (copia)\client"

# 2. Activar el entorno virtual
.\venv\Scripts\Activate.ps1

# Nota: Si PowerShell te bloquea la ejecución de scripts, ejecuta primero:
# Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 3. Arrancar la aplicación Flask
python api.py
```

Verás una salida indicando que el servidor Flask está corriendo en el puerto 5000:
`* Running on http://127.0.0.1:5000`

---

## 🎨 Paso 3: Abrir la Interfaz de Usuario (Frontend)

El frontend está compuesto por archivos estáticos modernos y elegantes (`index.html`, `style.css`, `app.js`) en la carpeta `client/frontend`.

Para interactuar con la IA:
1. Abre tu explorador de archivos de Windows y navega a:
   `c:\Users\jonns\OneDrive\Escritorio\Agente de ia\agente_mirascope_mcp_interno_stdio (copia)\client\frontend`
2. Haz **doble clic** en [index.html](file:///c:/Users/jonns/OneDrive/Escritorio/Agente%20de%20ia/agente_mirascope_mcp_interno_stdio%20%28copia%29/client/frontend/index.html) para abrirlo en tu navegador web preferido (Chrome, Edge, Firefox, etc.).
3. Escribe un mensaje en el chat, por ejemplo:
   * *"¿Cuál es el sueldo del empleado EMP001?"*
   * *"¿Me das el sueldo neto de Luis después de deducciones?"*

---

## 🛠️ Solución de Problemas Frecuentes

* **Error de Permisos en PowerShell (`Set-ExecutionPolicy`)**:
  Si al ejecutar `Activate.ps1` recibes un mensaje indicando que la ejecución de scripts está deshabilitada, ejecuta este comando en PowerShell para solucionarlo:
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
  ```
  E intenta activarlo de nuevo.

* **El chat no responde o sale error de conexión**:
  Asegúrate de que la terminal donde ejecutaste `python api.py` sigue abierta y corriendo. También verifica que tu clave en `client/.env` sea correcta y no tenga espacios alrededor.
