import { SKINS } from "../utils/i18n";

export function Header({
                           onHelpClick,
                           onBrandClick,
                           theme,
                           onToggleTheme,
                           skin,
                           onSkinChange,
                           language,
                           onLanguageChange,
                           t,
                       }) {
    return (
        <header className="topbar">
            <button type="button" className="brand brand-button" onClick={onBrandClick}>
                <span className="brand-word">DontLookAway</span>
            </button>

            <div className="topbar-actions">
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

                <div className="skin-picker" aria-label={t.skinLabel}>
                    <span>{t.skinLabel}</span>
                    <div className="skin-swatch-group">
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

                <button type="button" className="ghost-button theme-toggle" onClick={onToggleTheme}>
                    {theme === "dark" ? t.light : t.dark}
                </button>

                <button type="button" className="ghost-button" onClick={onHelpClick}>
                    {t.rules}
                </button>
            </div>
        </header>
    );
}