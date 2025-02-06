import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { UserContext } from '../context/user.context';
import { useLocation } from 'react-router-dom';
import axios from '../config/axios';
import { initializeSocket, receiveMessage, sendMessage } from '../config/socket';
import Markdown from 'markdown-to-jsx';
import hljs from 'highlight.js';
import { getWebContainer } from '../../config/webContainer';

import PropTypes from 'prop-types';
//import webcontainer from "../config/webcontainer";


function SyntaxHighlightedCode({ className, children }) {
    const ref = useRef(null);

    useEffect(() => {
        if (ref.current && className?.includes('lang-') && window.hljs) {
            window.hljs.highlightElement(ref.current);
            ref.current.removeAttribute('data-highlighted'); // Allows reprocessing
        }
    }, [className, children]);

    return <code ref={ref} className={className}>{children}</code>;
}

SyntaxHighlightedCode.propTypes = {
    className: PropTypes.string,
    children: PropTypes.node.isRequired
};

const Project = () => {
    const location = useLocation();
    const { user } = useContext(UserContext);
    const messageBox = useRef(null);

    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(new Set());
    const [project, setProject] = useState(location.state.project);
    const [message, setMessage] = useState('');
    const [users, setUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [fileTree, setFileTree] = useState({});
    const [currentFile, setCurrentFile] = useState(null);
    const [webContainer, setWebContainer] = useState(null);
    const [iframeUrl, setIframeUrl] = useState(null);

    // Memoized message handler to prevent re-creation on every render
    const handleMessage = useCallback((data) => {
        console.log("Raw received message:", data.message);

        if (data.sender._id === 'ai') {
            try {
                const messageData = typeof data.message === 'string' ? JSON.parse(data.message) : data.message;
                console.log("Parsed messageData:", messageData);

                if (messageData.fileTree) {
                    webContainer?.mount(messageData.fileTree);
                    setFileTree(messageData.fileTree || {});
                }
            } catch (error) {
                console.error("JSON Parsing Error:", error, data.message);
            }
        }

        setMessages((prevMessages) => [...prevMessages, data]);
    }, [webContainer]); // Add webContainer as a dependency

    useEffect(() => {
        // Initialize socket connection
        const socket = initializeSocket(project._id);

        // Attach the message handler
        receiveMessage('project-message', handleMessage);

        // Initialize WebContainer if not already initialized
        if (!webContainer) {
            getWebContainer().then((container) => {
                setWebContainer(container);
                console.log("WebContainer started");
            });
        }

        // Cleanup function to remove the event listener and disconnect the socket
        return () => {
            console.log("Cleaning up socket listeners...");
            socket.off('project-message', handleMessage); // Remove the event listener
            socket.disconnect(); // Disconnect the socket
        };
    }, [project._id, handleMessage]); // Add project._id and handleMessage as dependencies

    const handleUserClick = (id) => {
        setSelectedUserId((prev) => {
            const newSelection = new Set(prev);
            newSelection.has(id) ? newSelection.delete(id) : newSelection.add(id);
            return newSelection;
        });
    };

    const addCollaborators = () => {
        axios
            .put("/projects/add-user", {
                projectId: location.state.project._id,
                users: Array.from(selectedUserId),
            })
            .then(() => setIsModalOpen(false))
            .catch((err) => console.error("Error adding collaborators:", err));
    };

    const send = () => {
        sendMessage('project-message', { message, sender: user });
        setMessages((prevMessages) => [...prevMessages, { sender: user, message }]);
        setMessage("");
    };

    function saveFileTree(ft) {
        axios
            .put('/projects/update-file-tree', {
                projectId: project._id,
                fileTree: ft,
            })
            .then((res) => console.log("File tree updated:", res.data))
            .catch((err) => console.error("Error saving file tree:", err));
    }

    return (
        <main className='h-screen w-screen flex'>
            {/* Left Section */}
            <section className="left flex flex-col h-screen min-w-96 bg-slate-300">
                <header className='flex justify-between items-center p-2 px-4 bg-slate-100'>
                    <button onClick={() => setIsModalOpen(true)}>
                        <i className="ri-add-fill"></i> Add collaborator
                    </button>
                    <button onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}>
                        <i className="ri-group-fill"></i>
                    </button>
                </header>

                <div className="conversation-area flex-grow flex flex-col pt-14 pb-10">
                    <div ref={messageBox} className="message-box p-1 flex-grow overflow-auto">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message p-2 ${msg.sender._id === user._id ? 'ml-auto' : ''}`}>
                                <small>{msg.sender.email}</small>
                                <div>
                                    {msg.sender._id === 'ai' ? (
                                        <Markdown>
                                            {typeof msg.message === 'string' ? JSON.parse(msg.message).text : msg.message.text}
                                        </Markdown>
                                    ) : (
                                        <p>{msg.message}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="inputField w-full flex">
                        <input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className='p-2 flex-grow' placeholder='Enter message'
                        />
                        <button onClick={send} className='p-2 bg-slate-950 text-white'>
                            <i className="ri-send-plane-fill"></i>
                        </button>
                    </div>
                </div>
            </section>

            {/* Right Section */}
            <section className="right bg-red-50 flex-grow flex">
                <div className="explorer max-w-64 bg-slate-200">
                    {Object.keys(fileTree).map((file, index) => (
                        <button key={index} onClick={() => setCurrentFile(file)} className="p-2">
                            {file}
                        </button>
                    ))}
                </div>

                <div className="code-editor flex-grow">
                    {fileTree[currentFile] && (
                        <pre className="hljs">
                            <code
                                className="hljs"
                                contentEditable
                                onBlur={(e) => {
                                    const updatedContent = e.target.innerText;
                                    const newFileTree = { ...fileTree, [currentFile]: { file: { contents: updatedContent } } };
                                    setFileTree(newFileTree);
                                    saveFileTree(newFileTree);
                                }}
                                dangerouslySetInnerHTML={{ __html: hljs.highlight('javascript', fileTree[currentFile]?.file.contents).value }}
                            />
                        </pre>
                    )}
                </div>

                {iframeUrl && (
                    <div className="min-w-96">
                        <input type="text" value={iframeUrl} readOnly className="w-full p-2 bg-slate-200" />
                        <iframe src={iframeUrl} className="w-full h-full"></iframe>
                    </div>
                )}
            </section>
        </main>
    );
};

Project.propTypes = {
    children: PropTypes.node,
};

export default Project;