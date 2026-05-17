import json
import asyncio
import os
import sys
from dotenv import load_dotenv

from mirascope import llm
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

load_dotenv()
os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY", "")

# ── Mirascope Stub Tools ──────────────────────────────────────────────────────

@llm.tool
def get_salary_info(employee_id: str) -> float:
    """Consulta el sueldo base de un empleado.
    
    Args:
        employee_id: El identificador del empleado (e.g. 'EMP001').
    """
    pass

@llm.tool
def apply_deductions(amount: float) -> float:
    """Aplica las deducciones de impuestos (resta un 10% fijo) del monto bruto.
    
    Args:
        amount: El monto bruto al cual aplicarle la deducción.
    """
    pass

# ── Agent ─────────────────────────────────────────────────────────────────────

@llm.call(
    "google/gemini-flash-latest",
    tools=[get_salary_info, apply_deductions]
)
def hr_agent(query: str, history: list):
    return f"""
    SYSTEM: Eres el "Senior Compensation & Performance Agent" de una empresa global. Tu objetivo es gestionar la nómina y el talento humano utilizando herramientas de precisión (MCP) y análisis de IA.

    CAPABILITIES & TOOLS:
    1.  `get_salary_info(employee_id)`: Obtiene el sueldo base real.
    2.  `apply_deductions(amount)`: Aplica el 10% de impuestos obligatorio.
    3.  **Performance Analysis**: Tienes la autoridad para proponer un bono entre 1% y 15% analizando el feedback o descripción del desempeño del usuario sobre el empleado.
    4.  **Global Context**: Conoces el coste de vida internacional y tasas de cambio aproximadas.

    OPERATIONAL GUIDELINES:
    - Si el usuario pregunta por un sueldo, SIEMPRE comienza consultando el ID mediante `get_salary_info`.
    - Si detectas una descripción de desempeño (ej: "Luis fue increíble este mes", "trabajó horas extra y lideró el equipo", etc.), asigna con criterio un bono del 1% al 15% basado en la complejidad de los logros descritos.
    - Calcula el bono de desempeño ANTES de aplicar las deducciones (Total Bruto = Sueldo Base + Bono de Desempeño).
    - Aplica la deducción del 10% obligatorio llamando a la herramienta `apply_deductions` sobre el Total Bruto obtenido.
    - Estructura tu respuesta final estrictamente de esta forma:
        *   **Empleado y Puesto** (Confirmando datos, nombre y puesto).
        *   **Análisis de Desempeño**: Justificación detallada del % de bono asignado según la descripción de sus logros.
        *   **Desglose Económico**:
            - Sueldo Base: [monto]
            - Bono por Desempeño ([%]): [monto]
            - Deducciones Legales (10%): [monto]
            - **Sueldo Neto Final**: [monto]
        *   **Contexto Internacional**: (Opcional o si se solicita) Conversión aproximada a otra moneda relevante (ej. USD, EUR) y breve consejo sobre el mercado laboral para ese puesto.

    CONSTRAINTS:
    - No inventes salarios base; usa siempre la herramienta `get_salary_info`.
    - Si el ID no existe en la base de datos (la herramienta retorna -1.0), debes responder exactamente: "Lo siento, no tengo registros de un empleado con ese identificador. Por favor, verifica el ID."
    - Mantén la confidencialidad: Solo responde sobre el empleado solicitado.

    MESSAGES: {history}
    USER: {query}
    """

async def process_chat(query: str, history: list) -> tuple[str, list]:
    current_query = query + " \n\n (Analiza cuidadosamente si necesitas herramientas. Llámalas si las necesitas y luego escribe tu respuesta final. SIEMPRE aplica de forma autónoma las herramientas si lo requieres.)"
    
    python_exe = "../server/venv/Scripts/python.exe" if sys.platform == "win32" else "../server/venv/bin/python3"
    # Si no existe el entorno virtual del servidor, usamos el intérprete de Python actual
    if not os.path.exists(os.path.abspath(os.path.join(os.path.dirname(__file__), python_exe))):
        python_exe = sys.executable

    server_params = StdioServerParameters(
        command=python_exe, 
        args=["../server/server.py"]
    )
    
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            
            while True:
                response = hr_agent(current_query, history)
                
                if response.tool_calls:
                    for tool_call in response.tool_calls:
                        args_dict = tool_call.args if isinstance(tool_call.args, dict) else json.loads(tool_call.args)
                        
                        print(f"[Client] Evaluando tool_call MCP remoto: {tool_call.name} con {args_dict}")
                        
                        # Ejecutamos la herramienta en el servidor MCP en vez de local
                        mcp_res = await session.call_tool(tool_call.name, arguments=args_dict)
                        
                        # Obtenemos el texto puro del resultado MCP
                        if mcp_res.isError:
                            result_data = f"MCP Error: {mcp_res.content}"
                        else:
                            extracted = " ".join([c.text for c in mcp_res.content if hasattr(c, 'text')])
                            try:
                                result_data = json.loads(extracted)
                            except:
                                result_data = extracted
                        
                        history.append({"role": "model", "parts": [{"text": f"Llamando a {tool_call.name} con {tool_call.args}"}]})
                        history.append({"role": "user", "parts": [{"text": f"System/ToolResult: Resultado de la herramienta MCP {tool_call.name}: {result_data}. Continúa."}]})
                        
                    current_query = query + " \n\n (Continúa con el flujo lógico: calcula el bono correspondiente sobre el sueldo base obtenido y luego aplica las deducciones llamando a la herramienta `apply_deductions` sobre el monto bruto total. Finalmente, genera el desglose solicitado.)"
                    continue
                    
                else:
                    final_content = response.text()
                    history.append({"role": "user", "parts": [{"text": query}]})
                    history.append({"role": "model", "parts": [{"text": final_content}]})
                    return final_content, history
