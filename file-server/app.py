from flask import Flask, request
from repositories.FileRepository import FileRepository
from flask import jsonify

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
    files, folders = fileRepo.index(user_id)
    res = [ob.__dict__ for ob in files + folders]
    return jsonify(res)


@app.route("/shared/<user_id>")
def shared(user_id):
    return jsonify(fileRepo.shared(user_id))


@app.route("/upload", methods=["POST"])
def upload():
    file = request.files['file']
    parent_id = request.form.get('parent_id')
    owner_id = request.form.get('owner_id')
    if file.filename == '':
        raise Exception('No selected file')
    if file:
        return jsonify(fileRepo.upload(owner_id, file, parent_id))


@app.route("/file/<file_id>", methods=["PUT"])
def update(file_id):
    if(request.is_json):
        content = request.get_json()
        cnt = fileRepo.update(file_id, content["name"], content["parent_id"])
    return jsonify(cnt)


@app.route("/file/<file_id>", methods=["DELETE"])
def delete(file_id):
    cnt = fileRepo.delete(file_id)
    return jsonify(cnt)


if __name__ == '__main__':
    app.run()
