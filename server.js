require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const path = require("path");
const AWS = require("aws-sdk");
// const fileUpload = require("express-fileupload");

// database
// require("./configs/database");

// aws
// const region = "ap-southeast-1";
// const accessKeyId = process.env.ACCESS_KEYID;
// const secretAccessKey = process.env.SECRET_ACCESSKEY;
// AWS.config.update({
// 	accessKeyId,
// 	secretAccessKey,
// 	region
// });

// init app
const app = express();


// middlewares
// helmet
app.use(
	helmet({
		contentSecurityPolicy: false,
		crossOriginEmbedderPolicy: false,
		crossOriginOpenerPolicy: false,
		crossOriginResourcePolicy: false
	})
);
// cors
app.use(cors());
// body parser
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: false, limit: "15mb" }));
// file upload
// app.use(fileUpload());


// routes
app.use("/api/user/auth", require("./routes/api/auth/authApi"));
// app.use("/api/receipt", require("./routes/api/receiptApi"));
// app.use("/api/retailer", require("./routes/api/retailerApi"));
// app.use("/api/admin", require("./routes/api/adminApi"));
// app.use("/api/admin/retailer", require("./routes/api/admin/retailer/retailerAdminApi"));
// app.use("/api/admin/dsr", require("./routes/api/admin/dsr/dsrAdminApi"));
// app.use("/api/admin/user", require("./routes/api/admin/user/userAdminApi"));
// app.use('/api/admin/validation', require('./routes/api/admin/validation/validationAdminApi'));



// serve static folder
app.use("/", express.static(path.join(__dirname, "client", "build")));
app.get("*", (req, res) => res.sendFile(path.resolve(__dirname, "client", "build", "index.html")));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));