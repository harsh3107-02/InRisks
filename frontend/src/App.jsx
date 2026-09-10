import { useEffect, useMemo, useState } from 'react'
import InputPanel from './components/InputPanel'
import FileList from './components/FileList'
import WeatherChart from './components/WeatherChart'
import WeatherTable from './components/WeatherTable'
import { getWeatherFile, listWeatherFiles, storeWeatherData } from './api'

const defaultForm = {
  latitude: '28.6139',
  longitude: '77.2090',
  start_date: '2026-08-01',
  end_date: '2026-08-10',
}

function toDailyRows(content) {
  const daily = content?.daily || {}
  const dates = daily.time || []
  return dates.map((date, index) => ({
    date,
    max: daily.temperature_2m_max?.[index],
    min: daily.temperature_2m_min?.[index],
    apparentMax: daily.apparent_temperature_max?.[index],
    apparentMin: daily.apparent_temperature_min?.[index],
  }))
}

export default function App() {
  const [form, setForm] = useState(defaultForm)
  const [files, setFiles] = useState([])
  const [selectedFile, setSelectedFile] = useState('')
  const [weatherContent, setWeatherContent] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filesLoading, setFilesLoading] = useState(false)
  const [contentLoading, setContentLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const rows = useMemo(() => toDailyRows(weatherContent), [weatherContent])

  const refreshFiles = async () => {
    setFilesLoading(true)
    setError('')
    try {
      const result = await listWeatherFiles()
      setFiles(result.files || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setFilesLoading(false)
    }
  }

  useEffect(() => {
    refreshFiles()
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    try {
      const result = await storeWeatherData({
        ...form,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
      })
      setMessage(`Stored successfully: ${result.file}`)
      await refreshFiles()
      await selectFile(result.file)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const selectFile = async (filename) => {
    setSelectedFile(filename)
    setContentLoading(true)
    setError('')
    try {
      const content = await getWeatherFile(filename)
      setWeatherContent(content)
    } catch (err) {
      setError(err.message)
      setWeatherContent(null)
    } finally {
      setContentLoading(false)
    }
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-7">
          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Weather Explorer</h1>
        </header>

        {(message || error) && (
          <div className={`mb-5 rounded-xl border px-4 py-3 text-sm ${error ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'}`}>
            {error || message}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <InputPanel form={form} setForm={setForm} onSubmit={handleSubmit} loading={loading} />
          <FileList files={files} selectedFile={selectedFile} onSelect={selectFile} loading={filesLoading} onRefresh={refreshFiles} />
        </div>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">Weather data</h2>
            <p className="mt-1 break-all text-sm text-slate-500">
              {selectedFile || 'Select a stored file'}
            </p>
          </div>

          {contentLoading ? (
            <div className="py-16 text-center text-sm text-slate-500">Loading file...</div>
          ) : rows.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-500">No weather data selected.</div>
          ) : (
            <>
              <WeatherChart data={rows} />
              <div className="mt-8">
                <WeatherTable data={rows} />
              </div>
            </>
          )}
        </section>

      </div>
    </main>
  )
}
