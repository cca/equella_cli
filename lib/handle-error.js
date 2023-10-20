export function handle(err, data) {
    if (err) throw err

    if (data && data.error) {
        console.error(data.error_description)
        process.exit(1)
    }
}
