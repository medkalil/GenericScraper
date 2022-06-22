from ast import Return
#from crypt import methods
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
from flask import Flask, render_template, redirect, url_for, session
#from flask_ngrok import run_with_ngrok
import pandas as pd
import re
import numpy as np

app = Flask(__name__)
app.secret_key = 'session_key'

api = Api(app)
scrapyd = ScrapydAPI('http://localhost:6800')
PROJECT_NAME ="genericscrapy"

client = MongoClient('mongodb+srv://posts:posts@cluster0.lkclz.mongodb.net/')
#db = client['mydb']
print(client.list_database_names())
db = client['mydb']

########################################### testing for the demo with flask : BEGIN ###############################

@app.route('/')
def home():
  #get data from Mongo :
  # 1/ collection -> document -> store it in var
  # 2/ display the data in a table form 
  # 3/ search functionality  
  print("col list",db.list_collection_names())
  list_project = db.list_collection_names()
  my_data = dict()
  data_len= dict()

  for col_name in list_project:
      print("col_name",col_name)
      #print("x",list(db[col_name].find({}).limit(5)))
      res = list(db[col_name].find({},{"_id":0,"configuration":0}).limit(5))
      data_len_temp = len(list(db[col_name].find({},{"_id":0,"configuration":0})))
      if col_name not in my_data.keys():
         my_data[col_name] = res
         data_len[col_name] = data_len_temp
  print("mydict is ",my_data)

  #print("hehe",list(db.table_collection.find({}).limit(5)))
  return render_template('index.html',my_data = my_data, data_len = data_len)

@app.route('/run_search', methods = ['GET', 'POST'])
def search():
  search_query = request.form['search_query']
  print("search_query",search_query)
  list_project = db.list_collection_names()
  my_data = dict()
  data_len= dict()

  for col_name in list_project:
      print("search col",col_name)
      data_len_temp = len(list(db[col_name].find({},{"_id":0,"configuration":0})))

      #searching by title col
      first_item = list(db[col_name].find({},{"_id":0,"configuration":0}))[1]
      title = find_title_filed(first_item)
      res = list(db[col_name].find({title : { "$regex" : search_query.strip() }},{"_id":0,"configuration":0}).limit(5))
      # mapping data to the col name
      if col_name not in my_data.keys():
         my_data[col_name] = res
         data_len[col_name] = data_len_temp
  return render_template('index.html',my_data = my_data ,data_len = data_len )


@app.route("/scrape")
def scrape():
    return render_template("index.html", page="scrape.html")

@app.route("/list_scraper")
def list_scraper():
    spiders_status = scrapyd.list_jobs(PROJECT_NAME)
    print(spiders_status)
    return render_template("index.html", page="list_scraper.html",spiders_status = spiders_status)

@app.route("/contact")
def contact():
    return render_template("index.html", page="contact.html")

@app.route("/about")
def about():
    return render_template("index.html", page="about.html")

@app.route("/account")
def account():
    return render_template("index.html", page="account.html")



#test form
@app.route("/run_table" , methods = ['GET', 'POST'])
def run_table():
    spider_name = request.form['Spider_Name']
    urls = request.form['urls']
    table_match = request.form['table_match']
    print(urls,spider_name,table_match)
    scrapyd.schedule(PROJECT_NAME, 'table', start_urls_list=urls , table_match=table_match, collection_name=spider_name)
    return redirect(url_for('scrape'))
    

@app.route("/run_cardscrape" , methods = ['GET', 'POST'])
def run_cardscrape():
    spider_name = request.form['Spider_Name']
    urls = request.form['urls']
    config=request.form['config']
    card_css_selector=request.form['card_css_selector']
    print("spidername",spider_name)
    print("urls",urls)
    print("config",config)
    print("card_css_selector",card_css_selector)
    scrapyd.schedule(PROJECT_NAME, 'scraper', config=config, start_urls_list=urls, card_css_selector=card_css_selector,collection_name=spider_name)
    
    #pass data between views with session
    """ spiders_status = scrapyd.list_jobs(PROJECT_NAME)
    session['spiders_status'] = spiders_status
    if session.get('spiders_status', None):
        spiders_status = session.get('spiders_status', None)
        print("from here:",spiders_status) """

    return redirect(url_for('scrape'))

@app.route('/run_table_crawl', methods = ['GET', 'POST'])
def run_table_crawl():
  spider_name = request.form['Spider_Name']
  root = request.form['root']
  table_match = request.form['table_match']
  url_list=  []

  # Link Extractor
  scrapyd.schedule(PROJECT_NAME, 'url-extractor', depth=0 , root = root)

  #Message Queue
  consumer = KafkaConsumer(
    'numtest',
     bootstrap_servers=['localhost:9092'],
     auto_offset_reset='earliest',
     enable_auto_commit=True,
     group_id='my-group',
     consumer_timeout_ms=10000,
     value_deserializer=lambda x: loads(x.decode('utf-8')))

  #reading from Queue  
  print("before loop")
  for message in consumer:
      print("inside the for")
      #message = message.value
      message = message.value['link']
      url_list.append(message)
      print("the msg is :",message)

  #mapping through the urls and adding it to the scraper   
  url_list = "".join([str(elem)+"," for elem in url_list])
  scrapyd.schedule(PROJECT_NAME, 'table', start_urls_list=url_list , table_match = table_match , collection_name = spider_name)
  url_list=""

  return redirect(url_for('scrape'))


