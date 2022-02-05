import { relative } from 'pathe'
import { defineConfig, mergeConfig, Plugin } from 'vite'
import { APP_PATH, DIST_CLIENT_PATH } from './alias.js'
import { Context } from './context.js'
import { stories } from './stories.js'

export const STORIES_ID = '$histoire-stories'
export const RESOLVED_STORIES_ID = `/${STORIES_ID}-resolved`

export async function createVitePlugins (ctx: Context): Promise<Plugin[]> {
  const userViteConfig = {} // @TODO

  const vuePlugin = (await import('@vitejs/plugin-vue')).default()

  const vitePlugin: Plugin = {
    name: 'histoire-vite-plugin',

    config () {
      const baseConfig = defineConfig({

        optimizeDeps: {
          // force include vue to avoid duplicated copies when linked + optimized
          include: ['vue'],
        },
        server: {
          fs: {
            allow: [DIST_CLIENT_PATH, ctx.config.sourceDir, process.cwd()],
          },
        },
      })
      return userViteConfig
        ? mergeConfig(userViteConfig, baseConfig)
        : baseConfig
    },

    resolveId (id) {
      if (id.startsWith(STORIES_ID)) {
        return RESOLVED_STORIES_ID
      }
    },

    load (id) {
      if (id === RESOLVED_STORIES_ID) {
        return `${Object.values(stories).map((story, index) => `import Comp${index} from '${story.path}'`).join('\n')}
export let files = [${Object.values(stories).map((story, index) => `{ id: '${story.id}', file: '${story.path}', component: Comp${index}, framework: 'vue3' }`).join(',\n')}]
const handlers = []
export function onUpdate (cb) {
  handlers.push(cb)
}
if (import.meta.hot) {
  import.meta.hot.accept(newModule => {
    files = newModule.files
    handlers.forEach(h => {
      h(newModule.files)
      newModule.onUpdate(h)
    })
  })
}`
      }
    },

    configureServer (server) {
      server.middlewares.use((req, res, next) => {
        if (req.url!.startsWith('/__sandbox')) {
          res.statusCode = 200
          res.end(`
<!DOCTYPE html>
<html>
<head>
  <title></title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="description" content="">
</head>
<body>
  <div id="app"></div>
  <script>
  // Hide spammy vite messages
  const origConsoleLog = console.log
  console.log = (...args) => {
    if (typeof args[0] !== 'string' || !args[0].startsWith('[vite] connect')) {
      origConsoleLog(...args)
    }
  }
  </script>
  <script type="module" src="/@fs/${APP_PATH}/sandbox.js"></script>
</body>
</html>`)
          return
        }
        next()
      })

      // serve our index.html after vite history fallback
      return () => {
        server.middlewares.use((req, res, next) => {
          if (req.url!.endsWith('.html')) {
            res.statusCode = 200
            res.end(`
<!DOCTYPE html>
<html>
  <head>
    <title></title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="description" content="">
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/@fs/${APP_PATH}/index.js"></script>
  </body>
</html>`)
            return
          }
          next()
        })
      }
    },
  }

  const plugins = [
    vitePlugin,
    vuePlugin,
  ]

  if (ctx.mode === 'build') {
    // Add file name in build mode to have components names instead of <Anonymous>
    const include = [/\.vue$/]
    const exclude = [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/, /[\\/]\.nuxt[\\/]/]
    const fileNamePlugin: Plugin = {
      name: 'histoire-file-name-plugin',
      enforce: 'post',

      transform (code, id) {
        if (exclude.some(r => r.test(id))) return
        if (include.some(r => r.test(id))) {
          const file = relative(ctx.config.sourceDir, id)
          const index = code.indexOf('export default')
          const result = `${code.substring(0, index)}_sfc_main.__file = '${file}'\n${code.substring(index)}`
          return result
        }
      },
    }
    plugins.push(fileNamePlugin)
  }

  return plugins
}
