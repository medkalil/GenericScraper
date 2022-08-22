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
import re
import joblib
import copy


def contains_url(s):
    return re.search("(?P<url>https?://[^\s]+)|www", s)
#print(contains_url("https://www.google"))

# item must not containing list/dict -> just key:value
# wel give it item[1] to bypass item[0]:configuration
def find_title_filed(item):
    copy_item = copy.deepcopy(item)
    #bypass url links
    for res in list(copy_item):
        print(res)
        if contains_url(copy_item[res]):
            print("copy_item del",copy_item[res])
            del copy_item[res]
    #len(k[0]) : 0 -> lengest key
    #len(k[1]) : 1 -> lengest value
    return max(copy_item.items(), key = lambda k :len(k[1]))[0]

class LinkExtratorPipeline:
    def __init__(self,producer,topic):
        self.producer = producer
        self.topic = topic
    
    def open_spider(self, spider):
        pass

    def close_spider(self, spider):
        #sending mark to the consumer to close the queue
        partition = int(spider.partition)
        self.producer.send(self.topic,"end_mark",partition=partition) 
        self.producer.close()
        print("################### from close spider #############""")
        pass

    def process_item(self, item, spider):
        mongo_collection = spider.source
        print("this mongo_collection",mongo_collection)
        partition = int(spider.partition)
        print("the partition is:",partition)
        print("here is LinkExtratorPipeline")
        print("item:",item)
        item = dict(item)
        item['spider'] = spider.name
        self.producer.send(self.topic, item,partition=partition)
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
        #configuration = {"configuration":{"start_urls_list":start_urls_list,"type":"card_scraper","config":config,"collection_name":collection_name,"card_css_selector":card_css_selector}}
        configuration = {"configuration":{"type":"card_scraper","config":config,"collection_name":collection_name,"card_css_selector":card_css_selector}}
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

        #adding model
        #print("the title is:",find_title_filed(item))
        title = find_title_filed(item)
        model_ml = joblib.load('model.pkl')
        item['classified_as'] = model_ml.predict([item[title]])[0]

        #saving item in DB
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
        #configuration = {"configuration":{"start_urls_list":start_urls_list,"type":"table_scraper","table_match":table_match,"collection_name":collection_name}}
        configuration = {"configuration":{"type":"table_scraper","table_match":table_match,"collection_name":collection_name}}
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

        #adding model
        #print("the title is:",find_title_filed(item))
        title = find_title_filed(item)
        model_ml = joblib.load('model.pkl')
        item['classified_as'] = model_ml.predict([item[title]])[0]
        
        #saving item in DB
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