@app.route('/run_crad_crawl', methods = ['GET', 'POST'])
def run_crad_crawl():
    spider_name = request.form['Spider_Name']
    root = request.form['root']
    config = request.form['config']
    card_css_selector = request.form['card_css_selector']
    url_list=  []

    scrapyd.schedule(PROJECT_NAME, 'url-extractor', depth=0 , root = root)
    
      #Message Queue
    consumer = KafkaConsumer(
    'numtest',
     bootstrap_servers=['localhost:9092'],
     auto_offset_reset='earliest',
     enable_auto_commit=True,
     group_id='my-group',
     consumer_timeout_ms=10000,
     value_deserializer=lambda x: loads(x.decode('utf-8')))

  #reading from Queue  
    print("before loop")
    for message in consumer:
      print("inside the for")
      #message = message.value
      message = message.value['link']
      url_list.append(message)
      print("the msg is :",message)
    
    #mapping through the urls and adding it to the scraper
    url_list = "".join([str(elem)+"," for elem in url_list])
    #url_list = ''.join(('https://www.amazon.com/b?node=16225016011&pf_rd_r=N5TD9AJ5M2MFZYTD40G8&pf_rd_p=e5b0c85f-569c-4c90-a58f-0c0a260e45a0&pd_rd_r=c1e8591e-f091-4da5-8604-4635be6844be&pd_rd_w=bM1cA&pd_rd_wg=jgaTh&ref_=pd_gw_unk,',url_list))
    print("is urlslist",url_list)
    scrapyd.schedule(PROJECT_NAME, 'scraper', config = config, start_urls_list = url_list , card_css_selector=card_css_selector ,collection_name = spider_name)
    url_list=""

    return redirect(url_for('scrape'))

########################################### testing for the demo with flask : END ###############################


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
  scrapyd.schedule('genericscrapy', 'url-extractor', depth=0 , root="https://www.amazon.com/b?node=16225016011&pf_rd_r=N5TD9AJ5M2MFZYTD40G8&pf_rd_p=e5b0c85f-569c-4c90-a58f-0c0a260e45a0&pd_rd_r=c1e8591e-f091-4da5-8604-4635be6844be&pd_rd_w=bM1cA&pd_rd_wg=jgaTh&ref_=pd_gw_unk")
  #scrapyd.schedule('genericscrapy', 'url-extractor', depth=0 , root="https://centraledesmarches.com/")
  #scrapyd.schedule('genericscrapy', 'url-extractor', depth=0 , root="https://www.appeloffres.com/")
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
  print("the len:",len(url_list))
  print(type(url_list[0]))
  url_list = " ".join([str(elem)+"," for elem in url_list])
  url_list = ''.join(('https://www.amazon.com/b?node=16225016011&pf_rd_r=N5TD9AJ5M2MFZYTD40G8&pf_rd_p=e5b0c85f-569c-4c90-a58f-0c0a260e45a0&pd_rd_r=c1e8591e-f091-4da5-8604-4635be6844be&pd_rd_w=bM1cA&pd_rd_wg=jgaTh&ref_=pd_gw_unk,',url_list))
  #print("hayy",url_list)
  scrapyd.schedule('genericscrapy', 'scraper', config="{'title':'.a-size-base-plus::text'}" , start_urls_list = url_list , card_css_selector="._octopus-search-result-card_style_apbSearchResultItem__2-mx4",collection_name="abay_card")
  url_list=""

  #scrapy crawl scraper -a page=https://quotes.toscrape.com/js/ -a config="{'Nom':'.text::text'}" -a mandatory='Nom'
  #test : quotes.toscrape
  """ url_list = " ".join([str(elem)+",{}".format("https://quotes.toscrape.com/js/") for elem in url_list])
  scrapyd.schedule('genericscrapy', 'scraper', config="{'Nom':'.text::text'}", start_urls_list = url_list, card_css_selector=".quote")
  url_list="" """
  
  #test table scrapers
  #change table scraper to accepting list of urls like CardScraper
  """ url_list = "".join([str(elem)+"," for elem in url_list])
  scrapyd.schedule(PROJECT_NAME, 'table', start_urls_list=url_list , table_match="Description sommaire de l'appel d'offres", collection_name = "abay")
  url_list="" """

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


def contains_url(s):
    return re.search("(?P<url>https?://[^\s]+)|www", s)
#print(contains_url("https://www.google"))

# item must not containing list/dict -> just key:value
# wel give it item[1] to bypass item[0]:configuration
def find_title_filed(item):
    #bypass url links
    for res in list(item):
        if contains_url(item[res]):
            print("item del",item[res])
            del item[res]
    #len(k[0]) : 0 -> lengest key
    #len(k[1]) : 1 -> lengest value
    return max(item.items(), key = lambda k :len(k[1]))[0]


if __name__ == "__main__":
  app.run(debug=True , threaded=True)