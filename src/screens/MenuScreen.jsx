export function MenuScreen({ dailyLabel, resetCountdownLabel, onStart, t }) {
    return (
        <section className="card menu-card menu-beat-card">
            <div className="menu-beat-bg">
                <span className="menu-beat-orb orb-1" />
                <span className="menu-beat-orb orb-2" />
                <span className="menu-beat-orb orb-3" />
            </div>

            <div className="eyebrow">{t.dailyEyebrow}</div>
            <h1 className="hero-title menu-hero-title">{t.heroTitle}</h1>
            <p className="hero-subtitle">{t.heroSubtitle}</p>

            <div className="daily-pill">{dailyLabel}</div>

            <p className="menu-note">{t.dailyResetNote}</p>

            <p className="reset-timer">
                {t.nextResetIn} <strong>{resetCountdownLabel}</strong>
            </p>

            <div className="action-stack">
                <button
                    type="button"
                    className="button-primary beat-button beat-button-primary"
                    onClick={() => onStart("daily")}
                >
                    {t.playDaily}
                </button>

                <button
                    type="button"
                    className="button-secondary beat-button"
                    onClick={() => onStart("training")}
                >
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

            <div className="menu-footer-links" aria-label="Liens externes">
                <a
                    className="menu-footer-link"
                    href="https://mindster.fr"
                    target="_blank"
                    rel="noreferrer"
                >
                    {t.menuLinkMindster}
                </a>
                <a
                    className="menu-footer-link"
                    href="https://buymeacoffee.com/mindsters"
                    target="_blank"
                    rel="noreferrer"
                >
                    {t.menuLinkSupport}
                </a>
            </div>
        </section>
    );
}