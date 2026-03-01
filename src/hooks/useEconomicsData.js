import { useEffect, useState } from 'react'

export default function useEconomicsData(country = 'USA') {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let canceled = false
    setLoading(true)
    fetch(`/api/economics?country=${encodeURIComponent(country)}`)
      .then((r) => r.json())
      .then((d) => {
        if (!canceled) {
          setData(d)
          setLoading(false)
        }
      })
      .catch((e) => {
        if (!canceled) {
          setError(e)
          setLoading(false)
        }
      })
    return () => {
      canceled = true
    }
  }, [country])

  return { data, loading, error }
}
