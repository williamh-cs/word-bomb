const blockedRoots = [
  'nigger', 'nigga', 'negro', 'coon', 'darkie', 'jigaboo', 'pickaninny',
  'chink', 'gook', 'jap', 'zipperhead', 'slanteye',
  'kike', 'heeb', 'hymie', 'spic', 'spick', 'wetback', 'beaner',
  'dago', 'wop', 'guido', 'paki', 'raghead', 'towelhead', 'camel jockey',
  'redskin', 'squaw', 'injun', 'abo', 'boong', 'kaffir', 'kafir',
  'fag', 'faggot', 'dyke', 'tranny', 'shemale', 'ladyboy',
  'retard', 'mongoloid', 'spastic', 'spaz', 'tard',
]

const blockedWords = new Set([
  ...blockedRoots.flatMap((root) => [root, `${root}s`, `${root}es`]),
  'retarded', 'retarding', 'retardation', 'faggotry',
  'faggy', 'dykey', 'darkies', 'pickaninnies', 'trannies',
  'camel jockeys', 'cameljockey', 'cameljockeys',
])

export function isDisallowedWord(word) {
  return typeof word === 'string' && blockedWords.has(word.trim().toLowerCase())
}
