import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllCars, deleteCar } from '../services/CarsApi'
import '../css/ViewCars.css' 

const fmt = n => Number(n||0).toLocaleString(undefined,{style:'currency',currency:'USD',maximumFractionDigits:0})

export default function ViewCars({ title }) {
  const [cars, setCars] = useState([])

  useEffect(() => { document.title = title || 'BOLT BUCKET | Your Builds' }, [title])

  useEffect(() => {
    getAllCars().then(setCars).catch(console.error)
  }, [])

  async function handleDelete(id) {
    if (!confirm('Delete this build?')) return
    await deleteCar(id)
    setCars(prev => prev.filter(c => c.id !== id))
  }

  return (
    <main className="vc-container">
      <h1 className="vc-title">Your Builds</h1>

      <div className="vc-list">
        {cars.map(car => (
          <section className="vc-card" key={car.id}>
            <header className="vc-card-header">
              <h2 className="vc-car-title">{car.title}</h2>
              <div className="vc-buttons">
                <Link to={`/customcars/${car.id}`} className="vc-btn vc-btn-view">View</Link>
                <Link to={`/edit/${car.id}`} className="vc-btn vc-btn-edit">Edit</Link>
                <button onClick={() => handleDelete(car.id)} className="vc-btn vc-btn-delete">Delete</button>
              </div>
            </header>

            <p className="vc-price">
              Build price: <span className="vc-price-strong">{fmt(car.total_price ?? car.base_price)}</span>
            </p>
          </section>
        ))}
      </div>
    </main>
  )
}
