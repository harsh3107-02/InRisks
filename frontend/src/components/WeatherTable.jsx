import { useMemo, useState } from 'react'

export default function WeatherTable({ data }) {
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize))
  const safePage = Math.min(page, totalPages)

  const visible = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return data.slice(start, start + pageSize)
  }, [data, safePage, pageSize])

  const changePageSize = (value) => {
    setPageSize(Number(value))
    setPage(1)
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">{data.length} daily rows</p>
        <label className="text-sm text-slate-600">
          Rows per page:{' '}
          <select
            value={pageSize}
            onChange={(event) => changePageSize(event.target.value)}
            className="rounded border border-slate-300 px-2 py-1"
          >
            {[10, 20, 50].map((size) => <option key={size}>{size}</option>)}
          </select>
        </label>
      </div>

      <div className="overflow-auto rounded-lg border border-slate-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Max °C</th>
              <th className="px-4 py-3">Min °C</th>
              <th className="px-4 py-3">Apparent max °C</th>
              <th className="px-4 py-3">Apparent min °C</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.date} className="border-t border-slate-100">
                <td className="px-4 py-3">{row.date}</td>
                <td className="px-4 py-3">{row.max ?? '—'}</td>
                <td className="px-4 py-3">{row.min ?? '—'}</td>
                <td className="px-4 py-3">{row.apparentMax ?? '—'}</td>
                <td className="px-4 py-3">{row.apparentMin ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <button
          onClick={() => setPage(Math.max(1, safePage - 1))}
          disabled={safePage === 1}
          className="rounded border border-slate-300 px-3 py-2 text-sm"
        >
          Previous
        </button>
        <span className="text-sm text-slate-500">Page {safePage} of {totalPages}</span>
        <button
          onClick={() => setPage(Math.min(totalPages, safePage + 1))}
          disabled={safePage === totalPages}
          className="rounded border border-slate-300 px-3 py-2 text-sm"
        >
          Next
        </button>
      </div>
    </div>
  )
}
