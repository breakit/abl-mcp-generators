import { describe, it, expect } from 'vitest'
import { scaffoldProject } from './project.js'

describe('scaffoldProject', () => {
  const files = scaffoldProject({
    name: 'demo',
    package: 'com.acme.demo',
    description: 'Demo app',
    outputDir: 'out',
  })
  const byPath = (p: string) => files.find(f => f.path === p)

  it('emits the expected file set', () => {
    expect(files.map(f => f.path).sort()).toEqual([
      'out/.gitignore',
      'out/abl.toml',
      'out/incl/.gitkeep',
      'out/schema/.gitkeep',
      'out/src/com/acme/demo/config.i',
      'out/src/com/acme/demo/def/global-defs.i',
      'out/src/com/acme/demo/start.p',
      'out/test/.gitkeep',
    ])
  })

  it('writes project metadata to abl.toml', () => {
    const toml = byPath('out/abl.toml')!.content
    expect(toml).toContain('name = "demo"')
    expect(toml).toContain('package = "com.acme.demo"')
    expect(toml).toContain('description = "Demo app"')
  })

  it('references package path in start.p and config.i', () => {
    expect(byPath('out/src/com/acme/demo/start.p')!.content).toContain('{com/acme/demo/config.i}')
    expect(byPath('out/src/com/acme/demo/config.i')!.content).toContain('{com/acme/demo/def/global-defs.i}')
  })

  it('handles missing description', () => {
    const f = scaffoldProject({ name: 'x', package: 'a.b', outputDir: 'o' } as any)
    expect(f.find(x => x.path === 'o/abl.toml')!.content).toContain('description = ""')
  })
})
