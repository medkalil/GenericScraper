
import json
import re
import scrapy
import ast
from scrapy_splash import SplashRequest

class Scraper(scrapy.Spider):
    name = 'scraper'
    custom_settings = {'ITEM_PIPELINES': {'genericscrapy.pipelines.CardScraperPipeline':2}}
    """ custom_settings = {
    'ROBOTSTXT_OBEY': False
    } """
    #USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36'
    #mandatory=None
    def __init__(self, page=None, config=None, mandatory="" ,  *args, **kwargs):
        self.page =page
        #print("+++",type(config))
        self.config = json.loads(json.dumps(config))
        #print(type(self.config))
        self.mandatory_fields = mandatory.split(',')
        super(Scraper, self).__init__(*args, **kwargs)


    """ rules = (
        Rule(LinkExtractor(), callback='start_requests',follow=True),
    ) """


    def start_requests(self):
        self.logger.info('Start url: %s' % self.page)
        yield SplashRequest(url=self.page , callback=self.parse)
        
    def parse(self, response):
        #for amazon : for it in response.css("._octopus-search-result-card_style_apbSearchResultItem__2-mx4"):
        # cart:
        for it in response.css("._octopus-search-result-card_style_apbSearchResultItem__2-mx4"):    
            print("it is here",it)
            item = dict(url=response.url)
            # iterate over all keys in config and extract value for each of thems
            #for it in response.css("_octopus-search-result-card_style_apbSearchResultItem__2-mx4"):
            for key in eval(self.config):
                print("++"+key)
                # extract the data for the key from the html response
                #print("++++++++++"+type(key))
                print("+++"+self.config)
                res = it.css(eval(self.config).get(key)).extract()
                # if the label is any type of url then make sure we have an absolute url instead of a relative one
                if bool(re.search('url', key.lower())):
                    res = self.get_absolute_url(response, res)
                item[key] = ' '.join(elem for elem in res).strip()
                #yield dict(item)

            # ensure that all mandatory fields are present, else discard this scrape
            mandatory_fileds_present = True
            for key in self.mandatory_fields:
                if not item[key]:
                    mandatory_fileds_present = False
            if mandatory_fileds_present:
                yield dict(item)

    @staticmethod
    def get_absolute_url(response, urls):
        final_url = []
        for url in urls:
            if not bool(re.match('^http', url)):
                final_url.append(response.urljoin(url))
            else:
                final_url.append(url)
        return final_url


# commande for run : scrapy crawl scraper -a page='https://timesofindia.indiatimes.com/city/delhi/2014-khirki-extn-raid-court-orders-aaps-somnath-bharti-to-stand-trial/articleshow/64810526.cms'
#                                           -a config='{"title":".heading1 arttitle::text","tags":"meta[itemprop=\"keywords\"]::attr(content)","publishedTs":"meta[itemprop=\"datePublished\"]::attr(content)","titleImageUrl":"link[itemprop=\"thumbnailUrl\"]::attr(href)","body":".Normal::text","siteBreadCrumb":"span[itemprop=\"name\"]::text"}' -a mandatory='title'

# scrapy crawl scraper -a page=https://www.appeloffres.com/appels-offres/telecom -a config="{'Nom':'.table_taille td > b::text','des':'.desc_text b::text'}" -o out.json


# scrapy crawl scraper -a page=https://medium.com/@chetaniam/using-scrapy-to-create-a-generic-and-scalable-crawling-framework-83d36732181 -a config="{'title':'.pw-post-title::text'}"


# scrapy crawl scraper -a page=https://www.francemarches.com/recherche?q=appel-offre -a config="{'title':'offre__header-link::text'}" -a mandatory='title'

# scrapy crawl scraper -a page="https://www.amazon.com/b?node=16225016011&pf_rd_r=N5TD9AJ5M2MFZYTD40G8&pf_rd_p=e5b0c85f-569c-4c90-a58f-0c0a260e45a0&pd_rd_r=c1e8591e-f091-4da5-8604-4635be6844be&pd_rd_w=bM1cA&pd_rd_wg=jgaTh&ref_=pd_gw_unk" -a config="{'title':'.a-size-base-plus::text'}" -o amazon.json

