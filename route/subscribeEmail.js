module.exports = (app) =>{
    const {
        emailSubscribe,
        subscriptionStatus,
        unsubscribeUser
    } = require('../controller/subscribeEmail');


     app.post('/api/subscribe',emailSubscribe);
     app.get('/api/checkStatus',subscriptionStatus);
     app.put('/api/unSubscribedUser',unsubscribeUser);
}