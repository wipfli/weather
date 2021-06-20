const express = require('express')
const moment = require('moment')
const Influx = require('influx')
const cors = require('cors')

const influx = new Influx.InfluxDB({
    database: 'weather',
    host: 'localhost'
})

const app = express()
app.use(express.json())
app.use(cors())

app.listen(process.env.PORT, () => {
    console.log('Weather service running on port ' + String(process.env.PORT))
})

const getValue = async (id, time, key) => {
    const query = `SELECT "value" FROM stations WHERE "id" = '${id}' AND "key" = '${key}' AND time <= '${moment(time / 1e-3).toISOString()}' ORDER BY DESC LIMIT 1`
    const result = await influx.query(query)

    if (result[0]) {
        return result[0].value
    }
    else {
        return null
    }
}

const getStation = async (id, time) => {
    const temperature = await getValue(id, time, 'tre200s0')
    const temperatureTower = await getValue(id, time, 'ta1tows0')

    const windSpeed = await getValue(id, time, 'fu3010z0')
    const windSpeedTower = await getValue(id, time, 'fu3towz0')

    const gustSpeed = await getValue(id, time, 'fu3010z1')
    const gustSpeedTower = await getValue(id, time, 'fu3towz1')

    const windDirection = await getValue(id, time, 'dkl010z0')
    const windDirectionTower = await getValue(id, time, 'dv1towz0')

    return {
        temperature: (temperature ? temperature : temperatureTower),
        windSpeed: (windSpeed ? windSpeed : windSpeedTower),
        gustSpeed: (gustSpeed ? gustSpeed : gustSpeedTower),
        windDirection: (windDirection ? windDirection : windDirectionTower),
    }
}

const getMetar = async (stationId) => {
    const query = `SELECT * FROM metar WHERE "station_id" = '${stationId}' ORDER BY DESC LIMIT 1`
    const result = await influx.query(query)

    if (result[0]) {
        return {
            dewpt: result[0].dewpt,  // dew point in K
            press: result[0].press,  // pressure in Pa
            station_id: result[0].station_id,  // 4 letter ICAO airport identifier
            temp: result[0].temp,  // temperature in K
            wind_dir: result[0].wind_dir,  // wind direction in deg
            wind_speed: result[0].wind_speed,  // wind speed in m/s
            time: result[0].time.getNanoTime() * 1e-9,  // unix timestamp
        }
    }
    else {
        return {}
    }
}

app.get('/station', (req, res) => {
    if (!req.query.id || !req.query.time) {
        return res.sendStatus(400)
    }
    getStation(req.query.id, req.query.time)
        .then(data => res.send(data))
        .catch(err => {
            console.log(err)
            res.sendStatus(500)
        })
})

app.get('/metar', (req, res) => {
    if (!req.query.station_id) {
        return res.sendStatus(400)
    }
    getMetar(req.query.station_id)
        .then(data => res.send(data))
        .catch(err => {
            console.log(err)
            res.sendStatus(500)
        })
})
