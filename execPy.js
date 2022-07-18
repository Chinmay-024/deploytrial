const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const inputDir = path.join(__dirname, "inputs");

if (!fs.existsSync(inputDir)) {
    fs.mkdirSync(inputDir, { recursive: true });
}

const executePy = (filepath, input) => {
    const codeId = path.basename(filepath).split(".")[0];

    return new Promise(async (resolve, reject) => {
        if (input === undefined) {
            exec(`python ${filepath}`, (error, stdout, stderr) => {
                error && reject({ error, stderr });
                stderr && reject(stderr);
                resolve(stdout);
            });
        } else {
            const inputname = `input.txt`;
            const inputpath = path.join(inputDir, inputname);
            await fs.writeFileSync(inputpath, input);
            console.log(`python ${filepath} < ${inputpath}`);
            exec(
                `python ${filepath} < ${inputpath}`,
                (error, stdout, stderr) => {
                    error && reject({ error, stderr });
                    stderr && reject(stderr);
                    resolve(stdout);
                }
            );
        }
    });
};

module.exports = {
    executePy,
};
