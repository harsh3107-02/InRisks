export default function FileList({ files, selectedFile, onSelect, loading, onRefresh }) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Stored files</h2>
          <p className="mt-1 text-sm text-slate-500">Select a stored JSON file to view it.</p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <div className="mt-4 max-h-80 overflow-auto rounded-lg border border-slate-200">
        {files.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">No stored weather files found.</p>
        ) : (
          files.map((file) => (
            <button
              key={file.name}
              onClick={() => onSelect(file.name)}
              className={`block w-full border-b border-slate-100 px-4 py-3 text-left text-sm last:border-b-0 hover:bg-slate-50 ${
                selectedFile === file.name ? 'bg-slate-100' : ''
              }`}
            >
              <div className="font-medium break-all text-slate-800">{file.name}</div>
              <div className="mt-1 text-xs text-slate-500">
                {file.size.toLocaleString()} bytes · {new Date(file.created_at).toLocaleString()}
              </div>
            </button>
          ))
        )}
      </div>
    </section>
  )
}
