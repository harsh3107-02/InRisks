export default function InputPanel({ form, setForm, onSubmit, loading }) {
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-lg font-semibold text-slate-900">Fetch weather data</h2>
      <p className="mt-1 text-sm text-slate-500">Choose a location and up to 31 days.</p>

      <form onSubmit={onSubmit} className="mt-5 grid gap-4 sm:grid-cols-2">
        {[
          ['latitude', 'Latitude', 'number', '-90 to 90'],
          ['longitude', 'Longitude', 'number', '-180 to 180'],
          ['start_date', 'Start date', 'date', ''],
          ['end_date', 'End date', 'date', ''],
        ].map(([key, label, type, placeholder]) => (
          <label key={key} className="text-sm font-medium text-slate-700">
            {label}
            <input
              required
              type={type}
              step={type === 'number' ? 'any' : undefined}
              value={form[key]}
              onChange={(event) => update(key, event.target.value)}
              placeholder={placeholder}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </label>
        ))}

        <div className="sm:col-span-2 flex flex-wrap items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-slate-900 px-5 py-2.5 font-medium text-white hover:bg-slate-800"
          >
            {loading ? 'Fetching...' : 'Fetch & Store Data'}
          </button>
          <span className="text-xs text-slate-500">Data is fetched once and then read from S3.</span>
        </div>
      </form>
    </section>
  )
}
