const { DB } = require("../sql")
const bcrypt = require("bcryptjs")
const { validationResult } = require("express-validator")
const jwt = require("jsonwebtoken")
require("dotenv").config()





module.exports.createUser = (req, res) => {

    const { fullname, email, mobile, password } = req.body
    const errorResponse = validationResult(req)
    try {
        if (!validationResult(req).isEmpty()) {
            res.status(400).json({
                message: errorResponse.errors[0].msg
            })
        } else {
            DB.query("SELECT * FROM users WHERE mobile = ?", [mobile], (e, user) => {
                if (e) {
                    res.status(500).json({ message: "Error Fteching data" })
                } else {
                    if (user.length > 0) {
                        res.status(400).json({ message: "Mobile NO. already exist" })
                    } else {
                        const encryptedPassword = bcrypt.hashSync(password, 10)
                        DB.query("INSERT INTO users(fullname, email, mobile, pass_word) VALUES(?,?,?,?)", [fullname, email, mobile, encryptedPassword], (er, _) => {
                            if (er) {
                                res.status(500).json({ message: "unable to add new user" })
                                console.log(er)
                            } else {
                                res.status(200).json({ message: "Account created successfully" })
                            }
                        })
                    }
                }
            })
        }
    } catch (error) {
        res.status(500).json({ message: error.message ?? "something went wrong" })
    }
}



module.exports.getUser = (req, res) => {
    const { id } = req.user

    try {
        DB.query("SELECT * FROM users WHERE user_id =?", [id], (e, user) => {
            if (e) {
                res.status(500).json({ message: "unable to fetch user" })
            } else {
                if (user.length > 0) {
                    res.status(200).json({ message: user })
                } else {
                    res.status(400).json({ message: "user not found" })
                }
            }
        })
    } catch (error) {
        res.status(500).json({ message: error.message ?? "something went wrong" })
    }
}




module.exports.getAllUsers = (req, res) => {
    try {
        DB.query("SELECT user_id, fullname, email, mobile, createdAt FROM users ORDER BY createdAt DESC", (err, users) => {
            if (err) {
                res.status(500).json({ message: "unable to fetch users" })
            } else {
                res.status(200).json({ message: users })
            }
        })
    } catch (error) {
        res.status(500).json({ message: error.message ?? "something went wrong" })
    }
}



// module.exports.deleteUser = (req, res) => {
//     const { user_id } = req.params
//     try {
//         if (!user_id) {
//             res.status(400).json({ message: "user ID is required" })
//         }
//         DB.query("SELECT user_id FROM users WHERE user_id=?", [user_id], (err, user) => {
//             if (err) {
//                 res.status(500).json({ message: "Error checking user" })
//             }
//             if (user.length === 0) {
//                 res.status(404).json({ message: "user not found" })
//             }

//             DB.query("DELETE FROM users WHERE user_id=?", [user_id], (e, result) => {
//                 if (e) {
//                     console.log(e)
//                     res.status(500).json({ message: "unable to delete user" })
//                 }
//                 res.status(200).json({ message: "user deleted successfully" })
//             })
//         })
//     } catch (error) {
//         res.status(500).json({ message: error.message ?? "something went wrong" })
//     }
// }




module.exports.deleteUser = (req, res) => {
    const userId = req.params.user_id;

    // Check if user exists
    DB.query("SELECT * FROM users WHERE user_id = ?", [userId], (err, userResult) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Database error while fetching user" });
        }

        if (userResult.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if user has active bookings
        DB.query("SELECT * FROM bookings WHERE user_id = ?", [userId], (err, bookings) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Database error while checking bookings" });
            }

            if (bookings.length > 0) {
                return res.status(400).json({ message: "Cannot delete user with active bookings" });
            }

            // No active bookings, proceed to delete user
            DB.query("DELETE FROM users WHERE user_id = ?", [userId], (deleteErr, result) => {
                if (deleteErr) {
                    console.error(deleteErr);
                    return res.status(500).json({ message: "Failed to delete user" });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: "User not found" });
                }

                return res.status(200).json({ message: "User deleted successfully" });
            });
        });
    });
};




module.exports.loginUser = (req, res) => {
    const { email, password } = req.body;
    const errorResponse = validationResult(req);

    try {
        if (!errorResponse.isEmpty()) {
            return res.status(400).json({
                message: errorResponse.errors[0].msg
            });
        }

        DB.query("SELECT * FROM users WHERE email = ?", [email], (err, result) => {
            if (err) {
                return res.status(500).json({ message: "Unable to get user" });
            }

            if (result.length === 0) {
                return res.status(404).json({ message: "User not found" });
            }

            const user = result[0];
            const db_password = user.pass_word;

            const match = bcrypt.compareSync(password, db_password);

            if (match) {
                const token = jwt.sign(
                    { id: user.user_id },
                    process.env.JWT_SECRET,
                    { expiresIn: "1d" }
                );

                return res.status(200).json({
                    message: "Login successful",
                    token: token
                });
            } else {
                return res.status(400).json({ message: "Email or Password incorrect" });
            }
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Something went wrong" });
    }
};
