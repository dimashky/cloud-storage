import rpyc, argparse
from rpyc.utils.server import ThreadedServer
from repositories.FileRepository import FileRepository
from models.MinionsConnector import MinionsConnector

class FileManagingService(rpyc.Service):
	minionsConnector = MinionsConnector()
	fileRepository = FileRepository()
 
	def exposed_checkAuth(self, access_token):
		return 1

	def exposed_uploading(self, node_host, node_port, access_token, file_name, file_size, parent_id):
		owner_id = self.exposed_checkAuth(access_token)
		nodes = FileManagingService.minionsConnector.sortMinionsByStorageSize([(node_host, node_port)])
		print(nodes)
		paths = "%s:%d"%(node_host,node_port)
		for h,p in nodes:
			paths += ",%s:%d"%(h,p)
		file = FileManagingService.fileRepository.upload(owner_id, file_name, file_size, parent_id, paths)
		return {
			"nodes": nodes[:2],
			"file": file
		}
		

if __name__ == "__main__":
	server = ThreadedServer(FileManagingService, port = 5001)
	server.start()