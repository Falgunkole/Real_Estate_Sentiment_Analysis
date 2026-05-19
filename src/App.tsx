import { useEffect, useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { type AspectName, type PropertyInsights, getPropertyInsights } from './lib/queries';

const orderedAspects: AspectName[] = ['Utility', 'Transport', 'Location', 'Price'];

export default function App() {
  const [data, setData] = useState<PropertyInsights[]>([]);
  const [selected, setSelected] = useState<PropertyInsights | null>(null);
  const [q, setQ] = useState('');

  useEffect(() => {
    getPropertyInsights().then(setData);
  }, []);

  const filtered = useMemo(() => data.filter((p) => p.propertyName.toLowerCase().includes(q.toLowerCase())), [data, q]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="text-3xl font-bold">Real Estate Aspect Sentiment Dashboard</h1>
        <p className="text-slate-600 mt-1">Source: master_dashboard_data.json (property-level + aspect-level review intelligence)</p>
        <input className="mt-6 w-full rounded-lg border px-3 py-2" placeholder="Search property name" value={q} onChange={(e) => setQ(e.target.value)} />

        <div className="mt-6 overflow-hidden rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-left">
              <tr>
                <th className="p-3">Property Name</th><th className="p-3">Overall Sentiment</th><th className="p-3">Model Confidence</th><th className="p-3">Total Reviews</th><th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.propertyId} className="border-t">
                  <td className="p-3 font-medium">{p.propertyName}</td>
                  <td className="p-3">{p.overallSentiment}</td>
                  <td className="p-3">{(p.overallConfidence * 100).toFixed(1)}%</td>
                  <td className="p-3">{p.totalReviews}</td>
                  <td className="p-3"><button className="rounded bg-slate-900 px-3 py-1 text-white" onClick={() => setSelected(p)}>View details</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 p-4">
          <div className="mx-auto max-w-6xl max-h-[92vh] overflow-auto rounded-xl bg-white p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">{selected.propertyName}</h2>
                <a href={selected.propertyUrl} target="_blank" className="mt-1 inline-flex items-center gap-1 text-blue-600 underline">Open property link <ExternalLink size={14}/></a>
              </div>
              <button onClick={() => setSelected(null)} className="rounded border px-3 py-1">Close</button>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              {orderedAspects.map((aspect) => {
                const bucket = selected.aspects[aspect];
                return <div key={aspect} className="rounded-lg border p-4">
                  <h3 className="text-lg font-semibold">{aspect}</h3>
                  {bucket ? <>
                    <p className="text-sm">Verdict: <b>{bucket.finalVerdict}</b></p>
                    <p className="text-sm">Sentiment: <b>{bucket.sentiment}</b></p>
                    <p className="text-sm">Confidence: <b>{(bucket.confidenceScore * 100).toFixed(1)}%</b></p>
                    <div className="mt-3 space-y-3">
                      {bucket.reviews.map((r, i) => (
                        <div key={i} className="rounded border bg-slate-50 p-3">
                          <p className="text-xs text-slate-500">{r.date} · Attention weight: {r.attentionWeight.toExponential(2)}</p>
                          <p className="text-sm mt-1">{r.reviewText}</p>
                        </div>
                      ))}
                    </div>
                  </> : <p className="text-sm text-slate-500 mt-2">No data for this aspect.</p>}
                </div>;
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
