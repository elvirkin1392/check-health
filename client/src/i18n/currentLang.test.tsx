// AC-9 со стороны клиента: выбор языка должен переживать закрытие приложения.
// Серверная половина (значение доходит до базы) проверена в profile.service.
//
// Здесь же сторож на тот баг, из-за которого язык слетал: `GET /api/profile`
// отдаёт поле `lang` как есть, а у нового пользователя оно пустое.

// Новый запуск приложения: модуль загружается заново, в памяти ничего не осталось.
const freshStore = async () => {
  let store!: typeof import('./currentLang');
  await jest.isolateModulesAsync(async () => { store = await import('./currentLang'); });
  return store;
};

describe('язык интерфейса между запусками', () => {
  beforeEach(() => localStorage.clear());

  test('AC-9: выбранный язык остаётся после перезапуска приложения', async () => {
    (await freshStore()).storeLang('ru');

    expect((await freshStore()).getStoredLang()).toBe('ru');
  });

  test('AC-6: без сохранённого выбора — английский, а не пустота', async () => {
    expect((await freshStore()).getStoredLang()).toBe('en');
  });

  test('AC-5: пустое поле `lang` из профиля не затирает выбранный язык', async () => {
    const {storeLang, getStoredLang} = await freshStore();
    storeLang('ru');

    storeLang('');

    expect(getStoredLang()).toBe('ru');
  });

  test('нераспознаваемое значение из базы тоже не затирает выбор', async () => {
    const {storeLang, getStoredLang} = await freshStore();
    storeLang('ru');

    storeLang('клингонский');

    expect(getStoredLang()).toBe('ru');
  });

  test('отсутствие языка в ответе ничего не меняет', async () => {
    const {storeLang, getStoredLang} = await freshStore();
    storeLang('ru');

    storeLang(undefined);

    expect(getStoredLang()).toBe('ru');
  });

  test('язык документа идёт за выбором', async () => {
    (await freshStore()).storeLang('ru');

    expect(document.documentElement.lang).toBe('ru');
  });
});
