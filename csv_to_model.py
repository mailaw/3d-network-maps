
# coding: utf-8

# # TODO
#
# * add documetation to readData()
# * maybe come up with a better way to organize the coord attributes of the Relationship object

# In[1]:
import os
import ast
import igraph as ig
import numpy as np
from dateutil import parser
from flask import Flask, render_template, json, request,send_from_directory
import numpy as np
import csv


# In[ ]:
app = Flask(__name__,static_url_path='/static')
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
@app.route("/")
@app.route("/home")
def home():
    return render_template('index.html')

@app.after_request
def add_header(response):
    """
    Add headers to both force latest IE rendering engine or Chrome Frame,
    and also to cache the rendered page for 10 minutes.
    """
    response.headers['X-UA-Compatible'] = 'IE=Edge,chrome=1'
    response.headers['Cache-Control'] = 'public, max-age=0'
    return response
entity_list=[]
relationship_list=[]
entity_set=set()
class Entity:
    def __init__(self, primary_key, name, starting_date, ending_date):
        self.primary_key = primary_key
        self.name = name
        self.starting_date = starting_date
        self.ending_date = ending_date
        self.x = None
        self.y = None
        self.z1 = None
        self.z2 = None

    def get_string_representation(self):
        fields = [self.primary_key,
                  self.name,
                  self.starting_date,
                  self.ending_date,
                  self.x,
                  self.y,
                  self.z1,
                  self.z2]
        print(fields)
        return [str(field) for field in fields]



class Relationship:
    def __init__(self, primary_key, entity_key_1, entity_key_2,
                 relationship_type, starting_date = None, ending_date = None):

        self.primary_key = primary_key
        self.entity_key_1 = entity_key_1
        self.entity_key_2 = entity_key_2
        self.relationship_type = relationship_type
        self.starting_date = starting_date
        self.ending_date = ending_date
        self.x1 = None
        self.y1 = None
        self.z1 = None
        self.x2 = None
        self.y2 = None
        self.z2 = None
        self.x3 = None
        self.y3 = None
        self.z3 = None
        self.x4 = None
        self.y4 = None
        self.z4 = None

    def get_string_representation(self):
        fields = [self.primary_key,
                  self.entity_key_1,
                  self.entity_key_2,
                  self.relationship_type,
                  self.starting_date,
                  self.ending_date,
                  self.x1,
                  self.y1,
                  self.z1,
                  self.x2,
                  self.y2,
                  self.z2,
                  self.x3,
                  self.y3,
                  self.z3,
                  self.x4,
                  self.y4,
                  self.z4]

        return [str(field) for field in fields]



# In[ ]:

def readEntityData(entity_csv):
    index=1
    cntr=1
    for item in entity_csv:
        index+=1
        try:
            if('id' not in item):
                break
            dystart=parser.parse(str(item['dob']))
            dyend=parser.parse(str(item['active']))
            if item['id'] in entity_set:
                    print('Repeat Record', item)
                    print('Record index', index)
                    continue
            else:
                entity_list.append(Entity(item['id'],item['name'],dystart,dyend))
                entity_set.add(item['id'])
        except ValueError:
                print('Record could not be parsed', item)
                print('Record index', index)
                continue

def readRelationshipData(relationship_csv):
    index=1
    for item in relationship_csv:
        index+=1
        try:
            if('id' not in item):
                break
            if (item['s_date']) is None or str(item['s_date']) == '\n':
                dystart=None
            else:
                dystart=parser.parse(str(item['s_date']))
            if (item['end_date']) is None or str(item['end_date']) == '\n':
                dyend=None
            else:
                dyend=parser.parse(str(item['end_date']))
            if item['pid_1'] not in entity_set:
                    ##print('Refers to entity not found', item['pid_1'])
                    ##print('Record index', index)
                    continue
            if item['pid_2'] not in entity_set:
                    ##print('Refers to entity not found', item['pid_2'])
                    ##print('Record index', index)
                    continue

            relationship_list.append(Relationship(item['id'],item['pid_1'],item['pid_2']
                                                  ,item['relationship'],dystart,dyend))
        except ValueError:
                ##print('Record could not be parsed', item)
               ## print('Record index', index)
               ## print(len(item['s_date']))
                continue

##1

# In[4]:

def primary_key_map(entity_list):
    '''
    Generates a mapping of the primary keys of the entities, or people, and maps it to a unique integer starting at 0

    Arguments:
        entity_list: a list of Entity objects

    Returns:
        primary_key_mapper: a dictionary that takes an Entity's primary key as an index
            and returns a unique integer >= 0

        inverse_primary_key_mapper: a dictionary that takes an index and returns
            the corresponding Entity primary key

    '''
    primary_key_mapper = dict()
    inverse_primary_key_mapper = dict()

    entity_primary_keys = [entity.primary_key for entity in entity_list]

    for index, primary_key in enumerate(sorted(entity_primary_keys)):
        primary_key_mapper[primary_key] = index
        inverse_primary_key_mapper[index] = primary_key

    return primary_key_mapper, inverse_primary_key_mapper


# In[5]:

def relationships_to_edge_list(relationship_list, primary_key_mapper):
    '''
    Creates an edge list from the relationship list and a primary key map

    Arguments:
        relationship_list: a list of Relationship objects
        primary_key_mapper: a dictionary that maps entity primary keys to a unique integer

    Returns:
        a list of tuples that represents an edge list
    '''
    return [(primary_key_mapper[relationship.entity_key_1], primary_key_mapper[relationship.entity_key_2])
           for relationship in relationship_list]


