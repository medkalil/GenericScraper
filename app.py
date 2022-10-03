from ast import Return
from fileinput import close
#from crypt import methods
from logging import root
from os import urandom
from pickletools import int4
from turtle import title
from flask import Flask
from flask_restful import Resource, Api, reqparse
from flask import request
import json
import subprocess

import queue
from time import sleep, time
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
from urllib.parse import urlparse
from kafka import TopicPartition
import gc
from flask import session
from flask import jsonify
from flask_cors import CORS
import bson.json_util 
import copy
import ast
from typing import Iterable 
import json5
import flask
from urllib.request import urljoin
from bs4 import BeautifulSoup
import requests
from urllib.request import urlparse
import re
import time

from models.shema_detect import Shema_detect_class
import traceback



app = Flask(__name__)
app.secret_key = 'session_key'
CORS(app)

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
     consumer_timeout_ms=20000,
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
@app.route('/job_status',methods=['GET'])
def job_status():
  task_id=request.args.get('task_id')
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

##################################### Routes for Production #################################################
@app.route('/run_crawl_test', methods=['GET','POST'])
def run_crawl_test():
    data = {"site":"https://centraledesmarches.com/regions/provence-alpes-cote-d-azur"} 
    res = requests.get('http://localhost:3000/cll',json=data)  
    #res = requests.post('http://localhost:3000/crawl')  
    print("res :",res.json())
    r = res.json()
    return r

@app.route('/flask_to_node', methods=['GET'])
def flask_to_node():
    res = requests.get('http://localhost:3000/cll')
    print("res :",res.json())
    r = res.json()
    result = r['result'] 
    print("resultat :", result)
    return result

