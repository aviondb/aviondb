const EnvironmentAdapter = require('../core/EnvironmentAdapter')
//const HTTPClient = require('../HTTPClient')
const fs = require('fs')
const Path = require('path')
const multiaddr = require('multiaddr')
let visible = true
const disablePrinting = () => { visible = false }

const print = (msg, includeNewline = true, isError = false) => {
    if (visible) {
        if (msg === undefined) {
            msg = ''
        }
        msg = includeNewline ? msg + '\n' : msg
        const outStream = isError ? process.stderr : process.stdout
        outStream.write(msg)
    }
}

print.clearLine = () => {
    return process.stdout.clearLine()
}

print.cursorTo = (pos) => {
    process.stdout.cursorTo(pos)
}

print.write = (data) => {
    process.stdout.write(data)
}

print.error = (msg, newline) => {
    print(msg, newline, true)
}

// used by ipfs.add to interrupt the progress bar
print.isTTY = process.stdout.isTTY
print.columns = process.stdout.columns

module.exports = {
    getRepoPath: () => {
        if (process.env.aviondb_path) {
            return process.env.aviondb_path
        } else {
            return EnvironmentAdapter.repoPath()
        }
    },
    print,
    getAviondb: () => {
        var repoPath = module.exports.getRepoPath()
        var apiPath = Path.join(repoPath, "apiAddr");
        if(fs.existsSync(apiPath)) {
            var apiAddr = multiaddr(fs.readFileSync(apiPath).toString());
            var aviondb = new HTTPClient(apiAddr); //Create HTTP Client later
    
            return {
                aviondb,
                isDaemon: false
            }
        } else {
            throw `apiAddr does not exist at "${apiPath}" \nforgot to run "pinza daemon"?`
        }
    }
}