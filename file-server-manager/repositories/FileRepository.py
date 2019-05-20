import mysql.connector, os, io, rpyc
from datetime import datetime
from werkzeug.utils import secure_filename
from models.Folder import Folder
from models.File import File

class FileRepository:
    def __init__(self):
        self.mydb = mysql.connector.connect(
            host="localhost",
            user="root",
            passwd="root",
            database="cloud_storage_files"
        )
        self.cursor = self.mydb.cursor(buffered=False)
        self.cursor._connection.autocommit = True
        
    def index(self, userId):
        self.cursor.execute("SELECT * FROM files WHERE owner_id = "+str(userId))
        rows = self.cursor.fetchall()
        folders = [Folder(*row, self) for row in rows if not row[len(row)-1]]
        files = [File(*row, folders, self) for row in rows if row[len(row)-1]]
        folders = [folder.setKey(folders) for folder in folders]
        return (files, folders)

    def canAccessFile(self, userId, fileId):
        self.cursor.execute("SELECT * FROM files WHERE owner_id = %d AND id = %d"%(int(userId), int(fileId)))
        rows = self.cursor.fetchall()
        
        if(len(rows) == 0):
            return False
        return rows[0][1]
        
    def shared(self, userId):
        self.cursor.execute('''
            SELECT * FROM files join shareable on file_id = id 
            WHERE user_id = '''+str(userId))
        rows = self.cursor.fetchall()
        
        return rows

    def getFilePath(self, fileId):
        q = '''
            SELECT * FROM files
            WHERE id = '''+str(fileId)
        self.cursor.execute(q)
        rows = self.cursor.fetchall()
        
        if(len(rows) != 1):
            return None
        
        paths = rows[0][len(rows[0])-1]
        slaves =  paths.split(",")
        minions = []
        for m in slaves:
            path = m.split(":")
            if(len(path) < 2):
                continue
            minions.append((path[0], int(path[1])))    
        return minions
    
    
    def upload(self, owner_id, file_name, file_size, parent_id, nodes):
        modified = datetime.now().isoformat()
        size = file_size
        parent = parent_id
        filename = file_name
        path = nodes
        
        sql = "INSERT INTO files (owner_id, name, modified_at, size, parent_id, path) VALUES (%s, %s, %s, %s,%s,%s)"
        val = (owner_id, filename, modified, size, parent, path)
        self.cursor.execute(sql, val)

        self.mydb.commit()

        
        files, folders = self.index(owner_id)
        return File(self.cursor.lastrowid, filename, "", owner_id, modified, size, parent, path, folders, self).__dict__

    def createFolder(self, owner_id, folder_name, parent_id):
        modified = datetime.now().isoformat()
        parent = parent_id

        sql = "INSERT INTO files (owner_id, name, modified_at, size, parent_id) VALUES (%s, %s, %s, %s,%s)"
        val = (owner_id, folder_name, modified, 0, parent)
        self.cursor.execute(sql, val)

        self.mydb.commit()

        
        return self.cursor.lastrowid

    def update(self, file_id, filename, folder_id):
        modified = datetime.now().isoformat()
        SET = "SET modified_at='" + modified + "'"
        if(folder_id):
            SET += ", parent_id=" + str(folder_id)

        if(filename):
            SET += ", name='" + str(filename) + "'"

        sql = "UPDATE files " + SET + " WHERE id = " + str(file_id)
        self.cursor.execute(sql)

        self.mydb.commit()

        
        return self.cursor.rowcount

    def delete(self, file_id):
        self.cursor.execute("SELECT * FROM files WHERE id = "+str(file_id))
        rows = self.cursor.fetchall()

        if len(rows) == 0:
            return 1

        file_path = rows[0][7]
        
        sql = "DELETE FROM files WHERE id = " + str(file_id)
        self.cursor.execute(sql)
        self.mydb.commit()
        

        if file_path and os.path.isfile(file_path):
            os.remove(file_path)

        return self.cursor.rowcount
