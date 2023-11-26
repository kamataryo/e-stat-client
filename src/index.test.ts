import { test } from 'node:test'
import assert from 'node:assert'
import { Client } from './'

test('should return an instance', async () => {
  const client = new Client({ appid: 'test-app-id' })
  assert.equal(client instanceof Client, true)
  assert.equal(client.options.appid, 'test-app-id')
})

