import { test } from 'node:test'
import assert from 'node:assert/strict'
import { allowedSpaceKeys } from '../src/lib/media/entitlements.ts'

function catalog() {
  const assets = [], packs = []
  for (const [packId, type, count] of [['photos-1','image',125],['videos-1','video',30],['photos-2','image',100],['videos-2','video',35]]) {
    const assetKeys = []
    for (let index = 0; index < count; index++) {
      const key = `${packId}-${index}`
      assetKeys.push(key)
      assets.push({ key, packId, mediaType: type })
    }
    packs.push({ id: packId, assetKeys })
  }
  return { assets, packs }
}

test('Space tiers distribute exact quotas across multiple albums; no access leaks across tiers', () => {
  const sample = catalog()
  const check = (imageLimit, videoLimit, expected, secondImage, secondVideo) => {
    const allowed = allowedSpaceKeys(sample, { active: true, spaceId: 'space', imageLimit, videoLimit })
    assert.equal(allowed.size, expected)
    assert.equal(allowed.has('photos-2-0'), secondImage)
    assert.equal(allowed.has('videos-2-0'), secondVideo)
    return allowed
  }
  const guest = check(30, 10, 40, false, false)
  assert.equal(guest.has('photos-1-30'), false)
  assert.equal(guest.has('videos-1-10'), false)
  check(100, 20, 120, false, false)
  const premium = check(200, 50, 250, true, true)
  assert.equal(premium.has('photos-2-74'), true)
  assert.equal(premium.has('photos-2-75'), false)
  assert.equal(premium.has('videos-2-19'), true)
  assert.equal(premium.has('videos-2-20'), false)
  check(null, null, 290, true, true)
  assert.equal(allowedSpaceKeys(sample, { active: false, spaceId: 'space', imageLimit: null, videoLimit: null }).size, 0)
})
