import rpyc
import configparser, collections

class MinionsConnector:
	def __init__(self, configPath = "config.ini"):
		parser = configparser.ConfigParser()
		parser.read(configPath)
		minions = parser.get('master','minions').split(',')
		self.minions = {}
		for m in minions:
			id,host,port = m.split(":")
			self.minions[id] = (host, int(port))
	
	def sortMinionsByTrafficLoad(self, includes = []):
		minions = []
		for id, (host, port) in self.minions.items():
			try:
				if(len(includes) > 0 and (host,port) not in includes):
					continue
				conn =  rpyc.connect(host, port=port)
				load = conn.root.loadness()
				conn.close()
				minions.append((host, port, load))
			except:
				print("Error with minion => %s %d" % (host, port))
		minions = sorted(minions, key=lambda kv: kv[2])
		return [(h,p) for h,p,s in minions]

	def sortMinionsByStorageSize(self, includes = []):
		minions = []
		for id, (host, port) in self.minions.items():
			try:
				if(len(includes) > 0 and (host,port) in includes):
					continue
				conn =  rpyc.connect(host, port=port)
				storage = conn.root.storage()
				conn.close()
				minions.append((host, port, storage))
			except:
				print("Error with minion => %s %d" % (host, port))
		minions = sorted(minions, key=lambda kv: kv[2])	
		return [(h,p) for h,p,s in minions]