""" @app.route('/run_linkextractor', methods=['POST','GET'])
async def run_linkextractor():
  url_list = []
  ulr_for_scraping = []
  page_type = ""
  consumer_closing = False

  root=request.args.get('root')
  depth=int(request.args.get('depth'))
  allow_domains = request.args.get('allow_domains')
  list_mot_cle = request.args.get('list_mot_cle')
  partition = int(request.args.get('partition'))

  #1 run LinkExtractor
  link_extrator_process_id = scrapyd.schedule(PROJECT_NAME, 'url-extractor' ,allowed_domains = get_domain_from_url(root) ,root = root ,depth=depth,list_mot_cle=list_mot_cle, partition=partition )
  #Message Queue
  consumer = KafkaConsumer(
    #"numtest",
     bootstrap_servers=['localhost:9092'],
     #earliest->latest
     auto_offset_reset='latest',
     enable_auto_commit=True,
     #group_id='my-group',
     # 2 min for timing out (1s=1000)
     consumer_timeout_ms=180000,
     value_deserializer=lambda x: loads(x.decode('utf-8')))
 
  consumer.assign([TopicPartition('numtest', partition)])

  #list_mot_cle = list_mot_cle.split(",")
  #reading from Queue  
  print("before loop")
  for message in consumer:
      #checking for closing spider 
      if message.value == "end_mark":
        consumer_closing = True
        consumer.close()
        print("before closing") 
        break

      collection_list = db.list_collection_names()
      print("inside the for")
      message = message.value['link']
      url_list.append(message)
      ulr_for_scraping.append(message)
      
      print("the msg from "+ str(partition) +" is :",message)

      #closing consumer after the UrlExtractor finishes  
      #if get_scraper_status(link_extrator_process_id) == "finished":
      #  print("4ariba ends")
      #  consumer.close()
      #  break 
     
      #1/Schema detection
      if (len(url_list) == 10 and root not in collection_list):
        data = {"url_list":url_list,"list_mot_cle":list_mot_cle.split(",")}
        headers = requests.utils.default_headers()
        #headers.update({'User-Agent': 'My User Agent 1.0',})
        #res = await requests.post('http://localhost:3000/schema_detect',headers={"User-Agent" :"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36"},json=data) 
        res = await call_shema_detect("http://localhost:3000/schema_detect",data)
        url_list = [] 
        print("RETERNED RES IS:",res.json())
        print("and RETERNED RES IS:",res.json()["result"])
        #if (res.json()["result"] is dict):
        if isinstance(res.json()["result"],dict):
          print("collection is created")
          page_type = res.json()["result"]
          db.create_collection(root)
        elif res.json()["result"] == "Table":
          print("collection is created")
          page_type = "table"
          db.create_collection(root)
          
      #2/Scraping
      elif (len(ulr_for_scraping) >= 10 and root in collection_list):
        print("*************************** root is IN already ***************************************")
        if len(ulr_for_scraping) >= 10:
          urls = ulr_for_scraping[:10]
          ulr_for_scraping = ulr_for_scraping[10:]
          print("the len of urls is:",len(urls))
          if page_type == "table":
            print("runnign TABLE CRAPER")
            urls = "".join([str(elem)+"," for elem in urls])
            print("nomBER OF URLS:",len(urls))
            #was :table_match=list_mot_cle[0] -> table_match=list_mot_cle (bc scraper now can take more than 1 mot cle)  
            # RQ : for card Scraper too
            scrapyd.schedule(PROJECT_NAME, 'table', start_urls_list=urls , table_match=list_mot_cle, collection_name=root)
          elif isinstance(page_type,dict):
            print("runnign CARD SCRAPER")
            urls = "".join([str(elem)+"," for elem in urls])
            #scrapyd.schedule(PROJECT_NAME, 'scraper', config="{'title':'a.stretched-link.text-dark::text'}", start_urls_list=urls, card_css_selector="div.card.rounded-1.results-item.mb-3",collection_name=root,mot_cle=list_mot_cle[0])
            #was : mot_cle=list_mot_cle[0] -> mot_cle=list_mot_cle (bc scraper now can take more than 1 mot cle)
            scrapyd.schedule(PROJECT_NAME, 'scraper', config = str(page_type["config"]), start_urls_list=urls, card_css_selector=page_type["card_css_selector"],collection_name=root,mot_cle=list_mot_cle)
            #scrapyd.schedule(PROJECT_NAME, 'scraper', config = "{'item0': 'A.stretched-link.text-dark *::text', 'item1': 'DIV.item-detail-label *::text', 'item2': 'DIV.d-flex.align-items-center *::text', 'item3': 'DIV.item-detail-label *::text', 'item4': 'DIV.text-danger *::text', 'item5': 'DIV.item-detail-subvalue.deadline *::text'}", start_urls_list=urls, card_css_selector="DIV.card.rounded-1.results-item.mb-3", collection_name=root, mot_cle=list_mot_cle[0])

  print("THE LENGTHE IS",len(ulr_for_scraping))
  if len(ulr_for_scraping) > 0:
    print("inside last TT")
    urls = ulr_for_scraping
    if page_type == "table":
      print("*************************** root is IN already & table running***************************************")
      print("runnign TABLE CRAPER")
      urls = "".join([str(elem)+"," for elem in urls])
      print("nomBER OF URLS:",len(urls))
      scrapyd.schedule(PROJECT_NAME, 'table', start_urls_list=urls , table_match=list_mot_cle, collection_name=root)
    elif isinstance(page_type,dict):
      print("runnign CARD SCRAPER")
      urls = "".join([str(elem)+"," for elem in urls])
      scrapyd.schedule(PROJECT_NAME, 'scraper', config = str(page_type["config"]), start_urls_list=urls, card_css_selector=page_type["card_css_selector"],collection_name=root,mot_cle=list_mot_cle)
   

  url_list = []

  return "xx"
"""

#shema_detect with beatuliful soup as LinkExtractor
@app.route('/shema_detect', methods=['POST','GET'])
async def shema_detect():
          #service,materiel,ambassade,test,tunisie, fourniture,acquisitio,activite
          root=request.args.get('root')
          mots_cles = request.args.get('mots_cles').split(",")
          depth=3
          
          if root not in db.list_collection_names():
            res = crawl_root(depth,root,mots_cles=mots_cles)
            if res == "table":
              #table : type,collection_name
              db.create_collection(root)
              configuration = {"configuration":{"type":"table_scraper","collection_name":root}}
              db[root].insert_one(configuration)

            elif isinstance(res,dict):
            #card :type,collection_name,config,card_css_selector
              db.create_collection(root)
              config = res['config']
              card_css_selector = res['card_css_selector']
              configuration = {"configuration":{"type":"card_scraper", "collection_name":root, "config":config,"card_css_selector":card_css_selector}}
              db[root].insert_one(configuration)
          else:
            return jsonify("taost to the user : root existe already in our sys")
          return res

