import {useLang} from "../i18n/currentLang";

const PageStatistics = () => {
  const {t} = useLang();

  return (
    <div>
      {t('nav_test_results')}
    </div>
  );
};

export default PageStatistics;
