// The seven built-in kinds (Decision, 2026-10-17), the weather chips, and the gallery of words.
export const KINDS = [
  { key: 'travel', emoji: '✈️', name: 'Travel', hint: 'Qantas to Sydney',
    fields: [
      { k: 'mode', label: 'How', type: 'chips', options: ['✈️ Plane', '🚆 Train', '🚌 Bus', '🚗 Car', '⛴️ Boat', '🚲 Bike', '🚶 Walk'] },
      { k: 'company', label: 'Company', hint: 'Airline, line, operator' },
      { k: 'from', label: 'From' }, { k: 'to', label: 'To' },
      { k: 'seat', label: 'Seat or number', hint: 'Seat 23A, flight QF12' },
    ] },
  { key: 'food', emoji: '🍽️', name: 'Food & drink', hint: 'Flat white and a scone', fields: [] },
  { key: 'activity', emoji: '🚴', name: 'Activity', hint: 'Bike ride along the harbour',
    fields: [] },
  { key: 'place', emoji: '📍', name: 'Place', hint: 'Taronga Zoo', fields: [] },
  { key: 'people', emoji: '👋', name: 'People', hint: 'The couple at the fireworks',
    fields: [
      { k: 'names', label: 'Names' }, { k: 'from', label: 'Where from' },
      { k: 'contact', label: 'Contact', hint: 'Number, email, handle' },
      { k: 'recommended', label: 'What they recommended' },
    ] },
  { key: 'stay', emoji: '🏨', name: 'Stay', hint: 'Hotel name', fields: [{ k: 'nights', label: 'Nights', type: 'number', hint: 'Shows on each of those days' }] },
  { key: 'note', emoji: '📝', name: 'Note', hint: 'Something worth remembering', fields: [] },
];
export const kindOf = (key) => KINDS.find((k) => k.key === key);

export const WEATHER = ['☀️', '🌤️', '⛅', '☁️', '🌧️', '⛈️', '🌨️', '🌫️', '🌬️', '🥵', '🥶', '🌈'];

