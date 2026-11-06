async function searchBusinesses(location, industry) {
    const apiKey = process.env.SERPAPI_API_KEY

    if (!apiKey) {
        throw new Error('SerpApi key is missing.')
    }

    const url = new URL('https://serpapi.com/search.json')

    url.searchParams.set('engine', 'google_maps')
    url.searchParams.set('type', 'search')
    url.searchParams.set('q', `${industry || 'businesses'} in ${location}`)
    url.searchParams.set('hl', 'en')
    url.searchParams.set('api_key', apiKey)

    const response = await fetch(url, {
        signal: AbortSignal.timeout(30000)
    })

    if (!response.ok) {
        throw new Error(`SerpApi request failed: ${response.status}`)
    }

    //handling searches with no results
    const data = await response.json()

    const noResults =
        data.search_metadata?.status === 'Success' &&
        data.search_information?.local_results_state === 'Fully empty'

    if (noResults) {
        return []
    }
    //
    if (data.error) {
        throw new Error(
            'SerpApi could not complete the search. Check your key, quota, and query.'
        )
    }

    return data.local_results || []
}

module.exports = searchBusinesses