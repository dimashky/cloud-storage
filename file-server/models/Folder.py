from models.FileComponent import FileComponent

class Folder(FileComponent):
    def __init__(self, id, name, key, owner, modified, size, parent, path):
        FileComponent.__init__(self, id, name, key, owner, modified, size, parent, path)
        self.children = []