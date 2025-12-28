export interface googlePlaceDetailsRes {
  html_attributions: any[]
  result: Result
  status: string
}

export interface Result {
  current_opening_hours: CurrentOpeningHours
  formatted_address: string
  formatted_phone_number: string
  name: string
  photos: Photo[]
  rating: number
  reviews: Review[]
  url: string
}

export interface CurrentOpeningHours {
  open_now: boolean
  periods: Period[]
  weekday_text: string[]
}

export interface Period {
  close: Close
  open: Open
}

export interface Close {
  date: string
  day: number
  time: string
}

export interface Open {
  date: string
  day: number
  time: string
}

export interface Photo {
  height: number
  html_attributions: string[]
  photo_reference: string
  width: number
}

export interface Review {
  author_name: string
  author_url: string
  language: string
  original_language: string
  profile_photo_url: string
  rating: number
  relative_time_description: string
  text: string
  time: number
  translated: boolean
}
