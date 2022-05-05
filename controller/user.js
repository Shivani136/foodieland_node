const User = require('../model/user');
const mongoose = require('mongoose')
const Roles = require('../model/role')
const bcrypt = require('bcrypt');
const crypto = require('crypto')
const _ = require('lodash')
const jwt = require('jsonwebtoken');
const multer = require('multer');
const nodemailer = require('nodemailer');
require('dotenv').config();
var ObjectId = mongoose.Types.ObjectId
const secrte = process.env.SECRTE

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, `./uploads/`);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname);
    },
});

exports.upload = multer({ storage: storage });

exports.login = (req, res) => {
    try {
        const body = req.body;
        User.findOne({ email: body.email, isDeleted: false })
            .then(userData => {
                const hash = bcrypt.compareSync(body.password, userData.password);
                if (!hash) {
                    res.status(400).send({ message: "incorrect password" })
                }
                else {
                    var token = jwt.sign({ email: userData.email }, secrte, {
                        expiresIn: "1h" // 1 hr
                    });
                    res.status(200).send({ message: "Login successfully", data: userData, accessToken: token })
                }
            })
            .catch(err => {
                res.status(400).send({ message: "Incorrect Email ", SubError: err.message })
            })
    } catch (err) {
        res.status(400).send({ message: err.message })
    }

}

exports.register = (req, res) => {
    // console.log(req.file);
    let imagePath = "";
    if (req.file) {
        imagePath = req.file.path;
    }
    const body = req.body;
    // console.log(req.body.roleId, "roleId");
    Roles.findOne({ roleName: "user" })
        .then((data) => {
            console.log(data._id, "data");
            const newUser = new User({
                roleId: data._id,
                firstName: body.firstName,
                lastName: body.lastName,
                email: body.email,
                phone: body.phone,
                password: body.password,
                Image: imagePath,
                // status: body.status,
                isDeleted: body.isDeleted,
                DeletedBy: body.DeletedBy,
            })
            if (data.roleName === 'admin') {
                newUser.status = 'approved';
            }
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(newUser.password, salt);
            newUser.password = hash;
            newUser
                .save()
                .then((result) => {
                    res.status(200).send({ message: 'user added successFully ..', data: result });
                })
                .catch((err) => {
                    res.status(400).send({
                        message: "please Insert Unique Data",
                        SubError: err.message,
                    });
                });
        })
        .catch((err) => {
            res
                .status(400)
                .send({ message: "Role does not exist..", SubError: err.message });
        });
}

exports.getAllUsers = async (req, res) => {
    try {
        
        await User.find({ isDeleted: false }).select("-password").populate('roleId')
        // await User.find({ isDeleted: false }).select("-password").populate('roleId')
            .then(userData => {
                res.status(200).send({ message: "user data ", data: userData });
            })
            .catch(err => {
                res.status(400).send({ message: err.message })
            })
    } catch (err) {
        res.status(400).send({ message: err.message })
    }

}

exports.updateUser = async (req, res) => {
    try {
        const body = req.body;
        const id = req.query.id;
        if (!ObjectId.isValid(id) && !ObjectId(id)) {
            res.status(400).send({ message: "please insert valid id" })
        }
        else if (Object.keys(body).length === 0 && body.constructor === Object) {
            res.status(400).send({ message: "Data Not Proper Formated..." });
        }
        else {
            try {
                let imagePath = "";
                if (req.file) {
                    imagePath = req.file.path;
                }
                Roles.findOne({ roleName: req.body.roleId || "user" })
                    .then((data) => {
                        body.roleId = data._id;
                        const newUpdatedUser = {
                            roleId: data._id,
                            firstName: body.firstName,
                            lastName: body.lastName,
                            email: body.email,
                            phone: body.phone,
                            Image: '',
                            status: body.status,
                        }
                        User.findById(id).then(userdata => {
                            if (!userdata) {
                                res.status(200).send({ message: "id not found..", });
                            } else {
                                if (req.file === undefined) {
                                    newUpdatedUser.Image = userdata.Image
                                } else {
                                    newUpdatedUser.Image = imagePath
                                }
                                User.findByIdAndUpdate(id, newUpdatedUser, { new: true }).select("-password").populate('roleId')
                                    .then((result) => {
                                        res.status(200).send({ message: "data updated successfully..", updatedData: result });
                                    })
                                    .catch((err) => {
                                        res.status(400).send({
                                            message: "Data not updated",
                                            SubError: err.message,
                                        });
                                    });
                            }

                        }).catch(err => { res.status(400).send({ message: err.message }) })

                    })
                    .catch((err) => {
                        res
                            .status(400)
                            .send({ message: err.message });
                    });
            } catch (err) {
                res.status(400).send({ message: err.message })
            }
        }
    }
    catch (err) {
        res.status(400).send({ message: err.message })
    }

}