#last working cmd : scrapy crawl scraper -a page=https://www.appeloffres.com/appels-offres/telecom -a config="{'Nom':'td:nth-child(8)::text','des':'.desc_text b::text'}" -o out.json -a mandatory='des'

# scrapy crawl scraper -a page=https://quotes.toscrape.com/js/ -a config="{'Nom':'.text::text'}" -a mandatory='Nom'

# scrapy crawl scraper -a page=https://centraledesmarches.com/pays/france -a config="{'Nom':'.libelle::text'}" -a mandatory='Nom'

#last working copie
""" import json
import re
import scrapy
import ast
class Scraper(scrapy.spiders.Spider):
    name = 'scraper'
    #mandatory=None
    def __init__(self, page=None, config=None, mandatory="" ,  *args, **kwargs):
        self.page =page
        #print("+++",type(config))
        self.config = json.loads(json.dumps(config))
        #print(type(self.config))
        self.mandatory_fields = mandatory.split(',')
        super(Scraper, self).__init__(*args, **kwargs)

    def start_requests(self):
        self.logger.info('Start url: %s' % self.page)
        yield scrapy.Request(url=self.page, callback=self.parse)
    def parse(self, response):
        item = dict(url=response.url)
        # iterate over all keys in config and extract value for each of thems
        for key in eval(self.config):
            print("++"+key)
            # extract the data for the key from the html response
            #print("++++++++++"+type(key))
            print("+++"+self.config)
            res = response.css(eval(self.config).get(key)).extract()
            # if the label is any type of url then make sure we have an absolute url instead of a relative one
            if bool(re.search('url', key.lower())):
                res = self.get_absolute_url(response, res)
            item[key] = ' '.join(elem for elem in res).strip()
        # ensure that all mandatory fields are present, else discard this scrape
        mandatory_fileds_present = True
        for key in self.mandatory_fields:
            if not item[key]:
                mandatory_fileds_present = False
        if mandatory_fileds_present:
            yield dict(data=item)
    @staticmethod
    def get_absolute_url(response, urls):
        final_url = []
        for url in urls:
            if not bool(re.match('^http', url)):
                final_url.append(response.urljoin(url))
            else:
                final_url.append(url)
        return final_url

#   commande for run : scrapy crawl scraper -a page='https://timesofindia.indiatimes.com/city/delhi/2014-khirki-extn-raid-court-orders-aaps-somnath-bharti-to-stand-trial/articleshow/64810526.cms'
#                                           -a config='{"title":".heading1 arttitle::text","tags":"meta[itemprop=\"keywords\"]::attr(content)","publishedTs":"meta[itemprop=\"datePublished\"]::attr(content)","titleImageUrl":"link[itemprop=\"thumbnailUrl\"]::attr(href)","body":".Normal::text","siteBreadCrumb":"span[itemprop=\"name\"]::text"}' -a mandatory='title'

#   scrapy crawl scraper -a page=https://www.appeloffres.com/appels-offres/telecom -a config="{'Nom':'.table_taille td > b::text','des':'.desc_text b::text'}" -o out.json


# scrapy crawl scraper -a page=https://medium.com/@chetaniam/using-scrapy-to-create-a-generic-and-scalable-crawling-framework-83d36732181 -a config="{'title':'.pw-post-title::text'}"

# scrapy crawl scraper -a page=https://www.francemarches.com/recherche?q=appel-offre -a config="{'title':'offre__header-link::text'}" -a mandatory='title'

## scrapy crawl scraper -a page="https://www.amazon.com/b?node=16225016011&pf_rd_r=N5TD9AJ5M2MFZYTD40G8&pf_rd_p=e5b0c85f-569c-4c90-a58f-0c0a260e45a0&pd_rd_r=c1e8591e-f091-4da5-8604-4635be6844be&pd_rd_w=bM1cA&pd_rd_wg=jgaTh&ref_=pd_gw_unk" -a config="{'title':'.a-size-base-plus::text'}" -a mandatory='title' """


