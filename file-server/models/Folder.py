from models.FileComponent import FileComponent

class Folder(FileComponent):
    def __init__(self, id, name, key, owner, modified, size, parent, path):
        FileComponent.__init__(self, id, name, key, owner, modified, size, parent, path)
        self.children = []
    
    def setKey(self, folders):
        self.key = self.getKey(self.parent, folders) + self.name + "/"
        return self

    def getKey(self, parentId, folders):
        if not parentId:
            return ""
        key = ""
        folder = [folder for folder in folders if folder.id == parentId]
        if not len(folder):
            return ""
        folder = folder[0]
        if(folder.key):
            return folder.key
        key += self.getKey(folder.parent, folders)
        folder.key = key +  folder.name + "/"
        key += folder.name + "/"
        return key