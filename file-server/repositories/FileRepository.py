import mysql.connector
import os
from datetime import datetime
from werkzeug.utils import secure_filename

class FileRepository:
    def __init__(self):
        self.mydb = mysql.connector.connect(
            host="localhost",
            user="root",
            passwd="root",
            database="cloud_storage_files"
        )
    
    def index(self, userId):
        mycursor = self.mydb.cursor()
        mycursor.execute("SELECT * FROM files WHERE owner_id = "+str(userId))
        rows = mycursor.fetchall()
        return rows

    def shared(self, userId):
        mycursor = self.mydb.cursor()
        mycursor.execute('''
            SELECT * FROM files join shareable on file_id = id 
            WHERE user_id = '''+str(userId))
        rows = mycursor.fetchall()
        mycursor.close()
        return rows

    def upload(self, owner_id, file, folder_id):
        modified = datetime.now().isoformat()
        size = len(file.read())
        parent = folder_id
        filename = secure_filename(file.filename)
        path = os.path.join('./data/', filename)

        file.save(path)
        mycursor = self.mydb.cursor()
        sql = "INSERT INTO files (owner_id, name, modified_at, size, parent_id, path) VALUES (%s, %s, %s, %s,%s,%s)"
        val = (owner_id,filename, modified, size, parent, path)
        mycursor.execute(sql, val)

        self.mydb.commit()

        print("1 record inserted, ID:", mycursor.lastrowid)
        
        mycursor.close()
        return True