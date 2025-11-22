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

    const contentType = response.headers.get("content-type")
    if (contentType && contentType.includes("text/html")) {
      const text = await response.text()
      console.error("[Server Action] Recebeu HTML em vez de JSON (Provável erro do Ngrok):", text.substring(0, 200))
      return { success: false, error: "Erro de conexão com o Túnel (Ngrok)" }
    }

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`)
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error("[Server Action] Erro ao buscar dados:", error)
    return { success: false, error: "Falha na conexão com a API" }
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

    const contentType = response.headers.get("content-type")
    if (contentType && contentType.includes("text/html")) {
      return { success: false, error: "Erro de conexão com o Túnel (Ngrok)" }
    }

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`)
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error("[Server Action] Erro ao buscar config:", error)
    return { success: false, error: "Falha na conexão com a API" }
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
      throw new Error(`Erro HTTP: ${response.status}`)
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error("Erro ao salvar config:", error)
    return { success: false, error: "Falha na conexão com a API" }
  }
}
