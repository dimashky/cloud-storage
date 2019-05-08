from models.FileComponent import FileComponent

db = {}

class File(FileComponent):
    def __init__(self, id, name, key, owner, modified, size, parent, path, folders, dbObj):
        global db
        FileComponent.__init__(self, id, name, key, owner, modified, size, parent, path)
        parentKey = self.getKey(parent, folders)
        db = dbObj
        if parentKey != -1:
            self.key = parentKey+name
        else:
            self.delete()

    def getDict(self):
        return self.__dict__
    
    def getKey(self, parentId, folders):
        if not parentId or int(parentId) == 0:
            return ""
        key = ""
        folder = [folder for folder in folders if folder.id == int(parentId)]
        if not len(folder):
            return -1
        folder = folder[0]
        parentKey = self.getKey(folder.parent, folders)
        if(parentKey == -1):
            return -1
        key += parentKey
        folder.key = key +  folder.name + "/"
        key += folder.name + "/"
        return key
    
    def delete(self):
        global db
        db.delete(self.id)