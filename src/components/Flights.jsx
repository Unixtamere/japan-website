import FlightCard from './FlightCard.jsx'

export default function Flights({ flights, onRefresh }) {
  return (
    <section className="section" id="flights">
      <h2 className="section-title">
        <span className="section-emoji">🛫</span> Flights
      </h2>
      {flights.length === 0 ? (
        <p className="empty">No flights yet.</p>
      ) : (
        <div className="flight-grid">
          {flights.map((f) => (
            <FlightCard key={f.id} flight={f} onRefresh={onRefresh} />
          ))}
        </div>
      )}
    </section>
  )
}
