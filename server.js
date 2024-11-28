const express = require("express");
const bodyparser = require("body-parser");
const path = require("path");
const app = express();
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const connectDB = require("./src/database/conn");
dotenv.config({ path: "config.env"});
const port = process.env.port || 4000;
connectDB();

app.use(bodyparser.urlencoded({ extended: true }));

app.use(bodyparser.json());

app.use(cookieParser());

app.set("view engine", "ejs");


app.use("/css", express.static(path.resolve(__dirname, "Assets/css")));
app.use("/img", express.static(path.resolve(__dirname, "Assets/img")));
app.use("/js", express.static(path.resolve(__dirname, "Assets/js")));

app.use("/", require("./src/routes/router"));


app.listen(port,()=>{
    console.log(`Server is running on http://localhost:${port}`);
});


