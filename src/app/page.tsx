export default function HomePage() {
  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">PRÉPARATION AU CONCOURS EXTERNE</p>
        <h1>Caporal <span>SPP</span></h1>
        <p className="intro">
          Un programme clair, un entraînement structuré et un coach qui adapte
          tes révisions à ta progression.
        </p>
        <div className="status">
          <span className="statusDot" />
          Fondations du projet en construction
        </div>
      </section>
      <section className="panel">
        <p className="panelLabel">LES DEUX PARCOURS</p>
        <div className="trackGrid">
          <article>
            <h2>Voie classique</h2>
            <p>Compréhension de texte et mathématiques.</p>
          </article>
          <article>
            <h2>Voie SPV</h2>
            <p>Compréhension de texte et connaissances de sapeur-pompier volontaire.</p>
          </article>
        </div>
      </section>
      <footer>Une préparation exigeante, progressive et explicable.</footer>
    </main>
  );
}
