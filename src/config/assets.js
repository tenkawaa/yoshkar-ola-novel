const base = import.meta.env.BASE_URL

const bg = (name) => `${base}assets/bg/${name}`
const cat = (emotion) => `${base}assets/characters/cat/${emotion}.webp`

export const ASSETS = {
  bg: {
    menu: bg('default.jpg'),
    evening: bg('scene2.jpg'),
    cat_monument: bg('cat_monument.webp'),
    obolensky_square: bg('obolensky_square.webp'),
    gallery: bg('gallery.webp'),
    gallery_clock: bg('gallery_clock.webp'),
    kremlin: bg('kremlin.webp'),
    tower: bg('tower.webp'),
    bruges: bg('bruges.webp'),
    embankment: bg('embankment.webp'),
  },
  // characters.<characterKey>.<emotion>; эмоция по умолчанию — neutral
  characters: {
    cat: {
      neutral: cat('neutral'),
      happy: cat('happy'),
      point: cat('point'),
      surprised: cat('surprised'),
      thinking: cat('thinking'),
      sly: cat('sly'),
      sad: cat('sad'),
    },
  },
}

// Фото с Wikimedia Commons — лицензии CC BY / CC BY-SA требуют указать автора
export const CREDITS = [
  { what: 'Памятник «Йошкин кот»', author: 'Alkort', license: 'CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Monument_to_Yoshkin_Kot_in_Yoshkar-Ola.jpg' },
  { what: 'Площадь Оболенского-Ноготкова', author: 'Azmanova Natalia', license: 'CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Национальная_художественная_галерея,_Йошкар-Ола.jpg' },
  { what: 'Национальная художественная галерея', author: 'Alexxx1979', license: 'CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Yoshkar-Ola._National_Art_Gallery_P8122188_2200.jpg' },
  { what: 'Часы на здании галереи', author: 'Alkort', license: 'CC BY 3.0', url: 'https://commons.wikimedia.org/wiki/File:Hours_on_a_building_of_national_art_gallery.jpg' },
  { what: 'Царевококшайский кремль', author: 'Дмитрий Сазанов', license: 'CC BY 4.0', url: 'https://commons.wikimedia.org/wiki/File:Tsarevokokshaysk_Kremlin_-_2025-07-05_12.jpg' },
  { what: 'Благовещенская башня', author: 'Дмитрий Сазанов', license: 'CC BY 4.0', url: 'https://commons.wikimedia.org/wiki/File:Annunciation_Tower,_Yoshkar-Ola_-_2025-07-05_01.jpg' },
  { what: 'Набережная Брюгге', author: 'Дмитрий Сазанов', license: 'CC BY 4.0', url: 'https://commons.wikimedia.org/wiki/File:Yoshkar-Ola_-_2025-07-05_08.jpg' },
  { what: 'Набережная Малой Кокшаги', author: 'Petr Vasiliev', license: 'CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Набережная_Йошкар-Олы.jpg' },
]
