var open = require('open')

module.exports = function (options) {
    var dest = options._[1]
    var root = options.root.replace(/api\/$/, 'access/')
    var urls = {
        dashboard: root + 'portaladmin.do',
        diagnostics: root + 'diagnostics.do',
        language: root + 'language.do',
        liu: root + 'liu.do',
        mdf: root + 'manualdatafixes.do',
        mime: root + 'mime.do',
        shortlinks: root + 'shortcuturlssettings.do',
        theme: root + 'themesettings.do'
    }

    switch(dest) {
        case 'dash':
            open(urls.dashboard)
            break
        case 'dashboard':
            open(urls.dashboard)
            break
        case 'datafixes':
            open(urls.mdf)
            break
        case 'diag':
            open(urls.diagnostics)
            break
        case 'diagnostic':
            open(urls.diagnostics)
            break
        case 'diagnostics':
            open(urls.diagnostics)
            break
        case 'lang':
            open(urls.language)
            break
        case 'language':
            open(urls.language)
            break
        case 'liu':
            open(urls.liu)
            break
        case 'loggedin':
            open(urls.liu)
            break
        case 'logged-in':
            open(urls.liu)
            break
        case 'manualdata':
            open(urls.mdf)
            break
        case 'manualdatafixes':
            open(urls.mdf)
            break
        case 'mdf':
            open(urls.mdf)
            break
        case 'mime':
            open(urls.mime)
            break
        case 'mimetype':
            open(urls.mime)
            break
        case 'mimetypes':
            open(urls.mime)
            break
        case 'mime-type':
            open(urls.mime)
            break
        case 'mime-types':
            open(urls.mime)
            break
        case 'reindex':
            open(urls.mdf)
            break
        case 'short':
            open(urls.shortlinks)
            break
        case 'shortcuts':
            open(urls.shortlinks)
            break
        case 'shortlinks':
            open(urls.shortlinks)
            break
        case 'theme':
            open(urls.theme)
            break
        // if command didn't match a shortcut, exit with an error
        default:
            console.error('Oh no, I don\'t know any settings shortcuts by the name %s!', dest)
            process.exit(1)
    }

    process.exit(0)
}
