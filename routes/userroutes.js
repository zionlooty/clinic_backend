const express = require("express")
const { loginUser, createUser, getUser, getAllUsers, deleteUser } = require("../controllers/usercontroller")
const { body } = require("express-validator")
const { verifyUser } = require("../middlewares/auth")


const useRouter = express.Router()


useRouter.post("/new/user",
    [
        body("fullname").notEmpty().withMessage("fullname required"),
        body("mobile").isNumeric().withMessage("invalid mobile number"),
        body("email").isEmail().withMessage("invalid email"),
        body("password").isAlphanumeric().isLength({ min: 6 }).withMessage("password must be atleast 6 character long")

    ],


    createUser)

useRouter.post("/user/login", 
    [
        body("email").notEmpty().withMessage("Email required"),
        body("password").notEmpty().withMessage("password required")
    ],
    
    loginUser)


    useRouter.get("/user", verifyUser, getUser)



if (getAllUsers) {
    useRouter.get("/users/all", verifyUser, getAllUsers)
}



if (deleteUser) {
    useRouter.delete("/user/:user_id", verifyUser, deleteUser)
}


module.exports = useRouter