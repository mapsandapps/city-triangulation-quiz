// @ts-nocheck

const NUMBER_OF_CITIES = cities.length
const NUMBER_OF_OPTIONS = 12 // ignored if SHOW_ALL_OPTIONS = true
const SHOW_ALL_OPTIONS = false

var chosenCities
var correctAnswer
var isAnswerRevealed
var map
var remainingCities = _.cloneDeep(cities)
var units = localStorage.units || 'miles'

const revealAnswer = () => {
  document.getElementById('correctAnswer').innerHTML = `${correctAnswer.city}, ${correctAnswer.state}<br><button onclick="location.reload()">Next question</button>`

  _.forEach(chosenCities, city => {
    L.marker([city.lat, city.lon]).addTo(map)
      .bindPopup(`<b>${city.city}</b><br>${city.state}`)
  })

  map.addControl(map.zoomControl)
  map.touchZoom.enable()
  map.doubleClickZoom.enable()
  map.scrollWheelZoom.enable()
  map.boxZoom.enable()
  map.keyboard.enable()

  isAnswerRevealed = true
}

const checkAnswer = (city, state, buttonIndex) => {
  if (city === correctAnswer.city && state === correctAnswer.state) {
    document.getElementById(`option${buttonIndex}`).classList.add('correct')
    revealAnswer()
  } else {
    if (!isAnswerRevealed) {
      document.getElementById('correctAnswer').innerHTML = `<button onclick="revealAnswer()">Reveal answer</button>`
    }
    document.getElementById(`option${buttonIndex}`).classList.add('incorrect')
  }
}

const initMap = (lat, lon, zoom) => {
  map = L.map('map').setView([lat || 38, lon || -99], zoom || 4)
  map.removeControl(map.zoomControl)
  map.touchZoom.disable()
  map.doubleClickZoom.disable()
  map.scrollWheelZoom.disable()
  map.boxZoom.disable()
  map.keyboard.disable()

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map)
}

const setUpQuestion = (config) => {
  chosenCities = _.sampleSize(cities, 4)

  correctAnswer = chosenCities[0]
  const correctAnswerIndex = correctAnswer.index

  if (SHOW_ALL_OPTIONS) {
    var answerOptions = _.cloneDeep(cities)
    _.pullAt(answerOptions, [
      chosenCities[1].index,
      chosenCities[2].index,
      chosenCities[3].index
    ])

    answerOptionsSorted = _.sortBy(answerOptions, ['state', 'city'])
  } else {
    var answerOptions = _.cloneDeep(cities)
    _.pullAt(answerOptions, [
      chosenCities[0].index,
      chosenCities[1].index,
      chosenCities[2].index,
      chosenCities[3].index
    ])

    answerOptionsShortened = _.sampleSize(answerOptions, NUMBER_OF_OPTIONS - 1)
    answerOptionsShortened.push(correctAnswer)

    answerOptionsSorted = _.sortBy(answerOptionsShortened, ['city', 'state'])
  }

  writeHTML({
    chosenCities,
    correctAnswerIndex,
    answerOptionsSorted
  })

  initMap(config.lat, config.lon, config.zoom)
}

const getDistanceString = (distanceInMiles) => {
  if (units === 'kilometers') {
    return `${_.round(distanceInMiles * 1.60934)} km`
  } else {
    return `${distanceInMiles} miles`
  }
}

const writeHTML = ({
  chosenCities,
  correctAnswerIndex,
  answerOptionsSorted
}) => {
  document.getElementById('otherCities').innerHTML = `<div>What city is</div><div> ${getDistanceString(chosenCities[1].distances[correctAnswerIndex])} from ${chosenCities[1].city}, ${chosenCities[1].state},</div><div>${getDistanceString(chosenCities[2].distances[correctAnswerIndex])} from ${chosenCities[2].city}, ${chosenCities[2].state}, and</div><div>${getDistanceString(chosenCities[3].distances[correctAnswerIndex])} from ${chosenCities[3].city}, ${chosenCities[3].state}?</div>`

  var optionButtonsHTML = ''

  _.map(answerOptionsSorted, (city, index) => {
    optionButtonsHTML += `<button id="option${index}" onclick="checkAnswer('${city.city}', '${city.state}', '${index}')"><span class="city">${city.city}</span><br /><span class="state">${city.state}</span></button>`
  })

  document.getElementById('optionButtons').innerHTML = optionButtonsHTML
}
