#! /usr/bin/env node

/* eslint-disable no-console */
'use strict'

// Handle any uncaught errors
process.once('uncaughtException', (err, origin) => {
  if (!origin || origin === 'uncaughtException') {
    console.error(err)
    process.exit(1)
  }
})
process.once('unhandledRejection', (err) => {
  console.error(err)
  process.exit(1)
})

const { print, getPinza, getRepoPath } = require('./utils')
const debug = require('debug')('aviondb:cli')
const cli = require('.')

async function main() {
  let exitCode = 0
  let ctx = {
    print,
    getStdin: () => process.stdin,
    repoPath: getRepoPath(),
    cleanup: () => { },
    error: console.log
  }

  const command = process.argv.slice(2)

  try {
    const data = await cli(command, async (argv) => {
      if (!['daemon', 'init'].includes(command[0])) {
        const { aviondb, isDaemon, cleanup } = await getAviondb(argv)

        ctx = {
          ...ctx,
          aviondb,
          isDaemon,
          //cleanup
        }
      }

      argv.ctx = ctx

      return argv
    })

    if (data) {
      print(data)
    }
  } catch (err) {

    //if (err.code === NotEnabledError.code) {
    //  err.message = `no pinza folder found in ${ctx.repoPath}.\nplease run: 'pinza init'`
    //}

    // Handle yargs errors
    if (err.code === 'ERR_YARGS') {
      err.yargs.showHelp()
      ctx.print.error('\n')
      ctx.print.error(`Error: ${err.message}`)
    } else if (debug.enabled) {
      // Handle commands handler errors
      debug(err)
    } else {
      console.log(err)
    }

    exitCode = 1
  } finally {
    await ctx.cleanup()
  }

  if (command[0] === 'daemon' && exitCode === 0) {
    // don't shut down the daemon process
    return
  }

  process.exit(exitCode)
}

main()