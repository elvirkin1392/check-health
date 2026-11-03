import {Button, Container} from "../components/main";
import {SUPPORTED_LANGUAGES, Lang} from "../i18n";
import {getStoredLang, storeLang, useLang} from "../i18n/currentLang";
import {saveLanguage} from "./api";

const PageSettings = () => {
  const {lang, t} = useLang();

  const handleSelect = async (selected: Lang) => {
    if (selected === lang) {
      return;
    }

    // The interface switches at once; the server answer only confirms or rolls it back.
    const previous = getStoredLang();
    storeLang(selected);
    try {
      storeLang(await saveLanguage(selected));
    } catch {
      storeLang(previous);
    }
  }

  return (
    <Container $width='400px' style={{margin: '20px auto'}}>
      <div style={{color: '#999', letterSpacing: '2px', marginBottom: '20px'}}>
        {t('settings_language')}
      </div>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px'}}>
        {SUPPORTED_LANGUAGES.map(code => (
          <Button key={code}
                  $type={code === lang ? 'active' : undefined}
                  aria-pressed={code === lang}
                  onClick={() => handleSelect(code)}>
            {t(`language_${code}`)}
          </Button>
        ))}
      </div>
    </Container>
  );
};

export default PageSettings;
