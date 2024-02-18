export function toISO8601(date) {
    try {
        // if date = number like "2024" Date misinterprets it as milliseconds from epoch
        return new Date(date.toString()).toISOString().substring(0, 10)
    } catch (e) {
        console.error('Error! Invalid date. Try using ISO 8601 (YYYY-MM-DD) format.')
        throw e
    }
}
