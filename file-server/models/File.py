from models.FileComponent import FileComponent

class File(FileComponent):
    def __init__(self, id, name, key, owner, modified, size, parent, path, folders):
        FileComponent.__init__(self, id, name, key, owner, modified, size, parent, path)
        self.key = self.getKey(parent, folders)+name

    def getDict(self):
        return self.__dict__
    
    def getKey(self, parentId, folders):
        if not parentId:
            return ""
        key = ""
        folder = [folder for folder in folders if folder.id == parentId]
        if not len(folder):
            raise Exception("Folder not found!")
        folder = folder[0]
        key += self.getKey(folder.parent, folders)
        folder.key = key +  folder.name + "/"
        key += folder.name + "/"
        return key