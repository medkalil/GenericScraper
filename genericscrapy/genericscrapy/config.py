import re

WORD_LIST_TO_AVOID = ["login","password","user","abonnement","forgotten-password","newsletter","profil","conditions","contact","alerte","commandes","reabonnement","factures","support","connexion","register","sources","fiches","blog","aide","faq","politique-cookies","politique","cookies","credits","mentions","ForgotPassword","Password","Forgot","forgot password"]


def Filter(string, substr):
    return [strr for strr in string if not
             any(sub in str(strr) for sub in substr)]

def get_valid_links(links,root):
    links = [link for link in links if root in link.url ]
    links = Filter(links,WORD_LIST_TO_AVOID)
    return links 
