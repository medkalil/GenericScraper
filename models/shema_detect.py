from cgitb import text
import string
from urllib.request import urljoin
from xml.dom.minidom import Document
from bs4 import BeautifulSoup
import requests
from urllib.request import urlparse
import re
import time
import re
from bs4 import BeautifulSoup
from bs4.element import Comment
import urllib.request
import re
import traceback



#RQ
#when can't pass the root to the shema detect

#not working
#https://tunisie-appels-doffres.com/categorie/fournitures-de-bureau : need to delete nav and footer from content
#https://www.lespagesjaunesafrique.com/societes/angola/ambassades-consulats : give a shema not in data pages
#working:
#https://www.e-marchespublics.com/appel-offre/activite/fourniture/amenagement-urbain/banc
#https://www.j360.info/appels-d-offres/afrique/tunisie
#https://www.lespagesjaunesafrique.com/societes/angola/ambassades-consulats
#https://centraledesmarches.com/pays/france
#https://www.appeloffres.com/appels-offres/telecom
#https://www.appeloffres.net


class Shema_detect_class:

    def __init__(self, res, page_type,input_url,list_mot_cle):
        self.res = res
        self.page_type = page_type
        self.input_url = input_url
        self.list_mot_cle = list_mot_cle

        self.page_content = requests.get(self.input_url).content.lower()
        self.soup = BeautifulSoup(self.page_content, "lxml")
        self.soup2 = BeautifulSoup(requests.get(input_url).content.lower(),"lxml")
        [s.extract() for s in self.soup2(['style', 'script', '[document]', 'head', 'title'])]
        self.visible_text = self.soup2.getText()

    """ res = []
    page_type = ""
    input_url = "https://www.j360.info/appels-d-offres/afrique/tunisie/"
    list_mot_cle = ['materiel','ambassade','test' ,'tunisie', 'fourniture','acquisition' ]
    #list_mot_cle = ['ambassade' ]
    page_content = requests.get(input_url).content.lower()
    soup = BeautifulSoup(page_content, "lxml")

    soup2 = BeautifulSoup(requests.get(input_url).content.lower(),"lxml")
    [s.extract() for s in soup2(['style', 'script', '[document]', 'head', 'title'])]
    visible_text = soup.getText() """


    def getTagname_className(self,class_list_to_join):
        return "."+".".join(class_list_to_join)

    def temp_delete_point_from_classes(self,st):
        return st[1:].replace("."," ")
        
    def get_title_class(self,list_mot_cle, res, soup, visible_text):

        page_type = ""
        for elem in soup(text=re.compile('|'.join( list_mot_cle))):
            temp_elem = elem
            try:
                if elem.parent.name != "script" or elem.parent.text in visible_text:
                    print ("ele",elem.parent)

                #detecting tr or td if there is : ->table schema 
                    for _ in range(5):
                        temp_elem = temp_elem.parent
                        if temp_elem.name == "td" or temp_elem.name == "tr":
                            print("TABLE: td after class")
                            page_type = "table"
                        
                    while  elem.parent.get("class") == None:
                        print("inside while None")
                        elem = elem.parent 
                        if elem.name == "tr" or elem.name == "td" or elem.parent.name == "tr":
                            print("TABLE: td before class")
                            page_type = "table"
                            break
                #res.append(elem.parent['class'])
                    res.append(elem.parent)
                #break
            except:
                pass
        print("page type is:",page_type)
        return page_type

    #print("the visible text is",visible_text)
    #tt = [*set(res)]
    def get_class_list(self,res, getTagname_className):
        res_list = []
        print("################################################################ ")
        for x in res:
            try:
                print("calss:",getTagname_className(x['class']))
                res_list.append(getTagname_className(x['class']))
            except:
                pass
        return [*set(res_list)]

    def get_exact__title_class(self,temp_delete_point_from_classes, soup, page_content, res_list):
        temp_dict = {}
        #find: return the first element => class[0]
        for x in res_list:
            if str(page_content).count(temp_delete_point_from_classes(x)) > 1:
                print("more than 1",x)
                if  "footer" not in str(x) and "shadowblock" not in str(x) and ".col-sm-12.ct-u-margintop20.ct-u-marginbottom10" not in str(x) and ".wrapper" not in str(x) and ".textwidget" not in str(x):
                    temp = soup.find(attrs={'class' :temp_delete_point_from_classes(x) }).get_text()
                    temp = re.sub(r"\s+", "",temp)
                    print("textuel content :",temp)
                    temp_dict[x] = temp

        print("##############################################################################################################")
        print("the longest class textuel content is:", max(temp_dict, key=lambda x:len(temp_dict[x])))
        return max(temp_dict, key=lambda x:len(temp_dict[x]))


    def get_card_css_selector( self,soup, page_content, res_list):
        title_class = self.get_exact__title_class(self.temp_delete_point_from_classes, soup, page_content, res_list)
        print("func call to get title class:",title_class)

        list_elements = soup.find_all(attrs={'class' :self.temp_delete_point_from_classes(title_class)})
        #print("here:",list_elements)
        first_element = list_elements[0]
        sencond_element = list_elements[1] 

        """ print("##############################################################################################################")
        print("1st elem",first_element)
        print("1st elem sibling",first_element.find_next_sibling())
        print("sencond_element elem",sencond_element) """

        while True:
            first_element = first_element.parent
            sencond_element = sencond_element.parent
            if sencond_element in first_element.find_next_siblings() :
                break

        #print("the card css selector",getTagname_className(first_element["class"]))
        return self.getTagname_className(first_element["class"])    

    def get_elements_class_in_card_css_selector_for_config(self,soup,getTagname_className,temp_delete_point_from_classes,text,card_css_selector):
        #1 :get the card ele
        #2 :get the text class inside it
        try:
            ele = soup.find(attrs={'class' :temp_delete_point_from_classes(card_css_selector)})
            ele = ele.find(text=re.compile(text))
            #ele = ele.find(text=re.compile("ambassade")).parent.get('class')[0]
            print("elee isssqsdqssd",ele)
            
            #working : ele = soup.find(text=re.compile(text))
            if ele.parent.get('class') != None:
                return getTagname_className(ele.parent.get('class'))
            else:
                while ele.parent.get('class') == None:
                    ele = ele.parent
                return getTagname_className(ele.parent.get('class'))
        except:
            print("un text dosent have a class inside the card")


    def get_config(self,soup,getTagname_className,temp_delete_point_from_classes,get_elements_class_in_card_css_selector_for_config,card_css_selector):
        new_words = []
        di = {}
        item = ""
        text_class = ""
        words = soup.find(attrs={'class' :temp_delete_point_from_classes(card_css_selector)}).get_text().split("\n")
        for x in words:
            x = x.strip()
            if x != "":
                new_words.append(x)
        if len(new_words) == 1:
            print("NOT A CARD DATA: NOT A DATA PAGE Like les PagesJaunes depth 1 pages")
        else:
            for idx,x in enumerate(new_words):
                item = "item"+str(idx)
                
                di[x] = get_elements_class_in_card_css_selector_for_config(soup,getTagname_className,temp_delete_point_from_classes,x,card_css_selector)
        return di 


