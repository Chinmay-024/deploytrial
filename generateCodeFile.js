const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");

const codeDir = path.join(__dirname, "codes");
const inputDir = path.join(__dirname, "inputs");

if (!fs.existsSync(codeDir)) {
    fs.mkdirSync(codeDir, { recursive: true });
}
if (!fs.existsSync(inputDir)) {
    fs.mkdirSync(inputDir, { recursive: true });
}

const generateFile = async (format, content, input) => {
    const codeId = uuid();
    const filename = `${codeId}.${format}`;
    const filepath = path.join(codeDir, filename);
    let inputpath;
    if (input === undefined) {
        inputpath = "";
    } else {
        const inputname = `${codeId}.txt`;
        inputpath = path.join(inputDir, inputname);
    }

    await fs.writeFileSync(inputpath, input);
    await fs.writeFileSync(filepath, content);
    return { filepath, inputpath };
};

module.exports = {
    generateFile,
};
