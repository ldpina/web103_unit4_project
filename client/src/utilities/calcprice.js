export function buildOptionMap(options = []) {
  const map = new Map()
  for (const o of options || []) map.set(Number(o.id), o)
  return map
}

export function getOptionPrice(optionId, optionMapOrArray = []) {
  if (optionId == null) return 0
  if (optionMapOrArray instanceof Map) {
    const o = optionMapOrArray.get(Number(optionId))
    return Number(o?.price_delta || 0)
  }
  const found = (optionMapOrArray || []).find(o => Number(o.id) === Number(optionId))
  return Number(found?.price_delta || 0)
}

export function getOptionPrices(selectedOptionIds = [], optionMapOrArray = []) {
  return (selectedOptionIds || []).map(id => ({
    id: Number(id),
    price: getOptionPrice(id, optionMapOrArray),
  }))
}

export function sum(values = []) {
  let total = 0
  for (const v of values) total += Number(v || 0)
  return total
}

export function calcTotalPrice(basePrice = 0, selectedOptionIds = [], optionMapOrArray = []) {
  const parts = getOptionPrices(selectedOptionIds, optionMapOrArray).map(p => p.price)
  return Number(basePrice || 0) + sum(parts)
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
    .format(Number(amount || 0))
}

export function calcTotalPriceFromArray(basePrice = 0, selectedOptionIds = [], allOptions = []) {
  const map = buildOptionMap(allOptions)
  return calcTotalPrice(basePrice, selectedOptionIds, map)
}
