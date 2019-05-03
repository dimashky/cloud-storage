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
}

export default FileManager;
