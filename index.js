const express = require("express");
const cors = require("cors");
const useRouter = require("./routes/userroutes");
const bookingRoutes = require("./routes/bookingRoutes")

const app = express();

app.use(express.json());
app.use(cors({
    // origin: "http://localhost:5173",
    methods: ["POST", "GET", "DELETE", "PATCH", "PUT"]
}));

app.get("/", (req, res) => {
    res.send("Backend is Running...");
});

app.use("/", useRouter)
app.use("/", bookingRoutes);

app.listen(5000, () => {
    console.log("Server is running on port 5000");
});



