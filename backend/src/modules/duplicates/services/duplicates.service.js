const imghash = require("imghash");

const duplicatesRepository = require("../repository/duplicates.repository");

function hammingDistance(a, b) {
  let distance = 0;
  const max = Math.min(a.length, b.length);

  for (let index = 0; index < max; index += 1) {
    if (a[index] !== b[index]) {
      distance += 1;
    }
  }

  return distance + Math.abs(a.length - b.length);
}

async function buildDuplicateContext(eventId, photos) {
  const items = [];

  for (const photo of photos) {
    const hash = await imghash.hash(photo.thumbnail_path, 16, "hex");
    items.push({ photo, hash });
  }

  const groups = [];

  for (const item of items) {
    const matched = groups.find((group) => hammingDistance(group.hash, item.hash) <= 8);

    if (matched) {
      matched.items.push(item);
      continue;
    }

    groups.push({
      hash: item.hash,
      items: [item],
    });
  }

  for (const group of groups) {
    if (group.items.length < 2) {
      continue;
    }

    const groupEntity = await duplicatesRepository.createOrGetGroup({
      eventId,
      groupKey: group.hash.slice(0, 12),
    });

    for (const item of group.items) {
      await duplicatesRepository.assignPhotoToGroup(item.photo.id, groupEntity.id);
    }
  }

  return items.reduce((accumulator, item) => {
    const group = groups.find((candidate) => candidate.items.some((entry) => entry.photo.id === item.photo.id));
    accumulator[item.photo.id] = {
      hash: item.hash,
      isDuplicate: Boolean(group && group.items.length > 1),
      groupSize: group ? group.items.length : 1,
      groupKey: group ? group.hash.slice(0, 12) : null,
    };
    return accumulator;
  }, {});
}

module.exports = { buildDuplicateContext, hammingDistance };
