import { get, map } from 'lodash'

export function populateCustomAttributes (customAttributes) {
  return map(customAttributes, ca => {
    ca.label = get(ca, 'metadata.instant.i18n.label', {})
    ca.materialIcon = get(ca, 'metadata.instant.materialIcon')
    ca.description = get(ca, 'metadata.instant.i18n.description', {})
    ca.priority = get(ca, 'metadata.instant.priority', 0)
    ca.suggestedValues = get(ca, 'metadata.instant.suggestedValues', 0) // for tags
    return ca
  })
}