// Gallery: word -> emoji. Kept on the phone, so it works offline.
export const WORDS = Object.entries({
  coffee: '☕', tea: '🍵', breakfast: '🥐', brunch: '🥞', lunch: '🥪', dinner: '🍝', dessert: '🍰', 'ice cream': '🍦', gelato: '🍨',
  pizza: '🍕', burger: '🍔', sushi: '🍣', ramen: '🍜', noodles: '🍜', tacos: '🌮', dumplings: '🥟', curry: '🍛', steak: '🥩', seafood: '🦐',
  oysters: '🦪', fish: '🐟', bread: '🍞', cheese: '🧀', fruit: '🍓', snack: '🍿', chocolate: '🍫', cake: '🎂', pastry: '🥐', bakery: '🥖',
  wine: '🍷', beer: '🍺', cocktail: '🍸', drinks: '🍹', bar: '🍻', pub: '🍺', brewery: '🍺', winery: '🍇', water: '💧', juice: '🧃',
  market: '🛒', shopping: '🛍️', souvenir: '🎁', gift: '🎁', bookshop: '📚', 'record shop': '💿', vintage: '🧥', mall: '🏬',
  museum: '🏛️', gallery: '🖼️', art: '🎨', sculpture: '🗿', exhibition: '🖼️', theatre: '🎭', show: '🎭', concert: '🎤', music: '🎶',
  festival: '🎪', fireworks: '🎆', parade: '🎉', party: '🥳', cinema: '🎬', movie: '🎬', comedy: '😂', opera: '🎻', dance: '💃',
  beach: '🏖️', swim: '🏊', surf: '🏄', snorkel: '🤿', dive: '🤿', boat: '⛵', cruise: '🛳️', ferry: '⛴️', kayak: '🛶', sail: '⛵',
  hike: '🥾', walk: '🚶', run: '🏃', bike: '🚲', climb: '🧗', ski: '⛷️', snowboard: '🏂', golf: '⛳', tennis: '🎾', yoga: '🧘',
  game: '🏟️', match: '⚽', football: '⚽', basketball: '🏀', baseball: '⚾', cricket: '🏏', rugby: '🏉', race: '🏁',
  park: '🌳', garden: '🌷', forest: '🌲', mountain: '⛰️', volcano: '🌋', lake: '🏞️', river: '🏞️', waterfall: '💦', desert: '🏜️',
  island: '🏝️', cave: '🕳️', canyon: '🏜️', sunrise: '🌅', sunset: '🌇', stars: '🌌', moon: '🌙', rainbow: '🌈', view: '🔭', lookout: '🔭',
  zoo: '🦁', aquarium: '🐠', wildlife: '🦘', kangaroo: '🦘', koala: '🐨', penguin: '🐧', whale: '🐋', dolphin: '🐬', birds: '🐦', safari: '🦒',
  dog: '🐕', cat: '🐈', horse: '🐎', farm: '🐄',
  temple: '🛕', church: '⛪', mosque: '🕌', shrine: '⛩️', cathedral: '⛪', castle: '🏰', palace: '🏯', ruins: '🏛️', monument: '🗽',
  bridge: '🌉', tower: '🗼', skyline: '🏙️', 'old town': '🏘️', square: '⛲', fountain: '⛲', harbour: '⚓', harbor: '⚓', lighthouse: '🗼',
  flight: '✈️', airport: '🛫', plane: '✈️', train: '🚆', metro: '🚇', tram: '🚋', bus: '🚌', taxi: '🚕', car: '🚗', 'road trip': '🛣️',
  rental: '🚗', scooter: '🛵', 'tuk tuk': '🛺', 'cable car': '🚠', gondola: '🚡', helicopter: '🚁', 'hot air balloon': '🎈', camper: '🚐',
  hotel: '🏨', hostel: '🛏️', airbnb: '🏡', camping: '🏕️', tent: '⛺', cabin: '🛖', resort: '🏝️', 'check in': '🔑', 'check out': '🧳',
  spa: '💆', massage: '💆', pool: '🏊', sauna: '🧖', nap: '😴', rest: '🛋️', 'lazy day': '🛋️', sick: '🤒', pharmacy: '💊', doctor: '🩺',
  rain: '🌧️', storm: '⛈️', hot: '🥵', cold: '🥶', snow: '❄️', wind: '🌬️', fog: '🌫️', sunny: '☀️',
  friends: '👯', family: '👨‍👩‍👧', kids: '🧒', date: '💑', wedding: '💍', birthday: '🎂', reunion: '🤗', locals: '🧑‍🤝‍🧑', guide: '🧭', tour: '🧭',
  photo: '📸', selfie: '🤳', video: '🎥', drone: '🛸', sketch: '✏️', journal: '📓', postcard: '💌', letter: '✉️', call: '📞',
  money: '💸', atm: '🏧', tip: '💵', budget: '🧾', receipt: '🧾', bank: '🏦', exchange: '💱',
  laundry: '🧺', haircut: '💇', groceries: '🛒', cooking: '🍳', picnic: '🧺', bbq: '🍖', 'street food': '🥡', 'food truck': '🚚',
  work: '💻', meeting: '🤝', wifi: '📶', lost: '🧭', found: '🔎', surprise: '🎁', mistake: '🤦', win: '🏆', fail: '🙃', lucky: '🍀',
  luggage: '🧳', passport: '🛂', visa: '📄', customs: '🛃', delay: '⏳', queue: '🧍', traffic: '🚦', ticket: '🎟️', map: '🗺️',
  book: '📖', reading: '📖', puzzle: '🧩', cards: '🃏', casino: '🎰', arcade: '🕹️', karaoke: '🎤', bowling: '🎳', 'escape room': '🔐',
  prayer: '🙏', meditation: '🧘', ceremony: '🎎', class: '🎓', lesson: '🎓', workshop: '🛠️', volunteering: '🤲',
  rooftop: '🌆', night: '🌃', 'night market': '🏮', lantern: '🏮', neon: '🌃', stroll: '🚶', bench: '🪑',
}).map(([word, emoji]) => ({ word, emoji }));

// Find an emoji for a free-typed word: exact first, then a word that starts with it.
export function emojiFor(word) {
  const q = word.trim().toLowerCase();
  if (!q) return '';
  const exact = WORDS.find((w) => w.word === q);
  if (exact) return exact.emoji;
  const start = WORDS.find((w) => w.word.startsWith(q) && q.length >= 3);
  return start ? start.emoji : '';
}
