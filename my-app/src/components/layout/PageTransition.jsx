import { useLocation } from 'react-router-dom'

export default function PageTransition({ children }) {
  const location = useLocation()

  return (
    <div className="page-transition" key={location.pathname}>
      <div className="page-magic" aria-hidden="true">
        {Array.from({ length: 24 }, (_, index) => (
          <span
            className="magic-sparkle"
            key={index}
            style={{
              '--x': `${(index * 37 + 11) % 100}%`,
              '--y': `${(index * 23 + 7) % 100}%`,
              '--delay': `${(index % 6) * 45}ms`,
              '--size': `${8 + (index % 4) * 4}px`,
              '--drift': `${(index % 2 === 0 ? 1 : -1) * (18 + index % 5 * 8)}px`,
            }}
          />
        ))}
      </div>
      <div className="page-transition-content">{children}</div>
    </div>
  )
}
