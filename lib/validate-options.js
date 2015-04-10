// make sure the required fields are present in the options object
module.exports = function(options) {
    var errors = []

    if (!options.root) {
        errors.push('No root URL for the EQUELLA API specified in .equellarc')
    }
    if (!options.token) {
        errors.push('No OAUTH token found in .equellarc')
    }

    if (errors.length > 0) {
        for (var error in errors) {
            console.error('Error!', errors[error])
        }
        process.exit(1)
    }
}
