module.exports = (app) => {
    const roles = require('../controller/role');

    app.post('/roles/addRoles',roles.Roles);
    app.get('/roles/getAll',roles.getAllRoles);  
}
