const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const compression = require("compression");
const { generateFile } = require("./generateCodeFile");
const { executeCpp } = require("./execCpp");
const { addTaskToQueue } = require("./taskQueue");
const Task = require("./models/taskModel");
const dotenv = require("dotenv");

const app = express();
dotenv.config({ path: "./config.env" });

mongoose.connect(
    process.env.DATABASE,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
    (err) => {
        err && console.error(err);
        console.log("Successfully connected to MongoDB: compilerdb");
    }
);

// Implement CORS
app.use(cors());
app.options("*", cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(compression());

app.post("/run", async (req, res) => {
    const { language = "cpp", code, input } = req.body;
    console.log(language, "Length:", code.length);

    if (code === undefined) {
        return res
            .status(400)
            .json({ success: false, error: "Empty code body!" });
    }

    // need to generate a c++ file with content from the request
    const { filepath, inputpath } = await generateFile(language, code, input);

    // write into DB
    const task = await new Task({ language, filepath, inputpath }).save();
    const taskId = task["_id"];
    addTaskToQueue(taskId);
    res.status(201).json({ taskId });
});

app.get("/status", async (req, res) => {
    const taskId = req.query.id;

    if (taskId === undefined) {
        return res
            .status(400)
            .json({ success: false, error: "missing id query param" });
    }

    const task = await Task.findById(taskId);

    if (task === undefined) {
        return res
            .status(400)
            .json({ success: false, error: "couldn't find task" });
    }

    return res.status(200).json({ success: true, task });
});

__dirname = path.resolve();
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "/client/build")));
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
    });
}

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});
