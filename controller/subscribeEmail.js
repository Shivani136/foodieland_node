const subscribeEmail = require('../model/subscribeEmail');
const mailchimp = require("@mailchimp/mailchimp_marketing");
const md5 = require("md5");
require('dotenv').config;

mailchimp.setConfig({
    apiKey: 'eed40a0198dd47c4553cce48a284570d-us14',
    server: 'us14'
});

const listId = 'c6625da991';

exports.emailSubscribe = async (req, res) => {
    const body = req.body;
    await subscribedUser(body).then(data => {
        console.log(" data = ", data)
        if (!data) {
            res.status(400).send({ message: " user not subscribed.." })
        } else {
            const newData = new subscribeEmail({
                subscribeUserId: data.id,
                email_address: data.email_address,
                status: data.status
            })
            newData.save().then(result => {
                res.status(200).send({ message: "successfully subscribed..", result })
            }).catch(err => {
                res.status(400).send({ message: " plese enter valid or unique email ..", err })
            })
        }
    }).catch(err => {
        res.status(400).send({ message: err })
    })
}

exports.subscriptionStatus = async (req, res) => {
    try {
        const email = req.body.email;
        await sbscribeStatus(email).then(function (data) {
            res.status(200).send({ message: `This user's subscription status is    ${data.status}` })
        }).catch(err => {
            res.status(400).send(err)
        })
    } catch (error) {
        res.status(400).send({ message: error.message })
    }
}

exports.unsubscribeUser = async (req, res) => {
    try {
    const email = req.body.email;
    await unSubscribedUser(email).then((data)=>{
        res.status(200).send({ message: `This user is now   ${data.status}.` })
    }).catch(err=>{
        res.status(400).send(err)
    })
    } catch (error) {
        res.status(400).send({message:error.message})
    }
}

async function subscribedUser(subscribedUser) {
    try {
        var response;
        await mailchimp.lists.addListMember(listId, {
            email_address: subscribedUser.email,
            status: "subscribed",
            merge_fields: {
                FNAME: subscribedUser.firstName,
                LNAME: subscribedUser.lastName
            }
        }).then(function (data) {
            response = data
        }).catch(function (err) {
            response = err.message
        });

    } catch (error) {
        response = error
    }
    return response
}

async function sbscribeStatus(userEmail) {
    try {
        var response;
        console.log(userEmail)

        const subscriberHash = md5(userEmail.toLowerCase());
        await mailchimp.lists.getListMember(
            listId,
            subscriberHash
        ).then(function (data) {
            response = data
        }).catch(function (err) {
            response = err
        });
        console.log(`This user's subscription status is ${response.status}.`);
    } catch (e) {
        if (e.status === 404) {
            console.error(`This email is not subscribed to this list`, e);
        }
    }
    console.log("response", response)
    return response
}

async function unSubscribedUser(userEmail) {
    try {
        var response;
        console.log(userEmail)
        const email = userEmail;
        const subscriberHash = md5(email.toLowerCase());
         await mailchimp.lists.updateListMember(
            listId,
            subscriberHash,
            {
                status: "unsubscribed"
            }
        ).then(result=>{
            response = result
        }).catch(err=>{
            response = err
        });
        console.log(`This user is now ${response.status}.`);
       
    } catch (error) {
           response = error
    }
    return response
}