exports.sendforgetPasswodMail = (req, res) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,

        auth: { user: "mangoit.mit12@gmail.com", pass: "mangoit@123" },
    });
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
        }
        const token = buffer.toString("hex");
        User.findOne({ email: req.body.email }).then((user) => {
            if (!user) {
                return res
                    .status(422)
                    .json({ error: "User dont exists with that email" });
            }
            console.log(user)
            user.resetToken = token;
            user.expireToken = Date.now() + 3600000;
            user.save().then((result) => {
                transporter.sendMail({
                    to: user.email,
                    from: "mangoit.mit12@gmail.com",
                    subject: "password reset link",
                    html: `
                      <p>You requested for password reset</p>
                      <h1>click in this <a href="http://foodiereact.mangoitsol.com/resetpassword">link</a> to reset password</h1>
                      and Youe token is- ${token}
                      `,
                });
                res.json({ message: "check your email", token });
            });
        });
    });
};

exports.restPassword = (req, res) => {
    const { token, newPassword, confirmPassword } = req.body;
    const salt = bcrypt.genSaltSync(10);

    const hash = bcrypt.hashSync(newPassword, salt);
    const obj = {
        password: hash,
        token: ''
    };
    if (newPassword === confirmPassword) {
        User.findOne({ resetToken: token })
            .then((user) => {
                user = _.extend(user, obj);
                user.save();
                return res.status(200).json({
                    message: "Your Password Has Been Changed Successfully",
                });
            })
            .catch((err) => {
                return res.status(400).json({
                    message: "Token is not match or expired Token",
                });
            });
    } else {
        return res.status(400).json({
            message: "New password and confirm password is not match",
        });
    }
};

exports.changeStatus = async (req, res, next) => {
    try {
        const body = req.body;
        var userId = body.userId
        var ownerId = body.ownerId
        var status = req.query.status;
        var deleteData = {
            isDeleted: true,
            DeletedBy: ''
        }
        var statusObj = {
            status: req.query.status
        }
        if (!status) {
            res.status(400).send({ message: "status not found" })
        }
        else if (!ObjectId.isValid(userId)) {
            res.status(400).send({ message: "userId  is not valid" })
        }
        else if (!ObjectId.isValid(ownerId)) {
            res.status(400).send({ message: "ownerId  is not valid" })
        }
        else {
            try {
                await User.findById(ownerId).then(ownerData => {
                    if (!ownerData) {
                        res.status(404).send({ message: 'ownerId not found..' })
                    } else {
                        deleteData.DeletedBy = ownerData._id
                        User.findById(userId).then(userdata => {
                            if (!userdata) {
                                res.status(404).send({ message: 'userId not found..' })
                            } else {
                                if (status === "isDeleted" && userdata.isDeleted === false) {
                                    User.findByIdAndUpdate({ _id: userId }, deleteData, { new: true }, (error, deletedData) => {
                                        if (!deletedData) {
                                            res.status(404).send('deleted user not found..')
                                        } else if (error) {
                                            res.status(400).send({
                                                message: "user not deleted"
                                            });
                                        } else {
                                            res.status(200).send({
                                                message: "User deleted successfully"
                                            });
                                        }
                                    })
                                }
                                else if (status === "isDeleted" && userdata.isDeleted === true) {
                                    res.status(200).send({ message: "already deleted" });
                                }
                                else if (status === 'approved' && userdata.status === 'pending') {
                                    changuser(userId, statusObj).then(result => {
                                        res.status(200).send({
                                            message: "you are approved successfully......",
                                            result
                                        })
                                    }).catch(err => {
                                        res.status(400).send({ message: err.message })
                                    })
                                }
                                else if (status === "approved" && userdata.status === 'approved') {
                                    res.send({ message: 'already approved' })
                                }
                                else if (status === "unapproved" && userdata.status === 'approved') {
                                    changuser(userId, statusObj).then(result => {
                                        res.status(200).send({
                                            message: "you are unapproved successfully......",
                                            result
                                        })
                                    }).catch(err => {
                                        res.status(400).send({ message: err.message })
                                    })
                                }
                                else if (status === "unapproved" && userdata.status === 'unapproved') {
                                    res.send({ message: 'you are already unapproved ' })
                                }
                                else if (status === "approved" && userdata.status === 'unapproved') {
                                    changuser(userId, statusObj).then(result => {
                                        res.status(200).send({
                                            message: "you are approved successfully......",
                                            result
                                        })
                                    }).catch(err => {
                                        res.status(400).send({ message: err.message })
                                    })
                                }
                            }
                        }).catch(err => { res.status(400).send({ message: err.message }) })
                    }
                }).catch(err => {
                    res.status(400).send({ message: err.message })
                })
            } catch (err) {
                res.status(400).send({ message: err.message })
            }
        }

    } catch (err) {

    }
}

async function changuser(id, recipObj) {
    var result;
    await User.findByIdAndUpdate({ _id: id }, recipObj, { new: true }).then(updatedData => {
        if (!updatedData) {
            result = { message: "recip not found." }
        } else {
            result = updatedData
        }
    })
    return result
}