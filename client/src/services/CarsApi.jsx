const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api'

async function handleResponse(res) {
  if (!res.ok) {
    const msg = await res.text()
    throw new Error(`API ${res.status}: ${msg}`)
  }
  return res.json()
}

export async function getAllCars() {
  const res = await fetch(`${API_BASE}/items`)
  return handleResponse(res)
}

export async function getCar(id) {
  const res = await fetch(`${API_BASE}/items/${id}`)
  return handleResponse(res)
}

export async function createCar(carData) {
  const res = await fetch(`${API_BASE}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(carData),
  })
  return handleResponse(res)
}

export async function updateCar(id, carData) {
  const res = await fetch(`${API_BASE}/items/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(carData),
  })
  return handleResponse(res)
}

export async function deleteCar(id) {
  const res = await fetch(`${API_BASE}/items/${id}`, { method: 'DELETE' })
  return handleResponse(res)
}
