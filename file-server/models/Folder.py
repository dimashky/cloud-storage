from models.FileComponent import FileComponent

db = {}

class Folder(FileComponent):
    def __init__(self, id, name, key, owner, modified, size, parent, path, dbObj):
        global db
        FileComponent.__init__(self, id, name, key, owner, modified, size, parent, path)
        self.children = []
        db = dbObj
    
    def setKey(self, folders):
        parentKey = self.getKey(self.parent, folders)
        if parentKey == -1:
            self.delete()
            self.key = ""
        else:
            self.key = parentKey + self.name + "/"
        return self

    def getKey(self, parentId, folders):
        if not parentId:
            return ""
        key = ""
        folder = [folder for folder in folders if folder.id == parentId]
        if not len(folder):
            return -1
        folder = folder[0]
        if(folder.key):
            return folder.key

        parentKey = self.getKey(folder.parent, folders)

        if(parentKey == -1):
            self.delete()
            return -1

        key += parentKey
        folder.key = key +  folder.name + "/"
        key += folder.name + "/"
        return key

    def delete(self):
        global db
        db.delete(self.id)