import { join } from 'pathe'
import { build } from '../build.js'
import { HistoireConfig } from '../config.js'
import { Context } from '../context.js'

export async function buildCommand () {
  const config: HistoireConfig = {
    sourceDir: join(process.cwd(), 'src'),
    outDir: join(process.cwd(), 'histoire-dist'),
    storyMatch: ['**/*.story.vue'],
  }
  const ctx: Context = {
    config,
    mode: 'build',
  }
  await build(ctx)
}
