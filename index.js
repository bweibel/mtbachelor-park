const fetch = require("node-fetch")
const fs = require('fs')
const { FILE } = require("dns")

const API_BASE_URL = 'http://api.parkwhiz.com/v4/'
const FILE_LOCATION = './data.json'

const today = new Date()
const nextweek = new Date(today.getFullYear(), today.getMonth(), today.getDate()+7)

let query = 'venues/478498/events/?fields=:default,availability&q=starting_before:'+nextweek
let queryUrl = API_BASE_URL + query

// https://api.parkwhiz.com/v4/venues/478498/events/?fields=%3Adefault%2Csite_url%2Cavailability%2Cvenue%3Atimezone&page=2&q=%20starting_after%3A2021-01-03T00%3A00%3A00-08%3A00&sort=start_time&zoom=pw%3Avenue



const json = response => response.json()

const getEventsData = async () => {
    const response = await fetch(queryUrl)
    const events = await response.json()
    return events
}

function getLastData() {
    try {
        const data = JSON.parse(fs.readFileSync(FILE_LOCATION, 'utf-8'))
        return(data)
    } catch (err) {
        console.error(err)
    }
}

//
// Compare two lists of events
//
function compareEvents(old, current){
    current.forEach(event => {
        compareEvent(old.filter(oldEvent => oldEvent.id === event.id)[0], event)
    });
}

//
// Compare a single event
//
function compareEvent(old, current){
    if(old === null || current === null) return

    console.log(`Old: ${old.id} New: ${current.id}`)

    if( old.availability.available < current.availability.available ) {
        console.log("New Spot available on " + current.name )
    }
}

const CheckParking = async () => {
    // Grab data from parkwhiz and from file
    const events = await getEventsData()
    let oldEvents = await getLastData()

    // Write updated data to file for next time
    fs.writeFile(FILE_LOCATION, JSON.stringify(events, null, 2), err => {
        if(err) {
            console.error(err)
            return
        }
    })

    if( oldEvents ){
        compareEvents(oldEvents, events)
    } 


}

CheckParking()
