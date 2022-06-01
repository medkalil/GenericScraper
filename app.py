from ast import Return
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
from kafka import KafkaConsumer
from json import loads
from scrapyd_api import ScrapydAPI
import pymongo
from pymongo import MongoClient
from flask import jsonify

app = Flask(__name__)
api = Api(app)
scrapyd = ScrapydAPI('http://localhost:6800')
PROJECT_NAME ="genericscrapy"

client = MongoClient('mongodb+srv://posts:posts@cluster0.lkclz.mongodb.net/')
#db = client['mydb']
print(client.list_database_names())
db = client['mydb']


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
  scrapyd.schedule('genericscrapy', 'scraper', config="{'title':'.a-size-base-plus::text'}" , start_urls_list = url_list , card_css_selector="._octopus-search-result-card_style_apbSearchResultItem__2-mx4")
  url_list="" """

  #scrapy crawl scraper -a page=https://quotes.toscrape.com/js/ -a config="{'Nom':'.text::text'}" -a mandatory='Nom'
  #test : quotes.toscrape
  """ url_list = " ".join([str(elem)+",{}".format("https://quotes.toscrape.com/js/") for elem in url_list])
  scrapyd.schedule('genericscrapy', 'scraper', config="{'Nom':'.text::text'}", start_urls_list = url_list, card_css_selector=".quote")
  url_list="" """
  
  #test table scrapers
  #change table scraper to accepting list of urls like CardScraper
  url_list = "".join([str(elem)+"," for elem in url_list])
  scrapyd.schedule(PROJECT_NAME, 'table', start_urls_list=url_list , table_match="Description sommaire de l'appel d'offres")
  url_list=""

  return "xx"


# run only CardScraper route
@app.route('/run_cardscraper', methods=['POST','GET'])
def run_cardscraper():
  url=request.args.get('url')
  config=request.args.get('config')
  card_css_selector=request.args.get('card_css_selector')
  collection_name = request.args.get('collection_name')
  return scrapyd.schedule(PROJECT_NAME, 'scraper', config=config, start_urls_list=url, card_css_selector=card_css_selector,collection_name=collection_name)
  # return scrapyd.schedule(PROJECT_NAME, 'scraper', config="{'Nom':'.text::text'}", start_urls_list=url, card_css_selector=".quote")

# run only TableScraper route
@app.route('/run_tablescraper', methods=['POST','GET'])
def run_tablescraper():
  url=request.args.get('url')
  table_match=request.args.get('table_match')
  collection_name = request.args.get('collection_name')
  #return scrapyd.schedule(PROJECT_NAME, 'table', start_urls_list=url , table_match=table_match)
  return scrapyd.schedule(PROJECT_NAME, 'table', start_urls_list=url , table_match=table_match, collection_name=collection_name)

#list_jobs
@app.route('/list_jobs',methods=['GET'])
def list_jobs():
  return scrapyd.list_jobs(PROJECT_NAME) 

#Cancel a scheduled job:
#source (get id) : https://blog.miguelgrinberg.com/post/designing-a-restful-api-with-python-and-flask
@app.route('/cancel_job_with_id/<int:task_id>',methods=['POST'])
def cancel_job_with_id(task_id):
  return scrapyd.cancel(PROJECT_NAME, task_id)

#Request status of a job:
@app.route('/job_status/<int:task_id>',methods=['GET'])
def job_status(task_id):
  return scrapyd.job_status(PROJECT_NAME,task_id )
# spider status
#exp: {u'finished': 0, u'running': 0, u'pending': 0, u'node_name': u'ScrapyMachine'}
@app.route('/spiders_status',methods=['GET'])
def spiders_status():
  return scrapyd.daemon_status()

#List all spiders available to a given project:
@app.route('/list_spiders',methods=['GET'])
def list_spiders():
  list_spiders = scrapyd.list_spiders(PROJECT_NAME)
  return jsonify(list_spiders)


if __name__ == "__main__":
  app.run(debug=True , threaded=True)