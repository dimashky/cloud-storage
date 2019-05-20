import $http from './$http';
import Moment from 'moment';
import FileSaver from 'file-saver';

class FileManager {
    static async getFiles() {
        let files = (await $http.get("files")).data;
        files.forEach(f => {
	        f.modified = Moment(f.modified)
        });
        return files;
    }

	static async uploadFile(file, parent_id) {
    const uploadLink = (await $http.get("upload-link")).data;
    if(!uploadLink){
    	throw Error("No Available Servers")
    }
		let data = new FormData();
		data.append("file", file);
		data.append("parent_id", parent_id);
		return (await $http.post(uploadLink, data)).data;
	}

	static async createFolder(name, parent_id) {
		return (await $http.post("folder",{name, parent_id: parent_id})).data;
	}

	static async DeleteFolderOrFile(id) {
		return (await $http.delete("delete-file/"+id)).data
	}

	static async EditFolderOrFile(id, name, parent_id) {
		return (await $http.put("update-file/"+id, {name, parent_id})).data
	}

	static async download(id) {
    const options = {
	    responseType: "arraybuffer"
    };
		let response = (await $http.get("download/"+id, options));
		let filename = response.headers["x-suggested-filename"];
		const blob = new Blob([response.data]);
		FileSaver.saveAs(blob, filename);
	}
}

export default FileManager;
