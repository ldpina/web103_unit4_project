import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCar, updateCar } from '../services/CarsApi'
import Customizer from '../components/Customizer'
import { calcTotalPriceFromArray } from '../utilities/calcprice'
import '../css/CreateCars.css' // reuse the same CSS as Create

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api'

export default function EditCar({ title }) {
  const { id } = useParams()
  const navigate = useNavigate()

  const [pageTitle] = useState(title || 'BOLT BUCKET | Edit')
  const [carTitle, setCarTitle] = useState('')
  const [basePrice, setBasePrice] = useState(30000)
  const [features, setFeatures] = useState([])
  const [options, setOptions] = useState([])
  const [selectedOptionIds, setSelectedOptionIds] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { document.title = pageTitle }, [pageTitle])

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const [car, feats, opts] = await Promise.all([
          getCar(id),
          fetch(`${API_BASE}/catalog/features`).then(r => r.json()),
          fetch(`${API_BASE}/catalog/options`).then(r => r.json()),
        ])
        if (!mounted) return
        setCarTitle(car.title || '')
        setBasePrice(Number(car.base_price ?? 30000))
        setSelectedOptionIds(Array.isArray(car.selected_option_ids) ? car.selected_option_ids : [])
        setFeatures(feats)
        setOptions(opts)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [id])

  const total = calcTotalPriceFromArray(basePrice, selectedOptionIds, options)

  async function handleSubmit(e) {
    e.preventDefault()
    const payload = {
      title: carTitle || 'My Corvette Build',
      base_price: basePrice,
      selected_option_ids: selectedOptionIds,
      total_price: total,
    }
    const updated = await updateCar(id, payload)
    navigate(`/customcars/${updated.id}`)
  }

  if (loading) return <main className="create-car-container">Loading…</main>

  return (
    <main className="create-car-container">
      <h1 className="create-car-title">Edit Custom Item</h1>

      <div className="create-car-total">
        <span>Total:</span> ${total.toLocaleString()}
      </div>

      <form onSubmit={handleSubmit} className="create-car-form">
        <label className="create-car-label">
          Build Name
          <input
            name="title"
            className="create-car-input create-car-input-white"
            placeholder="My Corvette Build"
            value={carTitle}
            onChange={(e) => setCarTitle(e.target.value)}
            required
          />
        </label>

        <Customizer
          basePrice={basePrice}
          selectedOptionIds={selectedOptionIds}
          setSelectedOptionIds={setSelectedOptionIds}
          features={features}
          options={options}
        />

        <button type="submit" className="create-car-save">SAVE CHANGES</button>
      </form>
    </main>
  )
}
