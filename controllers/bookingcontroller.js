const { DB } = require("../sql")
const allowedTimeSlots = [
    "9:00 - 11:00 AM",
    "12:00 - 2:00 PM",
    "3:00 - 5:00 PM"
];


module.exports.createBooking = (req, res) => {
    const { service_id, therapy_type_id, booking_date, time_slot } = req.body;

    if (!service_id || !booking_date || !time_slot) {
        return res.status(400).json({ message: "All fields are required" });
    }
    if (!allowedTimeSlots.includes(time_slot)) {
        return res.status(400).json({ message: "Invalid time slot selected" });
    }
    const user_id = req.user.id;
    DB.query(
        "SELECT * FROM bookings WHERE booking_date = ? AND time_slot = ? AND status = 'booked'",
        [booking_date, time_slot],
        (err, existingBooking) => {
            if (err) {
                return res.status(500).json({ message: "Error checking availability" });
            }

            if (existingBooking.length > 0) {
                return res.status(400).json({ message: "This time slot is already booked" });
            }
            DB.query(
                "INSERT INTO bookings(user_id, service_id, therapy_type_id, booking_date, time_slot, status) VALUES(?,?,?,?,?,?)",
                [user_id, service_id, therapy_type_id || null, booking_date, time_slot, 'booked'],
                (insertErr, result) => {
                    if (insertErr) {
                        console.log(insertErr)
                        return res.status(500).json({ message: "Failed to create booking" });
                    }

                    res.status(200).json({ message: "Booking successfully created" });
                }
            );
        }
    );
};





module.exports.getUserBookings = (req, res) => {
    const { id } = req.user;  

    try {
        DB.query(
            `SELECT 
                b.booking_id, 
                s.name AS service_name,
                s.price,
                t.name AS therapy_type,
                b.booking_date,
                b.time_slot,
                b.status
            FROM bookings b
            INNER JOIN services s ON b.service_id = s.service_id
            LEFT JOIN therapy_types t ON b.therapy_type_id = t.therapy_id
            WHERE b.user_id = ?`,
            [id],
            (err, bookings) => {
                if (err) {
                    res.status(500).json({ message: "Failed to fetch bookings" });
                } else {
                    res.status(200).json({ bookings });
                }
            }
        );
    } catch (error) {
        res.status(500).json({ message: error.message ?? "Something went wrong" });
    }
};

