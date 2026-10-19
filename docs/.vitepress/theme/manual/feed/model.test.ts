import assert from 'node:assert/strict'
import {
  burstCall,
  burstStats,
  burstTick,
  compareScript,
  emptyBurst,
  emptyRoom,
  emptyStrat,
  roomAdvance,
  roomFail,
  roomRefresh,
  stratCall,
  stratDrain,
} from './model.ts'

function burstHome(mode: 'plain' | 'single', times: number) {
  let state = emptyBurst(mode)
  for (let i = 0; i < times; i += 1) state = burstCall(state, 'feed:home')
  return state
}

const plain = burstStats(burstHome('plain', 3))
assert.equal(plain.calls, 3)
assert.equal(plain.runs, 3)
assert.equal(plain.merges, 0)

const merged = burstStats(burstHome('single', 3))
assert.equal(merged.calls, 3)
assert.equal(merged.runs, 1)
assert.equal(merged.merges, 2)

let other = emptyBurst('single')
other = burstCall(other, 'feed:home')
other = burstCall(other, 'feed:suggest')
assert.equal(other.tasks.length, 2)
assert.equal(other.tasks[0].status, 'running')
assert.equal(other.tasks[1].status, 'running')

let again = burstTick(burstHome('single', 2), 1200)
assert.equal(again.tasks[0].status, 'done')
again = burstCall(again, 'feed:home')
assert.equal(again.tasks.length, 2)

let locked = emptyStrat('mutex')
locked = stratCall(locked, 'feed:home')
locked = stratCall(locked, 'feed:suggest')
assert.equal(locked.tasks.length, 1)
assert.equal(locked.queue.length, 1)
locked = stratDrain(locked)
assert.equal(locked.tasks.length, 2)
assert.notEqual(locked.tasks[0].callerIds[0], locked.tasks[1].callerIds[0])

const report = Object.fromEntries(compareScript().map((row) => [row.strategy, row]))
assert.deepEqual(
  [report.none.runs, report.mutex.runs, report.single.runs, report.cache.runs],
  [4, 4, 3, 3],
)
assert.equal(report.single.joined, 1)
assert.equal(report.cache.hits, 1)
assert.equal(report.mutex.parallel, false)
assert.equal(report.none.parallel, true)

let room = roomRefresh(emptyRoom())
assert.equal(room.net, 'loading')
assert.equal(room.rows.length, 2)
assert.equal(room.rows[0].title, '上周的草稿')
room = roomRefresh(room)
assert.equal(room.merges, 1)
assert.equal(room.rows.length, 2)
for (let i = 0; i < 8; i += 1) room = roomAdvance(room)
assert.equal(room.net, 'ok')
assert.equal(room.rows[0].title, '刚刚拉到的新帖')

let failed = roomFail(roomRefresh(emptyRoom()), true)
for (let i = 0; i < 8; i += 1) failed = roomAdvance(failed)
assert.equal(failed.net, 'error')
assert.equal(failed.rows.length, 2)
assert.equal(failed.rows.some((row) => row.fresh), false)

console.log('feed model ok')
