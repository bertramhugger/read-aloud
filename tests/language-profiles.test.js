const assert = require('node:assert/strict')
const {test} = require('node:test')
const {readFileSync} = require('node:fs')
const vm = require('node:vm')
const context = vm.createContext({})
const defaults = readFileSync(require.resolve('../js/defaults.js'), 'utf8')
vm.runInContext(defaults.slice(defaults.indexOf('function normalizeLanguageProfiles('), defaults.indexOf('function getLanguageDisplayName(')), context)
const plain = value => JSON.parse(JSON.stringify(value))

test('normalizes stored profiles, dropping invalid and duplicate languages', () => {
  assert.deepEqual(plain(context.normalizeLanguageProfiles(undefined)), [])
  assert.deepEqual(plain(context.normalizeLanguageProfiles([
    {lang: 'da', voiceName: 'Microsoft Christel'},
    {lang: 'en'},
    {lang: 'da', voiceName: 'Other'},
    null,
    {voiceName: 'No lang'},
  ])), [
    {lang: 'da', voiceName: 'Microsoft Christel'},
    {lang: 'en', voiceName: ''},
  ])
})

test('active profile is only returned when it matches a stored profile', () => {
  const languageProfiles = [{lang: 'da', voiceName: 'Microsoft Christel'}]
  assert.equal(context.getActiveLanguageProfile({languageProfiles}), null)
  assert.equal(context.getActiveLanguageProfile({languageProfiles, activeLanguage: ''}), null)
  assert.equal(context.getActiveLanguageProfile({languageProfiles, activeLanguage: 'fr'}), null)
  assert.deepEqual(plain(context.getActiveLanguageProfile({languageProfiles, activeLanguage: 'da'})), {lang: 'da', voiceName: 'Microsoft Christel'})
})