# In[6]:

def time_span(entity_list):
    '''
    Gives the first date and last date found amoung the attributes of the entities

    Arguments:
        entity_list: a list of Entity objects

    Returns:
        the first and last date as datetime objects
    '''
    times = []

    for entity in entity_list:
        times.append(entity.starting_date)
        times.append(entity.ending_date)


    times = sorted(times)

    return times[0], times[-1]


# In[7]:
def setGeometries():
    if len(entity_list) > 0 and len(relationship_list) > 0:
        get_entity = dict() # a way to get an entity by its primary key
        for entity in entity_list:
            get_entity[entity.primary_key] = entity


        # In[8]:
        relationship_network = ig.Graph()
        relationship_network.add_vertices(len(entity_list))
        primary_key_mapper, inverse_primary_key_mapper = primary_key_map(entity_list) #getting key mappers
        edge_list = relationships_to_edge_list(relationship_list, primary_key_mapper) #generating edge list
        starting_time, ending_time = time_span(entity_list) #getting starting and ending times
        n_day_duration = (ending_time - starting_time).days #getting duration as days


        # In[9]:

        entity_xy_coords = np.array(ig.Graph(edge_list).layout('kk')) # getting 2d coordiantes of entities
        model_height = np.ptp(entity_xy_coords, axis = 0).max().round() # getting a good model height


        # In[10]:

        # setting the geometry of each entity
        for index, coord in enumerate(entity_xy_coords):
            entity_primary_key = inverse_primary_key_mapper[index]
            entity = get_entity[entity_primary_key]
            entity.x = coord[0]
            entity.y = coord[1]
            entity.z1 = float((entity.starting_date - starting_time).days)/n_day_duration * model_height
            entity.z2 = float((entity.ending_date - starting_time).days)/n_day_duration * model_height

        # In[11]:

        # setting the geometry of each relationship
        for relationship in relationship_list:
            entity_1 = get_entity[relationship.entity_key_1]
            entity_2 = get_entity[relationship.entity_key_2]

            relationship.x1 = entity_1.x
            relationship.y1 = entity_1.y

            relationship.x2 = entity_1.x
            relationship.y2 = entity_1.y

            relationship.x3 = entity_2.x
            relationship.y3 = entity_2.y

            relationship.x4 = entity_2.x
            relationship.y4 = entity_2.y


            if relationship.starting_date is None and relationship.ending_date is None: # if relationship exists during full life of both entities
                relationship.z1 = max(entity_1.z1, entity_2.z1)
                relationship.z3 = relationship.z1

                relationship.z2 = entity_1.z2
                relationship.z4 = enitty_2.z2

            else:
                bottom_z = float((relationship.starting_date - starting_time).days)/n_day_duration * model_height
                top_z = float((relationship.ending_date - starting_time).days)/n_day_duration * model_height

                relationship.z1 = bottom_z
                relationship.z3 = bottom_z

                relationship.z2 = top_z
                relationship.z4 = top_z


# In[12]:
def parse_csv(filename):
    reader = csv.DictReader(open(filename))
    result=list(reader)
    return result

def write_entities(entity_list, csv_name):
    output = []
    if(len(entity_list)>0 and len(relationship_list)>0):
        os.chdir("data")
        with open(csv_name + '.csv', mode = 'w') as entity_file:
            entity_writer = csv.writer(entity_file)
            entity_writer.writerow(['primary_key','name','starting_date','ending_date','x','y','z1','z2'])
            for entity in entity_list:
                entity_writer.writerow(entity.get_string_representation())
        eoutput=parse_csv('mock_entity_output.csv')
        os.chdir("..")
        return eoutput
# In[13]:

def write_relationships(relationship_list, csv_name):
    if(len(entity_list)>0 and len(relationship_list)>0):
        os.chdir("data")
        with open(csv_name + '.csv', mode = 'w') as relationship_file:
            relationship_writer = csv.writer(relationship_file)
            relationship_writer.writerow(['primary_key',
                                          'entity_key_1',
                                          'entity_key_2',
                                          'relationship_type',
                                          'starting_date',
                                          'ending_date',
                                          'x1',
                                          'y1',
                                          'z1',
                                          'x2',
                                          'y2',
                                          'z2',
                                          'x3',
                                          'y3',
                                          'z3',
                                          'x4',
                                          'y4',
                                          'z4'])

            for relationship in relationship_list:
                relationship_writer.writerow(relationship.get_string_representation())
        routput=parse_csv('mock_relationship_output.csv')
        os.chdir("..")
        return routput

# In[14]:
#3
@app.route("/execute",methods=['POST','GET'])
def execute():
    executedBoth = False
    efile=None
    rfile=None
    result=list()
    f = request.form.get("d")
    f = ast.literal_eval(f)
    if 'dob' in f[0].keys(): ##If it is the entity.csv file
        readEntityData(f)
    else:
        readRelationshipData(f)
        executedBoth = True
    setGeometries()
    if executedBoth:
        efile=write_entities(entity_list, 'mock_entity_output')
        rfile=write_relationships(relationship_list, 'mock_relationship_output')
        efile=json.dumps(efile)
        rfile=json.dumps(rfile)
        del entity_list[:]
        del relationship_list[:]
        entity_set.clear();
        result.append(efile)
        result.append(rfile)
        result=json.dumps(result)
        return result
    return "success"
if __name__ == '__main__':
    app.run(debug=True)

# In[ ]:
