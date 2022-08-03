from gc import callbacks
from pkgutil import get_data
from requests import request
import requests
from scrapy.spiders import Spider,Rule
from scrapy import Request
from scrapy.linkextractors import LinkExtractor
from inline_requests import inline_requests
from genericscrapy.config import WORD_LIST_TO_AVOID
from genericscrapy.config import get_valid_links
import re
from urllib.parse import urlparse
#from requests import Session
#import grequests

class UrlExtractor(Spider):
    name = 'url-extractor'
    custom_settings = {'ITEM_PIPELINES': {'genericscrapy.pipelines.LinkExtratorPipeline':1}}
    start_urls = []

    def __init__(self, root=None,list_mot_cle="", depth=0, *args, **kwargs):
        self.logger.info("[LE] Source: %s Depth: %s Kwargs: %s", root, depth, kwargs)
        self.source = root
        self.options = kwargs
        self.depth = depth
        self.listx = []
        #self.list_mot_cle = ["zarzis","HARDWARE","tunisie","SUPPLY"]
        self.list_mot_cle = list_mot_cle.split(",")
        UrlExtractor.start_urls.append(root)
        #UrlExtractor.allowed_domains = [self.options.get('allow_domains')]
        UrlExtractor.allowed_domains = self.get_domain_from_url(self.source)
        self.clean_options()
        self.le = LinkExtractor(allow=self.options.get('allow'), deny=self.options.get('deny'),
                                allow_domains=self.options.get('allow_domains'),
                                deny_domains=self.options.get('deny_domains'),
                                restrict_xpaths=self.options.get('restrict_xpaths'),
                                canonicalize=False,
                                unique=True, process_value=None, deny_extensions=None,
                                restrict_css=self.options.get('restrict_css'),
                                strip=True)
        super(UrlExtractor, self).__init__(*args, **kwargs)

    def start_requests(self, *args, **kwargs):
        yield Request('%s' % self.source, callback=self.get_links)
    
    @inline_requests
    def get_links(self,response):
        content = response.text
        url = response.url
        #test case : url valid but passes the depth    
        #if any(word in content for word in self.list_mot_cle) or any(word in str(url) for word in self.list_mot_cle): 
        #    yield Request('%s' % url, callback=self.parse_req , meta = {'dont_redirect': True,'handle_httpstatus_list': [301,302]},dont_filter=True)

        if int(response.meta['depth']) <= int(self.depth):
            print("depth is:",response.meta['depth'])
            all_urls = self.get_all_links(response)
            self.listx.extend(all_urls)
            for url in all_urls:
                #TODO : if not self.url_contains_multiple_digits(url) and url == root:
                if not self.url_contains_multiple_digits(url):
                    print("send url:",url)
                    yield Request('%s' % url, callback=self.parse_req, meta = {'dont_redirect': True,'handle_httpstatus_list': [301,302]},dont_filter=True)   
        
    @inline_requests
    def parse_req(self, response):
        content = response.text
        url = response.url
        print("depth  in parse_req is:",response.meta['depth'])
        if int(response.meta['depth']) < 2:
            yield Request('%s' % url, callback=self.get_links,dont_filter=True)
            #yield dict(link=url, meta=dict(source=self.source, depth=response.meta['depth']))

        elif any(word in content for word in self.list_mot_cle) or any(word in str(url) for word in self.list_mot_cle): 
            if self.source in url: 
                print("writing now in file.json")
                yield dict(link=url, meta=dict(source=self.source, depth=response.meta['depth']))
            yield Request('%s' % url, callback=self.get_links,dont_filter=True)
            print("the end")
                           

    def get_all_links(self, response):
        links = self.le.extract_links(response)
        #links = get_valid_links(links,self.source)
        str_links = []
        for link in links:
            if link.url not in self.listx:
               str_links.append(link.url)
        return str_links

    def clean_options(self):
        allowed_options = ['allow', 'deny', 'allow_domains', 'deny_domains', 'restrict_xpaths', 'restrict_css']
        for key in allowed_options:
            if self.options.get(key, None) is None:
                self.options[key] = []
            else:
                self.options[key] = self.options.get(key).split(',')

    def has_numbers(self,inputString):
        return any(char.isdigit() for char in inputString)
 
    def url_contains_multiple_digits(self,url):
        url = str(url)
        res = False    
        if self.has_numbers(url) and len(max(re.findall(r'\d+', url), key = len)) >= 4:
            res = True
        return res

    def get_domain_from_url(self,url):
        domain = urlparse(url).netloc
        return domain
