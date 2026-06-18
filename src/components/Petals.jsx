// Decorative falling sakura petals. Purely visual (aria-hidden).
const PETALS = Array.from({ length: 14 })

export default function Petals() {
  return (
    <div className="petals" aria-hidden="true">
      {PETALS.map((_, i) => (
        <span
          key={i}
          className="petal"
          style={{
            left: `${(i / PETALS.length) * 100 + Math.random() * 6}%`,
            animationDelay: `${Math.random() * 12}s`,
            animationDuration: `${10 + Math.random() * 10}s`,
            transform: `scale(${0.6 + Math.random() * 0.8})`,
          }}
        />
      ))}
    </div>
  )
}
