import axios from "axios";
import "./App.css";
import defaultCode from "./defaultCode";
import React, { useState, useEffect } from "react";
import moment from "moment";
import AceEditor from "react-ace";

import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "bootstrap-css-only/css/bootstrap.min.css";
import "mdbreact/dist/css/mdb.css";
import { MDBInput } from "mdbreact";
import Button from "@mui/material/Button";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/theme-tomorrow";
import "ace-builds/src-noconflict/ext-language_tools";

function App() {
    const [code, setCode] = useState("");
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [language, setLanguage] = useState("cpp");
    const [taskId, setTaskId] = useState(null);
    const [status, setStatus] = useState(null);
    const [taskDetails, setTaskDetails] = useState(null);

    useEffect(() => {
        setCode(defaultCode[language]);
    }, [language]);

    useEffect(() => {
        const defaultLang = localStorage.getItem("default-language") || "cpp";
        setLanguage(defaultLang);
    }, []);

    let pollInterval;

    const handleSubmit = async () => {
        const payload = {
            language,
            code,
            input,
        };
        try {
            setOutput("");
            setStatus(null);
            setTaskId(null);
            setTaskDetails(null);
            const { data } = await axios.post(
                "http://52.140.121.152/run",
                payload
            );
            if (data.taskId) {
                setTaskId(data.taskId);
                setStatus("Submitted.");

                // poll here
                pollInterval = setInterval(async () => {
                    const { data: statusRes } = await axios.get(
                        `http://52.140.121.152/status`,
                        {
                            params: {
                                id: data.taskId,
                            },
                        }
                    );
                    const { success, task, error } = statusRes;
                    console.log(statusRes);
                    if (success) {
                        const { status: taskStatus, output: taskOutput } = task;
                        setStatus(taskStatus);
                        setTaskDetails(task);
                        if (taskStatus === "pending") return;
                        setOutput(taskOutput);
                        clearInterval(pollInterval);
                    } else {
                        console.error(error);
                        setOutput(JSON.stringify(error.stderr));
                        setStatus("Bad request");
                        clearInterval(pollInterval);
                    }
                }, 1000);
            } else {
                setOutput("Retry again.");
            }
        } catch ({ response }) {
            if (response) {
                const errMsg = response.data.err.stderr;
                setOutput(errMsg);
            } else {
                setOutput("Please retry submitting.");
            }
        }
    };

    const setDefaultLanguage = () => {
        localStorage.setItem("default-language", language);
        console.log(`${language} set as default!`);
    };

    const renderTimeDetails = () => {
        if (!taskDetails) {
            return "";
        }
        let { submittedAt, startedAt, completedAt } = taskDetails;
        let result;
        submittedAt = moment(submittedAt).toString();
        if (startedAt && completedAt) {
            const start = moment(startedAt);
            const end = moment(completedAt);
            const diff = end.diff(start, "seconds", true);
            result = (
                <>
                    <p>
                        <span className='state'> Execution Time </span>
                        {diff} sec
                    </p>
                    <p>
                        <span className='state'> Task Submitted At </span>
                        {submittedAt}
                    </p>
                </>
            );
            return result;
        }
        result = (
            <p>
                <span className='state'> Task Submitted At </span>
                {submittedAt}
            </p>
        );
        return result;
    };

    return (
        <>
            <div className='App'>
                <div className='App-logo'>
                    {/* <h1>CODEIN</h1> */}
                    <img
                        className='image'
                        src={require("./logo3.png")}
                        alt='CODEIN'
                    />
                </div>
                <div className='head'>
                    <div className='form'>
                        <FormControl variant='standard' fullWidth>
                            <InputLabel id='demo-simple-select-label'>
                                Language
                            </InputLabel>
                            <Select
                                labelId='demo-simple-select-label'
                                id='demo-simple-select'
                                value={language}
                                label='Language'
                                onChange={(e) => {
                                    const shouldSwitch = window.confirm(
                                        "Are you sure you want to change language? WARNING: Your current code will be lost."
                                    );
                                    if (shouldSwitch) {
                                        setLanguage(e.target.value);
                                    }
                                }}
                            >
                                <MenuItem value='cpp'>C++</MenuItem>
                                <MenuItem value='py'>Python</MenuItem>
                                <MenuItem value='java'>Java</MenuItem>
                            </Select>
                        </FormControl>
                        <div />
                        <br />
                    </div>
                    <Button
                        onClick={setDefaultLanguage}
                        className='fillIcon'
                        variant='contained'
                        color='secondary'
                    >
                        Set Default
                    </Button>
                </div>
                <br />
                <div className='editor'>
                    <AceEditor
                        mode='java'
                        value={code}
                        theme='tomorrow'
                        width='100%'
                        fontSize='15px'
                        onChange={(e) => {
                            setCode(e);
                        }}
                        // name='UNIQUE_ID_OF_DIV'
                        editorProps={{ $blockScrolling: true }}
                        setOptions={{
                            enableBasicAutocompletion: true,
                            enableLiveAutocompletion: true,
                            enableSnippets: true,
                        }}
                    />
                </div>
                <br />
                <div className='centre'>
                    <MDBInput
                        type='textarea'
                        label='Input'
                        rows='5'
                        cols='50'
                        value={input}
                        onChange={(e) => {
                            setInput(e.target.value);
                        }}
                    />
                </div>
                <br />
                <Button
                    onClick={handleSubmit}
                    className='fillIcon'
                    variant='contained'
                    color='secondary'
                >
                    Submit
                </Button>
                <br />
                <br />
                {status && (
                    <div className='output'>
                        <div className='outputflex'>
                            {status && (
                                <p>
                                    <span className='state'>Status </span>
                                    {status}
                                </p>
                            )}
                            {taskId && (
                                <p>
                                    <span className='state'> Task ID </span>
                                    {taskId}
                                </p>
                            )}
                            {renderTimeDetails()}
                        </div>
                        {output && (
                            <p>
                                <span className='state'>Output </span>
                                {output}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

export default App;
