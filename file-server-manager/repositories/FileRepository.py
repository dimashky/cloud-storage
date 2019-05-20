import mysql.connector, os, io, rpyc, configparser
from datetime import datetime
from werkzeug.utils import secure_filename
from models.Folder import Folder
from models.File import File


parser = configparser.ConfigParser()
parser.read('config.ini')

db = mysql.connector.connect(
            host="localhost",
            user="root",
            passwd="root",
            database="cloud_storage_files"
        )

class FileRepository:
    def __init__(self):
        self.mydb = db

    def index(self, userId):
        mycursor = self.mydb.cursor()
        mycursor.execute("SELECT * FROM files WHERE owner_id = "+str(userId))
        rows = mycursor.fetchall()
        folders = [Folder(*row, self) for row in rows if not row[len(row)-1]]
        files = [File(*row, folders, self) for row in rows if row[len(row)-1]]
        folders = [folder.setKey(folders) for folder in folders]
        return (files, folders)

    def canAccessFile(self, userId, fileId):
        mycursor = self.mydb.cursor()
        mycursor.execute("SELECT * FROM files WHERE owner_id = %d AND id = %d"%(int(userId), int(fileId)))
        rows = mycursor.fetchall()
        mycursor.close()
        if(len(rows) == 0):
            return False
        return rows[0][1]
        
    def shared(self, userId):
        mycursor = self.mydb.cursor()
        mycursor.execute('''
            SELECT * FROM files join shareable on file_id = id 
            WHERE user_id = '''+str(userId))
        rows = mycursor.fetchall()
        mycursor.close()
        return rows

    def getFilePath(self, fileId):
        mycursor = self.mydb.cursor()
        mycursor.execute('''
            SELECT * FROM files
            WHERE id = '''+str(fileId))
        rows = mycursor.fetchall()
        mycursor.close()

        if(len(rows) != 1):
            return None
        
        paths = rows[0][len(rows[0])-1]
        slaves =  paths.split(",")
        minions = []
        for m in slaves:
            host, port = m.split(":")
            minions.append((host, int(port)))    
        return minions
    
    
    def upload(self, owner_id, file_name, file_size, parent_id, nodes):
        modified = datetime.now().isoformat()
        size = file_size
        parent = parent_id
        filename = file_name
        path = nodes

        mycursor = self.mydb.cursor()
        sql = "INSERT INTO files (owner_id, name, modified_at, size, parent_id, path) VALUES (%s, %s, %s, %s,%s,%s)"
        val = (owner_id, filename, modified, size, parent, path)
        mycursor.execute(sql, val)

        self.mydb.commit()

        mycursor.close()
        files, folders = self.index(owner_id)
        return File(mycursor.lastrowid, filename, "", owner_id, modified, size, parent, path, folders, self).__dict__

    def createFolder(self, owner_id, folder_name, parent_id):
        modified = datetime.now().isoformat()
        parent = parent_id

        mycursor = self.mydb.cursor()
        sql = "INSERT INTO files (owner_id, name, modified_at, size, parent_id) VALUES (%s, %s, %s, %s,%s)"
        val = (owner_id, folder_name, modified, 0, parent)
        mycursor.execute(sql, val)

        self.mydb.commit()

        mycursor.close()
        return mycursor.lastrowid

    def update(self, file_id, filename, folder_id):
        modified = datetime.now().isoformat()
        SET = "SET modified_at='" + modified + "'"
        if(folder_id):
            SET += ", parent_id=" + str(folder_id)

        if(filename):
            SET += ", name='" + str(filename) + "'"

        mycursor = self.mydb.cursor()
        sql = "UPDATE files " + SET + " WHERE id = " + str(file_id)
        mycursor.execute(sql)

        self.mydb.commit()

        mycursor.close()
        return mycursor.rowcount

    def delete(self, file_id):
        mycursor = self.mydb.cursor()
        mycursor.execute("SELECT * FROM files WHERE id = "+str(file_id))
        rows = mycursor.fetchall()

        if len(rows) == 0:
            return 1

        file_path = rows[0][7]
        
        sql = "DELETE FROM files WHERE id = " + str(file_id)
        mycursor.execute(sql)
        self.mydb.commit()
        mycursor.close()

        if file_path and os.path.isfile(file_path):
            os.remove(file_path)

        return mycursor.rowcount
