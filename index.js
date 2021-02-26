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

//app.listen(process.env.PORT, () => {
//    console.log('Weather service running on port ' + String(process.env.PORT))
//})

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

    return {
        temperature: (temperature ? temperature : temperatureTower),
        windSpeed: (windSpeed ? windSpeed : windSpeedTower),
        gustSpeed: (gustSpeed ? gustSpeed : gustSpeedTower),
    }
}

getStation('0-20000-0-06601', 1614380290)
