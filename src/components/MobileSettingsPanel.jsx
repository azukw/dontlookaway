import { SKINS } from "../utils/i18n";

export function MobileSettingsPanel({
                                        onClose,
                                        onHelpClick,
                                        theme,
                                        onToggleTheme,
                                        skin,
                                        onSkinChange,
                                        language,
                                        onLanguageChange,
                                        isMuted,
                                        onToggleMute,
                                        t,
                                    }) {
    return (
        <div className="dialog-overlay mobile-settings-overlay" onClick={onClose}>
            <div
                className="dialog-card mobile-settings-sheet"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="dialog-head">
                    <div className="eyebrow">{t.settings}</div>
                    <button type="button" className="ghost-button" onClick={onClose}>
                        {t.close}
                    </button>
                </div>

                <div className="mobile-settings-content">
                    <div className="setting-group">
                        <div className="setting-label">{t.languageLabel}</div>
                        <div className="language-toggle" aria-label={t.languageLabel}>
                            <button
                                type="button"
                                className={`lang-button ${language === "fr" ? "is-active" : ""}`}
                                onClick={() => onLanguageChange("fr")}
                            >
                                {t.frShort}
                            </button>
                            <button
                                type="button"
                                className={`lang-button ${language === "en" ? "is-active" : ""}`}
                                onClick={() => onLanguageChange("en")}
                            >
                                {t.enShort}
                            </button>
                        </div>
                    </div>

                    <div className="setting-group">
                        <div className="setting-label">{t.skinLabel}</div>
                        <div className="skin-swatch-group mobile-swatch-group">
                            {SKINS.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    className={`skin-swatch ${skin === item.id ? "is-active" : ""}`}
                                    onClick={() => onSkinChange(item.id)}
                                    title={item.label[language]}
                                    aria-label={item.label[language]}
                                >
                  <span
                      className="skin-swatch-fill"
                      style={{ background: item.gradient }}
                  />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="setting-actions">
                        <button type="button" className="button-secondary" onClick={onToggleTheme}>
                            {theme === "dark" ? t.light : t.dark}
                        </button>

                        <button type="button" className="button-secondary" onClick={onToggleMute}>
                            {isMuted ? t.unmute : t.mute}
                        </button>

                        <button
                            type="button"
                            className="button-secondary"
                            onClick={() => {
                                onClose();
                                onHelpClick();
                            }}
                        >
                            {t.rules}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}