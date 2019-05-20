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
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import Icon from '@material-ui/core/Icon';
import CloudUpload from '@material-ui/icons/CloudUpload';
import CloudDownload from '@material-ui/icons/CloudDownload';

export class Home extends Component {
    static displayName = Home.name;

    constructor(props) {
        super(props);
        this.state = {
            files: [],
            loading: false,
						selectedFolder: null,
		        selectedFile: null
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
    	let nameList = key.split("/");
    	let name = nameList[nameList.length - 2];
			let parent_id = 0;
    	if(this.state.selectedFolder){
	        parent_id = this.state.selectedFolder.id
			}
			if(nameList.length === 2){
				parent_id = 0;
			}
			else{
				let parentKey = key.slice(0, key.length-1-name.length);
				console.log(parentKey)
				let idx = this.state.files.findIndex(e => e.key === parentKey);
				if(idx > -1)
					parent_id = this.state.files[idx].id;
				else
					parent_id = 0;
			}
	    this.setState({loading: true});
	    FileManager.createFolder(name, parent_id)
		    .then((id) => {
			    this.setState({loading: false});
			    this.getFolders();
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
					 let parent_id = this.state.selectedFolder.id ? this.state.selectedFolder.id : 0;
				     FileManager.uploadFile(file, parent_id)
					     .then((file) => {
						     this.setState(state => {
								 file.modified = +Moment()
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

    handleRenameFolder = async (oldKey, newKey) => {
		let idx = this.state.files.findIndex(e => e.key === oldKey);
		let fileId = this.state.files[idx].id;
    	let nameList = newKey.split("/");
		let name = nameList[nameList.length - 2], parent_id;
		if(nameList.length === 2){
			parent_id = "NULL";
		}
		else{
			let parentKey = newKey.slice(0, newKey.length-1-name.length);
			console.log(parentKey)
			let idx = this.state.files.findIndex(e => e.key === parentKey);
			if(idx > -1)
				parent_id = this.state.files[idx].id;
			else
				parent_id = "NULL";
		}
		this.setState({loading: true});
		await FileManager.EditFolderOrFile(fileId, name, parent_id);
		this.setState({loading: false});
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

    handleRenameFile = async(oldKey, newKey) => {
		let idx = this.state.files.findIndex(e => e.key === oldKey);
		let fileId = this.state.files[idx].id;
    	let nameList = newKey.split("/");
		let name = nameList[nameList.length - 1], parent_id;
		if(nameList.length === 1){
			parent_id = "NULL";
		}
		else{
			let parentKey = newKey.slice(0, newKey.length-name.length);
			console.log(parentKey)
			let idx = this.state.files.findIndex(e => e.key === parentKey);
			if(idx > -1)
				parent_id = this.state.files[idx].id;
			else
				parent_id = "NULL";
		}
		this.setState({loading: true});
		await FileManager.EditFolderOrFile(fileId, name, parent_id);
		this.setState({loading: false});
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

    handleSelectFile = (file) => {
			console.log("selected file", file);
	    this.setState({selectedFile: file});
    }

		handleSelectFolder = (folder) => {
			console.log("selected folder", folder);
			this.setState({selectedFolder: folder, selectedFile: null});
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
		this.setState({loading: true});
        FileManager.DeleteFolderOrFile(file.id)
	        .then(() => {
				this.setState({loading: false});
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
				this.setState({loading: false});
	        	alert(err.message);
	        })
    }

  download= () => {
	  FileManager.download(this.state.selectedFile.id)
		  .catch(err => alert(err.message));
  }

	renderContextMenu = () => (
		<Menu id='menu_id'>
			{this.state.selectedFolder && !this.state.selectedFolder.path && <Item onClick={this.handleCreateFiles}><IconFont className="fas fa-upload"/>Upload</Item>}
		</Menu>
	);

    render() {
        const { files, loading } = this.state;

        return (
            <Grid container spacing={16} style={{marginTop: 40}}>
				{false &&
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
				}
                <Grid item xs={12}>
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
												onSelectFile={this.handleSelectFile}
				                onSelectFolder={this.handleSelectFolder}
												onFolderOpen={this.handleSelectFolder}
												onFolderClose={() => this.handleSelectFolder(null)}
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
	            <div style={{position:"fixed", left: 5, bottom: 5}}>
		            {
			            (!!this.state.selectedFile && this.state.selectedFile.size > 0) &&
			            <Fab size="small" variant="extended" onClick={this.download} color="primary">
				            <CloudDownload/>
				            &nbsp;&nbsp;{this.state.selectedFile.key}
			            </Fab>
		            }
	            </div>
	            <div style={{position:"fixed", left: 5, bottom: 50}}>
		            {
			            (!!this.state.selectedFolder && this.state.selectedFolder.size === 0) &&
			            <Fab size="small" variant="extended" onClick={this.handleCreateFiles} color="default">
				            <CloudUpload/>
				            &nbsp;&nbsp;{this.state.selectedFolder.key}
			            </Fab>
		            }
	            </div>
            </Grid>
        );
    }
}
