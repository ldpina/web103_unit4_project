import { useMemo } from 'react'
import { buildOptionMap, calcTotalPrice, formatCurrency } from '../utilities/calcprice'
import '../css/Customizer.css'

export default function Customizer({
  basePrice,
  selectedOptionIds,
  setSelectedOptionIds,
  features,
  options,
  onPreviewChange
}) {
  const optionsByFeature = useMemo(() => {
    const map = new Map()
    for (const f of features) map.set(f.id, [])
    for (const o of options) (map.get(o.feature_id) ?? []).push(o)
    return map
  }, [features, options])

  const optionMap = useMemo(() => buildOptionMap(options), [options])
  const total = calcTotalPrice(basePrice, selectedOptionIds, optionMap)

  const selectOption = (featureId, optionId) => {

    const remove = options
      .filter(o => o.feature_id === featureId)
      .map(o => o.id)
    const next = selectedOptionIds.filter(id => !remove.includes(id)).concat(optionId)

    const chosen = optionMap.get(Number(optionId))
    onPreviewChange?.(chosen?.icon_url || '')
    setSelectedOptionIds(next)
  }

  return (
    <div className="customizer-container">
      {features.map((f) => (
        <section key={f.id} className="customizer-section">
          <h3 className="customizer-feature-title">Choose {f.name}</h3>

          <div className="customizer-grid">
            {(optionsByFeature.get(f.id) || []).map((o) => {
              const active = selectedOptionIds.includes(o.id)
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => selectOption(f.id, o.id)}
                  className={`customizer-option ${active ? 'active' : ''}`}
                  title={`${o.label} (+${o.price_delta})`}
                >
                  <img
                    src={o.icon_url}
                    alt={o.label}
                    className="customizer-option-img"
                    loading="lazy"
                  />
                  <div className="customizer-label">
                    <span>{o.label}</span>
                    <span>{o.price_delta ? `+${o.price_delta}` : '+$0'}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
