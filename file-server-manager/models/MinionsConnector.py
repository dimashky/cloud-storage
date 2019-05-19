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
		minions = {}
		for id, (host, port) in self.minions.items():
			if(len(includes) > 0 and id not in includes):
				continue
			try:
				conn =  rpyc.connect(host, port=port)
				load = conn.root.loadness()
				conn.close()
				minions[id] = load
			except:
				print("Error with minion => %s %d" % (host, port))
		minions = collections.OrderedDict(sorted(minions.items(), key=lambda kv: kv[1]))
		return minions

	def sortMinionsByStorageSize(self, includes = []):
		minions = {}
		for id, (host, port) in self.minions.items():
			if(len(includes) > 0 and id not in includes):
				continue
			try:
				conn =  rpyc.connect(host, port=port)
				storage = conn.root.storage()
				conn.close()
				minions[id] = storage
			except:
				print("Error with minion => %s %d" % (host, port))
		minions = collections.OrderedDict(sorted(minions.items(), key=lambda kv: kv[1]))
		return minions
	
