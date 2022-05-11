from scrapy.crawler import CrawlerProcess
from genericscrapy.genericscrapy.spiders.LinkExtractor import UrlExtractor
from genericscrapy.genericscrapy.spiders.CardScraper import Scraper

#   orchestor need to : 1- trigger url extractor -> write Urls in kafka topic
#                       2- read Urls from kaka topic
#                       3- trigger scraper's on passing it 1 Url at a time
#  or trigger using scrapyd api
if __name__ == '__main__':

    process = CrawlerProcess({'USER_AGENT': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1)'})
    #1- trigger url extractor -> write Urls in kafka topic
    process.crawl(UrlExtractor,root='https://www.appeloffres.com/',depth=0)
    #2- read Urls from kaka topic
    # TODO
    #...

    #3- trigger scraper's on passing it 1 Url at a time : start_urls as arguments and pass it the urls from kafka topik
    process.crawl(Scraper,page='https://www.appeloffres.com/appels-offres/telecom',config="{'Nom':'td:nth-child(8)::text','des':'.desc_text b::text'}",mandatory='des')

    process.start()

# scrapy crawl url-extractor -a root=https://www.appeloffres.com/ -a allow_domains="appeloffres.com" -a depth=0 -o out.json

# scrapy crawl scraper -a page=https://www.appeloffres.com/appels-offres/telecom -a config="{'Nom':'td:nth-child(8)::text','des':'.desc_text b::text'}" -a mandatory='des'