""" @app.route('/shema_detect', methods=['POST','GET'])
async def shema_detect():
  url_list = []
  page_type = ""

  root=request.args.get('root')
  depth=int(request.args.get('depth'))
  allow_domains = request.args.get('allow_domains')
  list_mot_cle = request.args.get('list_mot_cle')
  partition = int(request.args.get('partition'))

  link_extrator_process_id = scrapyd.schedule(PROJECT_NAME, 'url-extractor' ,allowed_domains = get_domain_from_url(root) ,root = root ,depth=depth,list_mot_cle=list_mot_cle, partition=partition )
  #Message Queue
  consumer = KafkaConsumer(
    #"numtest",
     bootstrap_servers=['localhost:9092'],
     #earliest->latest
     auto_offset_reset='latest',
     enable_auto_commit=True,
     #group_id='my-group',
     # 2 min for timing out (1s=1000)
     consumer_timeout_ms=180000,
     value_deserializer=lambda x: loads(x.decode('utf-8')))
 
  consumer.assign([TopicPartition('numtest', partition)])
  #reading from Queue  
  print("before loop")
  for message in consumer:
    collection_list = db.list_collection_names()
    print("inside the for")
    message = message.value['link']
    url_list.append(message)
      
    print("the msg from "+ str(partition) +" is :",message)
      
    if (len(url_list) == 10 ):
      data = {"url_list":url_list,"list_mot_cle":list_mot_cle.split(",")}
      headers = requests.utils.default_headers()
      res = await call_shema_detect("http://localhost:3000/schema_detect",data)
      url_list = [] 
      print("RETERNED RES IS:",res.json())
      print("and RETERNED RES IS:",res.json()["result"])
        
      if isinstance(res.json()["result"],dict):
        print("collection is created")
        db.create_collection(root)
        page_type = res.json()["result"]
        #type,config,card_css_selector,collection_name
        break
      elif res.json()["result"] == "Table":
        print("collection is created")
        db.create_collection(root)
        page_type = "table"
        #type + collection_name
        break
      
  print("the res is:",page_type)

  return "xx" """


