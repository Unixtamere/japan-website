// Returns a Google Maps link for an activity. If the activity has its own
// `mapsUrl` (e.g. a pinned place or short link) that wins; otherwise we build
// a Google Maps search from the activity name + city.
export function mapsUrl(activity) {
  if (activity.mapsUrl) return activity.mapsUrl
  const query = [activity.title, activity.city, 'Japan'].filter(Boolean).join(', ')
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}
