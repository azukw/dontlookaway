export function MenuScreen({ dailyLabel, resetCountdownLabel, onStart, t }) {
    return (
        <section className="card menu-card">
            <div className="eyebrow">{t.dailyEyebrow}</div>
            <h1 className="hero-title">{t.heroTitle}</h1>
            <p className="hero-subtitle">{t.heroSubtitle}</p>

            <div className="daily-pill">{dailyLabel}</div>

            <p className="menu-note">
                {t.dailyResetNote}
            </p>

            <p className="reset-timer">
                {t.nextResetIn} <strong>{resetCountdownLabel}</strong>
            </p>

            <div className="action-stack">
                <button type="button" className="button-primary" onClick={() => onStart("daily")}>
                    {t.playDaily}
                </button>

                <button type="button" className="button-secondary" onClick={() => onStart("training")}>
                    {t.playEndless}
                </button>
            </div>

            <div className="mini-card-grid">
                <div className="mini-card">
                    <strong>{t.mobile}</strong>
                    <span>{t.mobileDesc}</span>
                </div>

                <div className="mini-card">
                    <strong>{t.desktop}</strong>
                    <span>{t.desktopDesc}</span>
                </div>

                <div className="mini-card">
                    <strong>{t.objective}</strong>
                    <span>{t.objectiveDesc}</span>
                </div>
            </div>
        </section>
    );
}