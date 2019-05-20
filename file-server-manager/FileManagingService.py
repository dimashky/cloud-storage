import rpyc, argparse, requests
from rpyc.utils.server import ThreadedServer
from repositories.FileRepository import FileRepository
from models.MinionsConnector import MinionsConnector

class FileManagingService(rpyc.Service):
	minionsConnector = MinionsConnector()
	fileRepository = FileRepository()
 
	def exposed_checkAuth(self, access_token):
		try:
			headers = {"Accept":"application/json","Authorization": access_token}
			res = requests.get("http://localhost:8000/api/user", headers=headers)
			if(res.status_code != 200):
				print("checkAuth => unAuth %d"%res.status_code)
				return False
			return res.json()["id"]
		except:
			print("checkAuth => Exception")
			return False

	def exposed_canDownload(self, access_token, fileId):
		user_id = self.exposed_checkAuth(access_token)
		if not user_id:
			return False
		return FileManagingService.fileRepository.canAccessFile(user_id, fileId)

	def exposed_uploading(self, node_host, node_port, access_token, file_name, file_size, parent_id):
		owner_id = self.exposed_checkAuth(access_token)
		if not owner_id:
			return False
		nodes = FileManagingService.minionsConnector.sortMinionsByStorageSize([(node_host, node_port)])
		paths = "%s:%d"%(node_host,node_port)
		for h,p in nodes:
			paths += ",%s:%d"%(h,p)
		file = FileManagingService.fileRepository.upload(owner_id, file_name, file_size, parent_id, paths)
		return {
			"nodes": nodes[:2],
			"file": file
		}
		

if __name__ == "__main__":
	server = ThreadedServer(FileManagingService, port = 5001, protocol_config = {"allow_public_attrs" : True})
	server.start()