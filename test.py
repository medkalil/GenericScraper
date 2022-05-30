from scrapy.crawler import CrawlerProcess
from genericscrapy.genericscrapy.spiders.LinkExtractor import UrlExtractor
from genericscrapy.genericscrapy.spiders.CardScraper import Scraper

#   orchestor need to : 1- trigger url extractor -> write Urls in kafka topic
#                       2- read Urls from kaka topic
#                       3- trigger scraper's on passing it 1 Url at a time
#  or trigger using scrapyd api
if __name__ == '__main__':

    process = CrawlerProcess({'USER_AGENT': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1)'})
    """ process.crawl(UrlExtractor,root='https://www.appeloffres.com/',depth=0)
    process.crawl(Scraper,page='https://www.appeloffres.com/appels-offres/telecom',config="{'Nom':'td:nth-child(8)::text','des':'.desc_text b::text'}",mandatory='des') """
    process.crawl(Scraper, start_urls_list="https://www.amazon.com/b?node=16225016011&pf_rd_r=N5TD9AJ5M2MFZYTD40G8&pf_rd_p=e5b0c85f-569c-4c90-a58f-0c0a260e45a0&pd_rd_r=c1e8591e-f091-4da5-8604-4635be6844be&pd_rd_w=bM1cA&pd_rd_wg=jgaTh&ref_=pd_gw_unk,https://www.amazon.com/b?node=16225016011&pf_rd_r=N5TD9AJ5M2MFZYTD40G8&page=10&pf_rd_p=e5b0c85f-569c-4c90-a58f-0c0a260e45a0&pd_rd_r=c1e8591e-f091-4da5-8604-4635be6844be&pd_rd_w=bM1cA&pd_rd_wg=jgaTh&ref_=pd_gw_unk" ,config="{'title':'.a-size-base-plus::text'}" , mandatory='title' )
#scrapy crawl scraper -a start_urls_list="https://www.amazon.com/b?node=16225016011&pf_rd_r=N5TD9AJ5M2MFZYTD40G8&pf_rd_p=e5b0c85f-569c-4c90-a58f-0c0a260e45a0&pd_rd_r=c1e8591e-f091-4da5-8604-4635be6844be&pd_rd_w=bM1cA&pd_rd_wg=jgaTh&ref_=pd_gw_unk,https://www.amazon.com/b?node=16225016011&pf_rd_r=N5TD9AJ5M2MFZYTD40G8&page=10&pf_rd_p=e5b0c85f-569c-4c90-a58f-0c0a260e45a0&pd_rd_r=c1e8591e-f091-4da5-8604-4635be6844be&pd_rd_w=bM1cA&pd_rd_wg=jgaTh&ref_=pd_gw_unk" -a config="{'title':'.a-size-base-plus::text'}" -a mandatory='title'
    process.start()

# scrapy crawl url-extractor -a root=https://www.appeloffres.com/ -a allow_domains="appeloffres.com" -a depth=0 -o out.json

# scrapy crawl scraper -a page=https://www.appeloffres.com/appels-offres/telecom -a config="{'Nom':'td:nth-child(8)::text','des':'.desc_text b::text'}" -a mandatory='des'