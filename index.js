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
    const sessions = db.collection('session');


    const verifyToken = async (req, res, next) => {
        console.log('header.........', req.headers);
        const header = req.headers.authorization
        if (!header) {
            return res.status(401).send({
                message: "Unauthorize acsess"
            })
        }

        const token = header.split(' ')[1];

        if (!token) {
            return res.status(401).send({
                message: "Unauthorize acsess"
            })
        }

        const query = { token: token }
        const session = await sessions.findOne(query);

        console.log("session of sessssssss----", session);
        const userId = session?.userId;

        const userQuary = {
            _id: userId
        }
        const user = await users.findOne(userQuary);

        console.log("user of sessssssss----", user);


        req.user = user;

        next();
    }

    const verifySeeker = (req, res, next) => {
        if (req.user?.role !== "seeker") {
            return res.status(403).send({ message: "Forbidden accsess" });
        }
        next();
    }
    const verifyRequeter = (req, res, next) => {
        if (req.user?.role !== "requeter") {
            return res.status(403).send({ message: "Forbidden accsess" });
        }
        next();
    }

    const verifyAdmin = (req, res, next) => {
        if (req.user?.role !== "admin") {
            return res.status(403).send({ message: "Forbidden accsess" });
        }
        next();
    }

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

        app.get('/api/applications', verifyToken, verifySeeker, async (req, res) => {
            try {
                const query = {};
                if (req.query.applicantId) {
                    query.applicantId = req.query.applicantId;
                }

                if (req.user._id.toString() !== query.applicantId) {
                    return res.status(403).send({ message: "Forbidden accsess" });
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

        app.get('/api/my/companis', verifyToken, verifyRequeter, async (req, res) => {

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

        app.get('/api/companies', verifyToken, async (req, res) => {

            try {
                const companies = await companis.find().toArray();

                for (const company of companies) {
                    const filter = {
                        companyID: company._id.toString()
                    }

                    const jobCount = await jobs.countDocuments(filter);
                    company.applications = jobCount;
                }


                res.status(200).send({
                    success: true,
                    message: 'Companis get successfully',
                    data: companies
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
        app.get('/api/companies2', async (req, res) => {

            const pipeline = [
                {
                    $skip: 1
                }
            ]
            const cursor = companis.aggregate(pipeline);
            const result = await cursor.toArray();
            res.send(result)
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

        app.patch('/api/companis/:id', verifyToken, verifyAdmin, async (req, res) => {
            try {
                const companyData = req.body;
                const id = req.params.id;

                const filter = { _id: new ObjectId(id) };
                const updateDocument = {
                    $set: {
                        status: companyData.status,
                    },
                };
                const updatedDoc = await companis.updateOne(filter, updateDocument);
                res.status(200).send({
                    success: true,
                    message: ' Status updated successfully',
                    subscriptionData: subscriptionResult,
                    userData: updatedDoc
                });

            } catch (error) {
                res.status(500).send({
                    success: false,
                    message: 'Failed to update status',
                    error: error.message
                });
            }
        }) 

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