@app.route('/run_linkextractor', methods=['POST','GET'])
async def run_linkextractor():
  url_list = []
  ulr_for_scraping = []
  page_type = ""

  root=request.args.get('root')
  depth=int(request.args.get('depth'))
  allow_domains = request.args.get('allow_domains')
  list_mot_cle = request.args.get('list_mot_cle')
  partition = int(request.args.get('partition'))

  #1 run LinkExtractor
  link_extrator_process_id = scrapyd.schedule(PROJECT_NAME, 'url-extractor' ,allowed_domains = get_domain_from_url(root) ,root = root ,depth=depth,list_mot_cle=list_mot_cle, partition=partition )
  #Message Queue
  consumer = KafkaConsumer(
    #"numtest",
     bootstrap_servers=['localhost:9092'],
     #earliest->latest
     auto_offset_reset='latest',
     enable_auto_commit=True,
     #group_id='my-group',
     # 2 min for timing out (1s=1000)
     consumer_timeout_ms=180000,
     value_deserializer=lambda x: loads(x.decode('utf-8')))
 
  consumer.assign([TopicPartition('numtest', partition)])
    

  #list_mot_cle = list_mot_cle.split(",")

  #reading from Queue  
  print("before loop")
  for message in consumer:
      collection_list = db.list_collection_names()
      print("inside the for")
      message = message.value['link']
      url_list.append(message)
      ulr_for_scraping.append(message)
      
      print("the msg from "+ str(partition) +" is :",message)

      #closing consumer after the UrlExtractor finishes  
      """ if get_scraper_status(link_extrator_process_id) == "finished":
          print("4ariba ends")
          consumer.close()
          break """
     
      #1/Schema detection
      if (len(url_list) == 10 and root not in collection_list):
        data = {"url_list":url_list,"list_mot_cle":list_mot_cle.split(",")}
        headers = requests.utils.default_headers()
        #headers.update({'User-Agent': 'My User Agent 1.0',})
        #res = await requests.post('http://localhost:3000/schema_detect',headers={"User-Agent" :"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36"},json=data) 
        res = await call_shema_detect("http://localhost:3000/schema_detect",data)
        url_list = [] 
        print("RETERNED RES IS:",res.json())
        print("and RETERNED RES IS:",res.json()["result"])
        #if (res.json()["result"] is dict):
        if isinstance(res.json()["result"],dict):
          print("collection is created")
          page_type = res.json()["result"]
          db.create_collection(root)
        elif res.json()["result"] == "Table":
          print("collection is created")
          page_type = "table"
          db.create_collection(root)
          
      #2/Scraping
      elif (len(ulr_for_scraping) >= 10 and root in collection_list):
        print("*************************** root is IN already ***************************************")
        if len(ulr_for_scraping) >= 10:
          urls = ulr_for_scraping[:10]
          ulr_for_scraping = ulr_for_scraping[10:]
          print("the len of urls is:",len(urls))
          if page_type == "table":
            print("runnign TABLE CRAPER")
            urls = "".join([str(elem)+"," for elem in urls])
            print("nomBER OF URLS:",len(urls))
            #was :table_match=list_mot_cle[0] -> table_match=list_mot_cle (bc scraper now can take more than 1 mot cle)  
            # RQ : for card Scraper too
            scrapyd.schedule(PROJECT_NAME, 'table', start_urls_list=urls , table_match=list_mot_cle, collection_name=root)
          elif isinstance(page_type,dict):
            print("runnign CARD SCRAPER")
            urls = "".join([str(elem)+"," for elem in urls])
            #scrapyd.schedule(PROJECT_NAME, 'scraper', config="{'title':'a.stretched-link.text-dark::text'}", start_urls_list=urls, card_css_selector="div.card.rounded-1.results-item.mb-3",collection_name=root,mot_cle=list_mot_cle[0])
            #was : mot_cle=list_mot_cle[0] -> mot_cle=list_mot_cle (bc scraper now can take more than 1 mot cle)
            scrapyd.schedule(PROJECT_NAME, 'scraper', config = str(page_type["config"]), start_urls_list=urls, card_css_selector=page_type["card_css_selector"],collection_name=root,mot_cle=list_mot_cle)
            #scrapyd.schedule(PROJECT_NAME, 'scraper', config = "{'item0': 'A.stretched-link.text-dark *::text', 'item1': 'DIV.item-detail-label *::text', 'item2': 'DIV.d-flex.align-items-center *::text', 'item3': 'DIV.item-detail-label *::text', 'item4': 'DIV.text-danger *::text', 'item5': 'DIV.item-detail-subvalue.deadline *::text'}", start_urls_list=urls, card_css_selector="DIV.card.rounded-1.results-item.mb-3", collection_name=root, mot_cle=list_mot_cle[0])

        url_list = []

  return "xx"


