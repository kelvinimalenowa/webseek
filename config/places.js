async function searchBusinesses(location, industry) {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY

    if (!apiKey) {
        throw new Error('Google Places API key is missing.')
    }

    const response = await fetch(
        'https://places.googleapis.com/v1/places:searchText',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': apiKey,
                'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.attributions'
            },
            body: JSON.stringify({
                textQuery: `${industry} in ${location}`,
                pageSize: 5
            }),
            signal: AbortSignal.timeout(15000)
        }
    )

    if (!response.ok) {
        throw new Error(`Google Places request failed: ${response.status}`)
    }

    const data = await response.json()

    return data.places || []
}

module.exports = searchBusinesses