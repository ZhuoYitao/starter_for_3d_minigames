import { noop } from './util/index.js'

const systemInfo = wx.getSystemInfoSync()

const system = systemInfo.system;
const platform = systemInfo.platform;
const language = systemInfo.language;

const android = system.toLowerCase().indexOf('android') !== -1;

const uaDesc = android ? 'Android; CPU Android 6.0' : 'iPhone; CPU iPhone OS 10_3_1 like Mac OS X';
const ua = `Mozilla/5.0 (${uaDesc}) AppleWebKit/603.1.30 (KHTML, like Gecko) Mobile/14E8301 MicroMessenger/6.6.0 MiniGame NetType/WIFI Language/${language}`;

const navigator = {
  platform,
  language: language,
  appVersion: `5.0 (${uaDesc}) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1`,
  userAgent: ua,
  onLine: true,

  geolocation: {
    getCurrentPosition: noop,
    watchPosition: noop,
    clearWatch: noop
  }
}

export default navigator
