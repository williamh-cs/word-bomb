import assert from 'node:assert/strict'
import { test } from 'node:test'
import { chooseStartingWord, getWordValidationError, isValidNextWord } from '../game/wordGame.js'
import { isDisallowedWord } from '../game/wordSafety.js'

test('negate and negation are accepted for matching pairs and explain mismatches', () => {
  for (const word of ['negate', 'negation']) {
    for (const previous of ['stone', 'yoga', 'cat']) {
      assert.equal(isValidNextWord(word, previous, new Set()), true, `${word} after ${previous}`)
    }
    assert.equal(getWordValidationError(word, 'forest', new Set()),
      'Your word must contain ST, together and in that order.')
    assert.match(getWordValidationError(word, 'stone', new Set([word])), /already been used/)
  }
  assert.match(getWordValidationError('zznezz', 'stone', new Set()), /not in the game dictionary/)
})

test('slurs and their plural forms are rejected even when they match the letter pair', () => {
  for (const word of ['chink', 'chinks', 'faggot', 'faggots', 'wetback', 'wetbacks', 'retarded']) {
    assert.equal(isDisallowedWord(word), true)
    assert.equal(isValidNextWord(word, `a${word.slice(0, 2)}`, new Set()), false)
  }
  assert.equal(isDisallowedWord('  CHINK  '), true)
})

test('ordinary words containing similar letters remain playable', () => {
  for (const word of ['spice', 'spicy', 'raccoon', 'retardant']) {
    assert.equal(isDisallowedWord(word), false, word)
    assert.equal(isValidNextWord(word, `a${word.slice(0, 2)}`, new Set()), true, word)
  }
  assert.equal(isDisallowedWord('Japanese'), false)
})

test('next word can contain the required pair at the start, middle, or end', () => {
  const used = new Set(['forest'])
  for (const word of ['stone', 'faster', 'toast']) {
    assert.equal(isValidNextWord(word, 'forest', used), true, word)
  }
  assert.equal(isValidNextWord('salt', 'forest', used), false, 'Letters must be adjacent')
  assert.equal(isValidNextWord('cats', 'forest', used), false, 'Letters must stay in order')
  assert.equal(isValidNextWord('zzstzz', 'forest', used), false, 'Must be an English word')
})

test('words used by any player, including the opener, cannot be repeated', () => {
  const used = new Set(['forest', 'faster', 'toast'])
  assert.equal(isValidNextWord('forest', 'toast', used), false)
  assert.equal(isValidNextWord('faster', 'forest', used), false)
  assert.equal(isValidNextWord('toast', 'forest', used), false)
  assert.equal(isValidNextWord('stone', 'forest', used), true)
})

test('every possible opener has several familiar valid replies', (context) => {
  const familiarReplies = {
    st: ['star', 'step', 'stop', 'stone', 'study'],
    ad: ['add', 'adapt', 'adopt', 'adult', 'admit'],
    am: ['amber', 'amaze', 'among', 'amount', 'ample'],
    ne: ['neat', 'neck', 'nest', 'never', 'news'],
    in: ['ink', 'into', 'inch', 'inside', 'insect'],
    go: ['gold', 'good', 'gone', 'goat', 'golf'],
    ra: ['rain', 'race', 'ramp', 'rank', 'rash'],
    ta: ['take', 'talk', 'tall', 'tank', 'tape'],
    ro: ['road', 'rock', 'role', 'room', 'rose'],
    to: ['tool', 'tooth', 'toast', 'total', 'tower'],
  }
  let random = 0
  context.mock.method(Math, 'random', () => random)
  const seen = new Set()
  for (let i = 0; i < 100; i += 1) {
    random = i / 100
    const opener = chooseStartingWord()
    seen.add(opener)
    const replies = familiarReplies[opener.slice(-2)]
    assert.ok(replies, `${opener} must end with an easy prefix`)
    assert.ok(replies.filter((reply) => isValidNextWord(reply, opener, new Set([opener]))).length >= 4,
      `${opener} must have at least four familiar valid replies`)
  }
  assert.ok(seen.size > 1, 'Keep variety in the opening word')
})
