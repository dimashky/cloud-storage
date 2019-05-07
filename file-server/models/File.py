from models.FileComponent import FileComponent

class File(FileComponent):
    def __init__(self, id, name, key, owner, modified, size, parent, path, folders):
        FileComponent.__init__(self, id, name, key, owner, modified, size, parent, path)
        self.key = self.getKey(parent, folders)+name

    def getDict(self):
        return self.__dict__
    
    def getKey(self, parentId, folders):
        if not parentId or parentId == 0:
            return ""
        key = ""
        folder = [folder for folder in folders if folder.id == int(parentId)]
        if not len(folder):
            return ""
        folder = folder[0]
        key += self.getKey(folder.parent, folders)
        folder.key = key +  folder.name + "/"
        key += folder.name + "/"
        return key