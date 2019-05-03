import $http from './$http';
import Moment from 'moment';

class FileManager {
    static async getFiles() {
        let files = (await $http.get("files")).data;
        files.forEach(f => {
	        f.modified = Moment(f.modified)
        });
        return files;
    }

	static async uploadFile(file, parent_id) {
		let data = new FormData();
		data.append("file", file);
		data.append("parent_id", parent_id);
		return (await $http.post("/api/upload", data)).data;
	}

	static async createFolder(name, parent_id) {
		return (await $http.post("/api/folder",{name, parent_id})).data;
	}

	static async DeleteFolderOrFile(id) {
		return (await $http.delete("/api/delete-file/"+id)).data
	}

	static async EditFolderOrFile(id, name, parent_id) {
		return (await $http.put("/api/update-file/"+id, {name, parent_id})).data
	}
}

export default FileManager;
