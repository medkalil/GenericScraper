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
    #collection_name = 'card_collection'
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
        collection_name = spider.collection_name
        start_urls_list = spider.start_urls_list
        config = spider.config
        card_css_selector = spider.card_css_selector
        print("spider name here",spider.name)
        # add configuration
        configuration = {"configuration":{"start_urls_list":start_urls_list,"type":"card_scraper","config":config,"collection_name":collection_name,"card_css_selector":card_css_selector}}
        if configuration not in list(self.db[collection_name].find(configuration,{"_id":0})) :
            self.db[collection_name].insert_one(configuration)
            print("configuration saved")
        else:
            print("configuration exist")

        print("from cardpipe for coll_name",collection_name)
        print("list_collection_names",self.db.list_collection_names())
        if collection_name in self.db.list_collection_names():
            print("yes is in")
        else :
            print("isn't")

        if len(list(self.db[collection_name].find({}))) == 0 :
            self.db[collection_name].insert_one(dict(item))
        #   not vide
        elif item in list(self.db[collection_name].find(item,{"_id":0})) :
            print("item exists")
            pass
        else:
            print("new item")
            #print("here is item",item)
            self.db[collection_name].insert_one(dict(item))
            logging.debug("Post added to MongoDB")
            return item




class TableScraperPipeline:
    #collection_name = 'table_collection'
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
        collection_name = spider.collection_name
        start_urls_list = spider.start_urls_list
        table_match = spider.table_match
        # add configuration
        configuration = {"configuration":{"start_urls_list":start_urls_list,"type":"table_scraper","table_match":table_match,"collection_name":collection_name}}
        if configuration not in list(self.db[collection_name].find(configuration,{"_id":0})) :
            self.db[collection_name].insert_one(configuration)
            print("configuration saved")
        else:
            print("configuration exist")

        print("from cardpipe for coll_name",collection_name)
        print("list_collection_names",self.db.list_collection_names())
        if collection_name in self.db.list_collection_names():
            print("yes is in")
        else :
            print("isn't")
        
        if len(list(self.db[collection_name].find({}))) == 0 :
            self.db[collection_name].insert_one(dict(item))
        #   not vide
        elif item in list(self.db[collection_name].find(item,{"_id":0})) :
            print("item exists")
            pass
        else:
            print("new item")
            #print("here is item",item)
            self.db[collection_name].insert_one(dict(item))
            logging.debug("Post added to MongoDB")
            return item