import HTMLAudioElement from './HTMLAudioElement'

export default class Audio extends HTMLAudioElement{};

Audio.HAVE_NOTHING = 0
Audio.HAVE_METADATA = 1
Audio.HAVE_CURRENT_DATA = 2
Audio.HAVE_FUTURE_DATA = 3
Audio.HAVE_ENOUGH_DATA = 4
