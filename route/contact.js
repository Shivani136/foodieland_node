module.exports = (app) => {
    const {
        createContactPage 
    } = require('../controller/contact');
  

    app.post('/api/addContactDetails',createContactPage)
}
