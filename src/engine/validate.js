// Проверка сценария в dev-режиме: опечатки в id сцен, фонов и эмоций
// сразу видны в консоли браузера, а не всплывают посреди прохождения.

export function validateScenario(scenario, assets, route) {
  const problems = []
  const stops = new Set(route.map((s) => s.id))
  const referenced = new Set(['start'])

  const checkNext = (from, next) => {
    if (typeof next === 'function') return // вычисляется во время игры
    referenced.add(next)
    if (!scenario[next]) problems.push(`${from}: нет сцены «${next}»`)
  }

  for (const [id, scene] of Object.entries(scenario)) {
    if (scene.bgKey && !assets.bg[scene.bgKey]) problems.push(`${id}: нет фона «${scene.bgKey}»`)
    if (scene.characterKey && !assets.characters[scene.characterKey]) problems.push(`${id}: нет персонажа «${scene.characterKey}»`)
    if (scene.emotion && !Object.values(assets.characters).some((c) => c[scene.emotion])) problems.push(`${id}: нет эмоции «${scene.emotion}»`)
    if (scene.stop && !stops.has(scene.stop)) problems.push(`${id}: нет точки маршрута «${scene.stop}»`)
    if (!scene.nextId && !scene.choices?.length && !scene.isEnd) problems.push(`${id}: тупик — нет nextId, choices или isEnd`)
    if (scene.nextId) checkNext(id, scene.nextId)
    for (const choice of scene.choices || []) checkNext(id, choice.nextId)
  }

  // сцены-концовки выбираются функцией, поэтому статически на них не ссылаются
  const dynamicTargets = Object.values(scenario).some((s) => typeof s.nextId === 'function')
  for (const id of Object.keys(scenario)) {
    if (!referenced.has(id) && !(dynamicTargets && scenario[id].isEnd)) problems.push(`${id}: на сцену никто не ссылается`)
  }

  if (problems.length) console.warn('[scenario]\n' + problems.join('\n'))
  else console.info(`[scenario] ок, сцен: ${Object.keys(scenario).length}`)
}
