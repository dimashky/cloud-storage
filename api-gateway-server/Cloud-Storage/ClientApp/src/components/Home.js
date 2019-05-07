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
import Swal from 'sweetalert2';

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
    };

    handleCreateFiles = (files) => {
	     Swal.fire({
		     title: "Select a file",
		     input: "file",
		     showCancelButton: true,
		     showLoaderOnConfirm: true,
		     inputAttributes: {
			     "aria-label": "Upload file"
		     },
		     preConfirm: file => {
			     return new Promise(resolve => {
				     let parent_id = this.state.selectedItem.id ? this.state.selectedItem.id : 0;
				     FileManager.uploadFile(file, parent_id)
					     .then((file) => {
						     this.setState(state => {
							     state.files = state.files.concat([file]);
							     return state
						     });
						     Swal.fire({
								     type: "success",
								     title: "تم رفع الملف بنجاح"
							     })
							     .then(() => {
								     resolve();
							     });
					     })
					     .catch(err => {
						     Swal.fire(err.message)
							     .then(() => resolve());
					     });
			     });
		     }
	     });
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

    handleDeleteFileOrFolder = (fileKey) => {
        let files = this.state.files;
        let idx = files.findIndex(e => e.key === fileKey || e.key === '//'+fileKey);
        if(idx < 0){
			alert("File not found");
			console.log(fileKey, files);
        	return;
		}
		let file = files[idx];
		if(file.key[0] === "/" && file.key[1] === "/"){
			fileKey = "//" + fileKey;
		}
        FileManager.DeleteFolderOrFile(file.id)
	        .then(() => {
				this.setState(state => {
					const newFiles = []
					state.files.map(f => {
					  if (f.key.substr(0, fileKey.length) !== fileKey) {
						newFiles.push(f)
					  }
					})
					state.files = newFiles
					return state
				  })
	        })
	        .catch(err => {
	        	alert(err.message);
	        })
    }

	onClick = ({ event, props }) => console.log(event,props);

	renderContextMenu = () => (
		<Menu id='menu_id'>
			{this.state.selectedItem && this.state.selectedItem.path && <Item onClick={this.onClick}><IconFont className="fas fa-download"/>Download</Item>}
			{this.state.selectedItem && !this.state.selectedItem.path && <Item onClick={this.handleCreateFiles}><IconFont className="fas fa-upload"/>Upload</Item>}
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
				                onDeleteFolder={this.handleDeleteFileOrFolder}
				                onDeleteFile={this.handleDeleteFileOrFolder}
			                />
		                </MenuProvider>
		                {this.renderContextMenu()}

	                </div>
                </Grid>
            </Grid>
        );
    }
}
