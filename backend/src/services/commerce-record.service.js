const env = require('../config/env');
const databaseEnabled = Boolean(env.databaseUrl) && env.nodeEnv !== 'test';
const CommerceRecord = databaseEnabled ? require('../models/commerce-record.model') : null;
const memoryRecords = new Map();

function recordKey(kind, id) {
  return `${kind}:${id}`;
}

async function getRecord(kind, id, transaction) {
  if (!CommerceRecord) return memoryRecords.get(recordKey(kind, id)) || null;
  const record = await CommerceRecord.findByPk(recordKey(kind, id), { transaction });
  return record ? record.value : null;
}

async function listRecords(kind) {
  if (!CommerceRecord) {
    const prefix = `${kind}:`;
    return [...memoryRecords.entries()].filter(([key]) => key.startsWith(prefix)).map(([, value]) => value);
  }
  const records = await CommerceRecord.findAll({ where: { kind }, order: [['createdAt', 'ASC']] });
  return records.map((record) => record.value);
}

async function saveRecord(kind, id, value, transaction) {
  if (!CommerceRecord) {
    memoryRecords.set(recordKey(kind, id), value);
    return value;
  }
  await CommerceRecord.upsert({
    key: recordKey(kind, id),
    kind,
    value,
  }, { transaction });
  return value;
}

async function deleteRecord(kind, id) {
  if (!CommerceRecord) {
    memoryRecords.delete(recordKey(kind, id));
    return;
  }
  await CommerceRecord.destroy({ where: { key: recordKey(kind, id) } });
}

module.exports = {
  databaseEnabled,
  CommerceRecord,
  getRecord,
  listRecords,
  saveRecord,
  deleteRecord,
};
