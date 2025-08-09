const express = require("express");
const router = express.Router();

const { createBooking, getUserBookings, cancelBooking, rescheduleBooking } = require("../controllers/bookingcontroller");
const { verifyUser } = require("../middlewares/auth");


router.post("/booking", verifyUser, createBooking)


router.get("/my-bookings", verifyUser, getUserBookings);


module.exports = router;
