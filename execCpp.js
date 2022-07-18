const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const outputPath = path.join(__dirname, "outputs");

if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
}

const executeCpp = (filepath, inputpath) => {
    const codeId = path.basename(filepath).split(".")[0];
    const outPath = path.join(outputPath, `${codeId}.out`);

    return new Promise(async (resolve, reject) => {
        if (inputpath === undefined) {
            exec(
                `g++ ${filepath} -o ${outPath} && cd ${outputPath} && timeout 20s ./${codeId}.out`,
                (error, stdout, stderr) => {
                    error && reject({ error, stderr });
                    stderr && reject(stderr);
                    resolve(stdout);
                }
            );
        } else {
            exec(
                `g++ ${filepath} -o ${outPath} && cd ${outputPath} && timeout 20s ./${codeId}.out < ${inputpath}`,
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
    executeCpp,
};
