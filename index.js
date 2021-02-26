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

const getStation = async (id, time) => {
    const queryTemperature = `SELECT "value" FROM stations WHERE "id" = '${id}' AND "key" = 'tre200s0' AND time <= '${moment(time / 1e-3).toISOString()}' ORDER BY DESC LIMIT 1`

    const result = await influx.query(query)

    console.log(result)
}

getStation('0-20000-0-06601', 1614380290)
