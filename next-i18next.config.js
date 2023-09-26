/** @type {import('next-i18next').UserConfig} */

const languages = ['en', 'ru']

module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: languages,
    localeDetection: false,
  },
}

module.exports.languages = languages
