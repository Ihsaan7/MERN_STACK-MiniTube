//Configuring DOTENV first
import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});

// DB Connection setup
import connectDB from "./db/db.js";
import app from "./app.js";

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server is running at PORT: ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("Error while Connecting to MONOGDO!!!", err);
    process.exit(1);
  });
