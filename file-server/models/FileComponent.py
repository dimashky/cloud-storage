class FileComponent:
    def __init__(self, id, name, key, owner, modified, size, parent, path):
        self.id = id
        self.name = name
        self.key = key
        self.owner = owner
        self.modified = modified
        self.size = size
        self.parent = parent
        self.path = path