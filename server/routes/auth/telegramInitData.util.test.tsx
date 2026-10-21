import * as crypto from 'node:crypto';
import {verifyTelegramInitData} from './telegramInitData.util.tsx';

const BOT_TOKEN = 'test-bot-token';

const buildInitData = (fields, botToken = BOT_TOKEN) => {
  const params = new URLSearchParams(fields);
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const hash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  params.set('hash', hash);
  return params.toString();
}

describe('verifyTelegramInitData', () => {
  const user = {id: 123, username: 'ivanova_eva', first_name: 'Eva'};

  it('returns the parsed user for a correctly signed payload', () => {
    const initData = buildInitData({
      user: JSON.stringify(user),
      auth_date: String(Math.floor(Date.now() / 1000)),
    });

    expect(verifyTelegramInitData(initData, BOT_TOKEN)).toEqual(user);
  });

  it('rejects a payload signed with a different bot token', () => {
    const initData = buildInitData({
      user: JSON.stringify(user),
      auth_date: String(Math.floor(Date.now() / 1000)),
    }, 'a-different-token');

    expect(verifyTelegramInitData(initData, BOT_TOKEN)).toBeNull();
  });

  it('rejects a tampered payload (hash no longer matches)', () => {
    const initData = buildInitData({
      user: JSON.stringify(user),
      auth_date: String(Math.floor(Date.now() / 1000)),
    });
    const tampered = initData.replace('ivanova_eva', 'attacker');

    expect(verifyTelegramInitData(tampered, BOT_TOKEN)).toBeNull();
  });

  it('rejects stale auth_date beyond maxAgeSeconds', () => {
    const oldTimestamp = Math.floor(Date.now() / 1000) - 90000;
    const initData = buildInitData({
      user: JSON.stringify(user),
      auth_date: String(oldTimestamp),
    });

    expect(verifyTelegramInitData(initData, BOT_TOKEN, 86400)).toBeNull();
  });

  it('returns null when initData or botToken is missing', () => {
    expect(verifyTelegramInitData('', BOT_TOKEN)).toBeNull();
    expect(verifyTelegramInitData('user=%7B%7D', '')).toBeNull();
  });
});
