import scrapy
import pandas as pd
import json
from collections import namedtuple
from json import JSONEncoder

class QuotesSpider(scrapy.Spider):
    name = "table"
    custom_settings = {'ITEM_PIPELINES': {'genericscrapy.pipelines.TableScraperPipeline':3}}

    def __init__(self, page=None, config=None, mandatory="" ,  *args, **kwargs):
        self.page =page
        super(QuotesSpider, self).__init__(*args, **kwargs)

    def start_requests(self):
        """ urls = [
            'https://quotes.toscrape.com/js/page/1/',
        ]
        for url in urls: """
        yield scrapy.Request(url=self.page, callback=self.parse)

    def parse(self, response):
        df = pd.read_html(self.page,match="Description sommaire de l'appel d'offres")
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