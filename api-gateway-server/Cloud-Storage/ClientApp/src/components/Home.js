import React, { Component } from 'react';
import FileBrowser, { Icons } from 'react-keyed-file-browser';
import FileManager from '../api/FileManager';
import Moment from 'moment';
import 'react-keyed-file-browser/dist/react-keyed-file-browser.css';
import LinearProgress from '@material-ui/core/LinearProgress';

export class Home extends Component {
    static displayName = Home.name;

    constructor(props) {
        super(props);
        this.state = {
            files: [],
            loading: false
        }
    }

    componentDidMount() {
        this.getFolders();
    }

    getFolders(){
	    this.setState({loading: true});
	    FileManager.getFiles()
		    .then(files => {
			    this.setState({ files });
			    this.setState({loading: false});
		    })
		    .catch(err => {
			    alert(err.message);
			    this.setState({loading: false});
		    });
    }

    handleCreateFolder = (key) => {
        this.setState(state => {
            state.files = state.files.concat([{
                key: key,
            }]);
            return state
        })
    }

    handleCreateFiles = (files, prefix) => {
        this.setState(state => {
            const newFiles = files.map((file) => {
                let newKey = prefix
                if (prefix !== '' && prefix.substring(prefix.length - 1, prefix.length) !== '/') {
                    newKey += '/'
                }
                newKey += file.name
                return {
                    key: newKey,
                    size: file.size,
                    modified: +Moment(),
                }
            })

            const uniqueNewFiles = []
            newFiles.map((newFile) => {
                let exists = false
                state.files.map((existingFile) => {
                    if (existingFile.key === newFile.key) {
                        exists = true
                    }
                })
                if (!exists) {
                    uniqueNewFiles.push(newFile)
                }
            })
            state.files = state.files.concat(uniqueNewFiles)
            return state
        })
    }

    handleRenameFolder = (oldKey, newKey) => {
        this.setState(state => {
            const newFiles = []
            state.files.map((file) => {
                if (file.key.substr(0, oldKey.length) === oldKey) {
                    newFiles.push({
                        ...file,
                        key: file.key.replace(oldKey, newKey),
                        modified: +Moment(),
                    })
                } else {
                    newFiles.push(file)
                }
            })
            state.files = newFiles
            return state
        })
    }

    handleRenameFile = (oldKey, newKey) => {
        this.setState(state => {
            const newFiles = []
            state.files.map((file) => {
                if (file.key === oldKey) {
                    newFiles.push({
                        ...file,
                        key: newKey,
                        modified: +Moment(),
                    })
                } else {
                    newFiles.push(file)
                }
            })
            state.files = newFiles
            return state
        })
    }

    handleDeleteFolder = (folderKey) => {
        this.setState(state => {
            const newFiles = []
            state.files.map((file) => {
                if (file.key.substr(0, folderKey.length) !== folderKey) {
                    newFiles.push(file)
                }
            })
            state.files = newFiles
            return state
        })
    }

    handleDeleteFile = (fileKey) => {
        this.setState(state => {
            const newFiles = []
            state.files.map((file) => {
                if (file.key !== fileKey) {
                    newFiles.push(file)
                }
            })
            state.files = newFiles
            return state
        })
    }

    render() {
        const { files, loading } = this.state;

        return (
            <div className="file-browser-container">
              {loading && (
	              <div style={{padding: 16}}>
		              <LinearProgress />
                </div>
              )}
                <FileBrowser
                    files={files}
                    icons={{
                        File: <i className="fas fa-file" aria-hidden="true" />,
                        Image: <i className="fas fa-file-image" aria-hidden="true" />,
                        PDF: <i className="fas fa-file-pdf" aria-hidden="true" />,
                        Rename: <i className="fas fa-i-cursor" aria-hidden="true" />,
                        Folder: <i className="fas fa-folder" aria-hidden="true" />,
                        FolderOpen: <i className="fas fa-folder-open" aria-hidden="true" />,
                        Delete: <i className="fas fa-trash" aria-hidden="true" />,
                        Loading: <i className="fas fa-sync fa-spin" aria-hidden="true" />,
                    }}

                    onCreateFolder={this.handleCreateFolder}
                    onCreateFiles={this.handleCreateFiles}
                    onMoveFolder={this.handleRenameFolder}
                    onMoveFile={this.handleRenameFile}
                    onRenameFolder={this.handleRenameFolder}
                    onRenameFile={this.handleRenameFile}
                    onDeleteFolder={this.handleDeleteFolder}
                    onDeleteFile={this.handleDeleteFile}
                />
            </div>
        );
    }
}
