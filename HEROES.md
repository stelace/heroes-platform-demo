# Stelace Super Heroes Demo

Here is a short description of what is implemented in this platform starter kit featuring Stelace [Search (Docs)](https://stelace.com/docs/search/), [Command](https://stelace.com/docs/command/) and some [Instant](https://stelace.com/docs) APIs.

## Web platform UI

- Typo-tolerant full-text [Search](https://stelace.com/docs/search/) of hero [Assets](
  https://stelace.com/docs/assets/)
- Advanced filters with [Custom Attributes](https://stelace.com/docs/assets/custom-attributes)
- NY Map location and mission status updated in real-time with custom [Events](
  https://stelace.com/docs/command/events) and [Signal](https://stelace.com/docs/signal).

### User actions

- When clicking a hero search result card, show a dialog with a button to book a hero for 1 hour in live demo version, starting from now.
The hero is then marked as busy and won’t get any new assignment for the duration of current mission.
- Users can create their own heroes after authentication relying on [User API](https://stelace.com/docs/users).

## Workflows/Tasks for each superhero

- Random short mission assignments depending on [Tasks](https://stelace.com/docs/command/tasks) triggering every minute, and longer manual missions assigned by visitors.
- Self-destruction after 48 hours for heroes created by visitors.
- Asset flagging and Slack notification to staff

## Heroes attributes

Used for Search & display.

### Stelace built-ins

- `name`
- `description` (potentially multi-language)
- `category` (Super powers or Inspiring Heroes)
- `price` (most hero accept missions for free).
- Random `location` in New York City

### Custom attributes

- `speed`, number between 0 and 100
- `abilities` tags list
- `gender`, of type select
- `environmentHero` boolean
- `stelaceStaffPick` boolean
- `starring` tags list of actors
- `history` free text, indexed for text search

### Metadata

- `images`, resized on the fly via built-in CDN

## Preview

[demo.webm](https://github.com/stelace/marketplace-demo/assets/25850444/00836041-1fd2-4175-8a11-708ea44424ce)
