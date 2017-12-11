/**
 * Append gtm script to DOM
 * @param  {String} trackId GA_TRACKING_ID
 * @param  {String} id      script id
 */
function appendGtmScript(trackId, id) {
  (function (w, d, s, l, i) {
    w[l] = w[l] || [];
    w[l].push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js'
    });
    var j = d.createElement(s),
      dl = l != 'dataLayer' ? '&l=' + l : '';
    j.async = true;
    j.id = id
    j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;

    // if dataLayer script element exists, insert after it
    var dt = d.getElementById('gtm-gt')
    var f = d.getElementsByTagName(s)[0];
    if (!!dt) {
      dt.parentNode.insertAfter(j, dt);
    } else {
      f.parentNode.insertBefore(j, f);
    }
  })(window, document, 'script', 'dataLayer', trackId);
}

/**
 * 
 * @param {*} data  dataLayer object
 */
function initDataLayer(data) {
  var f = document.getElementsByTagName('script')[0]
  var dtScript = document.createElement('script')
  dtScript.id = 'gtm-dt'
  dtScript.text = "const dataLayer = " + JSON.stringify(data)
  f.parentNode.insertBefore(dtScript, f)
}

/**
 * initialize gtm
 * @param  {String} trackId GA_TRACKING_ID
 * @param  {Object} opts  {debug,scriptId}
 */
function initialize(trackId, opts) {
  const w = window
  if (w.gtag) return
  if (opts.dataLayerData) {
    initDataLayer(opts.dataLayerData)
  }
  appendGtmScript(trackId, opts.scriptId, opts.dataLayerData)
  w.dataLayer = w.dataLayer || []
  const gtag = w.gtag = w.gtag || function () {
    w.dataLayer.push(arguments)
  }
  const gtagOpt = opts.gtagOpt || {}
  gtag("js", new Date())
  // gtag('config', trackId, gtagOpt)
  gtag({
    "event": opts.pageViewEventName,
    ...gtagOpt
  })
}

/**
 * set page path and send page_view event
 * @param  {String} pathPath
 * @param  {Object} opts
 */
function configPagePath(pathPath, opts) {
  initialize(trackId, opts)
  // send page view event
  gtag({
    "event": opts.pageViewEventName,
    "page_path": pathPath
  })
}

function log(url) {
  console.log(`set page path to: ${url}`)
}

/**
 * 
 * @param {*} router 
 * @param {*} opts
 */
export default function (router, GA_TRACKING_ID, opts = {}) {
  const options = {
    // customized page_view event filed name
    pageViewEventName: 'page_view',
    // gtm script tag's name
    scriptId: "gtm-js",
    //options dataLayer object declared before gtm script tag, (optional)
    dataLayerData: undefined,
    ...opts
  }
  if (typeof router === 'function') {
    router(url => {
      configPagePath(url, options)
      if (opts.debug) log(url)
    })
  } else {
    router.afterEach(to => {
      configPagePath(to.fullPath, options)
      if (opts.debug) log(to.fullPath)
    })
  }
}
