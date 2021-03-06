const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()


const app = express()
const port = process.env.PORT || 5000

app.use(express.json())
app.use(cors())

async function run() {
    const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.airwy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
    await client.connect()
    console.log('database connected');

    // collections
    const serviceCollection = client.db("users").collection("services");
    const bookingCollection = client.db("users").collection("booking");

    app.get('/services', async (req, res) => {
        const services = await serviceCollection.find().toArray()
        res.send(services)
    })
    app.post('/services', async (req, res) => {
        const booking = req.body
        const query = { service: booking.service, email: booking.email, date: booking.date }
        const isExit = await bookingCollection.findOne(query)
        console.log(booking.date);
        if (isExit) {
            return res.send({ success: false, booking: isExit })
        }
        const services = await bookingCollection.insertOne(booking)
        res.send({ success: true, booking: services })
    })

    app.get('/availableService', async (req, res) => {
        const date = req.query.date

        const services = await serviceCollection.find().toArray()  //all service from service collection
        const bookings = await bookingCollection.find({ date }).toArray() // all booking form booking collection


        services.forEach(service => {
            const serviceBooking = bookings.filter(book => book.service === service.name)
            const booked = serviceBooking.map(service => service.slot)
            const available = service.slots.filter(s => !booked.includes(s))
            service.available = available
        })

        // console.log(services);

        res.send(services)

    })




}

run().catch(console.dir)







app.get('/', (req, res) => {
    res.send({ message: 'Doctors portals server' })
})


app.listen(port, () => {
    console.log(`server is online ${port}...`)
})