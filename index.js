const express = require("express");
const colors = require("colors");
const morgan = require("morgan");
const mySqlPool = require("./config/db");
const cors = require("cors")
const dotenv = require('dotenv');

//env config
dotenv.config({ path: './.env' });

//rest obj
const app = express();

//middleware
app.use(morgan("dev"));
app.use(express.json());

// Enable CORS for all routes
app.use(cors())

//routes
app.use('/api/v1/products', require("./routes/productsRoute.js"))
app.use('/api/v1/auth', require("./routes/authRoute.js"))
app.use('/api/v1/cart', require("./routes/cartRoute.js"));

//port
const PORT = process.env.PORT;
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;

//conditionally listen
mySqlPool
  .query("SELECT 1")
  .then(() => {
    console.log("DB connected".bgCyan.black);
    //listen
    app.listen(PORT, () => {
      console.log(
        `server is running on port ${PORT}`.bgMagenta.white
      );
    });
  })
  .catch((error) => {
    console.log(error);
  });