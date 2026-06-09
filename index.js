const dns = require("node:dns/promises");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const express = require('express');
const dotenv = require('dotenv')
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');


// config 
dotenv.config();
const PORT = process.env.PORT || 4000;
const uri = process.env.MONGODB_URI


// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());








// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    const db = client.db('careerlink');
    const jobs = db.collection('jobs');
    const companis = db.collection('companis');

    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        app.post('/api/jobs', async (req, res) => {
            try {
                const job = req.body;
                const result = await jobs.insertOne(job);

                res.status(200).send({
                    success: true,
                    message: 'job added successfully',
                    data: result
                })
            } catch (error) {
                console.log(error);
                res.status(500).send({
                    success: false,
                    message: 'Failed to add  job ',
                    error: error.message
                })
            }
        });

        app.get('/api/jobs', async (req, res) => {

            try {
                const query = {};
                if (req.query.companyID) {
                    query.companyID = req.query.companyID;
                }
                if (req.query.status) {
                    query.status = req.query.status;
                }
                const cursor = jobs.find(query)
                const result = await cursor.toArray();

                res.status(200).send({
                    success: true,
                    message: 'job get successfully',
                    data: result
                })
            } catch (error) {
                console.log(error);
                res.status(500).send({
                    success: false,
                    message: 'Failed get  job ',
                    error: error.message
                })
            }
        })

        // company related api 

        app.get('/api/companis', async (req, res) => {

            try {
                const query = {};
                if (req.query.requeterId) {
                    query.requeterId = req.query.requeterId;
                }

                const cursor = companis.find(query);
                const result = await cursor.toArray();

                res.status(200).send({
                    success: true,
                    message: 'Companis get successfully',
                    data: result
                })
            } catch (error) {
                console.log(error);
                res.status(500).send({
                    success: false,
                    message: 'Failed get  job ',
                    error: error.message
                })
            }
        });

        app.post('/api/companis', async (req, res) => {
            try {
                const company = req.body;
                const result = await companis.insertOne(company);

                res.status(200).send({
                    success: true,
                    message: 'Company added successfully',
                    data: result
                })
            } catch (error) {
                console.log(error);
                res.status(500).send({
                    success: false,
                    message: 'Failed to add company ',
                    error: error.message
                })
            }
        });

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);










app.get("/", (req, res) => {
    res.send('Careerlink Api')
});

app.listen(PORT, () => {
    console.log(`app lisen in  ${PORT}`);
})