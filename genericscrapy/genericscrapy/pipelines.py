# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://docs.scrapy.org/en/latest/topics/item-pipeline.html


# useful for handling different item types with a single interface
from turtle import update
from itemadapter import ItemAdapter
import logging
import pymongo
from json import dumps
from kafka import KafkaProducer


""" class GenericscrapyPipeline:
    def process_item(self, item, spider):
        return item """


class LinkExtratorPipeline:
    def __init__(self,producer,topic):
        self.producer = producer
        self.topic = topic
    
    def open_spider(self, spider):
        pass

    def close_spider(self, spider):
        self.producer.close()
        pass

    def process_item(self, item, spider):

        mongo_collection = spider.source
        print("this mongo_collection",mongo_collection)

        print("here is LinkExtratorPipeline")
        print("item:",item)
        item = dict(item)
        item['spider'] = spider.name
        self.producer.send(self.topic, item)
        #sleep(2)
        #self.producer.flush()
    
    @classmethod
    def from_settings(cls, settings):
        """
        :param settings: the current Scrapy settings
        :type settings: scrapy.settings.Settings
        :rtype: A :class:`~KafkaPipeline` instance
        """
        k_hosts =['localhost:9092']
        topic = "numtest"
        conn = KafkaProducer(bootstrap_servers=k_hosts,
                            value_serializer=lambda x: dumps(x).encode('utf-8'))
        return cls(conn, topic)



class CardScraperPipeline:

    collection_name = 'card_collection'

    def __init__(self, mongo_uri, mongo_db):
        self.mongo_uri = mongo_uri
        self.mongo_db = mongo_db

    @classmethod
    def from_crawler(cls, crawler):
        ## pull in information from settings.py
        return cls(
            mongo_uri=crawler.settings.get('MONGO_URI'),
            mongo_db=crawler.settings.get('MONGO_DATABASE')
        )

    def open_spider(self, spider):
        ## initializing spider
        ## opening db connection
        self.client = pymongo.MongoClient(self.mongo_uri)
        self.db = self.client[self.mongo_db]
        
        #   Add data key
        #self.db[self.collection_name].insert_one({"data":[]})
        

    def close_spider(self, spider):
        ## clean up when spider is closed
        self.client.close()

    def process_item(self, item, spider):
        #self.db[self.collection_name].update_one({},{'$addToSet':{'data':dict(item)}})

        if len(list(self.db[self.collection_name].find({}))) == 0 :
            self.db[self.collection_name].insert_one(dict(item))
        #   not vide
        elif item in list(self.db[self.collection_name].find(item,{"_id":0})) :
            print("item exists")
            pass
        else:
            print("new item")
            #print("here is item",item)
            self.db[self.collection_name].insert_one(dict(item))
            logging.debug("Post added to MongoDB")
            return item




class TableScraperPipeline:
    collection_name = 'table_collection'

    """ 
    self.df[self.collection] = {"data:[]"}
        self.db[self.collection_name].data.insert_one(dict(item))
    """

    def __init__(self, mongo_uri, mongo_db):
        self.mongo_uri = mongo_uri
        self.mongo_db = mongo_db

    @classmethod
    def from_crawler(cls, crawler):
        ## pull in information from settings.py
        return cls(
            mongo_uri=crawler.settings.get('MONGO_URI'),
            mongo_db=crawler.settings.get('MONGO_DATABASE')
        )

    def open_spider(self, spider):
        ## initializing spider
        ## opening db connection
        self.client = pymongo.MongoClient(self.mongo_uri)
        self.db = self.client[self.mongo_db]


    def close_spider(self, spider):
        ## clean up when spider is closed
        self.client.close()

    def process_item(self, item, spider):
        ## how to handle each post
        #print("item is here",list(self.db[self.collection_name].find(item,{"_id":0}))[0])
        #   if vide
        print("here from table pipe")
        if len(list(self.db[self.collection_name].find({}))) == 0 :
            self.db[self.collection_name].insert_one(dict(item))
        #   not vide
        elif item in list(self.db[self.collection_name].find(item,{"_id":0})) :
            print("item exists")
            pass
        else:
            print("new item")
            #print("here is item",item)
            self.db[self.collection_name].insert_one(dict(item))
            logging.debug("Post added to MongoDB")
            return item