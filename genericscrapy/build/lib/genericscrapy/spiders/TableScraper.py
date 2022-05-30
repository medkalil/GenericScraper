import scrapy
import pandas as pd
import json
from collections import namedtuple
from json import JSONEncoder

class QuotesSpider(scrapy.Spider):
    name = "table"
    custom_settings = {'ITEM_PIPELINES': {'genericscrapy.pipelines.TableScraperPipeline':3}}

    def __init__(self, start_urls_list, config=None, mandatory="" ,  *args, **kwargs):
        super(QuotesSpider, self).__init__(*args, **kwargs)
        self.start_urls_list = start_urls_list.split(',')
        self.start_urls = self.start_urls_list

    def start_requests(self):
        for url in self.start_urls:
            yield scrapy.Request(url=url, callback=self.parse,dont_filter = True)

    def parse(self, response):
        print("isis:",response.request.url)
        df = pd.read_html(response.request.url,match="Description sommaire de l'appel d'offres")
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
            yield parsed[x]
        
        #parsed = json.dumps(parsed,ensure_ascii=False)  

    
        #   get the list of the columns names
        #for x in df[0]:
        #    print(x)

# scrapy crawl table -a page="https://www.appeloffres.com/appels-offres/telecom"
# scrapy crawl table -a start_urls_list="https://www.appeloffres.com/appels-offres/telecom,https://www.appeloffres.com/appels-offres/electricite"