@app.route('/run_scraper_for_root_exist', methods=['POST','GET'])
async def run_scraper_for_root_exist():
  #init
  ulr_for_scraping = []
  urls = []
  page_type = ""
  consumer_closing = False
  #get configuration dict from DB
  root=request.args.get('root')
  depth=int(request.args.get('depth'))
  allow_domains = request.args.get('allow_domains')
  list_mot_cle = request.args.get('list_mot_cle')
  partition = int(request.args.get('partition'))

  #if configuration not in list(self.db[collection_name].find(configuration,{"_id":0})) :
  configuration = list(db.get_collection(str(root)).find({"configuration":{"$type" : "object"}},{"_id":0}))
  configuration = configuration[0]["configuration"]
  print("configuration:",configuration)
  if configuration["type"] == "table_scraper":
    page_type = "table"
  elif configuration["type"] == "card_scraper":
    page_type = configuration
  
  #consumer 
  link_extrator_process_id = scrapyd.schedule(PROJECT_NAME, 'url-extractor' ,allowed_domains = get_domain_from_url(root) ,root = root ,depth=depth,list_mot_cle=list_mot_cle, partition=partition )
  #Message Queue
  consumer = KafkaConsumer(
    #"numtest",
     bootstrap_servers=['localhost:9092'],
     #earliest->latest
     auto_offset_reset='latest',
     enable_auto_commit=True,
     #group_id='my-group',
     # 2 min for timing out (1s=1000)
     consumer_timeout_ms=180000,
     value_deserializer=lambda x: loads(x.decode('utf-8')))
  consumer.assign([TopicPartition('numtest', partition)])
    
  #list_mot_cle = list_mot_cle.split(",")
  print("list_mot_cle:",list_mot_cle)
  print("list_mot_cle type:",type(list_mot_cle))
  
  #reading from Queue  
  print("before loop")
  for message in consumer:
      #checking for closing spider 
      if message.value == "end_mark":
        consumer_closing = True
        consumer.close()
        print("before closing") 
        break
      
      print("after closing")
      collection_list = db.list_collection_names()
      print("inside the for")
      message = message.value['link']
      ulr_for_scraping.append(message)
      print("the msg from "+ str(partition) +" is :",message)

      #scraping
      if root in collection_list and len(ulr_for_scraping) >= 10:
        if (consumer_closing == False and len(ulr_for_scraping) >= 10):
          urls = ulr_for_scraping[:10]
          ulr_for_scraping = ulr_for_scraping[10:]
        elif consumer_closing == True:
          urls = ulr_for_scraping

        if page_type == "table":
          print("*************************** root is IN already & table running***************************************")
          print("runnign TABLE CRAPER")
          urls = "".join([str(elem)+"," for elem in urls])
          print("nomBER OF URLS:",len(urls))
          scrapyd.schedule(PROJECT_NAME, 'table', start_urls_list=urls , table_match=list_mot_cle, collection_name=root)
        elif isinstance(page_type,dict):
          print("runnign CARD SCRAPER")
          urls = "".join([str(elem)+"," for elem in urls])
          scrapyd.schedule(PROJECT_NAME, 'scraper', config = str(page_type["config"]), start_urls_list=urls, card_css_selector=page_type["card_css_selector"],collection_name=root,mot_cle=list_mot_cle)
          #scrapyd.schedule(PROJECT_NAME, 'scraper', config = "{'item0': 'A.stretched-link.text-dark *::text', 'item1': 'DIV.item-detail-label *::text', 'item2': 'DIV.d-flex.align-items-center *::text', 'item3': 'DIV.item-detail-label *::text', 'item4': 'DIV.text-danger *::text', 'item5': 'DIV.item-detail-subvalue.deadline *::text'}", start_urls_list=urls, card_css_selector="DIV.card.rounded-1.results-item.mb-3", collection_name=root, mot_cle=list_mot_cle[0])

  print("THE LENGTHE IS",len(ulr_for_scraping))
  if len(ulr_for_scraping) > 0:
    print("inside last TT")
    urls = ulr_for_scraping
    if page_type == "table":
      print("*************************** root is IN already & table running***************************************")
      print("runnign TABLE CRAPER")
      urls = "".join([str(elem)+"," for elem in urls])
      print("nomBER OF URLS:",len(urls))
      scrapyd.schedule(PROJECT_NAME, 'table', start_urls_list=urls , table_match=list_mot_cle, collection_name=root)
    elif isinstance(page_type,dict):
      print("runnign CARD SCRAPER")
      urls = "".join([str(elem)+"," for elem in urls])
      scrapyd.schedule(PROJECT_NAME, 'scraper', config = str(page_type["config"]), start_urls_list=urls, card_css_selector=page_type["card_css_selector"],collection_name=root,mot_cle=list_mot_cle)
   
  ulr_for_scraping = []
  return "xx"

