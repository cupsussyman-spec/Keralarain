// GTM dataLayer + GA4 event tracking

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[]
    gtag?: (...args: unknown[]) => void
  }
}

function push(event: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ event, timestamp: Date.now(), ...params })
}

export const analytics = {
  districtAutoDetected(districtId: string, districtName: string) {
    push('district_auto_detected', { district_id: districtId, district_name: districtName, method: 'ip_geolocation' })
  },

  districtManualSelected(districtId: string, districtName: string) {
    push('district_manual_selected', { district_id: districtId, district_name: districtName, method: 'modal_pick' })
  },

  districtChanged(districtId: string, districtName: string) {
    push('district_changed', { district_id: districtId, district_name: districtName, method: 'location_selector' })
  },

  alertClicked(alertId: string, alertTitle: string) {
    push('alert_clicked', { alert_id: alertId, alert_title: alertTitle })
  },

  alertDismissed(alertId: string) {
    push('alert_dismissed', { alert_id: alertId })
  },

  searchUsed(query: string) {
    push('search_used', { search_query: query, query_length: query.length })
  },

  pageView(path: string, districtId?: string) {
    push('page_view', { page_path: path, district_id: districtId })
  },

  forecastTabChanged(tab: string) {
    push('forecast_tab_changed', { tab_name: tab })
  },

  mapDistrictClicked(districtId: string, districtName: string) {
    push('map_district_clicked', { district_id: districtId, district_name: districtName })
  },
}
