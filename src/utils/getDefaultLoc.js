import getLocale from 'browser-locale'

const languages = ['en', 'fr']
const defaultLoc = 'fr'

function getDefaultLoc () {
  return 'fr'
  // let browserLoc = getLocale()
  // if (!browserLoc) return defaultLoc
  // browserLoc = browserLoc.split('-')[0]
  // if (!~languages.indexOf(browserLoc)) return defaultLoc
  // return browserLoc
}

export default getDefaultLoc
