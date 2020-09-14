const args = process.argv.slice(2);
const yargs = require('yargs/yargs')(args)
const parser = yargs
  .commandDir('commands')
  .showHelpOnFail(true)
  .strict()
  .completion();

if(args.length === 0) {
  yargs.showHelp()
}
module.exports = parser;