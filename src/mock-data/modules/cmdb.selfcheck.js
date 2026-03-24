import {
  createCi,
  createCiModel,
  createCiRelation,
  createModelRelation,
  createRelationType,
  deleteCiRelation,
  exportCis,
  getAuditLogs,
  getCiModels,
  getCiRelations,
  getCis,
  getModelRelations,
  getRelationTypes,
  getTopology,
  importCis,
  runDiscovery,
  updateCi,
  upsertModelField
} from './cmdb.js'

export async function runCmdbSelfcheck() {
  const beforeModels = await getCiModels()
  const beforeTypes = await getRelationTypes()
  const beforeRelations = await getModelRelations()
  if (!beforeModels.length) throw new Error('缺少默认模型')
  if (!beforeTypes.length) throw new Error('缺少默认关系类型')

  await createRelationType({ key: 'tests_rel', label: '测试关系', directional: true })
  const types2 = await getRelationTypes()
  if (!types2.some(t => t.key === 'tests_rel')) throw new Error('关系类型新增失败')

  const testModel = await createCiModel({
    name: '测试模型',
    code: 'tests_model',
    categoryId: 'cat-other',
    description: '用于自检',
    displayField: 'name',
    fields: []
  })

  await upsertModelField(testModel.id, { key: 'name', label: '名称', type: 'text', required: true, unique: true })
  await createModelRelation({ fromModelCode: 'tests_model', typeKey: 'tests_rel', toModelCode: 'tests_model' })

  const ci1 = await createCi('tests_model', { name: 'ci-a' }, { operator: 'selfcheck', source: 'manual' })
  const ci2 = await createCi('tests_model', { name: 'ci-b' }, { operator: 'selfcheck', source: 'manual' })
  await createCiRelation({ fromId: ci1.id, toId: ci2.id, typeKey: 'tests_rel' })

  await updateCi(ci2.id, { name: 'ci-b2' }, { operator: 'selfcheck', source: 'manual' })
  const audits = await getAuditLogs({ ciId: ci2.id })
  if (!audits.length) throw new Error('审计记录缺失')

  const topo = await getTopology({ modelCodes: ['tests_model'] })
  if (!topo.nodes.length) throw new Error('拓扑节点缺失')

  const exported = await exportCis({ modelCode: 'tests_model', format: 'json' })
  const parsed = JSON.parse(exported)
  if (!Array.isArray(parsed) || !parsed.length) throw new Error('导出失败')

  await importCis({ modelCode: 'tests_model', format: 'json', content: JSON.stringify([{ name: 'ci-c' }]) })
  const all = await getCis({ modelCode: 'tests_model' })
  if (all.length < 3) throw new Error('导入失败')

  const rels = await getCiRelations({ fromId: ci1.id })
  if (!rels.length) throw new Error('关系查询失败')
  await deleteCiRelation(rels[0].id)

  await runDiscovery({ modelCode: 'host', count: 1 })

  const afterModels = await getCiModels()
  const afterTypes = await getRelationTypes()
  const afterRelations = await getModelRelations()
  if (afterModels.length < beforeModels.length + 1) throw new Error('模型未增加')
  if (afterTypes.length < beforeTypes.length + 1) throw new Error('关系类型未增加')
  if (afterRelations.length < beforeRelations.length + 1) throw new Error('模型关系未增加')

  return true
}
