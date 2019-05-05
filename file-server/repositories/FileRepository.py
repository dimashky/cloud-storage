import mysql.connector
import os
from datetime import datetime
from werkzeug.utils import secure_filename
from models.File import File
from models.Folder import Folder


class FileRepository:
    def __init__(self):
        self.mydb = mysql.connector.connect(
            host="localhost",
            user="root",
            passwd="",
            database="cloud_storage_files"
        )

    def index(self, userId):
        mycursor = self.mydb.cursor()
        mycursor.execute("SELECT * FROM files WHERE owner_id = "+str(userId))
        rows = mycursor.fetchall()
        folders = [Folder(*row) for row in rows if not row[len(row)-1]]
        files = [File(*row, folders) for row in rows if row[len(row)-1]]
        folders = [folder.setKey(folders) for folder in folders]
        return (files, folders)

    def shared(self, userId):
        mycursor = self.mydb.cursor()
        mycursor.execute('''
            SELECT * FROM files join shareable on file_id = id 
            WHERE user_id = '''+str(userId))
        rows = mycursor.fetchall()
        mycursor.close()
        return rows

    def upload(self, owner_id, file, parent_id):
        modified = datetime.now().isoformat()
        size = len(file.read())
        parent = parent_id
        filename = secure_filename(file.filename)
        path = os.path.join('./data/', filename)

        file.save(path)
        mycursor = self.mydb.cursor()
        sql = "INSERT INTO files (owner_id, name, modified_at, size, parent_id, path) VALUES (%s, %s, %s, %s,%s,%s)"
        val = (owner_id, file.filename, modified, size, parent, path)
        mycursor.execute(sql, val)

        self.mydb.commit()

        mycursor.close()
        files, folders = self.index(owner_id)
        print(folders)
        print(parent_id)
        return File(mycursor.lastrowid, filename, "", owner_id, modified, size, parent, path, folders).__dict__

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
            SET += ", parent_id='" + str(folder_id) + "'"

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
        sql = "DELETE FROM files WHERE id = " + str(file_id)
        mycursor.execute(sql)

        self.mydb.commit()

        mycursor.close()
        return mycursor.rowcount
