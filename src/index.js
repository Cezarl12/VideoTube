import { app } from "./app.js";
import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
  path: "./.env",
});
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log("Server running");
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Serve is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
