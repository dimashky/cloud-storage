import rpyc, os, argparse, json
from threading import Thread
from rpyc.utils.server import ThreadedServer
from flask import Flask, request, send_file, jsonify
from datetime import datetime
from werkzeug.utils import secure_filename

ap = argparse.ArgumentParser()
ap.add_argument("-p", "--port", required = True, help = "port")
args = vars(ap.parse_args())

api = Flask(__name__)

COORDINATOR_HOSTNAME = "localhost"
COORDINATOR_PORT = 5001

storage_directory = "storage%s"%args["port"]

if not os.path.exists(storage_directory):
    os.makedirs(storage_directory)

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
		return FileService.getSize(storage_directory)	

	def exposed_store(self, fileContent, id):
		try:
			filename = str(id)
			path = os.path.join(storage_directory, filename)

			f = open(path, 'wb')
			f.write(fileContent)
			return True
		except:
			return False

	def exposed_delete(self, id):
		try:
			file_path = os.path.join(storage_directory, id)
			if os.path.isfile(file_path):
				os.remove(file_path)
			return True
		except:
			return False
	
	def exposed_read(self, id):
		try:
			file_path = os.path.join(storage_directory, id)
			if os.path.isfile(file_path):
				return open(file_path, "rb").read()
			return False
		except:
			return False
	
	def exposed_existed(self, id):
		try:
			file_path = os.path.join(storage_directory, id)
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
	path = os.path.join(storage_directory, id)
	if os.path.isfile(path):
	    return send_file(path, as_attachment=True)
	return "Not Found", 404

@api.route("/upload", methods=["POST"])
def uploadFile():
	file = request.files['file']
	parent_id = request.form.get('parent_id')
	access_token = request.form.get('access_token')
 
	if file.filename == '':
		raise Exception('No selected file')
    
	if file:
		port = int(args["port"])
		fileContent = file.read()
		size = len(fileContent)
		filename = secure_filename(file.filename)
		conn = rpyc.connect(COORDINATOR_HOSTNAME, port=COORDINATOR_PORT)
		res = conn.root.uploading("localhost", port, access_token, filename, size, parent_id)
		id = res["file"]["id"]
		filename = str(id)
		path = os.path.join(storage_directory, filename)
		f = open(path, 'wb')
		f.write(fileContent)
		nodes = res["nodes"]
		for host,port in nodes:
			conn = rpyc.connect(host, port=port)
			conn.root.store(fileContent, id)
			conn.close()
		return jsonify(res["file"]["id"])

def runFlask(port):
	global api
	print("====> RUNNING FLASK <====")
	api.run(port=port, debug=False, use_reloader=False)

def runRPC(port):
	server = ThreadedServer(FileService, port = port)
	server.start()

if __name__ == "__main__":
	port = int(args["port"]) 
	t = Thread(target = runRPC, args=[port])
	t.setDaemon(True)
	t.start()
	runFlask(port + 1)