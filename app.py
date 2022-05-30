from logging import root
from os import urandom
from flask import Flask
from flask_restful import Resource, Api, reqparse
from flask import request
import json
import subprocess

import queue
from time import sleep
from unicodedata import numeric
from flask import Flask
from flask_restful import Resource, Api, reqparse
from flask import request
import json
import subprocess
import requests
from twisted.internet import reactor
from kafka import KafkaProducer, KafkaClient , KafkaConsumer
from threading import Thread

#   kafka
from kafka import KafkaConsumer
from json import loads
from scrapyd_api import ScrapydAPI


app = Flask(__name__)
api = Api(app)
scrapyd = ScrapydAPI('http://localhost:6800')

import pymongo
from pymongo import MongoClient


client = MongoClient('mongodb+srv://posts:posts@cluster0.lkclz.mongodb.net/')
#db = client['mydb']
print(client.list_database_names())
db = client['mydb']

STUDENTS = {
  '1': {'name': 'Mark', 'age': 23, 'spec': 'math'},
  '2': {'name': 'Jane', 'age': 20, 'spec': 'biology'},
  '3': {'name': 'Peter', 'age': 21, 'spec': 'history'},
  '4': {'name': 'Kate', 'age': 22, 'spec': 'science'},
}

@app.route('/')
def hello():
    return "hello"

@app.route('/students')
def getStudent():
  #scrapyd.delete_project('genericscrapy')
  return STUDENTS

# run scraper route
@app.route('/test', methods=['POST'])
def test():
  configuration = {"configuration":{"root":"https://www.amazon.com/b?node=16225016011&pf_rd_r=N5TD9AJ5M2MFZYTD40G8&pf_rd_p=e5b0c85f-569c-4c90-a58f-0c0a260e45a0&pd_rd_r=c1e8591e-f091-4da5-8604-4635be6844be&pd_rd_w=bM1cA&pd_rd_wg=jgaTh&ref_=pd_gw_unk","Name":"My 1 Scraper","config":"test"}}
  #if db.card_collection.find_one({'data':{'$exists':False,'$ne': False }}) is None:
  if configuration not in list(db.card_collection.find(configuration,{"_id":0})):
    print("in in")
    db.card_collection.insert_one(configuration)
    #db.card_collection.update_one({},{'$set':{'data':[]}})

  """ data = {'data':[]}
  if data not in list(db.card_collection.find(data,{"_id":0})) :
    db.card_collection.insert_one(data) """
  #scrapyd.schedule('genericscrapy', 'scraper', config="{'title':'.a-size-base-plus::text'}" , mandatory='title' , page="https://www.amazon.com/b?node=16225016011&pf_rd_r=N5TD9AJ5M2MFZYTD40G8&pf_rd_p=e5b0c85f-569c-4c90-a58f-0c0a260e45a0&pd_rd_r=c1e8591e-f091-4da5-8604-4635be6844be&pd_rd_w=bM1cA&pd_rd_wg=jgaTh&ref_=pd_gw_unk")
  return "test"
#scrapyd.schedule('genericscrapy', 'scraper', config="{'title':'.a-size-base-plus::text'}" , mandatory='title' , page="https://www.amazon.com/b?node=16225016011&pf_rd_r=N5TD9AJ5M2MFZYTD40G8&pf_rd_p=e5b0c85f-569c-4c90-a58f-0c0a260e45a0&pd_rd_r=c1e8591e-f091-4da5-8604-4635be6844be&pd_rd_w=bM1cA&pd_rd_wg=jgaTh&ref_=pd_gw_unk")

