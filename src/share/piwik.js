import app from '../index'

function isProduct() {
  let urls = ['localhost', 'uat.huilianyi.com', 'stage.huilianyi.com', 'http://115.159.108.80:25284'];
  let href = location.href;
  if (urls.some(item => href.indexOf(item) > -1)) {
    return false;
  }
  return true;
}
export function initPiwik() {
  if (!isProduct()) {
    return !1
  }
  /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
  let u = "https://matomo.huilianyi.com/";
  _paq.push(['trackPageView']);
  _paq.push(['enableLinkTracking']);
  _paq.push(['setTrackerUrl', u + 'piwik.php']);
  _paq.push(['setSiteId', '6']);
  (function () {
    let d = document, g = d.createElement('script'), s = d.getElementsByTagName('script')[0];
    g.type = 'text/javascript';
    g.async = true;
    g.defer = true;
    g.src = u + 'piwik.js';
    s.parentNode.insertBefore(g, s);
  })();
}
export function rejectPiwik(action) {
  if (!isProduct()) {
    return !1
  }
  let name = '测试';
  try {
    _paq.push(['setCustomDimension', 1, app.getState().login.user.fullName]);
  } catch (err) { }
  try {
    name = app.getState().login.company.name;
  } catch (err) { }
  _paq.push(['setDocumentTitle', name + '/' + action]);
  _paq.push(['setCustomUrl', '']);
  _paq.push(['trackPageView']);
  _paq.push(['enableLinkTracking']);
}
