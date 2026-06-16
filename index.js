const dns = require("node:dns/promises");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const express = require('express');
const dotenv = require('dotenv')
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


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
    const users = db.collection('user');
    const applications = db.collection('applications');
    const plans = db.collection('plans');
    const subscriptions = db.collection('subscriptions');

    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        app.get('/api/users', async (req, res) => {

            try {

                const cursor = users.find();
                const result = await cursor.toArray();

                res.status(200).send({
                    success: true,
                    message: 'users get successfully',
                    data: result
                })
            } catch (error) {
                console.log(error);
                res.status(500).send({
                    success: false,
                    message: 'Failed get  users ',
                    error: error.message
                })
            }
        })

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

        app.get('/api/jobs/:id', async (req, res) => {

            try {
                const { id } = req.params;
                const query = {
                    _id: new ObjectId(id)
                }

                const result = await jobs.findOne(query);

                res.status(200).send({
                    success: true,
                    message: 'jobdeatail get successfully',
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


        // application related api 

        app.get('/api/applications', async (req, res) => {
            try {
                const query = {};
                if (req.query.applicantId) {
                    query.applicantId = req.query.applicantId;
                }

                const cursor = applications.find(query)
                const result = await cursor.toArray();

                res.status(200).send({
                    success: true,
                    message: 'application get successfully',
                    data: result
                })
            } catch (error) {
                console.log(error);
                res.status(500).send({
                    success: false,
                    message: 'Failed get  applications ',
                    error: error.message
                })
            }
        });

        app.get('/api/plans', async (req, res) => {
            try {
                const query = {};
                if (req.query.planId) {
                    query.planId = req.query.planId;
                }

                const result = await plans.findOne(query)

                res.status(200).send({
                    success: true,
                    message: 'plan get successfully',
                    data: result
                })
            } catch (error) {
                console.log(error);
                res.status(500).send({
                    success: false,
                    message: 'Failed get plan ',
                    error: error.message
                })
            }
        })

        // subscription related api 
        // app.post('/api/subscriptions', async (req, res) => {
        //     try {
        //         const data = req.body;
        //         const subInfo = {
        //             ...data,
        //             createdAt: new Date()
        //         }
        //         const result = await subscriptions.insertOne(subInfo);

        //         res.status(200).send({
        //             success: true,
        //             message: 'subricstions create successfully',
        //             data: result
        //         });
        //     } catch (error) {
        //         console.log(error);
        //         res.status(500).send({
        //             success: false,
        //             message: 'Failed create subricstions ',
        //             error: error.message
        //         })
        //     }

        //     // update user plan
        //     try {
        //         const filter = { email: data.email };

        //         const updateDocument = {
        //             $set: {
        //                 plan: data.planId,
        //             },
        //         }
        //         const userResult = await users.updateOne(filter, updateDocument);

        //         res.status(200).send({
        //             success: true,
        //             message: 'update plan successfully',
        //             data: userResult
        //         });
        //     } catch (error) {
        //         console.log(error);
        //         res.status(500).send({
        //             success: false,
        //             message: 'Failed update plan',
        //             error: error.message
        //         })
        //     }

        // })

        app.post('/api/subscriptions', async (req, res) => {
            try {
                const data = req.body; // এখন এই 'data' পুরো try ব্লকের যেকোনো জায়গায় ব্যবহার করা যাবে

                // ১. সাবস্ক্রিপশন ডাটা তৈরি এবং ডাটাবেজে ইনসার্ট
                const subInfo = {
                    ...data,
                    createdAt: new Date()
                };
                const subscriptionResult = await subscriptions.insertOne(subInfo);

                // ২. ইউজারের প্ল্যান আপডেট করা
                const filter = { email: data.email };
                const updateDocument = {
                    $set: {
                        plan: data.planId, // আপনার রিকোয়েস্ট বডিতে planId থাকতে হবে
                    },
                };
                const userResult = await users.updateOne(filter, updateDocument);

                // ৩. সব কাজ সফলভাবে শেষ হলে একটিমাত্র রেসপন্স পাঠানো হবে
                res.status(200).send({
                    success: true,
                    message: 'Subscription created and user plan updated successfully',
                    subscriptionData: subscriptionResult,
                    userData: userResult
                });

            } catch (error) {
                // যেকোনো একটি অপারেশনে ভুল হলে বা এরর আসলে সরাসরি এখানে চলে আসবে
                console.error("Error in subscription process:", error);
                res.status(500).send({
                    success: false,
                    message: 'Failed to complete subscription process',
                    error: error.message
                });
            }
        });


        app.post('/api/applications', async (req, res) => {
            try {
                const application = req.body;
                const newApplication = {
                    ...application,
                    createdAt: new Date()
                };

                const result = await applications.insertOne(newApplication)

                res.status(200).send({
                    success: true,
                    message: 'Application added successfully',
                    data: result
                });
            } catch (error) {
                console.error(error);
                res.status(500).send({
                    success: false,
                    message: 'Failed to add application',
                    error: error.message
                });
            }
        });





        // company related api 

        app.get('/api/my/companis', async (req, res) => {

            try {
                const query = {};
                if (req.query.requeterId) {
                    query.requeterId = req.query.requeterId;
                }

                const result = await companis.findOne(query);

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

        app.get('/api/companies', async (req, res) => {

            try {
                const result = await companis.find().toArray();

                res.status(200).send({
                    success: true,
                    message: 'Companis get successfully',
                    data: result
                })
            } catch (error) {
                console.log(error);
                res.status(500).send({
                    success: false,
                    message: 'Failed get  Companis ',
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