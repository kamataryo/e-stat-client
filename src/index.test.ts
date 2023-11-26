import { test } from 'node:test'
import assert from 'node:assert'
import { Client } from './'

test('should return an instance', async () => {
  const client = new Client({ appId: 'test-app-id' })
  assert.equal(client instanceof Client, true)
  assert.equal(client.options.appId, 'test-app-id')
})

test('should get stats list', async () => {
  const client = new Client()
  const statsList = await client.getStatsList({ limit: 1 })
  assert.notEqual(statsList.GET_STATS_LIST, undefined)
})

test('should get stats data', async () => {
  const client = new Client()
  const statsData = await client.getStatsData({ statsDataId: '0003001568' })
  assert.notEqual(statsData.GET_STATS_DATA, undefined)
})
