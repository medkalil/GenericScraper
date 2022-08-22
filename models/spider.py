class Spider:
    def __init__(self, id, spider,start_time,end_time,status):
        self.id = id
        self.spider = spider
        self.start_time = self.set_start_time(start_time)
        self.end_time = self.set_end_time(end_time)
        self.status = self.get_status()

    def set_end_time(self,time):
        if time != None:
            self.end_time = time
        return self.end_time

    def set_start_time(self,time):
            if time != None:
                self.start_time = time
            return self.start_time

    def get_status(self):
        if self.start_time is None and self.end_time is None:
            return "pending"
        elif self.end_time is None:
            return "running"
        else:
            return "finished"



""" 'pending': [
        {
            u'id': u'24c35...f12ae',
            u'spider': u'spider_name'
        },
    ],
    'running': [
        {
            u'id': u'14a65...b27ce',
            u'spider': u'spider_name',
            u'start_time': u'2014-06-17 22:45:31.975358'
        },
    ],
    'finished': [
        {
            u'id': u'34c23...b21ba',
            u'spider': u'spider_name',
            u'start_time': u'2014-06-17 22:45:31.975358',
            u'end_time': u'2014-06-23 14:01:18.209680'
        }
    ] """