#   dict[item] =    findNodeByContentOfGetConfig(new_words[i]) + " *::text";

""" 
const get_config = (card_css_selector) => {
          //get text content
          words = document
            .getElementsByClassName(card_css_selector)[0]
            .textContent.split("\n");
          // trim + delete empty str
          new_words = [];
          for (var i = 0; i < words.length; i++) {
            words[i] = words[i].trim();
            if (words[i] !== "") {
              new_words.push(words[i]);
            }
          }
          if (new_words.length == 1) {
            console.log("not a card data, just card with 1 text");
            return "not a data page/ page with 1 item => can't detect page schema ";
          } else {
            var dict = {};
            for (var i = 0; i < new_words.length; i++) {
              item = "item" + i;
              dict[item] =
                findNodeByContentOfGetConfig(new_words[i]) + " *::text";
            }
            return dict;
          }
        };
 """


#

#p = Shema_detect_class(res=[],page_type="",input_url="https://www.lespagesjaunesafrique.com/pays/tunisie",list_mot_cle=['materiel','ambassade','test' ,'tunisie', 'fourniture','acquisition','benin' ])
#list_urls = ['https://www.e-marchespublics.com/appel-offre/hauts-de-france/oise/compiegne/891352/29021','https://www.e-marchespublics.com/appel-offre/activite/fourniture/habillement-textile/pantalon','https://www.appeloffres.com/appels-offres/telecom']


