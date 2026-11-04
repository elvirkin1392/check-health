// Выход из системы сбрасывал язык: при неудачном запросе профиля чистился
// весь localStorage, вместе с выбранным языком. Язык — не часть входа.

import {render, waitFor, cleanup} from '@testing-library/react';

import PageInfo from './index.tsx';
import {storeLang, getStoredLang} from '../i18n/currentLang';

jest.mock('../axios', () => ({
  instance: {
    get: jest.fn(() => Promise.reject(new Error('401'))),
    interceptors: {request: {use: jest.fn()}},
  },
}));

jest.mock('../hooks/useMediaQuery', () => ({
  useMediaQuery: () => [false],
}));

describe('неудачный запрос профиля', () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  test('сбрасывает вход, но не выбранный язык', async () => {
    storeLang('ru');
    localStorage.setItem('accessToken', 'token');
    localStorage.setItem('username', 'elvira');

    render(<PageInfo/>);

    await waitFor(() => expect(localStorage.getItem('accessToken')).toBeNull());
    expect(localStorage.getItem('username')).toBeNull();
    expect(getStoredLang()).toBe('ru');
  });
});
