import wordList from 'an-array-of-english-words' with { type: 'json' }
import { isDisallowedWord } from './wordSafety.js'

const words = wordList.filter((word) => /^[a-z]{3,}$/.test(word) && !isDisallowedWord(word))
const wordSet = new Set(words)
const easyOpeners = [
  'forest', 'coast', 'toast', 'nest', 'bread', 'dream', 'steam',
  'stone', 'train', 'mango', 'zebra', 'pasta', 'hero', 'potato',
]
const startingWords = easyOpeners.filter((word) => wordSet.has(word))

if (startingWords.length === 0) {
  throw new Error('The word list does not contain any playable starting words.')
}

export function chooseStartingWord() {
  return startingWords[Math.floor(Math.random() * startingWords.length)]
}

export function getWordValidationError(word, currentWord, usedWords) {
  if (isDisallowedWord(word)) return 'Please choose a respectful word.'
  if (usedWords.has(word)) return 'That word has already been used. Choose a different word.'
  if (!wordSet.has(word)) return 'That word is not in the game dictionary. Try another English word.'
  const pair = currentWord.slice(-2)
  if (!word.includes(pair)) return `Your word must contain ${pair.toUpperCase()}, together and in that order.`
  return null
}

export function isValidNextWord(word, currentWord, usedWords) {
  return getWordValidationError(word, currentWord, usedWords) === null
}
