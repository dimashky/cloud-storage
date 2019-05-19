import rpyc, os, argparse
from threading import Thread
from rpyc.utils.server import ThreadedServer
from flask import Flask, request, send_file

ap = argparse.ArgumentParser()
ap.add_argument("-p", "--port", required = True, help = "port")
args = vars(ap.parse_args())

api = Flask(__name__)

class FileService(rpyc.Service):
	connected_devices = 0
	def on_connect(self, conn ):
		FileService.connected_devices += 1
		print("Hello new, total load = "+ str(FileService.connected_devices))

	def on_disconnect(self, conn):
		FileService.connected_devices -= 1
		print("Bye, total load = "+ str(FileService.connected_devices))
		
	def exposed_loadness(self):
		return FileService.connected_devices

	def exposed_storage(self):
		return FileService.getSize("./storage")	

	def exposed_store(self, file, id):
		try:
			fileContent = file.read()
			filename = str(id)
			path = os.path.join('storage', filename)

			f = open(path, 'wb')
			f.write(fileContent)
			return True
		except:
			return False

	def exposed_delete(self, id):
		try:
			file_path = os.path.join('storage', id)
			if os.path.isfile(file_path):
				os.remove(file_path)
			return True
		except:
			return False
	
	def exposed_read(self, id):
		try:
			file_path = os.path.join('storage', id)
			if os.path.isfile(file_path):
				return open(file_path, "rb").read()
			return False
		except:
			return False
	
	def exposed_existed(self, id):
		try:
			file_path = os.path.join('storage', id)
			if os.path.isfile(file_path):
				return True
			return False
		except:
			return False
	
	@staticmethod
	def getSize(start_path = '.'):
		total_size = 0
		for dirpath, dirnames, filenames in os.walk(start_path):
			for f in filenames:
				fp = os.path.join(dirpath, f)
				total_size += os.path.getsize(fp)
		return total_size

@api.route('/download/<id>')
def downloadFile (id):
	path = os.path.join('storage', id)
	if os.path.isfile(path):
	    return send_file(path, as_attachment=True)
	return "Not Found", 404

def runFlask(port):
	global api
	print("====> RUNNING FLASK <====")
	api.run(port=port+1, debug=False, use_reloader=False)

def runRPC(port):
	server = ThreadedServer(FileService, port = port)
	server.start()

if __name__ == "__main__":
	port = int(args["port"]) 
	t = Thread(target = runRPC, args=[port])
	t.setDaemon(True)
	t.start()
	runFlask(port + 1)