# run scraper route
@app.route('/run', methods=['POST'])
def run():
  url_list=  []
  """ configuration = {"configuration":{"root":"https://www.amazon.com/b?node=16225016011&pf_rd_r=N5TD9AJ5M2MFZYTD40G8&pf_rd_p=e5b0c85f-569c-4c90-a58f-0c0a260e45a0&pd_rd_r=c1e8591e-f091-4da5-8604-4635be6844be&pd_rd_w=bM1cA&pd_rd_wg=jgaTh&ref_=pd_gw_unk","Name":"My 1 Scraper","config":"test"}}
  if configuration not in list(db.card_collection.find(configuration,{"_id":0})) :
    db.card_collection.insert_one(configuration)
  else:
    print("configuration exist")
  
  scrapyd.schedule('genericscrapy', 'url-extractor', depth=0 , root="https://www.amazon.com/b?node=16225016011&pf_rd_r=N5TD9AJ5M2MFZYTD40G8&pf_rd_p=e5b0c85f-569c-4c90-a58f-0c0a260e45a0&pd_rd_r=c1e8591e-f091-4da5-8604-4635be6844be&pd_rd_w=bM1cA&pd_rd_wg=jgaTh&ref_=pd_gw_unk") """
  #scrapy crawl scraper -a page=https://quotes.toscrape.com/js/ -a config="{'Nom':'.text::text'}" -a mandatory='Nom'
  #scrapyd.schedule('genericscrapy', 'url-extractor', depth=0 , root="https://quotes.toscrape.com/js/")
  #scrapyd.schedule('genericscrapy', 'url-extractor', depth=0 , root="https://www.amazon.com/b?node=16225016011&pf_rd_r=N5TD9AJ5M2MFZYTD40G8&pf_rd_p=e5b0c85f-569c-4c90-a58f-0c0a260e45a0&pd_rd_r=c1e8591e-f091-4da5-8604-4635be6844be&pd_rd_w=bM1cA&pd_rd_wg=jgaTh&ref_=pd_gw_unk")
  #scrapyd.schedule('genericscrapy', 'url-extractor', depth=0 , root="https://centraledesmarches.com/")
  scrapyd.schedule('genericscrapy', 'url-extractor', depth=0 , root="https://www.appeloffres.com/")
  # peut avoir des erreur si temps d'attende depasse le : 'consumer_timeout_ms=5000'
  consumer = KafkaConsumer(
    'numtest',
     bootstrap_servers=['localhost:9092'],
     auto_offset_reset='earliest',
     enable_auto_commit=True,
     group_id='my-group',
     consumer_timeout_ms=10000,
     value_deserializer=lambda x: loads(x.decode('utf-8')))
    
  print("before loop")
  for message in consumer:
      print("inside the for")
      #message = message.value
      message = message.value['link']
      url_list.append(message)
      #print("Offset:", message.offset)
      #     scrapyd.schedule('genericscrapy', 'table', page=message)
      #scrapyd.schedule('genericscrapy', 'scraper', config="{'title':'.a-size-base-plus::text'}" , mandatory='title' , page=message)
      print("the msg is :",message)
      #print("the link is:",message['link'])
  #consumer.close()
  """ print("the len:",len(url_list))
  print(type(url_list[0]))
  url_list = " ".join([str(elem)+"," for elem in url_list])
  url_list = ''.join(('https://www.amazon.com/b?node=16225016011&pf_rd_r=N5TD9AJ5M2MFZYTD40G8&pf_rd_p=e5b0c85f-569c-4c90-a58f-0c0a260e45a0&pd_rd_r=c1e8591e-f091-4da5-8604-4635be6844be&pd_rd_w=bM1cA&pd_rd_wg=jgaTh&ref_=pd_gw_unk,',url_list))
  #print("hayy",url_list)
  scrapyd.schedule('genericscrapy', 'scraper', config="{'title':'.a-size-base-plus::text'}" , mandatory='title' , start_urls_list = url_list)
  url_list="" """

  #scrapy crawl scraper -a page=https://quotes.toscrape.com/js/ -a config="{'Nom':'.text::text'}" -a mandatory='Nom'
  #test : quotes.toscrape
  """ url_list = " ".join([str(elem)+",{}".format("https://quotes.toscrape.com/js/") for elem in url_list])
  scrapyd.schedule('genericscrapy', 'scraper', config="{'Nom':'.text::text'}" , mandatory='Nom' , start_urls_list = url_list)
  url_list="" """
  
  #test table scrapers
  #change table scraper to accepting list of urls like CardScraper
  url_list = "".join([str(elem)+"," for elem in url_list])
  scrapyd.schedule('genericscrapy', 'table', start_urls_list=url_list)
  url_list=""

  return "xx"

if __name__ == "__main__":
  app.run(debug=True , threaded=True)