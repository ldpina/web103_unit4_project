import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getCar } from '../services/CarsApi'
import '../css/CarDetails.css'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api'
const fmt = (n) =>
  Number(n || 0).toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

export default function CarDetails({ title }) {
  const { id } = useParams()
  const [car, setCar] = useState(null)
  const [options, setOptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (title) document.title = title
  }, [title])

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const [c, opts] = await Promise.all([
          getCar(id),
          fetch(`${API_BASE}/catalog/options`).then(r => r.json())
        ])
        if (!mounted) return
        setCar(c)
        setOptions(opts)
      } catch (e) {
        console.error(e)
        setError('Failed to load car details.')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [id])

  const optionMap = useMemo(() => {
    const m = new Map()
    for (const o of options) m.set(Number(o.id), o)
    return m
  }, [options])

  if (loading) return <main className="cd-container">Loading…</main>
  if (error)   return <main className="cd-container">{error}</main>
  if (!car)    return <main className="cd-container">Not found.</main>

  const picked = (car.selected_option_ids || [])
    .map(oid => optionMap.get(Number(oid)))
    .filter(Boolean)

  return (
    <main className="cd-container">
       
        <h1 className="cd-title">{car.title}</h1>

        <div className="cd-actions">
            <Link to="/customcars" className="cd-btn">Back</Link>
            <Link to={`/edit/${car.id}`} className="cd-btn cd-btn-edit">Edit</Link>
        </div>

        <div className="cd-info-box">
            <div className="cd-total"><strong>Total:</strong> {fmt(car.total_price || car.base_price)}</div>

            <div className="cd-line"><strong>Selected Options:</strong></div>

            <div className="cd-options-column">
            {picked.length === 0 && <div className="cd-no-options">No options selected</div>}
            {picked.map(opt => (
                <div className="cd-option" key={opt.id}>
                <div className="cd-option-img-wrap">
                    <img className="cd-option-img" src={opt.icon_url} alt={opt.label} />
                </div>
                <div className="cd-option-label">
                    <span className="cd-option-name">{opt.label}</span>
                    {opt.price_delta ? <span className="cd-option-price">+{opt.price_delta}</span> : null}
                </div>
                </div>
            ))}
            </div>
        </div>
    </main>


  )
}
