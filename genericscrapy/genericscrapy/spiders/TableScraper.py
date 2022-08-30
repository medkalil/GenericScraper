from base64 import decode
import scrapy
import pandas as pd
import json
from collections import namedtuple
from json import JSONEncoder
from inline_requests import inline_requests

class QuotesSpider(scrapy.Spider):
    name = "table"
    custom_settings = {'ITEM_PIPELINES': {'genericscrapy.pipelines.TableScraperPipeline':3}}

    def __init__(self, collection_name , start_urls_list, table_match="" ,  *args, **kwargs):
        super(QuotesSpider, self).__init__(*args, **kwargs)
        self.start_urls_list = start_urls_list.split(',')
        self.start_urls = self.start_urls_list
        #self.table_match = table_match
        self.collection_name = collection_name

        self.table_match = table_match.split(",")

    def start_requests(self):
        for url in self.start_urls:
            try:
                yield scrapy.Request(url=url, callback=self.parse,dont_filter = True)
            except:
                continue
    @inline_requests
    def parse(self, response):
        for mot_cle in self.table_match:
            try:
                print("isis:",response.request.url)
                #df = pd.read_html(response.request.url,match="Description sommaire de l'appel d'offres")
                #df = pd.read_html(response.request.url,match=self.table_match)
                df = pd.read_html(response.url,match=mot_cle)
                df = df[0]
                df = df[df.columns.drop(list(df.filter(regex='Unnamed')))]
                result = df.to_json(orient="records")
                parsed = json.loads(result)
                #parsed = json.dumps(parsed,ensure_ascii=False)
                #get the fields names
                for x in df:
                    print(x)
                    print(df[x])

                for x in range(len(parsed)):
                    print(type(parsed[x]))
                    #res = parsed[x].update( {'url' : self.page} )
                    # return only the item that have mot_cle 
                    if self.check_mot_cle_in_item(parsed[x],mot_cle): 
                        parsed[x]["url"] = response.url
                        yield parsed[x]
            except:
                continue
            #parsed = json.dumps(parsed,ensure_ascii=False)  

    
        #   get the list of the columns names
        #for x in df[0]:
        #    print(x)

    @staticmethod            
    def check_mot_cle_in_item(item,mor_cle):
        for x in item.values():
            if mor_cle in x.lower():
                return True
        return False


#scrapy crawl table -a table_match="Description sommaire de l'appel d'offres" -a start_urls_list="https://www.appeloffres.com/appels-offres/telecom" -a collection_name="titi"

# scrapy crawl table -a page="https://www.appeloffres.com/appels-offres/telecom"
# new cmd: scrapy crawl table -a table_match="Description sommaire de l'appel d'offres" -a start_urls_list="https://www.appeloffres.com/appels-offres/telecom,https://www.appeloffres.com/appels-offres/electricite"
# scrapy crawl table -a table_match="Description sommaire de l'appel d'offres" -a start_urls_list="https://www.appeloffres.com/appels-offres/telecom,https://www.appeloffres.com/appels-offres/electricite" -a collection_name="table_collection"