@app.route('/just_consume', methods=['POST','GET'])
async def just_consume():
  consumer = KafkaConsumer(
     #"numtest",
     bootstrap_servers=['localhost:9092'],
     auto_offset_reset='earliest',
     enable_auto_commit=True,
     #group_id='my-group',
     consumer_timeout_ms=180000,
     value_deserializer=lambda x: loads(x.decode('utf-8')))
  consumer.assign([TopicPartition('numtest', 0)])
  
  for message in consumer:
      message = message.value['link']
      print("message:",message)
  return "xx"

@app.route('/get_list_jobs', methods=['POST','GET'])
async def get_list_jobs():
  #scrapyd.list_jobs(PROJECT_NAME)
  res = scrapyd.list_jobs(PROJECT_NAME)
  res.pop("node_name")
  return res

@app.route('/cancel_job', methods=['POST','GET'])
async def cancel_job():
  id = request.args.get("id")
  # Returns the "previous state" of the job before it was cancelled: 'running' or 'pending'or 'running'
  return scrapyd.cancel(PROJECT_NAME, id)

@app.route('/cancel_all_job', methods=['POST','GET'])
async def cancel_all_job():
  jobs = scrapyd.list_jobs(PROJECT_NAME)
  pending = jobs["pending"]
  running = jobs["running"]
  finished = jobs["finished"]

  if len(pending) != 0  :
    for job in pending:
      scrapyd.cancel(PROJECT_NAME, job["id"])

  if len(running) != 0  :
    for job in running:
      scrapyd.cancel(PROJECT_NAME, job["id"])

  if len(finished) != 0  :
    for job in finished:
      scrapyd.cancel(PROJECT_NAME, job["id"])

  return "all job canceled"

@app.route('/get_root_list', methods=['POST','GET'])
async def get_root_list():
  return  jsonify( db.list_collection_names())

# without: id,configuration 
@app.route('/get_root_data', methods=['POST','GET'])
async def get_root_data():
  root = request.args.get('root')
  data = list(db[root].find({},{"_id":0,"configuration":0}).limit(5))
  print("data:",data)
  # [1:] : get rid of the configuration obj
  return jsonify(json.loads(bson.json_util.dumps(data[1:])))

@app.route('/get_mot_cles', methods=['POST','GET'])
async def get_mot_cles():
  root = request.args.get('root')
  res_list = []

  data = list(db[root].find({"configuration":{"$exists":True}},{"_id":0}))
  print("data:",data)
  for i in range(len(data)):
    data[i] = data[i]['configuration']
    if data[i]['type']=="card_scraper":
      res_list.append(data[i]['mot_cle'])
    else:
      res_list.append(data[i]['table_match'])
  res_list = get_url_string_from_list(res_list)
  print("res_list is",res_list)
  return jsonify(res_list)

@app.route('/filter_resulat_by_mot_cle', methods=['POST','GET'])
async def filter_resulat_by_mot_cle():
  root = request.args.get('root')
  mot_cle = request.args.get('mot_cle')
  data = []
  mot_cle = mot_cle.split(',')

  print("the mot cle SI",mot_cle)

  temp = list(db[root].find({},{"_id":0,"configuration":0}))
  for it in temp:
    for mot in mot_cle:
      if check_mot_cle_in_item(it,mot):
        data.append(it)
  print("the data is",data)
  print("data end",data[:2])
  return jsonify(json.loads(bson.json_util.dumps(data)))


@app.route('/delete_collection', methods=['POST','GET'])
async def delete_collection():
  root = request.args.get('root')
  db[root].drop()
  return jsonify("deleted")

@app.route('/update_champ', methods=['POST','GET'])
async def update_champ():
  root = request.args.get('root')
  oldKey =  request.args.get('oldKey')
  newKey =  request.args.get('newKey')

  data = list(db[root].find({"configuration":{"$exists":True}},{"_id":0}))
  data = data[0]['configuration']

  if "config" in data.keys():
    print("in config")
    data = data["config"]
    #data = data.replace(oldKey,newKey)
    db[root].update_one()
    
  #if table or change the hall item key for all the data in that root 
  db[root].update_many( {}, { "$rename": { oldKey: newKey } } )

  return jsonify(data)

