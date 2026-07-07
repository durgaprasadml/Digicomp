import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { render } from './dist/server/entry-server.js'

const __filename = fileURLToPath( import.meta.url )
const __dirname = path.dirname( __filename )

// Resolve the absolute path to the uploads/dc-cache/jobs directory
const cacheDir = path.resolve( __dirname, '../../../../uploads/dc-cache' )
const jobsDir = `${ cacheDir }/jobs`

if ( !fs.existsSync( jobsDir ) ) {
  console.log( `[INFO] Jobs directory not found at ${jobsDir}. Exiting.` )
  process.exit( 0 )
}

const files = fs.readdirSync( jobsDir ).filter( f => f.endsWith( '.json' ) )

if ( files.length === 0 ) {
  console.log( `[INFO] No jobs to process.` )
  process.exit( 0 )
}

for ( const file of files ) {
  const jobFilePath = path.join( jobsDir, file )
  console.log( `[INFO] Processing job: ${ file }` )

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
      } )
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
        classList: { add: noop, remove: noop, contains: () => false }
      }
    }

    // 3. Render React App
    const appHtml = render( jobData.url || '/' )

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
    // Note: We DO NOT exit here, so that a single bad job doesn't crash the entire queue!
  }
}
