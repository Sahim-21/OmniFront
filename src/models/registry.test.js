import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { SELECT_MODEL_PROMPT, composeLocalReply } from './composeReply.js'
import { MODEL_STATUS, models, resolveSelectedModel } from './registry.js'

describe('model registry', () => {
  it('registers IEEE Model as available without selecting it', () => {
    const ieee = models.find((model) => model.id === 'ieee')
    assert.ok(ieee)
    assert.equal(ieee.name, 'IEEE Model')
    assert.equal(ieee.status, MODEL_STATUS.AVAILABLE)
    assert.equal(resolveSelectedModel(null), null)
    assert.equal(resolveSelectedModel(undefined), null)
  })

  it('keeps future models visible but not selectable', () => {
    const upcoming = models.filter((model) => model.status === MODEL_STATUS.COMING_SOON)
    assert.ok(upcoming.length >= 1)
    assert.equal(upcoming[0].name, 'More Models — Coming Soon')
    assert.equal(resolveSelectedModel(upcoming[0].id), null)
  })

  it('resolves only an available model id', () => {
    assert.equal(resolveSelectedModel('ieee').id, 'ieee')
    assert.equal(resolveSelectedModel('missing'), null)
  })
})

describe('composeLocalReply', () => {
  it('does not run the IEEE reply when no model is selected', () => {
    const reply = composeLocalReply({
      query: 'hello',
      documentCount: 1,
      model: null,
    })

    assert.equal(reply.ok, false)
    assert.equal(reply.text, SELECT_MODEL_PROMPT)
    assert.doesNotMatch(reply.text, /active document/)
  })

  it('routes IEEE Model through the local simulation and says no backend is connected', () => {
    const reply = composeLocalReply({
      query: 'hello',
      documentCount: 2,
      model: resolveSelectedModel('ieee'),
    })

    assert.equal(reply.ok, true)
    assert.equal(reply.modelId, 'ieee')
    assert.match(reply.text, /2 active document/)
    assert.match(reply.text, /IEEE Model/)
    assert.match(reply.text, /No backend RAG pipeline is connected/)
  })

  it('does not invent a reply for an unsupported model', () => {
    const reply = composeLocalReply({
      query: 'hello',
      documentCount: 1,
      model: models.find((model) => model.status === MODEL_STATUS.COMING_SOON),
    })

    assert.equal(reply.ok, false)
    assert.match(reply.text, /not available/)
    assert.match(reply.text, /No other RAG pipeline is connected/)
    assert.doesNotMatch(reply.text, /Found 3 relevant chunks/)
  })
})