@app.route('/delete_champ', methods=['POST','GET'])
async def delete_champ():
  return "deleted"

@app.route('/delete_item', methods=['POST','GET'])
async def delete_item():
  root = request.args.get('root')
  item = json.loads(request.args.get("item"))

  print("item:",item)
  print("item type:",type(item))
  selectedItem = list(db[root].find(item,{"_id":0}))
  print("selectedItem:",selectedItem)
  if selectedItem:
    db[root].delete_one(selectedItem[0])
  return jsonify(selectedItem)


@app.route('/get_search_data', methods=['POST','GET'])
async def get_search_data():
  root = request.args.get("root")
  search_mot = request.args.get("search_mot")
  data =[]
  #db.stores.find( { $text: { $search: "java coffee shop" } } )
  temp = list(db[root].find({},{"_id":0,"configuration":0}))
  for it in temp:
    for mot in search_mot.split(','):
      if check_mot_cle_in_item(it,mot):
        data.append(it)
  print("the mot search",search_mot)
  print("the data is",data)
  print("data end",data[:2])
  
  return jsonify(data[:10])


#####################################END: Routes for Production #################################################



def get_url_string_from_list(li):
  # [['travaux', 'amenagement'], ['materiel', 'amenagement']] -> ['travaux', 'amenagement', 'materiel', 'amenagement']
  return list(flatten(li))

def flatten(items):
    """Yield items from any nested iterable; see Reference."""
    for x in items:
        if isinstance(x, Iterable) and not isinstance(x, (str, bytes)):
            for sub_x in flatten(x):
                yield sub_x
        else:
            yield x


def check_mot_cle_in_item(item,mor_cle):
    for x in item.values():
      if mor_cle in x.lower():
        return True
    return False

def contains_url(s):
    return re.search("(?P<url>https?://[^\s]+)|www", s)
#print(contains_url("https://www.google"))

# item must not containing list/dict -> just key:value
# wel give it item[1] to bypass item[0]:configuration
def find_title_filed(item):
    copy_item = copy.deepcopy(item)
    #bypass url links
    print("from find_title",copy_item)
    for res in list(copy_item):
        if contains_url(item[res]):
            print("copy_item del",copy_item[res])
            del copy_item[res]
    #len(k[0]) : 0 -> lengest key
    #len(k[1]) : 1 -> lengest value
    return max(copy_item.items(), key = lambda k :len(k[1]))[0]


def get_domain_from_url(url):
        domain = urlparse(url).netloc
        return domain

def get_scraper_status(job_id):
  return scrapyd.job_status(PROJECT_NAME,job_id )


async def call_shema_detect(api,data):
      return requests.post(api,headers={"User-Agent" :"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36"},json=data) 

###############"######"for shema detect wth b4 ##########################""#
def has_numbers(inputString):
        return any(char.isdigit() for char in inputString)
 
def url_contains_multiple_digits(url):
        url = str(url)
        res = False    
        if has_numbers(url) and len(max(re.findall(r'\d+', url), key = len)) >= 4:
            res = True
        return res

def level_crawler(input_url):
    links_intern = set()
    links_extern = set()

    temp_urls = set()
    current_url_domain = urlparse(input_url).netloc
  
    # Creates beautiful soup object to extract html tags
    beautiful_soup_object = BeautifulSoup(
        requests.get(input_url).content, "lxml")
  
    # Access all anchor tags from input 
    # url page and divide them into internal
    # and external categories
    for anchor in beautiful_soup_object.findAll("a"):
        href = anchor.attrs.get("href")
        if(href != "" or href != None):
            href = urljoin(input_url, href)
            href_parsed = urlparse(href)
            href = href_parsed.scheme
            href += "://"
            href += href_parsed.netloc
            href += href_parsed.path
            final_parsed_href = urlparse(href)
            is_valid = bool(final_parsed_href.scheme) and bool(
                final_parsed_href.netloc)
            if is_valid:
                if current_url_domain not in href and href not in links_extern and not url_contains_multiple_digits(href):
                    #print("Extern - {}".format(href))
                    links_extern.add(href)
                if current_url_domain in href and href not in links_intern and not url_contains_multiple_digits(href):
                    #print("Intern - {}".format(href))
                    links_intern.add(href)
                    temp_urls.add(href)
    return temp_urls
  
