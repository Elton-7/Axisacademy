/**
 * Axis's learner age bands — the server's copy of the list the form offers.
 *
 * Kept in step with client/src/content/ageGroups.ts. The validator checks
 * against this rather than a literal written into the route, so adding a band
 * is one edit in each place and not a hunt through the routes for a stale
 * whitelist — which is exactly how 'child, teenager, adult' survived the column
 * being widened and rejected every new band with "Age group is required".
 */
const AGE_GROUP_VALUES = ['0-2', '3-5', '6-8', '9-11', '12-14', '15-17', '18-24', '25+']

module.exports = { AGE_GROUP_VALUES }
