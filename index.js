import express from "express";
import usersRouter from "./src/routes/usersRouter.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/api/users", usersRouter);

const PORT = 7777;
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`))