#myList = []
#special_list = []

def crawl_root(depth,input_url,mots_cles):
    myList = []
    special_list = []

    start = time.time()

    res = []
    # Set for storing urls with same domain
    if(depth == 0):
        print("Intern root - {}".format(input_url))
    
    elif(depth == 1):
        level_crawler(input_url)
    
    else:
        # We have used a BFS approach
        # considering the structure as
        # a tree. It uses a queue based
        # approach to traverse
        # links upto a particular depth.
        print("the mot clelist ",mots_cles)
        queue = []
        queue.append(input_url)
        for j in range(depth):
            for count in range(len(queue)):
                url = queue.pop(0)
                if not url_contains_multiple_digits(url):
                    urls = level_crawler(url)
                    for i in urls:
                        if not url_contains_multiple_digits(i) and i not in myList:
                            #print("Intern - {} - with depth - {}".format(i,j))
                            queue.append(i)
                            myList.append(i)
                            #check if one of the mot cle (or) is in the url :
                            if any(mot in i for mot in mots_cles):
                                special_list.append(i)
                                print("FROM SPECIAL LIST",i)

                                ##trying:
                                try:
                                    p = Shema_detect_class(res=[],page_type="",input_url=i,list_mot_cle=['service','materiel','ambassade','test' ,'tunisie', 'fourniture','acquisition','benin' ])
                                    #list of elements that have the mot_cle
                                    p.page_type = p.get_title_class(p.list_mot_cle, p.res, p.soup, p.visible_text)
                                    print("page_type:",p.page_type)

                                    if p.page_type == "table":
                                        print("Saving Schema As Table ")
                                        #break
                                        queue = []
                                        myList = []
                                        special_list = []
                                        return p.page_type
                                    else:
                                        print("############################ it can be a card shema ############################")    
                                        #list distinct (without duplicate ele) of classes that it's ele have the mot cle 
                                        res_list = p.get_class_list(p.res, p.getTagname_className)
                                        print('the res len is',res_list)

                                        #get the exact class + get the card css selector
                                        card_css_selector = p.get_card_css_selector( p.soup, p.page_content, res_list)
                                        print("THE CARD CSS SELECTOR:",card_css_selector)

                                        #print("get_elements_class_in_card_css_selector_for_config :",p.get_elements_class_in_card_css_selector_for_config(p.soup,p.getTagname_className,p.temp_delete_point_from_classes,"fourniture",card_css_selector))
                                        config = p.get_config(p.soup,p.getTagname_className,p.temp_delete_point_from_classes,p.get_elements_class_in_card_css_selector_for_config,card_css_selector)
                                        print("config is:",config)   
                                        if  bool(config):
                                            p.page_type = config
                                            print("we got the shema as card")
                                            #break
                                            queue = []
                                            myList = []
                                            special_list = []
                                            return {"config":p.page_type,"card_css_selector":card_css_selector}

                                except:
                                    print('NEXT PAGE : Cant Detect Shema on This Page') 
                                    traceback.print_exc()
                                    pass
                                ##trying:END
                                
        print("the len is",len(set(queue)))
        print("the len is",len(set(myList)))
        #print("the queue is",queue)
        """ for it in queue:
            for mot in mots_cles:
                if mot in it:
                    res.append(it) """
    
    end = time.time()
    print("THE TIME TAKEN IS",end - start)

    return set(queue)

   
 
###############"######"for shema detect wth b4 ##########################""#


if __name__ == "__main__":
  try:
    app.run(debug=True , threaded=True)
  finally:
    session.clear()


class GetOutOfLoop( Exception ):
    pass