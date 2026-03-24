// services/index.ts

import * as authService from './auth.service'
import * as weatherService from './weather.service'
import * as spotifyService from './spotify.service'
import * as calendarService from './calendar.service'
import * as moodService from './mood.service'

export const api = {
  ...authService,
  ...weatherService,
  ...spotifyService,
  ...calendarService,
  ...moodService
}

// On réexporte aussi les types pour que tes composants y aient accès facilement
export * from './types'
