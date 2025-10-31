import { useEffect, useState } from 'react'
import { createCar } from '../services/CarsApi'
import Customizer from '../components/Customizer'
import { calcTotalPriceFromArray } from '../utilities/calcprice'
import '../css/CreateCars.css'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api'

export default function CreateCar({ title }) {
  useEffect(() => { document.title = title || 'BOLT BUCKET | Customize' }, [title])

  const basePrice = 30000
  const [features, setFeatures] = useState([])
  const [options, setOptions] = useState([])
  const [selectedOptionIds, setSelectedOptionIds] = useState([])

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/catalog/features`).then(r => r.json()),
      fetch(`${API_BASE}/catalog/options`).then(r => r.json()),
    ])
      .then(([f, o]) => { setFeatures(f); setOptions(o) })
      .catch(console.error)
  }, [])

  const total = calcTotalPriceFromArray(basePrice, selectedOptionIds, options)

  async function handleSubmit(e) {
    e.preventDefault()
    const payload = {
      title: e.target.title?.value || 'My Corvette Build',
      base_price: basePrice,
      selected_option_ids: selectedOptionIds,
      total_price: total,
    }
    const created = await createCar(payload)
    window.location.href = `/customcars/${created.id}`
  }

  return (
    <main className="create-car-container">
      <h1 className="create-car-title">Create Custom Item</h1>

      <form onSubmit={handleSubmit} className="create-car-form">
        <label className="create-car-label">
          Build Name
          <input
            name="title"
            className="create-car-input"
            placeholder="My Corvette Build"
            required
          />
        </label>

        <div className="create-car-static">
          <span>Total:</span> ${total.toLocaleString()}
        </div>

        <Customizer
          basePrice={basePrice}
          selectedOptionIds={selectedOptionIds}
          setSelectedOptionIds={setSelectedOptionIds}
          features={features}
          options={options}
        />

        <button type="submit" className="create-car-save">SAVE</button>
      </form>
    </main>
  )
}
