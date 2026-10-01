function StatCard({ titulo, valor }) {
  return (
    <article className="stat-card">
      <p>{titulo}</p>
      <h3>{valor}</h3>
    </article>
  );
}

export default StatCard;