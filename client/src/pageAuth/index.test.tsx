// AC-1 и AC-2 на экране, а не на словаре: `translate` уже проверен отдельно,
// но он ничего не доказывает про то, что экран вообще им пользуется. Раньше
// подписи были литералами, и словарь мог быть сколь угодно правильным.

import {render, screen, cleanup} from '@testing-library/react';

import PageAuth from './index.tsx';
import {storeLang} from '../i18n/currentLang';

jest.mock('./api', () => ({
  loginRequest: jest.fn(),
  codeVerification: jest.fn(),
}));

describe('подписи экрана входа', () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  test('AC-1: у человека с ru подписи на русском', () => {
    storeLang('ru');

    render(<PageAuth onAuthorize={() => {}}/>);

    expect(screen.getByRole('button').textContent).toBe('Войти');
    expect(screen.getByPlaceholderText('имя пользователя')).toBeTruthy();
  });

  test('AC-2: у человека с en подписи на английском', () => {
    storeLang('en');

    render(<PageAuth onAuthorize={() => {}}/>);

    expect(screen.getByRole('button').textContent).toBe('Login');
    expect(screen.getByPlaceholderText('username')).toBeTruthy();
  });

  test('AC-6: без сохранённого языка экран на английском, а не пустой', () => {
    render(<PageAuth onAuthorize={() => {}}/>);

    expect(screen.getByRole('button').textContent).toBe('Login');
  });
});
