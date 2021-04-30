// run the admin launcher in the background
// requires having an admin console package downloaded and added to your
// .equellarc's "launcherPath" property
// see https://openequella.github.io/guides/AdministrationConsole/openEQUELLA2019.1-AdministrationConsolePackageGuide.html
// @TODO launcher was introduced in 2019.1, it'd be nice to throw an error if
// you hit this endpoint on an earlier version
// https://github.com/openequella/openEQUELLA/releases/tag/2019.1-Stable
const fs = require('fs')
const spawn = require('child_process').spawn
const clipboardy = require('clipboardy')

module.exports = function (options) {
    if (options.launcherPath) {
        // test if path exists and is executable for us
        fs.access(options.launcherPath, fs.constants.X_OK, (err) => {
            if (err) {
                console.error(`Error: path to admin console launcher must exist and be executable for the current user.`)
                if (options.debug) console.error(`${err}`)
                process.exit(1)
            }
            // if we have a password, put in on the clipboard
            if (options.password) {
                // this is actually async but it will always be quicker than
                // running the launcher so we don't care
                clipboardy.writeSync(options.password)
            }
            // https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options
            // see the meaning of stdio option in particular
            spawn(options.launcherPath, {
                detached: true,
                stdio: 'ignore'
            })
            process.exit(0)
        })
    } else {
        console.error(`Error: must provide the path to the launcher under .equellarc's launcherPath or pass it to this command with the --launcherPath flag.`)
        process.exit(1)
    }
}
