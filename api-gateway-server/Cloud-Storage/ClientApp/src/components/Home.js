import React, { Component } from 'react';
import FileBrowser from 'react-keyed-file-browser';
import FileManager from '../api/FileManager';
import Moment from 'moment';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import 'react-keyed-file-browser/dist/react-keyed-file-browser.css';
import LinearProgress from '@material-ui/core/LinearProgress';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import FolderShared from '@material-ui/icons/FolderShared';
import Folder from '@material-ui/icons/Folder';
import { Menu, Item, IconFont, MenuProvider } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.min.css';

export class Home extends Component {
    static displayName = Home.name;

    constructor(props) {
        super(props);
        this.state = {
            files: [],
            loading: false,
	          selectedItem: null
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
    	let name = key.split("/");
    	name = name[name.length - 2];
    	let parent_id = 0;
    	if(this.state.selectedItem){
    		parent_id = this.state.selectedItem.id
	    }
	    this.setState({loading: true});
	    FileManager.createFolder(name, parent_id)
		    .then((id) => {
			    this.setState({loading: false});
			    this.setState(state => {
				    state.files = state.files.concat([{
					    key,
					    id
				    }]);
				    return state
			    })
		    })
		    .catch(err => {
		    	alert(err.message);
			    this.setState({loading: false});
		    });
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

    handleSelectFileOrFolder = (file) => {
    	if(!file){
    		return;
	    }
	    this.setState({selectedItem: file});
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

	onClick = ({ event, props }) => console.log(event,props);

	renderContextMenu = () => (
		<Menu id='menu_id'>
			{this.state.selectedItem && this.state.selectedItem.path && <Item onClick={this.onClick}><IconFont className="fas fa-download"/>Download</Item>}
			{this.state.selectedItem && !this.state.selectedItem.path && <Item onClick={this.onClick}><IconFont className="fas fa-upload"/>Upload</Item>}
		</Menu>
	);

    render() {
        const { files, loading } = this.state;

        return (
            <Grid container spacing={16} style={{marginTop: 40}}>
                <Grid item xs={3} style={{borderRight: "1px solid grey"}}>
	                <List component="nav">
                      <ListItem button>
			                <ListItemIcon>
				                <Folder />
			                </ListItemIcon>
			                <ListItemText primary="My Folder" />
		                </ListItem>
		                <Divider/>
		                <ListItem button>
			                <ListItemIcon>
				                <FolderShared />
			                </ListItemIcon>
			                <ListItemText primary="Shared with Me" />
		                </ListItem>
	                </List>
                </Grid>
                <Grid item xs={9}>
	                <div className="file-browser-container">
		                {loading && (
			                <div style={{padding: 16}}>
				                <LinearProgress />
			                </div>
		                )}
		                <MenuProvider id="menu_id">
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
					                Download: <i className="fas fa-download" aria-hidden="true" />,
					                Loading: <i className="fas fa-sync fa-spin" aria-hidden="true" />,
				                }}
				                detailRenderer={(e)=><span>{e.name}</span>}
				                onSelect={this.handleSelectFileOrFolder}
				                onCreateFolder={this.handleCreateFolder}
				                onCreateFiles={this.handleCreateFiles}
				                onMoveFolder={this.handleRenameFolder}
				                onMoveFile={this.handleRenameFile}
				                onRenameFolder={this.handleRenameFolder}
				                onRenameFile={this.handleRenameFile}
				                onDeleteFolder={this.handleDeleteFolder}
				                onDeleteFile={this.handleDeleteFile}
			                />
		                </MenuProvider>
		                {this.renderContextMenu()}

	                </div>
                </Grid>
            </Grid>
        );
    }
}
