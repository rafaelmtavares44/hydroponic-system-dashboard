"use server"

const API_BASE_URL = "https://catchweight-kenton-distrustfully.ngrok-free.dev"

export async function fetchSensorData() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dados`, {
      headers: {
        "ngrok-skip-browser-warning": "true",
        "Content-Type": "application/json",
      },
      cache: "no-store", // Garante que sempre pegue dados novos
    })

    if (!response.ok) {
      const text = await response.text()

      // Detecta erro específico do ngrok não encontrando o localhost
      if (text.includes("ERR_NGROK_8012") || text.includes("dial tcp")) {
        console.error("Erro Ngrok: Não conseguiu conectar ao localhost:8080")
        return {
          success: false,
          error: "Ngrok conectado, mas não achou o Python. Tente rodar: 'ngrok http 127.0.0.1:8080'",
        }
      }

      throw new Error(`Erro HTTP: ${response.status}`)
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error: any) {
    console.error("Erro ao buscar dados:", error)
    return { success: false, error: error.message || "Falha na conexão com a API" }
  }
}

export async function fetchConfig() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/config`, {
      headers: {
        "ngrok-skip-browser-warning": "true",
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      const text = await response.text()
      if (text.includes("ERR_NGROK_8012") || text.includes("dial tcp")) {
        return {
          success: false,
          error: "Ngrok conectado, mas não achou o Python. Tente rodar: 'ngrok http 127.0.0.1:8080'",
        }
      }
      throw new Error(`Erro HTTP: ${response.status}`)
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error: any) {
    console.error("Erro ao buscar config:", error)
    return { success: false, error: error.message || "Falha na conexão com a API" }
  }
}

export async function saveConfig(configData: any) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/config`, {
      method: "POST",
      headers: {
        "ngrok-skip-browser-warning": "true",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(configData),
    })

    if (!response.ok) {
      const text = await response.text()
      if (text.includes("ERR_NGROK_8012") || text.includes("dial tcp")) {
        return {
          success: false,
          error: "Ngrok conectado, mas não achou o Python. Tente rodar: 'ngrok http 127.0.0.1:8080'",
        }
      }
      throw new Error(`Erro HTTP: ${response.status}`)
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error: any) {
    console.error("Erro ao salvar config:", error)
    return { success: false, error: error.message || "Falha na conexão com a API" }
  }
}
