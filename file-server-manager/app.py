from flask import Flask, request, redirect
from repositories.FileRepository import FileRepository
from flask import jsonify
from models.MinionsConnector import MinionsConnector

app = Flask(__name__)

fileRepo = FileRepository()
minionsConnector = MinionsConnector()

UPLOAD_FOLDER = './data/'
ALLOWED_EXTENSIONS = set(['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'])

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.secret_key = 'HelloSearchEngine'
app.config['SESSION_TYPE'] = 'filesystem'


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route("/files/<user_id>")
def index(user_id):
    files, folders = fileRepo.index(user_id)
    res = [ob.__dict__ for ob in files + folders]
    return jsonify(res)


@app.route("/shared/<user_id>")
def shared(user_id):
    return jsonify(fileRepo.shared(user_id))

@app.route("/upload-link")
def uploadLink():
    minions = minionsConnector.sortMinionsByStorageSize()
    if(len(minions) == 0):
        return ""
    return "http://%s:%d/upload"%(minions[0][0], minions[0][1])

@app.route("/download/<fileId>")
def downloadLink(fileId):
    minions = fileRepo.getFilePath(fileId)
    if not minions:
        return "Not Found", 404
    avaliable_minions = minionsConnector.sortMinionsByTrafficLoad()
    minions = [x for x in avaliable_minions if x in minions]
    if(len(minions) == 0):
        return ""
    return redirect("http://%s:%d/download/%s"%(minions[0][0], minions[0][1]+1, fileId))

@app.route("/upload", methods=["POST"])
def upload():
    file = request.files['file']
    parent_id = request.form.get('parent_id')
    owner_id = request.form.get('owner_id')
    if file.filename == '':
        raise Exception('No selected file')
    if file:
        return jsonify(fileRepo.upload(owner_id, file, parent_id))

@app.route("/create-folder", methods=["POST"])
def createFolder():
    cnt = -1
    if(request.is_json):
        content = request.get_json()
        cnt = fileRepo.createFolder(content["owner_id"], content["name"], content["parent_id"])
    return jsonify(cnt)


@app.route("/file/<file_id>", methods=["PUT"])
def update(file_id):
    cnt = -1
    if(request.is_json):
        content = request.get_json()
        cnt = fileRepo.update(file_id, content["name"], content["parent_id"])
    return jsonify(cnt)


@app.route("/file/<file_id>", methods=["DELETE"])
def delete(file_id):
    cnt = fileRepo.delete(file_id)
    return jsonify(cnt)


if __name__ == '__main__':
    app.run(debug=True)
