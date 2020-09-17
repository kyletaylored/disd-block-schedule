var $ = jQuery

/**
 * Get a list of holidays.
 */
function getHolidays() {
  var jqXHR = $.ajax({
    url: '/holidays.json',
    type: 'GET',
    async: false,
  })
  return JSON.parse(jqXHR.responseText)
}

/**
 * Assign the cohorts.
 * @param {*} isOdd
 */
function getCohort(isOdd) {
  isOdd = isOdd || false
  var even = {
    1: 'At School',
    2: 'Remote',
  }
  var odd = {
    1: 'Remote',
    2: 'At School',
  }
  return isOdd ? odd : even
}

/**
 * Determine if day is A or B.
 * @param {int} day
 */
function getAorB(day) {
  day = day > 6 ? day - 7 : day
  if (day == 1 || day == 2) {
    return 'A'
  }
  if (day == 3 || day == 4) {
    return 'B'
  }
  return 'All'
}

function assignCohort(day, day_diff, obj) {
  // Assign default data.
  obj.cohort = getCohort()
  day = day > 6 ? day - 7 : day

  switch (day) {
    // Mon/Weds
    case 1:
    case 3:
      // do nothing?
      break

    // Tues/Thurs
    case 2:
    case 4:
      obj.cohort = getCohort(true)
      break

    // Friday
    case 5:
      // Calculate Friday Cohort
      weeks_since = day_diff / 7
      if (weeks_since % 2 === 1) {
        obj.cohort = getCohort(true)
      }
      break

    // Weekend
    case 0:
    case 6:
      obj.cohort = ''
      obj.letter = ''
      obj.text = "It's the weekend!"
      break
  }
}

/**
 * Render text on page.
 * @param {object} textObj
 */
function render(today, tomorrow) {
  var block = $('#block-day')
  $('#current-date .date', block).html(today.today)
  if (today.hasOwnProperty('letter')) {
    $('#letter h1', block).html(today.letter)
    $(document.body).addClass(today.letter)
  }
  if (today.hasOwnProperty('cohort') && today.cohort[1] !== undefined) {
    $('#cohort-1 h3', block).html('Cohort 1: ' + today.cohort[1])
    $('#cohort-2 h3', block).html('Cohort 2: ' + today.cohort[2])
  }
  if (today.hasOwnProperty('text')) {
    $('#text p', block).html(today.text)
  }

  // Tomorrow
  prefix = '<strong>Tomorrow is</strong> ' + tomorrow.today + '<br>'
  if (tomorrow.cohort === '') {
    $('#tomorrow').html(prefix + tomorrow.text)
  } else {
    $('#tomorrow').html(
      prefix +
        '<strong>Block: </strong>' +
        tomorrow.letter +
        '<br><strong>Cohort</strong> 1: ' +
        tomorrow.cohort[1] +
        '<br><strong>Cohort</strong> 2: ' +
        tomorrow.cohort[2]
    )
  }
}

// Define some variables.
var disdCalendar = 'https://www.dentonisd.org/Page/2'
var today = moment()
// DEBUG (fake date)
// today = moment([2020, 08, 17])

var tomorrow = moment(today).add(1, 'd')
var day = today.day()
var holidays = getHolidays()
var todayText = {
  today: today.format('dddd, MMMM Do YYYY'),
  letter: getAorB(day),
  cohort: '',
  text: '',
}
var tomorrowText = Object.assign({}, todayText, {
  today: tomorrow.format('dddd, MMMM Do YYYY'),
  letter: getAorB(day + 1),
})

// THIS SHOULD NEVER CHANGE (except for each new semester)
var cohortGenesis = moment([2020, 09, 11])
// THIS SHOULD NEVER CHANGE

// To calculate the no. of days between two dates
var day_diff = today.diff(cohortGenesis, 'days')

// Get cohort information
assignCohort(day, day_diff, todayText)
assignCohort(day + 1, day_diff, tomorrowText)

// Check Holiday
if (holidays.hasOwnProperty(today.format('L'))) {
  // Holiday exists.
  todayText = { text: holidays(today.format('L')) }
}
if (holidays.hasOwnProperty(tomorrow.format('L'))) {
  // Holiday exists.
  tomorrowText = { text: holidays(tomorrow.format('L')) }
}

// Render data
console.log({ todayText, tomorrowText })
render(todayText, tomorrowText)
