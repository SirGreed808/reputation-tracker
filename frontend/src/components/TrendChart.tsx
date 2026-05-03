import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler,
} from 'chart.js'
import type { TrendPoint } from '../types'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

interface Props { trend: TrendPoint[]; style?: React.CSSProperties }

export default function TrendChart({ trend, style }: Props) {
  const labels = trend.map(p => {
    const d = new Date(p.date)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  })

  const data = {
    labels,
    datasets: [
      {
        label: 'Reputation Score',
        data: trend.map(p => p.score),
        borderColor: '#d93025',
        backgroundColor: 'rgba(217,48,37,0.06)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: '#d93025',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
      {
        label: 'Avg Rating ×20',
        data: trend.map(p => Math.round(p.avgRating * 20)),
        borderColor: '#1a4d3e',
        borderDash: [6, 4],
        backgroundColor: 'transparent',
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 4,
        pointBackgroundColor: '#1a4d3e',
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' as const, labels: { boxWidth: 12, font: { size: 11 } } },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            if (ctx.datasetIndex === 1) return `Avg Rating: ${(ctx.raw / 20).toFixed(1)}`
            return `Score: ${ctx.raw}`
          },
        },
      },
    },
    scales: {
      y: { min: 0, max: 100, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 11 } } },
      x: { grid: { display: false }, ticks: { font: { size: 10 }, maxTicksLimit: 10 } },
    },
  }

  return (
    <div className="card trend-card" style={style}>
      <div className="card-header">90-Day Trend</div>
      <div className="card-body" style={{ height: 440 }}>
        <div role="img" aria-label="90-day reputation trend: score and average rating over time" style={{ height: '100%' }}>
          <Line data={data} options={options} />
        </div>
      </div>
    </div>
  )
}