#   For Testing:
""" list_urls = [
    'https://tunisie-appels-doffres.com/categorie/impression-papeterie/',
'https://www.e-marchespublics.com/appel-offre/activite/service/transport-logistique-stockage',
'https://www.e-marchespublics.com/appel-offre/activite/fourniture/environnement',
 'https://www.e-marchespublics.com/appel-offre/activite/fourniture/vrd-assainissement' ,    
'https://www.e-marchespublics.com/appel-offre/activite/service/environnement',
 'https://www.e-marchespublics.com/appel-offre/activite/service/vrd-assainissement',  
 'https://www.e-marchespublics.com/appel-offre/activite/fourniture/machine-equipement-auto',
 'https://www.e-marchespublics.com/appel-offre/activite/service/espaces-verts',
 'https://www.e-marchespublics.com/appel-offre/activite/service/tourisme-sports-loisirs',
 'https://www.e-marchespublics.com/appel-offre/activite/fourniture/defense-securite',       
 'https://www.e-marchespublics.com/appel-offre/activite/service/agro-alimentaire',
 'https://www.e-marchespublics.com/appel-offre/activite/fourniture/telecommunication',      
 'https://www.e-marchespublics.com/appel-offre/activite/fourniture/restauration-traiteur',  
 'https://www.e-marchespublics.com/appel-offre/activite/fourniture/tourisme-sports-loisirs',
 'https://www.e-marchespublics.com/appel-offre/activite/fourniture/materiaux',
'https://www.e-marchespublics.com/appel-offre/activite/fourniture/proprete',
 'https://www.e-marchespublics.com/appel-offre/activite/fourniture/formation-edition',     
 'https://www.e-marchespublics.com/appel-offre/activite/service/poste-telecom',
 'https://www.e-marchespublics.com/appel-offre/activite/fourniture/education',
 'https://www.e-marchespublics.com/appel-offre/activite/fourniture/sante-medical',
 'https://www.e-marchespublics.com/appel-offre/activite/fourniture/espaces-verts',
 'https://www.e-marchespublics.com/appel-offre/activite/service/telecommunication',
 'https://www.e-marchespublics.com/appel-offre/activite/fourniture/eclairage-public',
 'https://www.e-marchespublics.com/appel-offre/activite/service/manutention-stockage',
 'https://www.e-marchespublics.com/appel-offre/activite/fourniture/informatique',
 'https://www.e-marchespublics.com/appel-offre/activite/fourniture/securite-defense',
 'https://www.e-marchespublics.com/appel-offre/fourniture',
 ]
for url in list_urls:
    try:
        p = Shema_detect_class(res=[],page_type="",input_url=url,list_mot_cle=['service','materiel','ambassade','test' ,'tunisie', 'fourniture','acquisition','benin' ])
        #list of elements that have the mot_cle
        page_type = p.get_title_class(p.list_mot_cle, p.res, p.soup, p.visible_text)
        print("page_type:",page_type)

        if page_type == "table":
            print("Saving Schema As Table ")
            break
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
                print("we got the shema as card")
                break

    except Exception:
        print('NEXT PAGE : Cant Detect Shema on This Page')
        traceback.print_exc()
        pass """




