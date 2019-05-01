from flask import Flask

app = Flask(__name__)


@app.route("/files")
def home():
    return "Hello, Flask  323!"


if __name__ == '__main__':
    app.run()
