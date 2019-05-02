from flask import Flask, request
from repositories.FileRepository import FileRepository
import json

app = Flask(__name__)

fileRepo = FileRepository()

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
    return json.dumps(fileRepo.index(user_id))

@app.route("/shared/<user_id>")
def shared(user_id):
    return json.dumps(fileRepo.shared(user_id))

@app.route("/upload", methods=["POST"])
def upload():
    file = request.files['file']
    parent_id = request.form.get('parent_id')
    owner_id = request.form.get('owner_id')
    if file.filename == '':
        raise Exception('No selected file')
    if file and allowed_file(file.filename):
        return json.dumps(fileRepo.upload(owner_id, file, parent_id))

if __name__ == '__main__':
    app.run()
