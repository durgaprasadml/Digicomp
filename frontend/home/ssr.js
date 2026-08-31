import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'


const __filename = fileURLToPath( import.meta.url )
const __dirname = path.dirname( __filename )
const cacheDir = path.resolve( __dirname, '../../../../uploads/dc-cache' )

const jobFilePath = process.argv[2]
if (!jobFilePath || !fs.existsSync(jobFilePath)) {
    console.error('[ERROR] Invalid or missing job file path.')
    process.exit(1)
}

const file = path.basename(jobFilePath)

try {
    // 1. Read Job File
    const jobRaw = fs.readFileSync( jobFilePath, 'utf-8' )
    const jobData = JSON.parse( jobRaw )

    // 2. Setup Global Window for SSR Hydration Compatibility
    const noop = () => {}

    globalThis.getComputedStyle = () => ( {
      getPropertyValue: () => ''
    } )

    globalThis.window = {
      dcSSD: jobData.dcSSD || {},
      addEventListener: noop,
      removeEventListener: noop,
      dispatchEvent: () => false,
      scrollTo: noop,
      requestAnimationFrame: ( cb ) => setTimeout( cb, 0 ),
      cancelAnimationFrame: noop,
      matchMedia: () => ( {
        matches: false,
        addListener: noop,
        removeListener: noop,
        addEventListener: noop,
        removeEventListener: noop,
      } ),
      HTMLInputElement: { prototype: {} },
      HTMLTextAreaElement: { prototype: {} },
      HTMLElement: { prototype: {} }
    }

    globalThis.document = {
      getElementById: () => null,
      querySelector: () => null,
      querySelectorAll: () => [],
      addEventListener: noop,
      removeEventListener: noop,
      createElement: () => ( { addEventListener: noop, removeEventListener: noop, setAttribute: noop } ),
      documentElement: {
        setAttribute: noop,
        getAttribute: () => null,
      },
      body: {
        appendChild: noop,
        removeChild: noop,
        addEventListener: noop,
        removeEventListener: noop,
        classList: { add: noop, remove: noop, contains: () => false }
      }
    }

    // 3. Render React App
    const { render } = await import( './dist/server/entry-server.js' )
    const appHtml = render( `/${ 'home' === jobData.path ? '' : jobData.path }` )

    // 4. Construct Inner HTML (App + Hydration Data)
    const innerHtml = `
<div id="dc-app">${ appHtml }</div>
<script>var dcSSD = ${ JSON.stringify( jobData.dcSSD ) };</script>
`

    // 5. Save to Cache Path
    const cacheFile = `${ cacheDir }/html/ssr-${ file.slice( 4, -5 ) }.html`
    if ( cacheFile ) {
      fs.writeFileSync( cacheFile, innerHtml.trim(), 'utf-8' )
      console.log( `[SUCCESS] Generated SSR cache at: ${ cacheFile }` )
    } else {
      throw new Error( 'No cache_file path provided in job data.' )
    }

    // 6. Cleanup the job file
    fs.unlinkSync( jobFilePath )

} catch ( e ) {
    console.error( `[ERROR] Failed to process job ${ jobFilePath }:`, e )
    process.exit(1)
}
